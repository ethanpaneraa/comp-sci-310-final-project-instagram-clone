const dbConnection = require("../database.js"); 
const { PutObjectCommand, GetObjectAclCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./../aws.js');
const { v4: uuidv4 } = require('uuid');

const uploadImageToS3 = async (file, bucketkey) => {
  const params = {
    Bucket: s3_bucket_name, 
    Key: bucketkey, 
    Body: file.buffer, 
    ContentType: file.mimetype
  };

  try {
    // Stream the file to S3
    await s3.send(new PutObjectCommand(params));
    console.log("Upload Success");
  } catch (error) {
    console.error("Error uploading image to S3", error);
    throw error; 
  }
};


const insertImageIntoAssets = async (post) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO assets (userid, bucketkey) VALUES (?, ?)`;
    const params = [post.userid, post.bucketkey];
    dbConnection.query(sql, params, (err, result) => {
      if (err) {
        console.log("error inserting into assets", err);
        reject(err);
      } else {
        console.log("success inserting into assets", result);
        resolve(result.insertId);
      };
    });
  });
};

const insertPostIntoPosts = async (post) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO posts (assetid, userid, caption) VALUES (?, ?, ?)`;
    const params = [post.assetid, post.userid, post.caption];
    dbConnection.query(sql, params, (err, result) => {
      if (err) {
        console.log("error inserting into posts", err);
        reject(err);
      } else {
        console.log("success inserting into posts", result);
        resolve(result);
      };
    });
  });
};

const getUserBucketKey = async (userid) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT bucketfolder FROM users WHERE userid = ?`;
    const params = [userid];
    dbConnection.query(sql, params, (err, result) => {
      if (err) {
        console.log("error getting bucketkey", err);
        reject(err);
      } else {
        console.log("success getting bucketkey");
        resolve(result[0].bucketfolder);
      };
    });
  });
};

const uploadImage = async (req, res) => {
  console.log("uploadImage called");

  const userid = req.body.userid;
  const caption = req.body.caption;
  
  console.log("userid", userid);
  console.log("caption", caption);
  if (!userid || !caption || !req.file) {
    console.log("missing required fields");
    res.status(400).send({ message: "missing required fields" });
    return;
  }
  let bucketkey = await getUserBucketKey(userid);

  if (bucketkey.length === 0) {
    console.log("no bucketkey found for user");
    res.status(400).send({ message: "no bucketkey found for user" });
    return;
  };

  let assetkey = uuidv4();
  bucketkey = `${bucketkey}/${assetkey}`;
  const post = { userid, assetkey, bucketkey, caption };

  await uploadImageToS3(req.file, bucketkey);

  const assetid = await insertImageIntoAssets(post);
  await insertPostIntoPosts({ assetid, ...post });
  res.status(200).send({ message: "image uploaded successfully" });
};

const likePost = async (req, res) => {

  console.log("call to /api/like..."); 

  try {

    const { postid } = req.body; 

    if (!postid) {
      res.status(400).json({
        "message": "Missing required fields",
        "data": []
      });
    }; 
    
    const sql = `UPDATE posts SET likes = likes + 1 WHERE postid = ?`;
    
    dbConnection.query(sql, [postid], (err, results) => {
      if (err) {
        res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        res.status(200).json({
          "message": "success", 
          "data": results
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      "message": err.message, 
    })
  }
}


const fetchComments = async (req, res) => {

  console.log("call to /api/comments..."); 

  try {

    const { postid } = req.body; 

    if (!postid) {
      res.status(400).json({
        "message": "Missing required fields",
        "data": []
      });
    }; 

    const sql = `SELECT * from comments WHERE postid = ?`;

    dbConnection.query(sql, [postid], (err, results) => {
      if (err) {
        res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        res.status(200).json({
          "message": "success", 
          "data": results
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      "message": err.message, 
    })
  }

}

const fetchPosts = async (req, res) => {

  console.log("call to /api/posts..."); 

  try {
    const sql = `SELECT posts.*, assets.bucketkey, users.username,
                (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                'commentid', comments.commentid,
                'userid', comments.userid,
                'comment', comments.comment,
                'created_at', comments.created_at,
                'username', comments.username
              )
            )
            FROM comments
            WHERE comments.postid = posts.postid) AS comments
            FROM posts 
            JOIN assets ON posts.assetid = assets.assetid
            JOIN users ON posts.userid = users.userid
            `;

    dbConnection.query(sql, [], (err, results) => {
      if (err) {
        res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        res.status(200).json({
          "message": "success", 
          "data": results
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      "message": err.message, 
    });
  };
};

const serveImage = async (req, res) => {
  try {
    const bucketkey = decodeURIComponent(req.params.bucketkey);
    const params = { Bucket: s3_bucket_name, Key: bucketkey };
    const data = await s3.send(new GetObjectCommand(params));
    res.setHeader('Content-Type', 'image/jpeg');
    data.Body.pipe(res);
  } catch (err) {
    console.error("Error serving image:", err);
    res.status(400).send({ message: "Error serving image", error: err.message });
  };
};

const createComment = async (req, res) => {
  console.log("call to /api/comment...");

  try {
    const { postid, comment, userid, username } = req.body;
    console.log(postid, comment, userid, username);

    if (!postid || !comment || !userid || !username) {
      res.status(400).json({
        message: "Missing required fields",
        data: [],
      });
    }

    const sql = `INSERT INTO comments (userid, comment, postid, username) VALUES (?, ?, ?, ?)`;
    const params = [userid, comment, postid, username];

    dbConnection.query(sql, params, (err, results) => {
      if (err) {
        res.status(400).json({
          message: err.message,
          data: [],
        });
      } else {
        res.status(200).json({
          message: "success",
          data: results,
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};


module.exports = {
  uploadImage, 
  likePost,
  fetchComments,
  fetchPosts, 
  serveImage,
  createComment
};