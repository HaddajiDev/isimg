require("dotenv").config();

const express = require('express')
const cors = require('cors');

const connect = require('./db_connect');
const fileRoutes = require('./routes/pics');
const { GridFSBucket } = require('mongodb');

const app = express();

const corsOptions = {
    origin: ["https://isimg.vercel.app", "https://isimg-preview.vercel.app"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
    try {
        const db = await connect();
        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads'
        });
        
        app.use('/api', fileRoutes(db, bucket));
        

        app.get("/", (req, res) => res.send("Working"));

        app.listen(5000, () => {
            console.log(`server running on ${5000}`);
        });
    } catch (error) {
        console.error('Error connecting to db:', error);
    }
})();
