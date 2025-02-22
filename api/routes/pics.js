const express = require('express');
const router = express.Router();
const OpenAi = require('openai');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const { processPdf } = require('../pdfConverter');
const storage = multer.memoryStorage();
const upload = multer({ storage });  

const client = new OpenAi({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY
});

const PROMPT = process.env.PROMPT;
const BACK = process.env.BACK;
  

module.exports = (db, bucket) => {
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
    
            const uploadStreams = await Promise.all(uploadPromises);
            const urls = uploadStreams.map(us => 
                `https://isimg-pre-back.vercel.app/api/inspect/${us.id}`
            );
    
            const data = await GetData(urls);
            res.status(200).send({ ai: data });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    router.post('/data/pdf', upload.single('file'), async (req, res) => {

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
                    const url = `${process.env.BACK}/api/inspect/${uploadStream.id}`;
                    const data = await processPdf(url, 1);
                    res.status(200).send({pdf : data});
                });

        } catch (error) {
            console.error('Error during file upload:', error);
            res.status(500).send("Error during file upload");
        }
    });

    

    router.get('/inspect/:id', async(req, res) => {
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
                    res.status(404).send(`<h1>File not Found</h1>`);
                });       
            

        } catch (error) {            
            res.status(500).send('Error downloading file.');
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

async function GetData(urls) {
    try {
        const userInput = `extract data | ${urls.join(' | ')}`;

        const messages = [{
            role: "system",
            content: PROMPT
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
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages: messages
        });

        const aiResponse = completion.choices[0].message.content;
        const finalResponse = aiResponse.replace(/```json|```/g, '');
        return finalResponse;

    } catch (error) {
        console.error('Error in GetData:', error);
        throw error;
    }
}