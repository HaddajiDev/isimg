const express = require('express');
const router = express.Router();
const OpenAi = require('openai');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const storage = multer.memoryStorage();
const upload = multer({ storage });  

const client = new OpenAi({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY
});

const PROMPT = process.env.PROMPT;
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
                    const url = `http://localhost:5000/api/inspect/67ba04d2d3233412acbc8aef`;
                    const response = await fetch(`http://127.0.0.1:2000?url=${url}&sem=1`);
                    const data = response.json();
                    console.log(response);
                    res.status(200).send({pdf : data});
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