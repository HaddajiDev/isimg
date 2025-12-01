require("dotenv").config();

const express = require('express')
const cors = require('cors');

const connect = require('./db_connect');
const fileRoutes = require('./routes/pics');
const { GridFSBucket } = require('mongodb');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      "https://isimg.vercel.app",
      "https://localhost:3000"
    ];

    if (origin && origin.match(/^https:\/\/isimg-.*\.vercel\.app$/)) {
      return callback(null, true);
    }

    if (!origin || whitelist.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
