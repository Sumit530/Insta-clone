const express = require("express");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const multer = require('multer');
const form = multer();
const router = require('./routes/router')
const cors = require('cors')
const session = require('express-session');
const session1 = require('express-session')
require('dotenv').config();
app.use(bodyParser.urlencoded({extended:true}))
//app.use(form.array());
app.use(cors());
app.use(cookieParser());
require('./connection/conn');

//global path

app.use("/upload/post",express.static('uploads/post'))
app.use("/upload/profile",express.static('uploads/profile'))
//for normal user 
app.use('/',
  session({
    key:"user",
    secret: process.env.USER_SECRET, //this is secret key of user 
    resave: true,
    saveUninitialized: false
  })
  );

// for admin 
app.use('/adminlogin',
  session({
   key:"admin",
    secret: process.env.ADMIN_SECRET, //this is secret key of ADMIN
    resave: true,
    saveUninitialized: false
  })
  );
app.use(router)

const port = process.env.PORT || 6000;
const host = process.env.HOST|| "localhost"

app.listen(port,host, () => {
  console.log(`port is running on ${port}`);
});
 