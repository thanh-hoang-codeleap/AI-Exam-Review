from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv

from ocr_pdf import ocr_pdf
from relevance_tool.tool_test import mistakes_detect, process_output
from relevance_tool.tool_task import process_task
from relevance_tool.process_tasks import remove_last_page
from relevance_tool.extract_answers import extract_answers
from extract_tasks import extract_tasks
from process_task_result.answers_check import check_answers
from export_xlsx import create_excel

# Initialize Flask app
load_dotenv()
app = Flask(__name__, static_url_path="/static", static_folder="static")
CORS(app)

exam_paper_path = "exam_paper.json"
solution_path = ""
student_answers_path = ""
checking_result_path = ""

# Directory setup
UPLOAD_FOLDER = "uploaded_files"
OUTPUT_FOLDER = "output_files"
SOLUTION_FOLDER = "solution_file"
TASK_FOLDER = "task_files"
TEXT_FOLDER = "extracted_texts"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER
app.config["SOLUTION_FOLDER"] = SOLUTION_FOLDER
app.config["TASK_FOLDER"] = TASK_FOLDER
app.config["TEXT_FOLDER"] = TEXT_FOLDER

STATIC_DIR = "static"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(SOLUTION_FOLDER, exist_ok=True)
os.makedirs(TASK_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf"}

required_folders = [
    UPLOAD_FOLDER,
    SOLUTION_FOLDER,
    TASK_FOLDER,
    TEXT_FOLDER,
    STATIC_DIR,
    OUTPUT_FOLDER,
]
for folder in required_folders:
    if not os.access(folder, os.W_OK):
        print(f"Warning: No write permissions for {folder}")
    else:
        print(f"Folder {folder} is ready.")


# Homepage route (serves index.html)
@app.route("/", methods=["GET"])
def home():
    return send_from_directory(".", "index.html")


# Route for serving static files (CSS, JS, etc.)
@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory(STATIC_DIR, path)


# Check if uploaded file has an allowed extension
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# File upload endpoint
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file part"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"})

    if file and allowed_file(file.filename):
        # Save the uploaded file
        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"], file.filename.replace(" ", "_")
        )
        file.save(file_path)

        try:
            print("Running OCR...")
            text_file_path = ocr_pdf(file_path)

            # Read extracted text
            with open(text_file_path, "r") as text_file:
                text = text_file.read()

            print("Processing text...")
            # Detect mistakes in the extracted text
            mistakes_1, mistakes_2, mistakes_3, mistakes_4 = mistakes_detect(text)

            mistakes = process_output(mistakes_1, mistakes_2, mistakes_3, mistakes_4)

            # # Save processed mistakes to JSON
            json_path = "mistakes.json"
            with open(json_path, "w") as outfile:
                json.dump(mistakes, outfile)

            # Save analysis result to Excel
            excel_path = os.path.join(
                app.config["OUTPUT_FOLDER"], file.filename[:-4].replace(" ", "_")
            )
            excel_path = f"{excel_path}.xlsx"
            create_excel(json_path, excel_path)
            excel = f"{file.filename.replace(' ', '_')[:-4]}.xlsx"

            return jsonify(
                {
                    "success": True,
                    "filename": file.filename,
                    "text": text,
                    "excel": excel,
                }
            )

        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": False, "error": "File type not allowed"}), 400


# Route for downloading the generated Excel file
@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    try:
        # Set the base folder path for your output files
        output_folder = os.path.join(
            os.getcwd(), "backend/output_files"
        )  # Absolute path

        # Combine with the file name
        file_path = os.path.join(output_folder, filename)

        # Debugging print statement to verify the path
        print(f"File path: {file_path}")

        # Check if the file exists before attempting to send it
        if not os.path.exists(file_path):
            return jsonify({"success": False, "error": "File not found"}), 404

        # Serve the file for download
        return send_from_directory(output_folder, filename, as_attachment=True)

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"An unexpected error occurred when downloading the file: {str(e)}",
                }
            ),
            500,
        )


