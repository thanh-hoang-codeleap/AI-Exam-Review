import os
import json
from openai import OpenAI
from dotenv import load_dotenv

from .prompt import text_processing, answers_extraction

# Load environment variables 
load_dotenv()

# Extract answers from student's OCR text 
def extract_answers(extracted_text_path: str, exam_paper_path: str) -> str | None:
    try:
        # Initialize OpenAI client
        client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ["OPENAI_API_KEY"],
        )
        
        print("Getting OCR text from student exam paper...")
        # Read the raw OCR extracted text from a file
        with open(extracted_text_path, "r") as file:
            extracted_text_data = file.read()

        # Clean the extracted text and map answers to the JSON structure
        output_path = map_answers(client, clean_text(client, extracted_text_data), exam_paper_path)

        return output_path
    
    except Exception as e:
        print(f"Failed check the answer. \n Error: {e}")

# Clean and preprocess the OCR extracted student exam 
def clean_text(client: OpenAI, extracted_text_data: str) -> str | None:
    print("Start cleaning student exam paper...")
    try:
        # Send the extracted text to OpenAI
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": text_processing  # Prompt guiding text cleaning
                },
                {
                    "role": "user",
                    "content": f'OCR text from student exam paper: \n {extracted_text_data}' 
                }
            ],
            model="gpt-4.1-mini",
            temperature=1,
            max_tokens=11000
        )
        print("Finish cleaning the text")
        print(f"Total tokens used: {response.usage.total_tokens}")
        
        # Extract cleaned text from the response
        output = response.choices[0].message.content.strip()
        return output

    except Exception as e:
        print(f"Failed to send the prompt. \n Error: {e}")

# Map the cleaned student answers to the exam paper questions
def map_answers(client: OpenAI, extracted_text_data: str, exam_paper_path: str) -> str | None:
    print("Getting exam paper data...")
    # Load the exam paper data 
    with open(exam_paper_path, "r") as file:
        exam_paper_data = json.load(file)

    print("Start mapping answers...")
    try:
        # Send the cleaned OCR text and exam paper JSON to OpenAI 
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": answers_extraction  # Prompt guiding answer mapping
                },
                {
                    "role": "user",
                    "content": f'OCR text from student exam paper: \n {extracted_text_data} \n \
                                JSON data for exam paper: \n {str(exam_paper_data)}' 
                }
            ],
            model="gpt-4.1-mini",
            temperature=1,
            max_tokens=11000
        )
        print("Finish mapping answers")
        print(f"Total tokens used: {response.usage.total_tokens}")
        # Extract JSON result 
        output = response.choices[0].message.content.strip()
        
        result = json.loads(output)
        
        output_path = "task_answers.json"
        with open(output_path, "w") as file:
            json.dump(result, file)
            
        return output_path

    except Exception as e:
        print(f"Failed to send the prompt. \n Error: {e}")