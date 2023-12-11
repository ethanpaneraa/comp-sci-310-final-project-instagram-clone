const express = require('express');
const config = require('./config.js');
const cors = require("cors"); 
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const dbConnection = require('./database.js');
const { HeadBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');
const userRoute = require("./routes/user.js");
const postRoute = require("./routes/post.js");
const PORT = process.env.PORT || 3001; 

const app = express(); 
app.use(express.json()); 
app.use(cors()); 


app.get("/", (req, res) => {
  res.status(200).send(`<h1>Ethan Pineda, Danny Pineda, Jesus Montero, Lizbeth Yumbla COMP_SCI 310 Final Project</h1>`); 
}); 

app.post('/api/posts/create', upload.single('image'));

app.use("/api/users", userRoute);

app.use("/api/posts", postRoute); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`); 
}); 