import pdfplumber
import json
import fitz  # PyMuPDF
import os
import numpy as np
from PIL import Image
import pytesseract
import cv2
import re
from flask import Flask, request, jsonify
import requests
from io import BytesIO
import shutil
import traceback

UPLOAD_DIR = 'uploads'
os.makedirs(UPLOAD_DIR, exist_ok=True)
app = Flask(__name__)
app.config['UPLOAD_DIR'] = UPLOAD_DIR


def convert_specific_page_to_image(pdf_content_io, output_path, page_num):

    pdf_content_io.seek(0)
    
    page_index = page_num - 1 

    try:
        doc = fitz.open(stream=pdf_content_io.read(), filetype="pdf")
        pdf_content_io.seek(0)
        
        if page_index < 0 or page_index >= len(doc):
            print(f"Error: PDF only has {len(doc)} pages. Cannot access page {page_num}.")
            doc.close()
            return False
        
        page = doc.load_page(page_index)
        
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        
        pix.save(output_path)
        doc.close()
        
        print(f"\n--- Conversion SUCCESS: Page {page_num} saved to {output_path} ---")
        return True
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        return False

def extract_matiere(image_path, target_char):

    out_txt = os.path.join(os.path.dirname(image_path), 'extracted_matiere.txt')
    out_img_crop = os.path.join(os.path.dirname(image_path), 'cropped_matiere_area.png')
    out_img_debug = os.path.join(os.path.dirname(image_path), 'debug_preprocessed.png')
    
    start_x = 800
    x_end = 1200

    try:
        img = Image.open(image_path)
        img_width, img_height = img.size
        
        print("1. Preprocessing image for better OCR...")
        
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        
        kernel = np.ones((2,2), np.uint8)
        binary = cv2.dilate(binary, kernel, iterations=1)
        
        img_preprocessed = Image.fromarray(binary)
        img_preprocessed.save(out_img_debug)
        print(f"   Saved preprocessed image to {out_img_debug}")
        
        print("2. Running OCR to find the vertical bounds of the target row...")
    
        custom_config = r'--psm 6 -l fra' 
        data = pytesseract.image_to_data(
            img_preprocessed, 
            output_type=pytesseract.Output.DICT,
            config=custom_config
        )
        
        y_min_of_two = -1
        y_max_of_two = -1
        limit_x = 300
        
        print("\n=== DEBUG: All detected text in leftmost area ===")
        for i, text in enumerate(data['text']):
            text_stripped = text.strip()
            if text_stripped and data['left'][i] < limit_x:
                x = data['left'][i]
                y = data['top'][i]
                conf = data['conf'][i]
                print(f"  Text: '{text_stripped}' at X={x}, Y={y}, Confidence={conf}")
        
        print("\n=== Searching for target ===")
        for i, text in enumerate(data['text']):
            text_stripped = text.strip()
            if text_stripped == target_char and data['left'][i] < limit_x:
                y_min_of_two = data['top'][i]
                y_max_of_two = data['top'][i] + data['height'][i]
                
                print(f"✓ Found '{target_char}' at X={data['left'][i]}, Y={y_min_of_two}")
                print(f"  Bounding box (Y-range: {y_min_of_two:.0f} to {y_max_of_two:.0f})")
                break
                
        if y_min_of_two == -1:
            print(f"\nERROR: OCR could not detect '{target_char}' in the Sem. column.")
            print("This is a known issue with table OCR. Trying alternative approach...")
            

            sem_crop_path = os.path.join(os.path.dirname(image_path), 'debug_sem_column.png')
            sem_crop = img_preprocessed.crop((0, 0, limit_x, img_height))
            sem_crop.save(sem_crop_path)
            
            sem_data = pytesseract.image_to_data(
                sem_crop,
                output_type=pytesseract.Output.DICT,
                config=custom_config
            )
            
            print("\n=== Trying OCR on isolated Sem. column ===")
            for i, text in enumerate(sem_data['text']):
                text_stripped = text.strip()
                if text_stripped:
                    print(f"  Text: '{text_stripped}' at Y={sem_data['top'][i]}, Conf={sem_data['conf'][i]}")
                    if text_stripped == target_char:
                        y_min_of_two = sem_data['top'][i]
                        y_max_of_two = sem_data['top'][i] + sem_data['height'][i]
                        print(f"✓ Found '{target_char}' in isolated column!")
                        break
        
        if y_min_of_two == -1:
            print("\nFAILURE: Could not detect the target character with OCR.")
            print("Possible solutions:")
            print("1. Manually provide Y-coordinates")
            print("2. Use a different image preprocessing technique")
            print("3. Try a different OCR engine (e.g., EasyOCR)")
            return None
                
        vsb = 5
        y_min_crop = max(0, int(y_min_of_two) - vsb) 
        
        veb = 200
        y_max_crop = min(img_height, int(y_max_of_two) + veb)
        
        crop_area = (start_x, y_min_crop, x_end, y_max_crop)
        
        print(f"\n3. Cropping region: {crop_area}")
        
        cropped_img = img.crop(crop_area)
        cropped_img.save(out_img_crop)
        print(f"   Saved cropped area to {out_img_crop}")
        
        print("4. Running OCR on the cropped Matière column...")
        extracted_text = pytesseract.image_to_string(cropped_img, lang='fra').strip()

        if extracted_text:
            cleaned_text = ' '.join(extracted_text.split())
            
            print("\n--- Extraction SUCCESS ---")
            print(f"Matières for semester '{target_char}':")
            print(f"\n{cleaned_text}")
            print(f"\nSaved to: {out_txt}")
            return cleaned_text
        else:
            print("\n--- No text extracted from cropped area ---")
            return None

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        traceback.print_exc()
        return None

