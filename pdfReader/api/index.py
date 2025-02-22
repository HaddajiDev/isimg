from flask import Flask, request, jsonify
import pdfplumber
import requests
from io import BytesIO

app = Flask(__name__)

def download_pdf_from_url(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    return BytesIO(response.content)

@app.route('/extract', methods=['GET'])
def extract_grades():
    pdf_url = request.args.get('url')
    sem = request.args.get('sem')
    if not pdf_url:
        return jsonify({"success": False, "error": "No PDF URL provided"}), 400

    grades = {
        "algebre1": {'DS': 0, 'Ex': 0},
        "analyse1": {'DS': 0, 'Ex': 0},
        "algorithme1": {'DS': 0, 'Ex': 0},
        "atelier1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "systeme1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "logique": {'DS': 0, 'TP': 0, 'Ex': 0},
        "formelle": {'DS': 0, 'Ex': 0},
        "multi1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "ang1": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "fra1": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "algebre2": {'DS': 0, 'Ex': 0},
        "analyse2": {'DS': 0, 'Ex': 0},
        "algorithme2": {'DS': 0, 'Ex': 0},
        "atelier2": {'DS': 0, 'TP': 0, 'Ex': 0},
        "progp": {'DS': 0, 'TP': 0, 'Ex': 0},
        "systeme2": {'DS': 0, 'TP': 0, 'Ex': 0},
        "reseaux": {'DS': 0, 'TP': 0, 'Ex': 0},
        "base": {'DS': 0, 'Ex': 0},
        "ang2": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "fra2": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "cult": {'DS': 0, 'Oral': 0, 'DS2': 0}
    }

    dss, ex, tp, oral = [], [], [], []

    try:
        with pdfplumber.open(download_pdf_from_url(pdf_url)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if any(x in row for x in ['DS (0.3)', 'DS\n(0.15)', 'DS (0.4)']):
                            i = next(i for i, val in enumerate(row) if val in ['DS (0.3)', 'DS\n(0.15)', 'DS (0.4)'])
                            dss.append(float(row[i + 1]) if row[i + 1] else 0)
                        elif 'Ex (0.7)' in row:
                            i = row.index('Ex (0.7)')
                            ex.append(float(row[i + 1]) if row[i + 1] else 0)
                        elif any(x in row for x in ['TP\n(0.15)', 'TP (0.2)']):
                            i = next(i for i, val in enumerate(row) if val in ['TP\n(0.15)', 'TP (0.2)'])
                            tp.append(float(row[i + 1]) if row[i + 1] else 0)
                        elif any(x in row for x in ['Oral\n(0.2)', 'Oral (0.2)']):
                            i = next(i for i, val in enumerate(row) if val in ['Oral\n(0.2)', 'Oral (0.2)'])
                            oral.append(float(row[i + 1]) if row[i + 1] else 0)

        ds_idx, ex_idx, tp_idx, oral_idx = 0, 0, 0, 0
        for subject in grades:
            grades[subject]['DS'] = dss[ds_idx] if ds_idx < len(dss) else 0
            ds_idx += 1
            if 'Ex' in grades[subject]:
                grades[subject]['Ex'] = ex[ex_idx] if ex_idx < len(ex) else 0
                ex_idx += 1
            if 'TP' in grades[subject]:
                grades[subject]['TP'] = tp[tp_idx] if tp_idx < len(tp) else 0
                tp_idx += 1
            if 'Oral' in grades[subject]:
                grades[subject]['Oral'] = oral[oral_idx] if oral_idx < len(oral) else 0
                oral_idx += 1
            if 'DS2' in grades[subject]:
                grades[subject]['DS2'] = dss[ds_idx] if ds_idx < len(dss) else 0
                ds_idx += 1

        data = [
            {'subject': 'Algebre', 'dsal': grades["algebre1"]["DS"], 'exal': grades["algebre1"]["Ex"]},
            {'subject': 'Analyse', 'dsa': grades["analyse1"]["DS"], 'exa': grades["analyse1"]["Ex"]},
            {'subject': 'Algorithme', 'dsalo': grades["algorithme1"]["DS"], 'exalo': grades["algorithme1"]["Ex"]},
            {'subject': 'Programmation', 'dsprog': grades["atelier1"]["DS"], 'exaprog': grades["atelier1"]["Ex"], 'tpprog': grades["atelier1"]["TP"]},
            {'subject': "Systemes d exploitation", 'dsse': grades["systeme1"]["DS"], 'exase': grades["systeme1"]["Ex"], 'tpse': grades["systeme1"]["TP"]},
            {'subject': 'Systemes logique', 'dssl': grades["logique"]["DS"], 'examensl': grades["logique"]["Ex"], 'tpsl': grades["logique"]["TP"]},
            {'subject': 'Logique formelle', 'dslf': grades["formelle"]["DS"], 'exalf': grades["formelle"]["Ex"]},
            {'subject': 'Technologies multimedia', 'dsmm': grades["multi1"]["DS"], 'examm': grades["multi1"]["Ex"], 'tpmm': grades["multi1"]["TP"]},
            {'subject': 'Anglais', 'oralang': grades["ang1"]["Oral"], 'dsang': grades["ang1"]["DS"], 'exaang': grades["ang1"]["DS2"]},
            {'subject': 'Francais', 'oralfr': grades["fra1"]["Oral"], 'dsfr': grades["fra1"]["DS"], 'exafr': grades["fra1"]["DS2"]}
        ]

        data2 = [
            {'subject': 'Algebre', 'dsal': grades["algebre2"]["DS"], 'exal': grades["algebre2"]["Ex"]},
            {'subject': 'Analyse', 'dsa': grades["analyse2"]["DS"], 'exa': grades["analyse2"]["Ex"]},
            {'subject': 'Algorithme', 'dsalo': grades["algorithme2"]["DS"], 'exalo': grades["algorithme2"]["Ex"]},
            {'subject': 'Programmation C', 'dsprog': grades["atelier2"]["DS"], 'exaprog': grades["atelier2"]["Ex"], 'tpprog': grades["atelier2"]["TP"]},
            {'subject': 'Programmation Python', 'dsprogp': grades["progp"]["DS"], 'exaprogp': grades["progp"]["Ex"], 'tpprogp': grades["progp"]["TP"]},
            {'subject': 'Systemes d exploitation', 'dsse': grades["systeme2"]["DS"], 'exase': grades["systeme2"]["Ex"], 'tpse': grades["systeme2"]["TP"]},
            {'subject': 'Fondements des reseaux', 'dssl': grades["reseaux"]["DS"], 'examensl': grades["reseaux"]["Ex"], 'tpsl': grades["reseaux"]["TP"]},
            {'subject': 'Fondements des bases de donnees', 'dslf': grades["base"]["DS"], 'exalf': grades["base"]["Ex"]},
            {'subject': 'Anglais', 'oralang': grades["ang2"]["Oral"], 'dsang': grades["ang2"]["DS"], 'exaang': grades["ang2"]["DS2"]},
            {'subject': 'Francais', 'oralfr': grades["fra2"]["Oral"], 'dsfr': grades["fra2"]["DS"], 'exafr': grades["fra2"]["DS2"]},
            {'subject': 'Culture et competence numerique', 'oralfrr': grades["cult"]["Oral"], 'dsfrr': grades["cult"]["DS"], 'exafrr': grades["cult"]["DS2"]}
        ]

        final_data = ""
        if sem == 1 : final_data = data
        else: final_data = data2

        print(final_data)

        return jsonify({"pdf" : final_data})

    except requests.RequestException as e:
        return jsonify({"success": False, "error": f"Error downloading PDF: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing PDF: {str(e)}"}), 500

def handler(event, context):
    return app(event, context)

if __name__ == '__main__':
    app.run(debug=True, port=2000)
