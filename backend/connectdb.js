const mongoose =require("mongoose")

const Connectdb= async ()=> {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("database connected")
    }catch(error){
        console.error("❌ MongoDB connection failed:", error.message)
        process.exit(1)
    }
}
module.exports=Connectdb