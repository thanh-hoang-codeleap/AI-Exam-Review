from PIL import Image
import pytesseract
from pypdf import PdfReader, PdfWriter
import os
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

from ocr_pdf import pdf_to_image

load_dotenv()

# Reads the first page of a PDF image
def read_first_page(image_path: str, output_path: str) -> None:
    try:
        print("Reading page 1...")
        with open(output_path, "w") as file:
            print("Opening image using Pillow...")
            # Open the image using Pillow
            img = Image.open(image_path)
            print("Finish opening image using Pillow")
            custom_config = r'--oem 3 --psm 6 -c tessedit_create_hocr=1'
            text = pytesseract.image_to_string(img, config=custom_config)
            file.write(text)
            file.write('\n')
    except Exception as e:
        print(f"Failed to read the first page. \n Error: {e}")

# Removes the first page of the PDF
def remove_first_page(input_pdf_path: str) -> str:
    try:
        # Open the PDF file
        with open(input_pdf_path, "rb") as infile:
            reader = PdfReader(infile)
            
            # Create a PdfWriter object to write the output
            writer = PdfWriter()

            # Add all pages except the first one
            for page_num in range(1, len(reader.pages)):
                writer.add_page(reader.pages[page_num])

            # Write the modified PDF to the output file
            out_file = "removed_pdf.pdf"
            with open(out_file, "wb") as outfile:
                writer.write(outfile)

        return out_file
    except Exception as e:
        print(f"Failed to remove the first page from the PDF. Error: {e}")
        return ""

# Extracts text from a PDF using Azure Document Analysis
def extract_text_from_pdf(pdf_path: str, output_path: str, client: DocumentAnalysisClient) -> None:
    try:
        with open(pdf_path, "rb") as f:
            # Begin document analysis with Azure Document Intelligence
            poller = client.begin_analyze_document("prebuilt-document", f)
            result = poller.result()

            # Initialize an empty string to hold the extracted text
            extracted_text = ""

            # Iterate through each page in the result
            for i, page in enumerate(result.pages):
                extracted_text = ""
                print(f"Reading page {i + 2}...")
                # Iterate through each line on the page
                for line in page.lines:
                    # Get the content of the current line
                    line_content = line.content
                    extracted_text += line_content + "\n"
                
                # Write extracted text to the output file
                with open(output_path, "a") as file:
                    file.write(extracted_text)

        print("Finish reading the file")
    except Exception as e:
        print(f"Failed to extract text from PDF. Error: {e}")

# Extract the task using OCR
def extract_tasks(file_path: str) -> str | None:
    try:
        # Convert PDF to images
        images = pdf_to_image(file_path)

        # Initialize Azure DocumentAnalysisClient
        client = DocumentAnalysisClient(
            endpoint=os.getenv("END_POINT"),
            credential=AzureKeyCredential(os.getenv("API_KEY"))
        )

        # Prepare the output file
        file_name = os.path.basename(file_path)[:-4].replace(" ", "_")
        output_file = f'extracted_texts/{file_name}.txt'
        if os.path.exists(output_file):
            os.remove(output_file)

        # Prepare the folder to save images
        images_folder = f"images_from_pdf/{file_name}"
        if not os.path.exists(images_folder):
            os.makedirs(images_folder)

        print("Start reading file...")

        # Process each image (PDF page) for OCR
        for i, image in enumerate(images):
            image_path = f'{images_folder}/page_{i + 1}.png'
            image.save(image_path, 'PNG')

            # Read first page and extract text from it
            if i == 0:
                read_first_page(image_path, output_file)
            else:
                break

        # Remove first page from the PDF and extract text using Azure
        extracted_pdf_path = remove_first_page(file_path)
        if extracted_pdf_path:
            extract_text_from_pdf(extracted_pdf_path, output_file, client)

        return output_file
    except Exception as e:
        print(f"Failed to extract tasks. Error: {e}")
        return None