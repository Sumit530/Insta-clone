const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
jsonparser = bodyParser.json();
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const User = require("../model/schema");
const Post = require("../model/postschema")


exports.userRegister = async (req, res) => {
  let { fname, lname, email, phone, dob, gender, password } = req.body;
  fname = fname.trim();
  lname = lname.trim();
  email = email.trim();
  phone = phone.trim();
  dob = dob.trim();
  gender = gender.trim();
  password = password.trim();

  let profile = "";
  if (req.file) {
    profile = req.file.filename;
  }
  if (!fname || !lname || !email || !phone || !gender || !dob || !password) {
    return res
      .status(401)
      .json({ status: 401, message: "please fiil the field properly" });
  } else {
    User.findOne({ email:email }).then(async (userExist) => {
      if (userExist !=null) {
        return res
          .status(409)
          .json({ status: 409, message: "user already exist" });
      }
      //hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        fname,
        lname,
        email,
        phone,
        gender,
        dob,
        profile,
        password: hashedPassword,
      });

      const finaluser = await user.save();
      if (finaluser) {
        return res
          .status(201)
          .json({ status: 201, message: "user register successfully" });
      } else {
        return res
          .status(402)
          .json({
            status: 402,
            message: "internal server error when regitsering user ",
          });
      }
    });
  }
};

exports.userLogin = async (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();
  if (!email || !password) {
    res
      .status(401)
      .json({ status: 402, message: "please fill field properly" });
  } else {
    const user = await User.findOne({ email });
    if (user != null) {
      const pass = await bcrypt.compare(password, user.password);

      if (pass == true) {
        const jwtdata = {
          id: user._id,
          email: email,
          time: Date(),
        };
        const token = jwt.sign(jwtdata, process.env.USER_SECRET);

        req.session.user = {
          email: user.email,
          id: user._id,
        }; // saving some user's data into user's session
        req.session.user.expires = new Date(
          Date.now() + 3 * 24 * 3600 * 1000 // session expires in 3 days
        );
        res
          .status(201)
          .json({ status: 201, message: "user login succesfully", token,user_id:req.session.user.id });
      } else {
        res.status(401).json({ status: 401, message: "invalid password" });
      }
    } else {
      res.status(401).json({ status: 401, message: "invalid email" });
    }
  }
};

exports.userShowProfile = async (req, res) => {
  const id = req.session.user.id;
  try {
    const user = await User.findOne({ _id: id });
    if (user != null) {
      res.status(201).json({ status: 201, message: "data found", data: user });
    } else {
      res.status(406).json({ status: 406, message: "data not found" });
    }
  } catch (e) {
    console.log("error on showprofile api");
    res.status(501).json({ status: 501, message: "internal erro on server" });
  }
};

exports.userUpdateProfile = async (req, res) => {
  try {
    const id = req.session.user.id;
    console.log(id);
    const { fname, lname, dob, gender } = req.body;
    let profile = "";

    if (req.file) {
      profile = req.file.filename;
    }
    if (!fname || !lname || !gender || !dob) {
      res
        .status(401)
        .json({ status: 401, message: "please fiil the field properly" });
    } else {
      User.findOneAndUpdate(
        { _id: id },
        {
          fname,
          lname,
          gender,
          dob,
          profile,
        },
        (err, doc) => {
          if (err) throw err;
          if (doc) {
            res
              .status(201)
              .json({ status: 201, message: "user updated successfully" });
          }
        }
      );
    }
  } catch (e) {
    res.status(501).json({
      status: 501,
      message: "internal server error on update profile",
    });
    console.log("internal error on update profile api");
  }
};

exports.userFollow = async (req, res) => {
  const id = req.session.user.id;
  const dest = mongoose.Types.ObjectId(req.body.dest);
  console.log(dest);
  const follow = await User.findOne({ _id: id, following: dest });
  console.log(follow);
  //checking the user followed dest or not

  if (follow != null) {
    res.status(406).json({ status: 406, message: "user already following" });
  } else {
    //fetching the following count data from source user
    await User.findOneAndUpdate({ _id: id },{$push:{following:dest}});
     await User.findOneAndUpdate({ _id: dest },{$push:{follower:id}});

    res
      .status(201)
      .json({ status: 201, message: "user followed successfully" });
  }
};

