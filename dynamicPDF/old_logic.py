from flask import Flask, jsonify, request
import pdfplumber
import json
import fitz  # PyMuPDF
import os
import easyocr
from PIL import Image
import numpy as np
import requests
from io import BytesIO
import tempfile

app = Flask(__name__)

def download_pdf_from_url(url):
    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()
    return BytesIO(response.content)

def convert_specific_page_to_image(pdf_source, output_path, page_num):
    page_index = page_num - 1 

    try:
        if isinstance(pdf_source, str):
            if not os.path.exists(pdf_source):
                return {"error": f"PDF file '{pdf_source}' not found."}
            doc = fitz.open(pdf_source)
        else:
            doc = fitz.open(stream=pdf_source, filetype="pdf")
        
        if page_index < 0 or page_index >= len(doc):
            doc.close()
            return {"error": f"PDF only has {len(doc)} pages. Cannot access page {page_num}."}
        
        page = doc.load_page(page_index)
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        pix.save(output_path)
        doc.close()
        
        return {"success": True, "message": f"Page {page_num} converted successfully"}

    except Exception as e:
        return {"error": f"Conversion error: {str(e)}"}

def extract_matiere(image_path, target_char):
    start_x = 800 
    x_end = 1130 

    reader = easyocr.Reader(['fr'])
    try:
        img = Image.open(image_path)
        img_height = img.size[1]
        
        results = reader.readtext(image_path, detail=1)
        
        y_min_of_two = -1
        y_max_of_two = -1
        limit_x = 200
        
        for (bbox, text, prob) in results:
            if target_char in text and bbox[0][0] < start_x and bbox[0][0] < limit_x:
                all_y_coords = [point[1] for point in bbox]
                y_min_of_two = min(all_y_coords) 
                y_max_of_two = max(all_y_coords)
                break
                
        if y_min_of_two != -1:
            vsb = 5
            y_min_crop = max(0, int(y_min_of_two) - vsb) 
            veb = 150
            y_max_crop = min(img_height, int(y_max_of_two) + veb)
            crop_area = (start_x, y_min_crop, x_end, y_max_crop)
            
            cropped_img = img.crop(crop_area)
            cropped_img_np = np.array(cropped_img) 
            
            cropped_results = reader.readtext(cropped_img_np, detail=0) 
            
            if cropped_results:
                extracted_text = " ".join(cropped_results).strip()
                return extracted_text
            else:
                return None
        else:
            return None

    except Exception as e:
        return None

def find_substring_in_row(row, x):
    found = None
    for item in row:
        if isinstance(item, str):
            if x in item:
                found = item
                break
    return found

def process_pdf(pdf_source, page_num=2, target='2'):

    temp_dir = tempfile.gettempdir()
    out_img = os.path.join(temp_dir, 'page_output.png')
    
    convert_result = convert_specific_page_to_image(pdf_source, out_img, page_num)
    if "error" in convert_result:
        return {"error": convert_result["error"]}
    
    sem = extract_matiere(out_img, target)
    z = "1"

    matierat = {
        "matierat1": [],
        "matierat2": []
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

    if isinstance(pdf_source, str):
        pdf_file = pdfplumber.open(pdf_source)
    else:
        pdf_file = pdfplumber.open(pdf_source)
    
    with pdf_file as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if 'Sem.' in row:
                        continue
                    
                    if ('RM' in row or 'CC' in row):
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
                            "name": name,
                            "coef": coef,
                            "credit": credit,
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
    
    try:
        if os.path.exists(out_img):
            os.remove(out_img)
    except:
        pass
    
    return matierat

@app.route('/extract', methods=['GET', 'POST'])
def extract_pdf_data():
    try:
        if request.method == 'GET':
            pdf_url = request.args.get('url')
            page_num = int(request.args.get('page_num', 2))
            target = request.args.get('target', '2')
        else:
            data = request.get_json()
            pdf_url = data.get('url')
            page_num = data.get('page_num', 2)
            target = data.get('target', '2')
        
        if not pdf_url:
            return jsonify({"error": "PDF URL is required"}), 400
        
        print(f"Downloading PDF from: {pdf_url}")
        pdf_bytes = download_pdf_from_url(pdf_url)
        
        result = process_pdf(pdf_bytes, page_num, target)
        
        return jsonify(result)
    
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to download PDF: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 2001))
    app.run(debug=False, host='0.0.0.0', port=port)