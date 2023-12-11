// defines the routes for the post api
const express = require("express");
const postController = require("../controllers/post.js");
const router = express.Router(); 
const multer = require("multer"); 
const upload = multer({ storage: multer.memoryStorage() });

// router.get("/", postController.fetchAllPosts);

router.post("/create", postController.uploadImage);

router.get("/", postController.fetchPosts);

router.post("/comments", postController.fetchComments);

router.put("/like", postController.likePost);

router.get("/image/:bucketkey", postController.serveImage);

router.post('/create', upload.single('image'), postController.uploadImage);

router.post("/comment", postController.createComment);


module.exports = router