def extract_filiere_niveau(img_name):

    try:
        img = Image.open(img_name)
        img_width, img_height = img.size
        
        header_path = os.path.join(os.path.dirname(img_name), 'debug_header_crop.png')
        header = img.crop((100, 500, img_width-500, 700))
        header.save(header_path)
        
        text = pytesseract.image_to_string(header, lang='fra')
        
        filiere_match = re.search(r'Filière\s*:\s*(.+?)(?=\n|Niveau)', text, re.IGNORECASE | re.DOTALL)
        filiere = ' '.join(filiere_match.group(1).strip().split()) if filiere_match else None
        
        niveau_match = re.search(r'Niveau\s*:\s*(\d+)', text, re.IGNORECASE)
        niveau = niveau_match.group(1) if niveau_match else None
        
        return filiere, niveau
        
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def find_substring_in_row(row, x):

    found = None
    for item in row:
        if isinstance(item, str):
            if x in item:
                found = item
                break
    return found

def download_pdf_from_url(url):

    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()
    return BytesIO(response.content)


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running."}), 200

@app.route('/extract', methods=['POST'])
def extract_data():

    data = request.get_json()
    pdf_url = data.get('pdf_url')
    
    if not pdf_url:
        return jsonify({"error": "Missing 'pdf_url' in request body"}), 400

    temp_dir = os.path.join(app.config['UPLOAD_DIR'], str(os.getpid()))
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        pdf_content_io = download_pdf_from_url(pdf_url)
        
        out_img_page_2 = os.path.join(temp_dir, 'page_2_pymupdf_output.png')
        out_img_page_1 = os.path.join(temp_dir, 'page_1.png')
        target = '2' 
        
        convert_specific_page_to_image(pdf_content_io, out_img_page_2, 2)
        pdf_content_io.seek(0) # Reset pointer
        convert_specific_page_to_image(pdf_content_io, out_img_page_1, 1)
        
        filiere, niveau = extract_filiere_niveau(out_img_page_1)
        print(f"Extracted header: Niveau={niveau}, Filiere={filiere}")
        
        sem = extract_matiere(out_img_page_2, target)
        print(f"Extracted matières text: {sem}")

        matierat = {
            "filiere": filiere,
            "niveau": niveau,
            "sem1": [],
            "sem2": []
        }

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
        z = "1"
        
        pdf_content_io.seek(0)
        with pdfplumber.open(pdf_content_io) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if 'Sem.' in row:
                            continue
                        
                        if ('RM' in row or 'CC' in row):
                            try:
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
                            except (IndexError, ValueError):
                                continue
                                
                        elif (o := find_substring_in_row(row, 'TP')) is not None and notet["tp"] == None:
                            try:
                                for i in range(len(row)):
                                    if row[i] == o:
                                        break
                                notet["tp"] = (0 if row[i+1] == '' else float(row[i+1]))
                                coeff["tp"] = float(o.split('(')[1].replace(')',''))
                            except (IndexError, ValueError):
                                continue

                        elif (o := find_substring_in_row(row, 'Oral')) is not None and notet["oral"] == None:
                            try:
                                for i in range(len(row)):
                                    if row[i] == o:
                                        break
                                notet["oral"] = (0 if row[i+1] == '' else float(row[i+1]))
                                coeff["oral"] = float(o.split('(')[1].replace(')',''))
                            except (IndexError, ValueError):
                                continue

                        elif (o := find_substring_in_row(row, 'Ex')) is not None and notet["ex"] == None:
                            try:
                                for i in range(len(row)):
                                    if row[i] == o:
                                        break
                                notet["ex"] = (0 if row[i+1] == '' else float(row[i+1]))
                                coeff["ex"] = float(o.split('(')[1].replace(')',''))
                            except (IndexError, ValueError):
                                continue

                        elif ((o := find_substring_in_row(row, 'DS')) is not None) and notet["ds2"] == None:
                            try:
                                for i in range(len(row)):
                                    if row[i] == o:
                                        break
                                notet["ds2"] = (0 if row[i+1] == '' else float(row[i+1]))
                                coeff["ds2"] = float(o.split('(')[1].replace(')',''))
                            except (IndexError, ValueError):
                                continue
                        
                        if (notet["ex"] != None and notet["ds"] != None) or \
                           (notet["ds2"] != None and notet["ds"] != None) or \
                           ((coeff.get("tp", 0.0) or 0.0) + (coeff.get("ds2", 0.0) or 0.0) == 1.0) and 'name' in locals():
                            
                            if (sem is not None) and (name in sem):
                                z = "2"
                            
                            matiere = {
                                "name": name,
                                "coef": coef,
                                "credit": credit,
                                "notet": notet,
                                "coeff": coeff
                            }
                            matierat[f"sem{z}"].append(matiere)
                            
                            # Reset for next course
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
                            
                            del name, coef, credit
        return jsonify(matierat), 200

    except requests.exceptions.RequestException as e:
        print(f"Download Error: {e}")
        return jsonify({"error": f"Failed to download PDF: {e}"}), 500
    except Exception as e:
        print(f"Critical Processing Error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"An internal server error occurred during processing: {e}"}), 500
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            print(f"Cleaned up temporary directory: {temp_dir}")
        
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=2001)
