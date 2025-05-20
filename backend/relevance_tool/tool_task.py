import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader

from .prompt import solution_extraction, exam_paper_extraction
from .extract_answers import clean_text

# Extract exam paper and solution for the exam
def process_task(paper_path: str, solution_path: str) -> dict | None:
    try:
        load_dotenv()
        
        # Initialize OpenAI client
        client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ["OPENAI_API_KEY"],
        )

        # Extract structured data from the exam paper PDF
        print("Extracting exam paper..")
        exam_paper = extract_exam_paper(paper_path, client)
        print("Finish extract exam paper")

        # Extract structured solution data from the solution paper 
        print("Extracting exam solution...")
        result = extract_exam_solution(exam_paper, solution_path, client)
        print("Finish extracting exam solution")

        return result
    
    except Exception as e:
        print(f"Error when processing task: {e}")

# Reads and extracts text content from a PDF file
def read_file(file_path: str) -> str | None:
    try:
        print("Reading the file...")
        reader = PdfReader(file_path)  # Initialize PDF reader
        full_text = ""
        # Loop through all pages in the PDF and extract text
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            full_text += page.extract_text()  # Append text of each page
        
        return full_text
    
    except Exception as e:
        print(f"Failed to read the file. \n Error: {e}")

# Extract structured exam solution information
def extract_exam_solution(exam_paper: dict, solution_path: str, client: OpenAI) -> dict | None:
    try:
        # Read text content from the solution paper PDF
        solution_data = read_file(solution_path)
        
        print("Start extracting solution...")
        # Create a chat completion request to OpenAI 
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": solution_extraction  # System prompt for guiding solution extraction
                },
                {
                    "role": "user",
                    "content": f'Text from solution paper: \n {solution_data} \n \
                                JSON data for exam paper: \n {str(exam_paper)}' 
                }
            ],
            model="gpt-4.1-mini",
            temperature=1,
            max_tokens=15000,
            response_format={"type": "json_object"} 
        )
        print("Finish extract solution")
        print(f"Total tokens used: {response.usage.total_tokens}")  # Token usage info
        
        # Extract JSON response content as string and parse it into dictionary
        output = response.choices[0].message.content.strip()
        print(output)
        result = json.loads(output)
        
        return result
    
    except Exception as e:
        print(f"Error when extracting solution: {e}")

# Extract structured exam paper information
def extract_exam_paper(paper_path: str, client: OpenAI) -> dict | None:
    try:        
        # Read text content from exam paper PDF
        exam_paper_data = read_file(paper_path)
        
        # Clean and structure the extracted text
        exam_paper_data = clean_text(client, exam_paper_data)
        
        print("Start extracting exam paper...")
        # Create a chat completion request 
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": exam_paper_extraction  # System prompt for exam paper extraction
                },
                {
                    "role": "user",
                    "content": f'Text from exam paper: \n {exam_paper_data}' 
                }
            ],
            model="gpt-4.1-mini",
            temperature=1,
            max_tokens=11000,
            response_format={"type": "json_object"}  # Request JSON response
        )
        print("Finish extract exam paper")
        print(f"Total tokens used: {response.usage.total_tokens}")  # Token usage info
        
        # Parse the JSON response 
        output = response.choices[0].message.content.strip()
        result = json.loads(output)

        # Save extracted exam paper data
        with open("exam_paper.json", "w") as file:
            json.dump(result, file)

        return result
    
    except Exception as e:
        print(f"Error when extracting exam paper: {e}")