exports.userUnfollow = async (req, res) => {
  const id = req.session.user.id;
  const dest = req.body.dest;
  console.log(dest);
  const follow = await User.findOne({ _id: id, following:dest });
  console.log(follow);
  //checking the user followed dest or not

  if (follow == null) {
    res.status(406).json({ status: 406, message: "user not following" });
  } else {
    //fetching the following count data from source user
     await User.findOneAndUpdate({ _id: id },{$pull:{following:dest}});
     await User.findOneAndUpdate({ _id: dest },{$pull:{follower:id}});
    //fetching the follower count data from dest user

    res
      .status(201)
      .json({ status: 201, message: "user unfollowed successfully" });
  }
    }
  
    
exports.userGetfollower = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.session.user.id)
  console.log(id)
  const follower = await User.findOne({_id:id}).populate("follower","-password")
  if(follower != []){
    if(follower.follower != ''){

      res.status(201).json({status:201,message:"got data",data:follower.followers})
    }
    else{
      res.status(402).json({status:402,message:"user dosent have follower",})
    }
  }
  else{
    res.status(501).json({status:501,message:"internal server error when fetching the data of follower",})
  }
  
  
}


exports.userGetfollowing = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.session.user.id)
  console.log(id)
  const following = await User.findOne({_id:id}).populate("following","-password")
  
  if(following != []){
    if(following.following != ''){

      res.status(201).json({status:201,message:"got data",data:following.following})
    }
    else{
      res.status(402).json({status:402,message:"user dosent have following",})
    }
  }
  else{
    res.status(501).json({status:501,message:"internal server error when fetching the data of following",})
  }
  
  
}


exports.userUploadpost = async (req, res) => {
  let {  caption } = req.body;
  let post = []
  console.log(req.files)
  if(req.files){

     req.files.map((e)=>{
      post.push(e.filename.replace(" ",""))
     })
  }
  try {
    if ( !post) {
      res
        .status(406)
        .json({ status: 406, message: "please fill field properly" });
    } else {
     
      caption = caption.trim().toLowerCase();
      const views = 0;
      const source_id = req.session.user.id;
     const userpost= new Post({
      source_id,
        caption,
        post,
     }) 
     const postupload = await userpost.save();
     await User.findOneAndUpdate({_id:source_id},{$push:{posts:postupload._id}})
        res.json({staus:201,message:"post uploaded succefully",postupload})
    }
  } catch (e) {
    console.log("error in uploading post " + e);
    res
      .status(502)
      .json({ status: 502, message: "internal error on uploading post" });
  }
}

exports.userShowpost = async(req,res)=>{
  const id = req.session.user.id
  
  try {
         const post = await User.findOne({_id:id},{password:0}).populate(
          {path:"posts",
           populate:{
              path:"likes",
              model:"User",
              select:{password:0}
            },
          populate:{
            path:"comment",
            model:"User",
            select:{password:0}
          }})
          if(post !=[]){

            res.status(201).json({status:201,message:"post found",post})    
          }
          else{
            res.status(409).json({status:409,message:"no post found of user"})
          }
  }
  catch(e){
      res.status(502).json({status:502,message:"internal server error when showing user's post"})
      console.log("internal error on show user post api"+e);

  }
}
exports.userDeletepost = async(req,res)=>{
  const dest = req.body.dest
  const id = req.session.user.id
  try{
   const deletepost = await deleteOne({_id:dest})
   const updateuserpost= await findOneAndUpdate({_id:id},{$pull:{posts:dest}})
   if(deletepost !='' && updateuserpost !=''){
    res.status(201).json({status:201,message:"post deleted successfully"})
   }
   else{
    res.status(406).json({status:406,message:"post not deleted"})
   }
   
  }
  catch(e){
      console.log("internal server error in delete user post " + e)
      res.status(502).json({status:502,message:"internal server error occured when deleting user pose"});
  }
} 

