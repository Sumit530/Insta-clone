const jwt = require('jsonwebtoken')
require('dotenv').config()

const adminauth = (req,res,next)=>{
  if(!req.headers.auth){
    res.status(412).json({status:412,message:"invalid credential"})
  }
try {
    let token = req.headers.auth
    console.log(token)
    if(token){
    //console.log(req.session.user);
   token = token.split(" ")[1]
   console.log(token)
   const admin = jwt.verify(token,process.env.ADMIN_SECRET);
   if(admin ){
     console.log(admin)

        // if(){

          next(); 
        // }
        // else{
        //   res.status(409).json({status:409,message:"invalid session token of admin"});      
        // }
        // console.log(req.session.admin)
   }
   else{   
    res.status(409).json({status:409,message:"invalid session token of admin"});
    }
   }
    
}

catch(e){
        res.status(500).json({status:500,message:"internal server error on admin authentication"})
        console.log("invalid token "+ e);
        
    
}

}

module.exports = adminauth;
