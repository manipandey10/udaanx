const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required to create a new user."],
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please provide a valid email address."],

    },
    password:{
        type:String,
        required:true,

    },
    emailVerified:{
        type:Boolean,
        default:false,
    },
    emailVerificationOtpHash:{
        type:String,
        default:null,
    },
    emailVerificationOtpExpiresAt:{
        type:Date,
        default:null,
    },
    emailVerificationOtpAttempts:{
        type:Number,
        default:0,
    },
    emailVerificationLastSentAt:{
        type:Date,
        default:null,
    }
},{
    timestamps:true,
})
const usermodel = mongoose.model("user",userschema);
module.exports = usermodel