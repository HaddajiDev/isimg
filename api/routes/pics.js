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
    router.post('/data', upload.single('file'), async (req, res) => {    
        try {
          if (!req.file) return res.status(400).send('No file uploaded');
      
          const readableStream = Readable.from(req.file.buffer);
          const uploadStream = bucket.openUploadStream(req.file.originalname);
      
          readableStream.pipe(uploadStream)
            .on('error', (error) => {
              console.error('Upload error:', error);
              return res.status(500).send("File upload failed");
            })
            .on('finish', async () => {
              try {
                const data = await GetData(uploadStream);
                res.status(200).send({ ai: data });
              } catch (error) {
                console.error('AI Processing error:', error);
                res.status(500).json({ error: "AI processing failed" });
              }
            });
        } catch (error) {
          console.error('Server error:', error);
          res.status(500).json({ error: "Internal server error" });
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


    return router;
}

async function GetData(uploadStream) {
    try {
        const userInput = `extract data | https://isimg-pre-back.vercel.app/api/inspect/${uploadStream.id}`;

        const messages = [{
            role: "system",
            content: PROMPT
        }];

        if (userInput.includes('|')) {
            const [textPart, urlPart] = userInput.split('|');
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: textPart.trim() },
                    { type: "image_url", image_url: { url: urlPart.trim() } }
                ]
            });
        } else {
            messages.push({
                role: "user",
                content: userInput
            });
        }

        const completion = await client.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages: messages
        });

        const aiResponse = completion.choices[0].message.content;
        const finalResponse = aiResponse.replace(/```json|```/g, '');
        console.log('AI Response:', finalResponse);
        return finalResponse;

    } catch (error) {
        console.error('Error in GetData:', error);
        throw error;
    }
}