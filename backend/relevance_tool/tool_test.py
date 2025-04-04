import os
import json
from relevanceai import RelevanceAI

def split_json(json_data: str | dict) -> (tuple[dict, dict] | None):
    try:
        # Parse JSON
        if isinstance(json_data, str):
            try:
                parsed_json = json.loads(json_data)
            except json.JSONDecodeError:
                parsed_json = None
                print("Warning: Could not parse JSON string")
        else:
            parsed_json = json_data

        if isinstance(parsed_json, dict) and 'text' in parsed_json:
            data = parsed_json['text']
        else:
            data = parsed_json

        # Split into two halves
        midpoint =  len(data) // 2

        first_half = data[:midpoint]
        second_half = data[midpoint:]

        first_json = {"text": first_half}
        second_json = {"text": second_half}

        return first_json, second_json
    
    except Exception as e:
        print(f"Error: {e}")

def mistakes_detect(text: str) -> (dict | None):
    client = RelevanceAI(
        api_key= os.getenv("RAI_API_KEY"),
        region= os.getenv("RAI_REGION"),
        project= os.getenv("RAI_PROJECT")
    )

    tool_ids = [
        "32618315-abfc-48e8-af92-5b8a50296edd",
        "24e7b78b-3994-4147-ba07-62117f1b52f2",
        "7698f127-e6be-4040-9297-1abfa69b1797"
    ]
    # Correcting the text
    json_data = mistakes_correction(client, text, tool_ids[0])
    # Identify the mistakes
    json_data_1, json_data_2 = mistakes_identification(client, json_data, tool_ids[1])
    # Analyze the mistakes
    first_json, second_json = mistakes_analysis(client, json_data_1, tool_ids[2])
    third_json, fourth_json = mistakes_analysis(client, json_data_2, tool_ids[2])

    return first_json, second_json, third_json, fourth_json


def mistakes_correction(client: RelevanceAI, text: str, tool_id: str) -> (dict | None):
    try:
        # Retrive tool
        correction_tool = client.tools.retrieve_tool(tool_id=tool_id)
 
        print("Correcting the text...")
        tool_result = correction_tool.trigger(params={"long_text": text})

        print("Text corrected")

        # Extract output
        json_data = tool_result.output
        if 'to_json_output' in json_data:
            json_data = json_data["to_json_output"]
        if 'corrections' in json_data:
            json_data = json_data["corrections"]
            
        return json_data
    
    except Exception as e:
        print(f"Error: {e}")


def mistakes_identification(client: RelevanceAI, json_data: str|dict, tool_id: str) -> (tuple[list, list] | None):
    try:
        # Retrive tool
        identification_tool = client.tools.retrieve_tool(tool_id=tool_id)
        print("Identifying mistakes...")

        # Handle based on input type
        first_json, second_json = split_json(json_data)

        if first_json is None or second_json is None:
            print("Error: Failed to split JSON properly.")
            return None, None

        # Process the first half
        print("Processing first half...")
        first_result = identification_tool.trigger(params={
            "long_text": json.dumps(first_json)
        })
        first_result = first_result.output['to_json_output']['text']

        # Process the second half
        print(f"Processing second half...")
        second_result = identification_tool.trigger(params={
            "long_text": json.dumps(second_json)
        }).output['to_json_output']['text']

        return first_result, second_result
    
    except Exception as e:
        print(f"Error: {e}")
    

def mistakes_analysis(client: RelevanceAI, json_data: str|dict, tool_id: str) -> (tuple[dict, dict] | None):
    try:
        # Retrieve tool
        analysis_tool = client.tools.retrieve_tool(tool_id=tool_id)

        print("Ananlyzing the mistakes...")
        
        # Split the input data into two halves
        first_json, second_json = split_json(json_data)

        if first_json is None or second_json is None:
            print("Error: Failed to split JSON properly.")
            return None, None

        # Process the first half
        print("Processing first half...")
        first_result = analysis_tool.trigger(params={
            "long_text": json.dumps(first_json)
        }).output['to_json_output']['results']

        # Process the second half
        print(f"Processing second half...")
        second_result = analysis_tool.trigger(params={
            "long_text": json.dumps(second_json)
        }).output['to_json_output']['results']

        return {"text": json.dumps(first_result)}, {"text": json.dumps(second_result)}
    
    except Exception as e:
        print(f"Error: {e}")


def get_text(json_result, data):
    result = json.loads(json_result["text"])
    for i in range(len(result)):
        data.append(result[i])

def process_output(first_result: dict, second_result: dict, third_result: dict, fourth_result: dict):
    try:
        data = []
        get_text(first_result, data)
        get_text(second_result, data)
        get_text(third_result, data)
        get_text(fourth_result, data)

        res = {"output": data}

        return res
    except Exception as e:
        print(f"Error: {e}")