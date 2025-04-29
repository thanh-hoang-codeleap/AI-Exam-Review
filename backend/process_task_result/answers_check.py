import os
import json
from openai import OpenAI
from dotenv import load_dotenv

from .prompt import result_prompt

load_dotenv()

def check_answers(solution_path: str, student_answers_path: str) -> str:
    try:
        client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ["OPENAI_API_KEY"],
        )

        result = send_prompt(client, solution_path, student_answers_path)

        print("Finish checking the answers")

        output_path = "process_task_result/result.json"
        with open(output_path, "w") as file:
            json.dump(result, file)

        return output_path
    
    except Exception as e:
        print(f"Failed check the answer. \n Error: {e}")


def send_prompt(client, solution_path, student_answers_path):
    print("Getting solution data...")
    with open(solution_path, "r") as file:
        solution_data = json.load(file)

    print("Getting student answers data...")
    with open(student_answers_path, "r") as file:
        student_answers_data = json.load(file)

    print("Start checking answers...")
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": result_prompt
                },
                {
                    "role": "user",
                    "content": 'JSON data for the exam solution: """ \n' + str(solution_data) + '\n """ \n' + 
                                'JSON data for answers provided by student: """ \n' + str(student_answers_data) + '\n """' 
                }
            ],
            model="gpt-4.1-mini",
            temperature=1,
            max_tokens=11000,
            response_format={"type": "json_object"}
        )
        print(f"Total tokens used: {response.usage.total_tokens}")
        output = response.choices[0].message.content.strip()
        json_output = json.loads(output)

        return json_output
    
    except Exception as e:
        print(f"Failed to send the prompt. \n Error: {e}")