exports.userShowrandompost = async(req,res)=>{
  const id = req.session.user.id  
  let offset = req.query.page
  const limit = req.query.limit
  console.log(limit)
   offset = (offset-1)*limit
console.log(id)
   let lastpage = false
   try {
           const posts = await Post.find({source_id:{$ne:id}},{reports:0}).populate("source_id","-password -posts")
           const total = posts.length
           const finalposts = posts
           
           if(offset+limit>=total){
            lastpage=true
           }
           if( total!=0){

             res.status(201).json({status:201,message:"found posts",posts:finalposts,lastpage,total})    
            }
          else{
            res.status(409).json({status:409,message:"not found post"})    
          }
   }
   catch(e){
       res.status(502).json({status:502,message:"internal server error when showing user's post"})
       console.log("internal error on show user post api"+e);
   }
 }

 exports.userShowoinduser = async(req,res)=>{
  const userid = req.session.user.id
  const id = req.params['id']
  try{
    const userdata = await User.findOne({_id:userid}).pupulate("posts","-reports")
    if(userdata != null){
      res.status(201).json({status:201,message:"user found" ,user:userdata});  
    }
    else{
      res.status(409).json({status:409,message:"user not fouond wrong credential"});  
    }

  }
  catch(e){
    res.status(502).json({status:502,message:"internal server error when shwoing individual user"});
  }
}


exports.userLikepost = async(req,res)=>{
  const {dest} = req.body  
const id = req.session.user.id
        try
        { const like = await Post.findOne({_id:dest,likes:id})
         
            if(like == null){
              await Post.findOneAndUpdate({_id:dest},{$push:{likes:id}})
              res.status(201).json({status:201,message:"user liked success"})
            }
            else{
              await Post.findOneAndUpdate({_id:dest},{$pull:{likes:id}})
              res.status(201).json({status:201,message:"user unliked success"})
            }
        }
        catch(e){
          res.status(506).json({status:506,message:"internal error when like "})
          console.log("error occured when user likes a post"+e)
        }
}

exports.userShowlikes = async(req,res)=>{
  const dest = req.params['id'];
    try{
      const likes = await Post.findOne({_id:dest},{reports:0}).populate({
        path:"likes",model:"User" , select:{password:0}})
      if(likes != null){
        res.status(201).json({status:201,message:"found data of like",likes:likes.likes})
      }
      else{
        res.status(401).json({status:409,message:"not found data"})

      }
    }
    catch (e){
      res.status(502).json({status:502,message:"internal server error"})
      console.log("internal server error when showing likes of user post " + e )
    }

}
exports.deleteUser = async(req,res)=>{
  const id = req.session.user.id
      try{

        const del = await User.deleteOne({_id:id})
        if(del != null){
          
          res.status(201).json({status:201,message:"user deleted successfully"});
          req.session.destroy();
        }
        else{
          res.status(402).json({status:402,message:"delete query un success"});
        }
      }
      catch (e){
        res.status(502).json({status:502,message:"internal errro when deleting user"});
        console.log("error occured when deleting user " + e)
      }
  
}

exports.reportUser = async(req,res)=>{
  const {post,reason} = req.body
  const id = mongoose.Types.ObjectId( req.session.user.id)
  
  const data = [
    id,
    post,
    reason
  ]
  try{

    const findreport = await Post.findOne({_id:post,reports:id})
    if(findreport !=null){
      res.status(403).json({status:403,message:"already reported"});
    }
    else{
    const report = await Post.findOneAndUpdate({_id:post},{$push:{reports:{user:id,reason:reason}}})
    res.status(201).json({status:201,message:"reported successfully"});
  }
}
catch(e){

  res.status(403).json({status:403,message:"error occured when reporting user"});
  console.log("error occured when reporting user post"+e)
}
  
 
}

