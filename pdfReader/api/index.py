from flask import Flask, request, jsonify
import pdfplumber
import requests
from io import BytesIO

app = Flask(__name__)

def download_pdf_from_url(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    return BytesIO(response.content)

@app.route('/', methods=['GET'])
def hello():
    return "Working"

@app.route('/extract', methods=['GET'])
def extract_grades():
    pdf_url = request.args.get('url')
    sem = request.args.get('sem', "1") 

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

    dss = []
    ex = []
    tp = []
    oral = []

    try:
        with pdfplumber.open(download_pdf_from_url(pdf_url)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if ('DS (0.3)' in row or 'DS\n(0.15)' in row or 'DS (0.4)' in row or 'DS (0.15)' in row):
                            for i in range(len(row)):
                                if row[i] in ['DS (0.3)', 'DS\n(0.15)', 'DS (0.4)', 'DS (0.15)']:
                                    break
                            dss.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif 'Ex (0.7)' in row:
                            for i in range(len(row)):
                                if row[i] == 'Ex (0.7)':
                                    break
                            ex.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif ('TP\n(0.15)' in row or 'TP (0.2)' in row or 'TP (0.15)' in row):
                            for i in range(len(row)):
                                if row[i] in ['TP\n(0.15)', 'TP (0.2)', 'TP (0.15)']:
                                    break
                            tp.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif ('Oral\n(0.2)' in row or 'Oral (0.2)' in row):
                            for i in range(len(row)):
                                if row[i] in ['Oral\n(0.2)', 'Oral (0.2)']:
                                    break
                            oral.append(0 if row[i+1] == '' else float(row[i+1]))

            a = 0
            b = 0
            c = 0
            d = 0

            for key, value in grades.items():
                if a < len(dss):
                    value['DS'] = dss[a]
                    a += 1
                else:
                    value['DS'] = 0

                if 'Ex' in value:
                    if b < len(ex):
                        value['Ex'] = ex[b]
                        b += 1
                    else:
                        value['Ex'] = 0

                if 'Oral' in value:
                    if c < len(oral):
                        value['Oral'] = oral[c]
                        c += 1
                    else:
                        value['Oral'] = 0

                if 'TP' in value:
                    if d < len(tp):
                        value['TP'] = tp[d]
                        d += 1
                    else:
                        value['TP'] = 0

                if 'DS2' in value:
                    if a < len(dss):
                        value['DS2'] = dss[a]
                        a += 1
                    else:
                        value['DS2'] = 0

        data = [
                { 'subject': 'Algebre', 'dsal': grades["algebre1"]["DS"], 'exal': grades["algebre1"]["Ex"]},  
                { 'subject': 'Analyse', 'dsa': grades["analyse1"]["DS"], 'exa': grades["analyse1"]["Ex"] },
                { 'subject': 'Algorithme', 'dsalo': grades["algorithme1"]["DS"], 'exalo': grades["algorithme1"]["Ex"] },  
                { 'subject': 'Programmation', 'dsprog': grades["atelier1"]["DS"], 'exaprog': grades["atelier1"]["Ex"], 'tpprog': grades["atelier1"]["TP"] },  
                { 'subject': "Systemes d exploitation", 'dsse': grades["systeme1"]["DS"], 'exase': grades["systeme1"]["Ex"], 'tpse': grades["systeme1"]["TP"] },  
                { 'subject': 'Systemes logique', 'dssl': grades["logique"]["DS"], 'examensl': grades["logique"]["Ex"], 'tpsl': grades["logique"]["TP"] },  
                { 'subject': 'Logique formelle', 'dslf': grades["formelle"]["DS"], 'exalf': grades["formelle"]["Ex"] },  
                { 'subject': 'Technologies multimedia', 'dsmm': grades["multi1"]["DS"], 'examm': grades["multi1"]["Ex"], 'tpmm': grades["multi1"]["TP"] },  
                { 'subject': 'Anglais', 'oralang': grades["ang1"]["Oral"], 'dsang': grades["ang1"]["DS"], 'ds2ang': grades["ang1"]["DS2"] },  
                { 'subject': 'Francais', 'oralfr': grades["fra1"]["Oral"], 'dsfr': grades["fra1"]["DS"], 'ds2fr': grades["fra1"]["DS2"]}
        ]
        data2 = [
                { 'subject': 'Algebre', 'dsal': grades["algebre2"]["DS"], 'exal': grades["algebre2"]["Ex"] },
                { 'subject': 'Analyse', 'dsa': grades["analyse2"]["DS"], 'exa': grades["analyse2"]["Ex"] },
                { 'subject': 'Algorithme', 'dsalo': grades["algorithme2"]["DS"], 'exalo': grades["algorithme2"]["Ex"] },
                { 'subject': 'Programmation C', 'dsprog': grades["atelier2"]["DS"], 'exaprog': grades["atelier2"]["Ex"], 'tpprog': grades["atelier2"]["TP"] },
                { 'subject': 'Programmation Python', 'dsprogp': grades["progp"]["DS"], 'exaprogp': grades["progp"]["Ex"], 'tpprogp': grades["progp"]["TP"] },
                { 'subject': 'Systemes d exploitation', 'dsse': grades["systeme2"]["DS"], 'exase': grades["systeme2"]["Ex"], 'tpse': grades["systeme2"]["TP"] },
                { 'subject': 'Fondements des reseaux', 'dssl': grades["reseaux"]["DS"], 'examensl': grades["reseaux"]["Ex"], 'tpsl': grades["reseaux"]["TP"] },
                { 'subject': 'Fondements des bases de donnees', 'dslf': grades["base"]["DS"], 'exalf': grades["base"]["Ex"] },
                { 'subject': 'Anglais', 'oralang': grades["ang2"]["Oral"], 'dsang': grades["ang2"]["DS"], 'ds2ang': grades["ang2"]["DS2"] },
                { 'subject': 'Francais', 'oralfr': grades["fra2"]["Oral"], 'dsfr': grades["fra2"]["DS"], 'ds2fr': grades["fra2"]["DS2"] },
                { 'subject': 'Culture et competence numerique', 'oralfrr': grades["cult"]["Oral"], 'dsfrr': grades["cult"]["DS"], 'ds2frr': grades["cult"]["DS2"] }
        ]

        final_data = data if sem == "1" else data2
        return jsonify(final_data)

    except requests.RequestException as e:
        return jsonify({"success": False, "error": f"Error downloading PDF: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing PDF: {str(e)}"}), 500


@app.route('/extract/lsim2', methods=['GET'])
def extract_grades_2():
    pdf_url = request.args.get('url')
    sem = request.args.get('sem', "1") 

    if not pdf_url:
        return jsonify({"success": False, "error": "No PDF URL provided"}), 400

    grades = {
        "proba1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "automat1": {'DS': 0, 'Ex': 0},
        "graphe1": {'DS': 0, 'Ex': 0},
        "conception1": {'DS': 0, 'Ex': 0},
        "java1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "bd1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "reseaux1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "ang1": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "ges1": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "web1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "animation1": {'DS': 0, 'TP': 0, 'Ex': 0},
        "num": {'DS': 0, 'Ex': 0},
        "tdi": {'DS': 0, 'TP': 0, 'Ex': 0},
        "ig": {'DS': 0, 'TP': 0, 'Ex': 0},
        "web2": {'DS': 0, 'TP': 0, 'Ex': 0},
        "appm": {'DS': 0, 'TP': 0, 'Ex': 0},
        "ai": {'DS': 0, 'TP': 0, 'Ex': 0},
        "test": {'DS': 0, 'TP': 0, 'Ex': 0},
        "ang2": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "droit": {'DS': 0, 'Oral': 0, 'DS2': 0},
        "projet": {'DS': 0, 'TP': 0, 'DS2': 0},
        "web3": {'DS': 0, 'TP': 0, 'Ex': 0},
        "cross": {'DS': 0, 'TP': 0, 'Ex': 0}
    }

    dss = []
    ex = []
    tp = []
    oral = []

    try:
        with pdfplumber.open(download_pdf_from_url(pdf_url)) as pdf:
            for page in pdf.pages:                
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if ('DS (0.3)' in row or 'DS\n(0.15)' in row or 'DS (0.4)' in row or 'DS (0.15)' in row):
                            for i in range(len(row)):
                                if row[i] in ['DS (0.3)', 'DS\n(0.15)', 'DS (0.4)', 'DS (0.15)']:
                                    break
                            dss.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif 'Ex (0.7)' in row:
                            for i in range(len(row)):
                                if row[i] == 'Ex (0.7)':
                                    break
                            ex.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif ('TP\n(0.15)' in row or 'TP (0.2)' in row or 'TP (0.15)' in row):
                            for i in range(len(row)):
                                if row[i] in ['TP\n(0.15)', 'TP (0.2)', 'TP (0.15)']:
                                    break
                            tp.append(0 if row[i+1] == '' else float(row[i+1]))
                        elif ('Oral\n(0.2)' in row or 'Oral (0.2)' in row):
                            for i in range(len(row)):
                                if row[i] in ['Oral\n(0.2)', 'Oral (0.2)']:
                                    break
                            oral.append(0 if row[i+1] == '' else float(row[i+1]))

            a = 0
            b = 0
            c = 0
            d = 0

            for key, value in grades.items():
                if a < len(dss):
                    value['DS'] = dss[a]
                    a += 1
                else:
                    value['DS'] = 0

                if 'Ex' in value:
                    if b < len(ex):
                        value['Ex'] = ex[b]
                        b += 1
                    else:
                        value['Ex'] = 0

                if 'Oral' in value:
                    if c < len(oral):
                        value['Oral'] = oral[c]
                        c += 1
                    else:
                        value['Oral'] = 0

                if 'TP' in value:
                    if d < len(tp):
                        value['TP'] = tp[d]
                        d += 1
                    else:
                        value['TP'] = 0

                if 'DS2' in value:
                    if a < len(dss):
                        value['DS2'] = dss[a]
                        a += 1
                    else:
                        value['DS2'] = 0

        data = [
            { 'subject': 'proba1', 'probads': grades["proba1"]["DS"], 'probatp': grades["proba1"]["TP"], 'probaex': grades["proba1"]["Ex"] },
            { 'subject': 'automat1', 'automatesds': grades["automat1"]["DS"], 'automatesex': grades["automat1"]["Ex"] },
            { 'subject': 'graphe1', 'graphesds': grades["graphe1"]["DS"], 'graphesex': grades["graphe1"]["Ex"] },
            { 'subject': 'conception1', 'conceptionds': grades["conception1"]["DS"], 'conceptionex': grades["conception1"]["Ex"] },
            { 'subject': 'java1', 'javads': grades["java1"]["DS"], 'javaex': grades["java1"]["Ex"], 'javatp': grades["java1"]["TP"] },
            { 'subject': 'bd1', 'bsdds': grades["bd1"]["DS"], 'bsdex': grades["bd1"]["Ex"], 'bsdtp': grades["bd1"]["TP"] },
            { 'subject': 'reseaux1', 'reseauxds': grades["reseaux1"]["DS"], 'reseauxtp': grades["reseaux1"]["TP"], 'reseauxex': grades["reseaux1"]["Ex"] },
            { 'subject': 'ang1', 'anglaisoral': grades["ang1"]["Oral"], 'anglaisds1': grades["ang1"]["DS"], 'anglaisds2': grades["ang1"]["DS2"] },
            { 'subject': 'ges1', 'gesoral': grades["ges1"]["Oral"], 'gesds1': grades["ges1"]["DS"], 'gesds2': grades["ges1"]["DS2"] },
            { 'subject': 'web1', 'webds': grades["web1"]["DS"], 'webtp': grades["web1"]["TP"], 'webex': grades["web1"]["Ex"] },
            { 'subject': 'animation1', 'animationds': grades["animation1"]["DS"], 'animationtp': grades["animation1"]["TP"], 'animationex': grades["animation1"]["Ex"] }
        ]
        data2 = [
            { 'subject': 'num', 'numds': grades["num"]["DS"], 'numex': grades["num"]["Ex"] },
            { 'subject': 'tdi', 'tdids': grades["tdi"]["DS"], 'tditp': grades["tdi"]["TP"], 'tdiex': grades["tdi"]["Ex"] },
            { 'subject': 'ig', 'igds': grades["ig"]["DS"], 'igtp': grades["ig"]["TP"], 'igex': grades["ig"]["Ex"] },
            { 'subject': 'web2', 'web2ds': grades["web2"]["DS"], 'web2tp': grades["web2"]["TP"], 'web2ex': grades["web2"]["Ex"] },
            { 'subject': 'appm', 'appmds': grades["appm"]["DS"], 'appmtp': grades["appm"]["TP"], 'appmex': grades["appm"]["Ex"] },
            { 'subject': 'ai', 'aids': grades["ai"]["DS"], 'aitp': grades["ai"]["TP"], 'aiex': grades["ai"]["Ex"] },
            { 'subject': 'test', 'testds': grades["test"]["DS"], 'testtp': grades["test"]["TP"], 'testex': grades["test"]["Ex"] },
            { 'subject': 'ang2', 'ang2ds1': grades["ang2"]["DS"], 'ang2oral': grades["ang2"]["Oral"], 'ang2ds2': grades["ang2"]["DS2"] },
            { 'subject': 'droit', 'droitds1': grades["droit"]["DS"], 'droitoral': grades["droit"]["Oral"], 'droitds2': grades["droit"]["DS2"] },
            { 'subject': 'projet', 'projetds1': grades["projet"]["DS"], 'projettp': grades["projet"]["TP"], 'projetds2': grades["projet"]["DS2"] },
            { 'subject': 'web3', 'web3ds': grades["web3"]["DS"], 'web3tp': grades["web3"]["TP"], 'web3ex': grades["web3"]["Ex"] },
            { 'subject': 'cross', 'crossds': grades["cross"]["DS"], 'crosstp': grades["cross"]["TP"], 'crossex': grades["cross"]["Ex"] }
        ]

        final_data = data if sem == "1" else data2
        return jsonify(final_data)

    except requests.RequestException as e:
        return jsonify({"success": False, "error": f"Error downloading PDF: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing PDF: {str(e)}"}), 500 


# if __name__ == "__main__":
#     Flask.run(app, port=2000)
#     pass
