import os
import io
import pymupdf
from dotenv import load_dotenv
from PIL import Image
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import HttpResponseError

load_dotenv()

def pdf_to_image(file_path: str) -> list:
    try:
        pdf_file = pymupdf.open(file_path)
        images = []

        for i in range(pdf_file.page_count):
            print(f"Start converting page {i + 1}...")
            page = pdf_file.load_page(i)
            page_pix = page.get_pixmap()

            img = Image.open(io.BytesIO(page_pix.tobytes("png")))

            images.append(img)

            print(f"Finish converting page {i + 1}")
        return images
    except Exception as e:
        print(f"Failed to convert the file to images. \n Error: {e}")
        return []

def ocr_pdf(file_path: str) -> str:
    try:
        # Convert PDF pages to images
        print("Converting to images...")
        images = pdf_to_image(file_path)

        # Initialize Azure ImageAnalysisClient
        print("Initializing client...")
        end_point = os.getenv("END_POINT")
        end_point = end_point.strip('"')
        client = ImageAnalysisClient(
            endpoint=end_point,
            credential=AzureKeyCredential(os.getenv("API_KEY"))
        )
        print("Finish initialize")
        visual_features =[
            VisualFeatures.READ,
        ]
        file_name = os.path.basename(file_path)[:-4].replace(" ", "_")
        output_file = f'extracted_texts/{file_name}.txt'
        if os.path.exists(output_file):
            os.remove(output_file)

        with open(output_file, "w") as f:
        # You can now write to the file, for example:
            f.write("")

        images_folder = f"images_from_pdf/{file_name}"
        if not os.path.exists(images_folder):
            os.makedirs(images_folder)

        # Process each image (PDF page) for OCR
        print("Processing images...")
        for i, image in enumerate(images):
            image_path = f'{images_folder}/page_{i + 1}.png'
            image.save(image_path, 'PNG')

            with open(image_path, "rb") as f:
                image_data = f.read()

            try:
                print(f"Processing page {i + 1}...") 

                # Call Azure OCR API
                result = client.analyze(
                    image_data=image_data,
                    visual_features=visual_features,
                    language="en"
                )

                if result.read is not None:
                    print("Saving text...")
                    with open(output_file, "a") as file:
                        for line in result.read.blocks[0].lines:
                            file.write(line.text)
                            file.write(" ")
                            #print(line.text)
                            # print(f"   Line: '{line.text}', Bounding box {line.bounding_polygon}")
                            # for word in line.words:
                            #     print(f"     Word: '{word.text}', Bounding polygon {word.bounding_polygon}, Confidence {word.confidence:.4f}")
                print(f"Finish processing page {i + 1}")

            except HttpResponseError as e:
                print(f"Status code: {e.status_code}")
                print(f"Reason: {e.reason}")
                print(f"Message: {e.error.message}")
        return output_file
    
    except Exception as e:
        print(f"Faield to perform OCR. \n Error: {e}")