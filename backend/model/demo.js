const mongoose = require("mongoose")

const Schema = new  mongoose.Schema({
    name : {
        type:String,
        require:true
    },
    status : {
        type:Boolean,
        default:true,
        require:true
    },
    deleted_at : {
        type:Date,
        default:null
        
    },
    created_at : {
        type:Date,
        default:Date.now()
        
    },
    updated_at : {
        type:Date,
        default:Date.now()
        
    }
})


const account_categories = new mongoose.model("Account",Schema)
var user = new account_categories({ name: 'Rover@rover.in', status: true });
user.save()
module.exports = account_categories;