exports.logoutUser = async(req,res)=>{
  const d = delete req.session.user 
  try{

    if(d==""){
      res.status(502).json({status:502,message:"internal sever error occured when user logouts "});
    }
    else{
      res.status(201).json({status:201,message:"user logout successfully "});
    }
  }catch(e){
    res.status(502).json({status:502,message:"internal sever error occured when user logouts "});
    console.log("error when logging out the user"+e)
  }
  
  
}
exports.adminLogin = async(req,res)=>{
  let {username,password}=req.body
  username = username.trim().toLowerCase()
  password = password.trim().toLowerCase()
try{

  if(!username || !password){
    res.status(409).json({status:409,message:"please fill field properly"})
    
  }
  else{
    if(username === process.env.ADMIN && password === process.env.PASS ){
      
      
      
      
      const token = jwt.sign(  {username:username},process.env.ADMIN_SECRET,(err,cb)=>{
        if(err) throw err
        if(cb){
          req.session.admin =  process.env.ADMIN
          
          req.session.admin.expires = new Date(
            Date.now() + 3 * 24 * 3600 * 1000 // session expires in 3 days
            );
            res.status(201).json({status:201,message:"admin login successfull",cb})
            console.log("success")
          }
        })
        
        
        
        
        // //console.log(req.session.admin);
        // res.status(201).json({status:201,message:"admin login successfull",token})
        
      }
      else{
        res.status(406).json({status:406,message:"wrong credential"});
      }
    }
    
  }catch(e){
    console.log("error when admin logging "+e)
    res.status(501).json({status:501,message:"internal server error"});
  }
  }

  exports.adminAdduser = async(req,res)=>{
    try {
      let { fname, lname, email, phone, dob, gender, password } = req.body;
  fname = fname.trim();
  lname = lname.trim();
  email = email.trim();
  phone = phone.trim();
  dob = dob.trim();
  gender = gender.trim();
  password = password.trim();

  let profile = "";
  if (req.file) {
    profile = req.file.filename;
  }
  if (!fname || !lname || !email || !phone || !gender || !dob || !password) {
    return res
      .status(401)
      .json({ status: 401, message: "please fiil the field properly" });
  } else {
    User.findOne({ email:email }).then(async (userExist) => {
      if (userExist !=null) {
        return res
          .status(409)
          .json({ status: 409, message: "user already exist" });
      }
      //hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        fname,
        lname,
        email,
        phone,
        gender,
        dob,
        profile,
        password: hashedPassword,
      });

      const finaluser = await user.save();
      if (finaluser) {
        return res
          .status(201)
          .json({ status: 201, message: "user register successfully" });
      } else {
        return res
          .status(402)
          .json({
            status: 402,
            message: "internal server error when regitsering user ",
          });
      }
    });
  }
    } catch (e) {
      console.log("error when admin adding user"+e)
      res.status(501).json({status:501,message:"internal server error when adding the user"});  
    }

  }

  exports.adminUpdateuser = async (req, res) => {
    try {
      const id = req.session.user.id;
      console.log(id);
      const { fname, lname, dob, gender } = req.body;
      let profile = "";
  
      if (req.file) {
        profile = req.file.filename;
      }
      if (!fname || !lname || !gender || !dob) {
        res
          .status(401)
          .json({ status: 401, message: "please fiil the field properly" });
      } else {
        User.findOneAndUpdate(
          { _id: id },
          {
            fname,
            lname,
            gender,
            dob,
            profile,
          },
          (err, doc) => {
            if (err) throw err;
            if (doc) {
              res
                .status(201)
                .json({ status: 201, message: "user updated successfully" });
            }
          }
        );
      }
    } catch (e) {
      res.status(501).json({
        status: 501,
        message: "internal server error when admin updating profile",
      });
      console.log("internal error on admin update profile api");
    }
  }

  exports.adminDeleteuser = async(req,res)=>{
    const {id} = req.body
        try{
  
          const del = await User.deleteOne({_id:id})
          if(del != null){
            
            res.status(201).json({status:201,message:"user deleted successfully"});
            req.session.destroy();
          }
          else{
            res.status(402).json({status:402,message:"delete query un success"});
          }
        }
        catch (e){
          res.status(502).json({status:502,message:"internal errro when deleting user"});
          console.log("error occured when deleting user " + e)
        }
    
}

exports.adminShowuser = async(req,res)=>{
  let offset = req.query.page

   console.log(offset)
const limit = 10  // req.query.limit;
  offset = (offset-1)*limit
  let lastpage = false;

try{
      const users = await User.find({},{password:0})
      
              if(users !=''){
                const total = users.length
                
                const result = users.splice(offset,limit)
                if(offset+limit>total){
                 lastpage = true;
                }
              //  if(result.length<10) 
              console.log(lastpage)
                res.status(201).json({status:201,message:"users found",result,lastpage,total})
              }
  }
  catch(e) {
    res.status(501).json({status:501,message:"internal server error on fetching data of user for admin "})
    console.log("error on admin when showing user " + e);
  
  }
}

