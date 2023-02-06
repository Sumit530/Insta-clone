const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect("mongodb://localhost:27017/movie_site",{
  useNewUrlParser: true,
      useUnifiedTopology: true,
}
).then(()=>{
  console.log("mongodb connected successfully");
}
).catch((e)=>
  console.log("connection failed"+e)
)
