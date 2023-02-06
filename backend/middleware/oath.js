const jwt = require("jsonwebtoken")
require('dotenv').config()



const auth = (req,res,next)=>{
            
    try{
        let token = req.headers.auth
        console.log(token)
        if(token){
        //console.log(req.session.user);
       token = token.split(" ")[1]
       const user = jwt.verify(token,process.env.USER_SECRET); 
          
       
            if(user){
        console.log(user)
        req.session.user = user  
        req.session.user.expires = new Date(
            Date.now() + 3 * 
            24 * 3600 * 1000 // session expires in 3 days
          )
 
         next();
       }
       else{
        res.status(409).json({status:409,message:"invalid session token"})
        }

       }
       
    }
   catch(e){
            console.log("authentication user error"+e);
            res.status(500).json({status:500,message:"invalid token "})
        }
}


module.exports = auth;
