const express = require('express');
const router = express.Router();
const OpenAi = require('openai');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const storage = multer.memoryStorage();
const upload = multer({ storage });  
const pdf = require('pdf-parse-new');



const client = new OpenAi({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY
});

const PROMPT = process.env.PROMPT;
const PROMPT_2 = process.env.PROMPT_2;
const BACK = process.env.BACK;
  

module.exports = (db, bucket) => {

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
        next();
    });

    router.post('/data', upload.array('files'), async (req, res) => {    
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        
        try {    
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const readableStream = Readable.from(file.buffer);
                    const uploadStream = bucket.openUploadStream(file.originalname);
    
                    readableStream.pipe(uploadStream)
                        .on('error', reject)
                        .on('finish', () => resolve(uploadStream));
                });
            });

            console.log("uploading");
    
            const uploadStreams = await Promise.all(uploadPromises);
            const urls = uploadStreams.map(us => 
                `https://isimg-pre-back.vercel.app/api/inspect/${us.id}`
            );
    
            const data = await GetData(urls, 1);
            res.status(200).send({ ai: data });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    router.post('/data/sem', upload.array('files'), async (req, res) => {    
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }       
        
        try {    
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const readableStream = Readable.from(file.buffer);
                    const uploadStream = bucket.openUploadStream(file.originalname);
    
                    readableStream.pipe(uploadStream)
                        .on('error', reject)
                        .on('finish', () => resolve(uploadStream));
                });
            });
    
            const uploadStreams = await Promise.all(uploadPromises);
            const urls = uploadStreams.map(us => 
                `https://isimg-pre-back.vercel.app/api/inspect/${us.id}`
            );
    
            const data = await GetData(urls, 2);
            res.status(200).send({ ai: data });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // lsim 1
    router.post('/data/pdf', upload.single('file'), async (req, res) => {

        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const sem = req.query.sem;

        try {
            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(req.file.originalname);

            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                    return res.status(500).send("File upload failed");
                })
                .on('finish', async() => {
                    const url = `https://isimg-pre-back.vercel.app/api/inspect/${uploadStream.id}`;
                    const response = await fetch(`https://isimg-python.vercel.app/extract?url=${encodeURIComponent(url)}&sem=${sem}`);
                    // const response = await fetch(`http://127.0.0.1:2000/extract?url=${encodeURIComponent(url)}&sem=${sem}`);
                    const data = await response.json();                    
                    res.status(200).send({pdf : JSON.stringify(data)});
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send("Error during file upload");
        }
    });

    //lsim 2
    router.post("/data/pdf/lsim2", upload.single('file'), async (req, res) =>{
        
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }


        const sem = req.query.sem;
        console.log(sem)
        try {
            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(req.file.originalname);

            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                    return res.status(500).send("File upload failed");
                })
                .on('finish', async() => {
                    const url = `https://isimg-pre-back.vercel.app/api/inspect/${uploadStream.id}`;
                    const response = await fetch(`https://isimg-python.vercel.app/extract/lsim2?url=${encodeURIComponent(url)}&sem=${sem}`);
                    //const response = await fetch(`http://127.0.0.1:2000/extract/lsim2?url=${encodeURIComponent(url)}&sem=${sem}`);
                    const data = await response.json();
                    res.status(200).send({pdf : JSON.stringify(data)});
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send("Error during file upload");
        }
    });

    //any
    router.post("/data/pdf/any", upload.single('file'), async (req, res) =>{

        res.header('Access-Control-Allow-Origin', 'https://isimg.vercel.app');
        res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        try {            

            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(req.file.originalname);

            readableStream.pipe(uploadStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                    return res.status(500).send("File upload failed");
                })
                .on('finish', async() => {
                    //const response = await GetPdfDataAny(pdfData)
                    //const data = await response.
                    const url = `https://isimg-pre-back.vercel.app/api/inspect/${uploadStream.id}`;
                    const response = await fetch('https://isimg-dynamic-pdf.onrender.com/extract', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Connection': 'keep-alive',
                    },
                        body: JSON.stringify({ pdf_url: url }),
                        keepalive: true,
                    });

                    const data = await response.json();
                    res.status(200).send({pdf : JSON.stringify(data)});
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send("Error during file upload");
        }
    });

    router.get('/inspect/:id', async (req, res) => {
        try {
            const fileId = req.params.id;
            
            if (!ObjectId.isValid(fileId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file ID format'
                });
            }
    
            const objectID = new ObjectId(fileId);
            
            const files = await bucket.find({ _id: objectID }).toArray();
            if (files.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
    
            const fileMetadata = files[0];
            
            res.set({
                'Content-Type': fileMetadata.contentType || 'application/octet-stream',
                'Content-Length': fileMetadata.length,
                'Content-Disposition': `inline; filename="${fileMetadata.filename}"`,                
            });
    
            const downloadStream = bucket.openDownloadStream(objectID);
    
            if (req.headers.range) {
                const range = req.headers.range;
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileMetadata.length - 1;
    
                if (start >= fileMetadata.length) {
                    return res.status(416).json({
                        success: false,
                        error: 'Requested range not satisfiable'
                    });
                }
    
                res.status(206).set({
                    'Content-Range': `bytes ${start}-${end}/${fileMetadata.length}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': end - start + 1
                });
    
                downloadStream.start(start);
                downloadStream.end(end);
            }
    
            downloadStream
                .on('error', (err) => {
                    console.error('Stream error:', err);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            error: 'Error streaming file'
                        });
                    }
                })
                .pipe(res);
    
            req.on('close', () => {
                downloadStream.destroy();
            });
    
        } catch (error) {
            console.error('Error in /inspect:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    router.get('/download/:id', async (req, res) => {
        try {
            const fileId = req.params.id;
            const objectID = new ObjectId(fileId);
            const downloadStream = bucket.openDownloadStream(objectID);

            downloadStream.on('data', (chunk) => {
                res.write(chunk);
            });

            downloadStream.on('end', () => {
                res.end();
            });

            downloadStream.on('error', (err) => {
                console.error('Error downloading file:', err);
                res.status(404).send('File not found.');
            });

        } catch (error) {
            console.error('Error downloading file:', error);
            res.status(500).send('Error downloading file.');
        }
    });

    return router;
}

async function GetData(urls, sem) {
    try {
        const userInput = `extract data | ${urls.join(' | ')}`;

        const messages = [{
            role: "system",
            content: sem === 1 ? PROMPT : PROMPT_2
        }];

        if (userInput.includes('|')) {
            const parts = userInput.split('|').map(p => p.trim());
            const textPart = parts[0];
            const urlParts = parts.slice(1);

            const content = [
                { type: "text", text: textPart }
            ];

            for (const url of urlParts) {
                content.push({ 
                    type: "image_url", 
                    image_url: { url } 
                });
            }

            messages.push({
                role: "user",
                content: content
            });
        }

        const completion = await client.chat.completions.create({
            model: process.env.MODEL,
            messages: messages
        });

        const aiResponse = completion.choices[0].message.content;
        const finalResponse = aiResponse.replace(/```json|```/g, '');
        console.log(finalResponse);
        return finalResponse;

    } catch (error) {
        console.error('Error in GetData:', error);
        throw error;
    }
}


async function GetPdfDataAny(pdfText) {
    const messages = [
        {
            role: "system",
            content: `You are a precise data extraction assistant. Extract academic subject information from the provided PDF text and return it in a clean JSON format.

IMPORTANT RULES:
1. Extract subjects organized by semester (sem1, sem2)
2. For each subject, extract:
   - Subject name (Matière)
   - Coefficient (Coeff)
   - Credits
   - Exam types and scores (épreuves)
   - notes: list of exam components, each containing:
            -"type" → the label (e.g., DS, DS2, TP, Ex, Oral, etc) - extract dynamically
            -"cs" → the number found in parentheses beside the type (as float)
            -"note" → the numeric score beside it (as float)
3. If a note/score does not exist, use 0 (e.g., "ds": 0)
4. If sem2 does not exist in the document, return an empty array for sem2: []
5. Extract Filière (field of study) and Niveau (level/year)
6. Return ONLY valid JSON - no markdown, no code blocks, no backticks, no \\n characters
7. Be accurate with the semester assignment - verify which semester each subject belongs to
8 - Do not assume fixed values for "cs" — always extract the actual number from the text (e.g. Ex (0.5) → "cs": 0.5).
9 - If the same exam type appears more than once for a subject (e.g., two DS entries), label them sequentially as "DS" and "DS2", "TP" and "TP2", etc. 
10 - Ignore unit titles:
    - Lines or boxes like "Mathématiques 1 – Crédits = 5" or "Systèmes Embarqués – Crédits = 8" represent unit headers (unité d'enseignement), not subjects.
    - Do not include them in the JSON output.

Expected JSON structure:
{
  "filiere": "...",
  "niveau": "...",
  "sem1": [
    {
      "matiere": "Subject Name",
      "coeff": 0,
      "credits": 0,
      "notes": [
        { "type": "ds", "cs": 0.15, "note": 3.5 },
        { "type": "tp", "cs": 0.15, "note": 14 },
        { "type": "ex", "cs": 0.7, "note": 1 }
      ]
    }
  ],
  "sem2": []
}`
        },
        {
            role: "user",
            content: [
                { type: "text", text: "Extract the subjects based on their semester from this PDF" },
                { type: "text", text: pdfText }
            ]
        }
    ];

    const completion = await client.chat.completions.create({
        model: process.env.MODEL,
        messages: messages
    });

    const aiResponse = completion.choices[0].message.content;
    const finalResponse = aiResponse.replace(/```json|```/g, '');
    console.log(finalResponse);
    return finalResponse;
}
