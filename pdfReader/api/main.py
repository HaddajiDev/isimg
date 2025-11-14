import pdfplumber
import json
import fitz  # PyMuPDF
import os
import easyocr
from PIL import Image
import numpy as np

def convert_specific_page_to_image(pdf_path, output_path, page_num):
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return

    page_index = page_num - 1 

    try:
        doc = fitz.open(pdf_path)
        
        if page_index < 0 or page_index >= len(doc):
            print(f"Error: PDF only has {len(doc)} pages. Cannot access page {page_num}.")
            doc.close()
            return
        
        page = doc.load_page(page_index)
        
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        
        pix.save(output_path)

        doc.close()
        
        print("\n--- Conversion SUCCESS ---")
        print(f"Page {page_num} successfully converted and saved as: {output_path}")

    except Exception as e:
        print("\n--- Conversion FAILURE ---")
        print(f"An unexpected error occurred: {e}")

def extract_matiere(image_path, target_char):
    out_txt = 'extracted_matiere.txt'
    out_img_crop = 'cropped_matiere_area.png'

    start_x = 800 
    x_end = 1130 

    reader = easyocr.Reader(['fr'])
    try:
        img = Image.open(image_path)
        img_height = img.size[1]
        
        print("1. Running initial OCR to find the vertical bounds of the target row...")
        results = reader.readtext(image_path, detail=1)
        
        y_min_of_two = -1
        y_max_of_two = -1

        limit_x = 200
        
        for (bbox, text, prob) in results:
            if target_char in text and bbox[0][0] < start_x and \
                bbox[0][0] < limit_x:
                
                all_y_coords = [point[1] for point in bbox]
                
                y_min_of_two = min(all_y_coords) 
                y_max_of_two = max(all_y_coords)
                
                print(f"2. Found '{target_char}' bounding box (Y-range: {y_min_of_two:.0f} to {y_max_of_two:.0f}).")
                break
                
        if y_min_of_two != -1:
            vsb = 5 #vertical start buffer
            y_min_crop = max(0, int(y_min_of_two) - vsb) 
            
            veb = 150
            y_max_crop = min(img_height, int(y_max_of_two) + veb)
            
            crop_area = (start_x, y_min_crop, x_end, y_max_crop)
            
            print(f"3. Cropping region: {crop_area}")
            
            cropped_img = img.crop(crop_area)
            cropped_img.save(out_img_crop)
            print(f"   (Saved cropped area to {out_img_crop} for visual check.)")

            cropped_img_np = np.array(cropped_img) 
            
            print("4. Running second OCR on the cropped Matière column...")
            cropped_results = reader.readtext(cropped_img_np, detail=0) 
            
            extracted_text = ""

            if cropped_results:
                extracted_text = " ".join(cropped_results).strip()

                print("\n--- Extraction SUCCESS ---")
                print(f"The Matière corresponding to the start of index '{target}' is:")
                print(f"**{extracted_text}**")
                return extracted_text
            else:
                 print("\n--- Extraction FAILURE ---")
                 print("ERROR: Second OCR run on the cropped area found NO text. Check cropped_matiere_area.png.")

        else:
            print(f"Character '{target_char}' not found in the image or is outside the expected X-range.")

    except FileNotFoundError:
        print(f"Error: The image file '{image_path}' was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

pdf = 'pdfs/4.pdf'
out_img = 'page_2_pymupdf_output.png'
num_page = 2

convert_specific_page_to_image(pdf, out_img, num_page)

img = 'page_2_pymupdf_output.png'  
target = '2'

sem = extract_matiere(img, target)
z = "1"

matierat = {
    "matierat1": [],
    "matierat2": []
}

def find_substring_in_row(row, x):
    found = None
    for item in row:
        if isinstance(item, str):
            if x in item:
                found = item
                break
    return found

notet = {
    "ds": None,
    "tp": None,
    "oral": None,
    "ex": None,
    "ds2": None
}

coeff = {
    "ds": None,
    "tp": None,
    "oral": None,
    "ex": None,
    "ds2": None
}

with pdfplumber.open("pdfs/4.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if 'Sem.' in row:
                    continue
#                print(row,(notet["ex"] != None and notet["ds"] != None) or (notet["ds2"] != None and notet["ds"] != None) or ((coeff.get("tp", 0.0) or 0.0) + (coeff.get("ds2", 0.0) or 0.0) == 1.0))
                if ('RM' in row or 'CC' in row):#(notet["ex"] == None and notet["ds"] == None)
                    for i in range(len(row)):
                        if row[i] == 'RM' or row[i] == 'CC':
                            break
                    s = str(row[i-1])
                    name = s.replace("\n", " ")
                    coef = float(row[i+1])
                    credit = int(row[i+2])
                    if (o := find_substring_in_row(row, 'DS')) is not None:
                        notet["ds"] = float(row[i+4])
                        coeff["ds"] = float(o.split('(')[1].replace(')',''))
                    elif (o := find_substring_in_row(row, 'TP')) is not None:
                        notet["tp"] = float(row[i+4])
                        coeff["tp"] = float(o.split('(')[1].replace(')',''))
                elif (o := find_substring_in_row(row, 'TP')) is not None and notet["tp"] == None:
                    for i in range(len(row)):
                        if row[i] == o:
                            break
                    notet["tp"] = (0 if row[i+1] == '' else float(row[i+1]))
                    coeff["tp"] = float(o.split('(')[1].replace(')',''))
                elif (o := find_substring_in_row(row, 'Oral')) is not None and notet["oral"] == None:
                    for i in range(len(row)):
                        if row[i] == o:
                            break
                    notet["oral"] = (0 if row[i+1] == '' else float(row[i+1]))
                    coeff["oral"] = float(o.split('(')[1].replace(')',''))
                elif (o := find_substring_in_row(row, 'Ex')) is not None and notet["ex"] == None:
                    for i in range(len(row)):
                        if row[i] == o:
                            break
                    notet["ex"] = (0 if row[i+1] == '' else float(row[i+1]))
                    coeff["ex"] = float(o.split('(')[1].replace(')',''))
                elif ((o := find_substring_in_row(row, 'DS')) is not None) and notet["ds2"] == None:
                    for i in range(len(row)):
                        if row[i] == o:
                            break
                    notet["ds2"] = (0 if row[i+1] == '' else float(row[i+1]))
                    coeff["ds2"] = float(o.split('(')[1].replace(')',''))
                if (notet["ex"] != None and notet["ds"] != None) or (notet["ds2"] != None and notet["ds"] != None) or ((coeff.get("tp", 0.0) or 0.0) + (coeff.get("ds2", 0.0) or 0.0) == 1.0):
                    if name == sem:
                        z = "2"
                    matiere = {
                        "name":name,
                        "coef":coef,
                        "credit":credit,
                        "notet": notet,
                        "coeff": coeff
                    }
                    matierat[f"matierat{z}"].append(matiere)
                    notet = {
                        "ds": None,
                        "tp": None,
                        "oral": None,
                        "ex": None,
                        "ds2": None
                    }
                    coeff = {
                        "ds": None,
                        "tp": None,
                        "oral": None,
                        "ex": None,
                        "ds2": None
                    }
with open('output.json', 'w', encoding='utf-8') as f:
    json.dump(matierat,f,ensure_ascii=False, indent=4)