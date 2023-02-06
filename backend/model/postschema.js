const mongoose = require('mongoose')
const postSchema = new mongoose.Schema({
    source_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    caption:{
        type:String,
        required:true,
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            default:null
        }
    ],
    comment:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                default:null
            },
            content:{
                type:String,
                default:null
            }
        }
    ],
    post:[
     {
        type:String,
        required:true
     }  
    ],
    shares : [
    { 
        post:{
            type:mongoose.Schema.Types.ObjectId
        },
        user:[
            {
                type:mongoose.Schema.Types.ObjectId
            }
        ],
        created_date : {
            type:Date,
            default:Date.now(),
             required:true
        }
    }
    ],
    reports:[
        {
            user :{
                type:mongoose.Schema.Types.ObjectId
                },
             reason:{type:String}   
        }
    ],
    
    created_date:{
        type:Date,
        default:Date.now(),
        required:true
    }

})



const Post = new mongoose.model('Post',postSchema)
module.exports = Post