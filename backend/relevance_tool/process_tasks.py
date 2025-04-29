import os
import json
from relevanceai import RelevanceAI
from dotenv import load_dotenv
from pypdf import PdfReader, PdfWriter

load_dotenv()

def remove_last_page(input_pdf_path):
    # Open the PDF file
    with open(input_pdf_path, "rb") as infile:
        reader = PdfReader(infile)
        
        # Create a PdfWriter object to write the output
        writer = PdfWriter()

        # Add all pages except the first one
        for page_num in range(min(5, len(reader.pages))):
            writer.add_page(reader.pages[page_num])

        # Write the modified PDF to the output file
        out_file = input_pdf_path
        with open(out_file, "wb") as outfile:
            writer.write(outfile)
    
    return out_file

def get_tasks_answers(exam_paper_path: str, answer_sheet_path: str) -> (str | None):
    try:
        with open(exam_paper_path, 'r') as file:
            exam_paper_data = json.load(file)

        with open(answer_sheet_path, "r") as file:
            answer_sheet_data = file.read()

        load_dotenv()
        client = RelevanceAI(
            api_key= os.getenv("RAI_API_KEY"),
            region= os.getenv("RAI_REGION"),
            project= os.getenv("RAI_PROJECT")
        )

        tool_id = [
            "ef2d3fed-c0b8-433a-b0fa-4533905fbf13", # Answer Extraction
            "93482123-8960-4cb3-9aad-de683a032eba" # Answer Mapping
        ]

        print("Getting task answers...")
        get_tasks_answers_tool = client.tools.retrieve_tool(tool_id=tool_id[0])

        tool_result = get_tasks_answers_tool.trigger(params={
            "exam_paper": str(exam_paper_data),
            "answer_sheet": answer_sheet_data
        })

        print("Processing output...")
        result = tool_result.output

        if "answer" in result:
            result = result["answer"]
        result = json.loads(result)

        output_path = "backend/task_answers.json"
        with open(output_path, "w") as file:
            json.dump(result, file)

        print("Finish getting task answers")

        return output_path
    
    except Exception as e:
        print(f"Failed to get the tasks answers. \n Error: {e}")