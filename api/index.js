require("dotenv").config();

const express = require('express')
const cors = require('cors');

const connect = require('./db_connect');
const fileRoutes = require('./routes/pics');
const { GridFSBucket } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['http://localhost:3000', 'https://isimg.vercel.app', 'https://isimg-preview.vercel.app', 'https://isimg-pre-back.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Range', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOptions.origin.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
});

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