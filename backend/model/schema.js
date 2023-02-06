const mongoose= require("mongoose")

const userSchema = new mongoose.Schema({

    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:["male","female","other"]
    },
    dob:{
        type:Date,
        required:true
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }],
    follower:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        created_date:Date.now()
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        created_date:Date.now()
    }],
    profile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    created_date:{
        type:Date,
        required:true,
        default:Date.now()
    }
})


const User = new mongoose.model('User',userSchema)
 module.exports = User
 