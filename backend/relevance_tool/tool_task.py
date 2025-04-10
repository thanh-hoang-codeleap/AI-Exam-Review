import os
import json
from dotenv import load_dotenv
from relevanceai import RelevanceAI
from pypdf import PdfReader

# Process for task exam paper and solution paper
def process_task(paper_path, solution_path):
    try:
        load_dotenv()
        client = RelevanceAI(
            api_key= os.getenv("RAI_API_KEY"),
            region= os.getenv("RAI_REGION"),
            project= os.getenv("RAI_PROJECT")
        )

        tool_id = [
            "80c3b36b-a6ac-4337-bad3-c1191ab8b36a"
        ]

        return extract_exam_solution(paper_path, solution_path, client, tool_id[0])\
    
    except Exception as e:
        print(f"Error: {e}")

def read_file(file_path):
    try:
        print("Reading the file...")
        reader = PdfReader(file_path)
        full_text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            full_text += page.extract_text()
        return full_text
    
    except Exception as e:
        print(f"Error: {e}")
        

# Extract the exam solution
def extract_exam_solution(paper_path, solution_path, client, tool_id):
    try:
        solution_tool = client.tools.retrieve_tool(tool_id=tool_id)
        tool_result = solution_tool.trigger(params={
        "long_text": read_file(paper_path),
        "long_text_1": read_file(solution_path)
        })

        result = tool_result.output

        print(result)

        if "answer" in result:
            result = result["answer"]
        result = json.loads(result)

        return result
    except Exception as e:
        print(f"Error: {e}")