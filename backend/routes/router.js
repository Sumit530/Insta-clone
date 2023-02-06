const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
jsonparser = bodyParser.json();
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const form = multer();
const auth = require("../middleware/oath");
const session = require("express-session");
const adminauth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const UserController = require('../controller/user');


//uploading profile in server using multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 19);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage
,fileFilter: (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
    return cb('Only .png, .jpg and .jpeg format allowed!');
  }
} });
//uploading post pic  in server using multer
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/post");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 19);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload_post_img = multer({ storage: storage2,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "video/mp4" ||  file.mimetype == "video/avi" || file.mimetype == "image/jpg"  || file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
      cb(null, true);
    }
    else {
      cb(null, false);
      return cb('Only .png, .jpg  .mp4 .avi and .jpeg  format allowed!');
    }
  } 

});

//user register route
router.post("/register", upload.single("profile"),UserController.userRegister)
//login route of user 
router.post("/login", form.array(),UserController.userLogin);

//show profile api of user

router.get("/showprofile", auth, UserController.userShowProfile);

//user profile update api
router.post(
  "/updateprofile",
  auth,
  upload.single("profile"),
  UserController.userUpdateProfile
);

//follow api of user

router.post("/followuser", auth,form.array(),UserController.userFollow);

//unfollow api of user

router.post("/unfollowuser", auth,form.array(),UserController.userUnfollow);

//show follower api of user

router.get("/getfollower", auth,UserController.userGetfollower);

// show following api of user

router.get("/getfollowing", auth,UserController.userGetfollowing);


//api for upoload post
router.post( "/uploadpost",auth,
  upload_post_img.array("post"),
  UserController.userUploadpost
);
//api for get users post 


router.get("/showuserpost",auth,UserController.userShowpost)


//delete user post api
router.delete("/deleteuserpost",auth,form.array(),UserController.userDeletepost)


//show random post api 

router.get("/showposts",auth,UserController.userShowrandompost)

// showing individual users 

router.get("/showinduser/:id",auth,UserController.userShowoinduser)

//views count api


router.post("/postlike",auth,form.array(),UserController.userLikepost)

// post views count api 

router.get("/showlikes/:id",auth,UserController.userShowlikes)

//delete acount api
router.delete("/deleteuser",auth,UserController.deleteUser)

// reporting any person's post
router.post("/report",auth,form.array(),UserController.reportUser)

//logout api of user
router.post("/logoutuser",auth,UserController.logoutUser)




//admin panel apis 


//admin login api
router.post("/adminlogin",form.array(),UserController.adminLogin)


// add user api for admin
router.post("/adminadduser",adminauth,upload.single('profile'),UserController.adminAdduser)


router.post(
  "/adminupdateuser",
  upload.single("profile"),
  adminauth,
  UserController.adminUpdateuser
);



router.delete("/admindeleteuser",adminauth,form.array(),UserController.adminDeleteuser)



router.get("/adminshowuser",adminauth,UserController.adminShowuser)

router.get("/adminshowinduser/:id",adminauth,UserController.adminShowIndivisualuser)

router.get("/adminshowpost",adminauth,UserController.adminShowuserPost)

router.get("/adminshowpost/:id",adminauth,UserController.adminShowIndivisualPost)
router.delete("/admindeletepost",adminauth,form.array(),UserController.adminDeletePost)

//showing report in admin panel
router.get("/adminshowreports",adminauth,UserController.adminShowReports)
// admin delete report  
router.delete("/admindeletereport",adminauth,form.array(),UserController.adminDeleteReports)


router.post("/logoutadmin",adminauth,)

module.exports = router