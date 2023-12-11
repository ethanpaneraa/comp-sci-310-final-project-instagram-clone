// defines the api for the users api
const dbConnection = require('../database.js');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const fetchAllUsers = async (req, res) => {

  console.log("call to /api/users...");

  try {

    dbConnection.query(`SELECT * FROM users ORDER BY userid ASC`, (error, rows) => {
      if (error) {
        res.status(400).json({
          "message": error.message,
          "data": []
        })
      } else {
        res.status(200).json({
          message: "success", 
          data: rows
        })
      };
    });

  }
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }
};

const createUser = async (req, res) => {

  console.log("call to /api/users...");

  const { username, email, lastname, firstname, password } = req.body;

  if (!username || !email || !lastname || !firstname || !password) {
    res.status(400).json({
      "message": "missing required fields",
    });
  }; 

  const hashed_password = bcrypt.hashSync(password, 10);
  const bucketfolder = uuid.v4();

  try {
    const sql = `INSERT INTO users (username, email, lastname, firstname, hashed_password, bucketfolder) VALUES (?, ?, ?, ?, ?, ?)`; 
    const values = [username, email, lastname, firstname, hashed_password, bucketfolder]; 

    dbConnection.query(sql, values, (error, rows) => {
      if (error) {
        console.log("error in createUser");
        res.status(400).json({
          "message": error.message,
        });
      } else {
        res.status(200).json({
          "message": "success",
          "data": {
            username: username,
            email: email,
            lastname: lastname,
            firstname: firstname,
            bucketfolder: bucketfolder,
            userid: rows.insertId
          }
        });
      };
    });
  } catch (error) {
    console.log("error in createUser: ", error.message);
    res.status(400).json({
      "message": error.message,
    });
  };
};

const checkDoesUserExist = async (req, res) => {

  console.log("call to /api/users/exists");

  const { email, password } = req.body;
  
  try {
    const sql = `SELECT * FROM users WHERE email = ?`;
    dbConnection.query(sql, [email], (error, rows) => {
      if (error) {
        res.status(400).json({
          "message": error.message,
          "data": []
        });
      } else {
        if (rows.length > 0) {
          const isPasswordCorrect = bcrypt.compareSync(password, rows[0].hashed_password);
          if (isPasswordCorrect) {
            res.status(200).json({
              "message": "success",
              "data": rows[0]
            });
          } else {
            res.status(200).json({
              "message": "Invalid credentials",
              "data": []
            });
          }
        } else {
          res.status(200).json({
            "message": "User not found",
            "data": []
          });
        };
      };
    });
    
  } catch (error) {
    console.log("error in checkDoesUserExist");
    res.status(400).json({
      "message": error.message,
      "data": []
    });
  };
};


const followUser = async (req, res) => {
    
  console.log("call to /api/user/follow..."); 

    try {
        
      const { to, from } = req.body; 

      console.log("to: ", to);
      console.log("from: ", from);

      if (!to || !from) {
        res.status(400).json({
          "message": "one or more userid's do not exist!",
          "data": []
        });
      }; 

      const sql = `INSERT INTO followers (following_user_id, followed_user_id) VALUES (?, ?)`;

      dbConnection.query(sql, [from, to], (err, results) => {
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
};

const unfollowUser = async (req, res) => {

  console.log("call to /api/user/unfollow..."); 

    try {

      const { to, from } = req.body; 

      if (!to || !from) {
        res.status(400).json({
          "message": "one or more userid's do not exist!",
          "data": []
        });
      }; 

      const sql = `DELETE FROM followers WHERE following_user_id = ? AND followed_user_id = ?`;

      dbConnection.query(sql, [from, to], (err, results) => {
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
};

const fetchUserProfile = async (req, res) => {
  console.log("call to /api/user/profile...");

  const { userid } = req.params;

  try {
    const sql = `SELECT u.userid, u.username, u.firstname, u.lastname, u.email, u.bucketfolder, COUNT(f.followed_user_id) AS followers
                FROM users u
                LEFT JOIN
                followers f ON u.userid = f.followed_user_id
                WHERE
                u.userid = ?
                GROUP BY
                u.userid, u.username, u.firstname, u.lastname, u.email, u.bucketfolder
                `; 
    dbConnection.query(sql, [userid], (err, results) => {
      if (err) {
        console.log("Error fetching user profile: ", err.message);
        return res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        return res.status(200).json({
          "message": "success",
          "data": results
        });
      };
    });
  } catch (error) {
    console.log("Error fetching user profile: ", error.message);
    return res.status(400).json({
      "message": error.message,
      "data": []
    });
  }
};

const fetchUserProfilePost = async (req, res) => {

  console.log("call to /api/user/profile...");

  const { userid } = req.params; 

  try {
    const sql = `SELECT p.postid, p.likes AS post_likes, a.bucketkey, u.firstname, u.lastname, u.username, COUNT(f.followed_user_id) AS followers,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'commentid', c.commentid,
                      'userid', c.userid,
                      'comment', c.comment,
                      'created_at', c.created_at
                    )
                  )
                  FROM comments c 
                  WHERE c.postid = p.postid
                )
                FROM users u 
                LEFT JOIN 
                posts p ON u.userid = p.userid
                LEFT JOIN 
                assets a ON p.assetid = a.assetid
                LEFT JOIN 
                followers f ON u.userid = f.followed_user_id
                WHERE 
                u.userid = ?
                GROUP BY 
                p.postid, p.likes, a.bucketkey, u.firstname, u.lastname, u.username`;
    
    dbConnection.query(sql, [userid], (err, results) => {
      if (err) {
        console.log("Error fetching user profile: ", err.message);
        return res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        return res.status(200).json({
          "message": "success",
          "data": results
        });
      };
    });

  } catch (error) {
    console.log("Error fetching user profile: ", error.message);
    return res.status(400).json({
      "message": error.message,
      "data": []
    });
  };
};

const fetchAllUsersFollowers = async (req, res) => {
  console.log("call to /api/user/followers...");

  const { userid } = req.params;

  try {
    const sql = `SELECT u.userid, u.username, u.firstname, u.lastname, u.email, u.bucketfolder
                FROM users u
                INNER JOIN
                followers f ON u.userid = f.following_user_id
                WHERE
                f.followed_user_id = ?
                GROUP BY
                u.userid;
                `; 
    dbConnection.query(sql, [userid], (err, results) => {
      if (err) {
        console.log("Error fetching user profile: ", err.message);
        return res.status(400).json({
          "message": err.message,
          "data": []
        });
      } else {
        return res.status(200).json({
          "message": "success",
          "data": results
        });
      };
    });
  } catch (error) {
    console.log("Error fetching user profile: ", error.message);
    return res.status(400).json({
      "message": error.message,
      "data": []
    });
  }
};



module.exports = {
  fetchAllUsers, 
  createUser, 
  checkDoesUserExist,
  followUser,
  unfollowUser, 
  fetchUserProfile,
  fetchUserProfilePost,
  fetchAllUsersFollowers
};

