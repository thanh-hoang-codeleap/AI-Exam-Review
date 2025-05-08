from PIL import Image
import pytesseract
from pypdf import PdfReader, PdfWriter
import os
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

from ocr_pdf import pdf_to_image

load_dotenv()

def read_first_page(image_path, output_path):
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

def remove_first_page(input_pdf_path):
    # Open the PDF file
    with open(input_pdf_path, "rb") as infile:
        reader = PdfReader(infile)
        
        # Create a PdfWriter object to write the output
        writer = PdfWriter()

        # Add all pages except the first one
        for page_num in range(1, len(reader.pages)):
            writer.add_page(reader.pages[page_num])

        # Write the modified PDF to the output file
        out_file = "backend/removed_pdf.pdf"
        with open("backend/removed_pdf.pdf", "wb") as outfile:
            writer.write(outfile)
    
    return out_file

def extract_text_from_pdf(pdf_path, output_path, client):
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
            
                # Check if the last character of the line is a sentensce-ending punctuation mark
                #if line_content[-1] in sentence_end_punctuation:
                    # If it is, append the line followed by a newline
                extracted_text += line_content + "\n"
                # else:
                #     # Otherwise, just append the line without a newline
                #     extracted_text += line_content + " "
            with open(output_path, "a") as file:
                file.write(extracted_text)
    
    print("Finish reading the file")

def extract_tasks(file_path):
    images = pdf_to_image(file_path)

    client = DocumentAnalysisClient(
        endpoint=os.getenv("END_POINT"),
        credential=AzureKeyCredential(os.getenv("API_KEY"))
    )

    file_name = os.path.basename(file_path)[:-4].replace(" ", "_")
    output_file = f'extracted_texts/{file_name}.txt'
    if os.path.exists(output_file):
        os.remove(output_file)

    images_folder = f"images_from_pdf/{file_name}"
    if not os.path.exists(images_folder):
        os.makedirs(images_folder)

    print("Start reading file...")
    # Process each image (PDF page) for OCR
    for i, image in enumerate(images):
        image_path = f'{images_folder}/page_{i + 1}.png'
        image.save(image_path, 'PNG')

        if i == 0:
            read_first_page(image_path, output_file)
        else:
            break

    extract_text_from_pdf(remove_first_page(file_path), output_file, client)

    return output_file