exports.adminShowIndivisualuser = async(req,res)=>{
  const id = req.params['id'];
  console.log(id)
  try{
    const users = await User.find({_id:id},{password:0})
    
              if(users !=''){
                res.status(201).json({status:201,message:"found data of user post",result:users});
              }
              else{
                res.status(402).json({status:401,message:"users not found"})
              }
  }
  catch(e) {
    res.status(501).json({status:501,message:"internal server error on fetching data of user for admin "})
    console.log("error on admin when showing user " + e);
  
  }
}



exports.adminShowuserPost =async(req,res)=>{
  let offset = req.query.page;
  console.log(offset)
  const limit = 8;
  offset = (offset-1)*limit
  let lastpage = false
  try {
    const posts = await Post.find({},{reports:0})
    const total = posts.length
    const result = posts.splice(offset,limit)
    if(offset+limit>=total){
     lastpage = true;
    }
    if(result.length == 0){
      res.status(409).json({status:409,message:"no data found of user posts"})
    }
    else {
      res.status(201).json({status:201,message:"found data of user post",result,lastpage,total});
    
    }
   
      }
   

catch(e){
res.status(502).json({status:502,message:"internal server error when showing user's post"})
console.log("internal error on show user post api");

}
}


exports.adminShowIndivisualPost = async(req,res)=>{
  const id = req.params['id'];
  try {
    const posts = await Post.find({_id:id}).populate('souce_id',"-password")
  
  
    if(posts.length == 0){
      res.status(409).json({status:409,message:"no data found of user posts"})
    }
    else {
      res.status(201).json({status:201,message:"found data of user post",result,lastpage});
    } 
    
    
  }
  
  

catch(e){
res.status(502).json({status:502,message:"internal server error when showing user's post"})
console.log("internal error on show user post api");

}
}
exports.adminDeletePost = async(req,res)=>{
  const dest = req.body.dest
  const id = req.body.id
  try{
   const deletepost = await deleteOne({_id:dest})
   const updateuserpost= await findOneAndUpdate({_id:id},{$pull:{posts:dest}})
   if(deletepost !='' && updateuserpost !=''){
    res.status(201).json({status:201,message:"post deleted successfully"})
   }
   else{
    res.status(406).json({status:406,message:"post not deleted"})
   }
   
  }
  catch(e){
      console.log("internal server error in delete user post " + e)
      res.status(502).json({status:502,message:"internal server error occured when deleting user pose"});
  }
} 

exports.adminShowReports = async(req,res)=>{
  let offset = req.query.page
  const limit = 2;
  offset = (offset-1)*limit
    let lastpage = false;
    try{

      const reports = await Post.find({reports:{$ne:[]}}).populate("reports","-password")
      if(reports.length != 0){
        const total = reports.length
        const  result = reports.splice(offset,limit);
        if(total<=offset+limit){
        lastpage = true
      } 
      res.status(201).json({status:201,message:"data found" ,result,lastpage,total})
    }
    else{
      res.status(402).json({status:402,message:"data not found"})
    }
  }
    catch(e){
      console.log("internal server error when showing report " + e)
      res.status(502).json({status:502,message:"internal server error occured when showing reports to admin"});
    }
  }
exports.adminDeleteReports = async(req,res)=>{
  const {id} = req.body
  const {post} = req.body
  try {
    const delreport = await findOneAndUpdate({_id:post},{reports:{$pull:{reports:{user:id}}}})
    res.status(201).json({status:201,message:"reports removed successfully"})
  } catch (e) {
    console.log("internal server error when deleting reports " + e)
    res.status(502).json({status:502,message:"internal server error occured when deleting reports"});
  }

}

exports.logoutAdmin = (req,res)=>{
  console.log(req.session.admin);
  const d = delete req.session.admin 
 try{

   if(d==""){
     res.status(502).json({status:502,message:"internal sever error occured when admin logouts "});
    }
    else{
      res.status(201).json({status:201,message:"admin logout successfully "});
    }
  }catch(e){
    console.log("internal server error when loggin out admin" + e)
    res.status(502).json({status:502,message:"internal server error occured when loggin out admin"});
  }
}