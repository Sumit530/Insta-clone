const mongoose= require("mongoose")
const followSchema =  new mongoose.Schema({
    source:
    {type: mongoose.Schema.Types.ObjectId,  ref: 'User'},
    dest:
    {type: mongoose.Schema.Types.ObjectId,ref: 'User'},
        
    created_date:{
        type:Date,
        required:true,
        default:Date.now()
    }

});

const Follow = new mongoose.model('Follow',followSchema)
module.exports = Follow;