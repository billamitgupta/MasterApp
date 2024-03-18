//  require('dotenv').config({path: './env'})
 import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
        app.on("error",(error)=> {
            console.log("ERROR : " , error);
            throw error;
        })
    })
})
.catch((err)=> {
    console.log("MongoDB connection failed!!!",err);
})









/*

       //connecting DB in index.js only which is nor professional 

       const app = express();
   (async ()=> {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERROR:", error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listinig on port: ${process.env.PORT}`);
        })
        

    }catch (error){
        console.log("ERROR", error)
        throw error
    }
   })()
   */
