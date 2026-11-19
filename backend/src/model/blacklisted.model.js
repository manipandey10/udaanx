const mongoose = require("mongoose");
const blacklistedschema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required for blacklisting"],

    }
},{
    timestamps:true,    
})
const blacklistedmodel = mongoose.model("BlackLISTED",blacklistedschema);
module.exports = blacklistedmodel