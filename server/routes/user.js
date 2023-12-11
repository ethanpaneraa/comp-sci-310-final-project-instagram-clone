// defines the routes for the user's api
const express = require("express"); 
const userController = require("../controllers/user.js");
const router = express.Router();

router.get("/", userController.fetchAllUsers); 
router.post("/register", userController.createUser);
router.post("/login", userController.checkDoesUserExist);
router.get("/profile/info/:userid", userController.fetchUserProfile);
router.get("/profile/post/:userid", userController.fetchUserProfilePost);
router.put("/follow", userController.followUser);
router.put("/unfollow", userController.unfollowUser);
router.get("/followers/:userid", userController.fetchAllUsersFollowers);

module.exports = router;