const https = require('https');
const pdf = require('pdf-parse');

// Define grade structure
const grades = {
    "algebre1": { DS: 0, Ex: 0 },
    "analyse1": { DS: 0, Ex: 0 },
    "algorithme1": { DS: 0, Ex: 0 },
    "atelier1": { DS: 0, TP: 0, Ex: 0 },
    "systeme1": { DS: 0, TP: 0, Ex: 0 },
    "logique": { DS: 0, TP: 0, Ex: 0 },
    "formelle": { DS: 0, Ex: 0 },
    "multi1": { DS: 0, TP: 0, Ex: 0 },
    "ang1": { DS: 0, Oral: 0, DS2: 0 },
    "fra1": { DS: 0, Oral: 0, DS2: 0 },
    "algebre2": { DS: 0, Ex: 0 },
    "analyse2": { DS: 0, Ex: 0 },
    "algorithme2": { DS: 0, Ex: 0 },
    "atelier2": { DS: 0, TP: 0, Ex: 0 },
    "progp": { DS: 0, TP: 0, Ex: 0 },
    "systeme2": { DS: 0, TP: 0, Ex: 0 },
    "reseaux": { DS: 0, TP: 0, Ex: 0 },
    "base": { DS: 0, Ex: 0 },
    "ang2": { DS: 0, Oral: 0, DS2: 0 },
    "fra2": { DS: 0, Oral: 0, DS2: 0 },
    "cult": { DS: 0, Oral: 0, DS2: 0 }
};

function downloadPdfFromUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download PDF: ${response.statusCode}`));
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

async function extractGrades(pdfBuffer) {
    const data = await pdf(pdfBuffer);
    const text = data.text;

    const lines = text.split('\n').map(line => line.trim());
    const dss = [], ex = [], tp = [], oral = [];

    lines.forEach(line => {
        if (line.includes('DS (0.3)') || line.includes('DS\n(0.15)') || line.includes('DS (0.4)')) {
            const value = line.match(/DS\s*\(0\.[34]\)|\n\(0\.15\)\)[\s]*([0-9.]+)/);
            dss.push(value ? parseFloat(value[1]) : 0);
        } else if (line.includes('Ex (0.7)')) {
            const value = line.match(/Ex\s*\(0\.7\)[\s]*([0-9.]+)/);
            ex.push(value ? parseFloat(value[1]) : 0);
        } else if (line.includes('TP\n(0.15)') || line.includes('TP (0.2)')) {
            const value = line.match(/TP\s*\n?\(0\.[12][5]\)[\s]*([0-9.]+)/);
            tp.push(value ? parseFloat(value[1]) : 0);
        } else if (line.includes('Oral\n(0.2)') || line.includes('Oral (0.2)')) {
            const value = line.match(/Oral\s*\n?\(0\.2\)[\s]*([0-9.]+)/);
            oral.push(value ? parseFloat(value[1]) : 0);
        }
    });

    return { dss, ex, tp, oral };
}

async function processPdf(url, sem) {
    try {
        const pdfBuffer = await downloadPdfFromUrl(url);
        const { dss, ex, tp, oral } = await extractGrades(pdfBuffer);

        let dsIdx = 0, exIdx = 0, tpIdx = 0, oralIdx = 0;
        for (const subject in grades) {
            grades[subject].DS = dss[dsIdx] || 0;
            dsIdx++;
            if ('Ex' in grades[subject]) {
                grades[subject].Ex = ex[exIdx] || 0;
                exIdx++;
            }
            if ('TP' in grades[subject]) {
                grades[subject].TP = tp[tpIdx] || 0;
                tpIdx++;
            }
            if ('Oral' in grades[subject]) {
                grades[subject].Oral = oral[oralIdx] || 0;
                oralIdx++;
            }
            if ('DS2' in grades[subject]) {
                grades[subject].DS2 = dss[dsIdx] || 0;
                dsIdx++;
            }
        }

        const data = [
            { subject: 'Algebre', dsal: grades["algebre1"].DS, exal: grades["algebre1"].Ex },
            { subject: 'Analyse', dsa: grades["analyse1"].DS, exa: grades["analyse1"].Ex },
            { subject: 'Algorithme', dsalo: grades["algorithme1"].DS, exalo: grades["algorithme1"].Ex },
            { subject: 'Programmation', dsprog: grades["atelier1"].DS, exaprog: grades["atelier1"].Ex, tpprog: grades["atelier1"].TP },
            { subject: "Systemes d exploitation", dsse: grades["systeme1"].DS, exase: grades["systeme1"].Ex, tpse: grades["systeme1"].TP },
            { subject: 'Systemes logique', dssl: grades["logique"].DS, examensl: grades["logique"].Ex, tpsl: grades["logique"].TP },
            { subject: 'Logique formelle', dslf: grades["formelle"].DS, exalf: grades["formelle"].Ex },
            { subject: 'Technologies multimedia', dsmm: grades["multi1"].DS, examm: grades["multi1"].Ex, tpmm: grades["multi1"].TP },
            { subject: 'Anglais', oralang: grades["ang1"].Oral, dsang: grades["ang1"].DS, exaang: grades["ang1"].DS2 },
            { subject: 'Francais', oralfr: grades["fra1"].Oral, dsfr: grades["fra1"].DS, exafr: grades["fra1"].DS2 }
        ];

        const data2 = [
            { subject: 'Algebre', dsal: grades["algebre2"].DS, exal: grades["algebre2"].Ex },
            { subject: 'Analyse', dsa: grades["analyse2"].DS, exa: grades["analyse2"].Ex },
            { subject: 'Algorithme', dsalo: grades["algorithme2"].DS, exalo: grades["algorithme2"].Ex },
            { subject: 'Programmation C', dsprog: grades["atelier2"].DS, exaprog: grades["atelier2"].Ex, tpprog: grades["atelier2"].TP },
            { subject: 'Programmation Python', dsprogp: grades["progp"].DS, exaprogp: grades["progp"].Ex, tpprogp: grades["progp"].TP },
            { subject: 'Systemes d exploitation', dsse: grades["systeme2"].DS, exase: grades["systeme2"].Ex, tpse: grades["systeme2"].TP },
            { subject: 'Fondements des reseaux', dssl: grades["reseaux"].DS, examensl: grades["reseaux"].Ex, tpsl: grades["reseaux"].TP },
            { subject: 'Fondements des bases de donnees', dslf: grades["base"].DS, exalf: grades["base"].Ex },
            { subject: 'Anglais', oralang: grades["ang2"].Oral, dsang: grades["ang2"].DS, exaang: grades["ang2"].DS2 },
            { subject: 'Francais', oralfr: grades["fra2"].Oral, dsfr: grades["fra2"].DS, exafr: grades["fra2"].DS2 },
            { subject: 'Culture et competence numerique', oralfrr: grades["cult"].Oral, dsfrr: grades["cult"].DS, exafrr: grades["cult"].DS2 }
        ];

        if(sem === 1){
            return data;
        }
        else {
            return data2;
        }
    } catch (error) {
        throw new Error(`Error processing PDF: ${error.message}`);
    }
}

module.exports = { processPdf };