# Route for processing the solution file
@app.route("/solution", methods=["POST"])
def process_solution_file():
    try:
        # Check if the required files are present in the request
        if "exam_paper" not in request.files or "solution" not in request.files:
            return jsonify(
                {
                    "success": False,
                    "error": "Missing required files (exam paper or solution)",
                }
            )

        exam_paper = request.files["exam_paper"]
        solution = request.files["solution"]

        # Validate if filenames are not empty
        if exam_paper.filename == "" or solution.filename == "":
            return jsonify({"success": False, "error": "No selected file"})

        # Save the files to the defined TASK_FOLDER
        exam_path = os.path.join(app.config["TASK_FOLDER"], exam_paper.filename)
        solution_file_path = os.path.join(app.config["TASK_FOLDER"], solution.filename)

        # Save the exam paper file
        try:
            exam_paper.save(exam_path)
        except Exception as e:
            return (
                jsonify(
                    {"success": False, "error": f"Error saving exam paper: {str(e)}"}
                ),
                500,
            )

        # Save the solution file
        try:
            solution.save(solution_file_path)
        except Exception as e:
            return (
                jsonify(
                    {"success": False, "error": f"Error saving solution: {str(e)}"}
                ),
                500,
            )

        # Call the function with the paths to the exam paper and solution
        try:
            print("Processing solution...")
            result = process_task(exam_path, solution_file_path)
        except Exception as e:
            print(f"Error when processing task: {e}")
            return (
                jsonify(
                    {"success": False, "error": f"Error processing task: {str(e)}"}
                ),
                500,
            )

        # Save the result to a JSON file
        solution_json_path = os.path.join(
            app.config["SOLUTION_FOLDER"], "task_output.json"
        )
        try:
            with open(solution_json_path, "w") as file:
                json.dump(result, file)

            global solution_path
            solution_path = solution_json_path
        except Exception as e:
            print(f"Error when saving json: {e}")
            print(result)
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Error saving solution output: {str(e)}",
                    }
                ),
                500,
            )

        json_data = json.dumps(result, ensure_ascii=False, sort_keys=False)

        return Response(json_data, mimetype="application/json")

    except Exception as e:
        print(f"Error when return response: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"An unexpected error occurred when processing solution file: {str(e)}",
                }
            ),
            500,
        )


# Route for extracting the answer sheet
@app.route("/answer", methods=["POST"])
def process_answer_sheet():
    try:
        # Check if the required files are present in the request
        if "exam_paper" not in request.files or "student" not in request.files:
            return jsonify(
                {
                    "success": False,
                    "error": "Missing required files (exam paper or solution)",
                }
            )

        answer_sheet = request.files["student"]

        # Save the files to the defined TASK_FOLDER
        answer_sheet_path = os.path.join(
            app.config["TASK_FOLDER"], answer_sheet.filename
        )

        # Save the answer sheet file
        try:
            answer_sheet.save(answer_sheet_path)
        except Exception as e:

            return jsonify({"success": False, "error": f"Error saving answer sheet: {str(e)}"})
        
        #answer_sheet_path = remove_last_page(answer_sheet_path)
        # Extract the answers from the answer sheet
        answer_path = extract_tasks(answer_sheet_path)

        try:
            global student_answers_path
            # Extract the student answers
            student_answers_path = extract_answers(answer_path, exam_paper_path)

        except Exception as e:
            print(f"Error when getting answers: {e}")
            return jsonify(
                {"success": False, "error": f"Error when getting answers: {str(e)}"}
            )

        try:
            global checking_result_path
            # Check the answer against the solution
            checking_result_path = check_answers(solution_path, student_answers_path)
            with open(checking_result_path, "r") as file:
                data = json.load(file)
        except Exception as e:
            print(f"Error when checking the answers. \n Error: {e}")
            return jsonify(
                {
                    "success": False,
                    "error": f"Error when checking the answers: {str(e)}",
                }
            )

        json_data = json.dumps(data, ensure_ascii=False, sort_keys=False)

        return Response(json_data, mimetype="application/json")

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"An unexpected error occurred when checking the answers: {str(e)}",
                }
            ),
            500,
        )


# Route for update solution file
@app.route("/update_solution", methods=["POST"])
def update_solution_file():
    try:
        # Get the updated solution
        data = request.json
        updated_solution = data["solution"]

        if not updated_solution:
            return (
                jsonify({"success": False, "message": "No solution data received."}),
                400,
            )

        # Function to clean empty strings specifically from "answer" arrays
        def clean_answers(obj):
            if isinstance(obj, dict):
                if "answer" in obj and isinstance(obj["answer"], list):
                    obj["answer"] = [ans for ans in obj["answer"] if ans != ""]
                for k, v in obj.items():
                    clean_answers(v)
            elif isinstance(obj, list):
                for item in obj:
                    clean_answers(item)
            return obj

        cleaned_solution = clean_answers(updated_solution)
        updated_solution = {"examPaper": cleaned_solution}

        # Update the solution file
        with open(solution_path, "w") as file:
            json.dump(updated_solution, file)

        return (
            jsonify({"success": True, "message": "Solution updated successfully."}),
            200,
        )

    except Exception as e:
        print(f"Error when updating solution. \n Error: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"An unexpected error occurred when updating solution: {str(e)}",
                }
            ),
            500,
        )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
