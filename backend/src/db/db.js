const mongoose = require("mongoose");
async function connectdb(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected Sucessfully.");

    }catch(error){
        console.error("Something WENT wrong HERE",error.message);
        throw error;

    }
}
module.exports= connectdb