from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

from ocr_pdf import ocr_pdf
from tool import mistakes_detect, process_output
from export_xlsx import create_excel

# Initialize Flask app
app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

# Directory setup
UPLOAD_FOLDER = 'uploaded_files'
OUTPUT_FOLDER = 'output_files'
STATIC_DIR = 'static'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf'}

# Homepage route (serves index.html)
@app.route('/', methods=['GET'])
def home():
    return send_from_directory('.', 'index.html')

# Route for serving static files (CSS, JS, etc.)
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(STATIC_DIR, path)

# Check if uploaded file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# File upload endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"})
    
    if file and allowed_file(file.filename):
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename.replace(" ", "_"))
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
            excel_path = os.path.join(OUTPUT_FOLDER, file.filename[:-4].replace(" ", "_"))
            excel_path = f"{excel_path}.xlsx"
            create_excel(json_path, excel_path)
            excel = f"{file.filename.replace(' ', '_')[:-4]}.xlsx"
            
            return jsonify({
                "success": True,
                "filename": file.filename,
                "text": text,
                "excel": excel
            })
        
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    return jsonify({"success": False, "error": "File type not allowed"}), 400

# Route for downloading the generated Excel file
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        # Ensure the requested file exists in the OUTPUT_FOLDER
        return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"success": False, "error": "File not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
