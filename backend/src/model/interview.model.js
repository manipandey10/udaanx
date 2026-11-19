const mongoose = require("mongoose");

const technicalquestionschema = new mongoose.Schema({

    question:{
        type:String,
        required:[true,"technical question is required"],
    },
    intention:{
        type:String,
        required:[true,"intention is required"],
    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{
    _id:false   //no generating new id. 
})
const behavioralquestionschema = new mongoose.Schema({

    question:{
        type:String,
        required:[true,"technical question is required"],
    },
    intention:{
        type:String,
        required:[true,"intention is required"],
    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{
    _id:false   //no generating new id. 
})
const skillgapschema = new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"skill is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"severity is required"]
    },
},{

     _id:false
})

const preparationplanschema = new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"day is required"]
    },
    focus:{
        type:String,
        required:[true,"focus is required"]
    },
    tasks:{
        type:String,
        required:[true,"task is required"]
    }

})









const interviewreportschema = new mongoose.Schema({
    jobdescription:{
        type:String,
        required:[true,"job description is mandantory"],

    },
    resume:{
        type:String,
    },
    selfdescription:{
        type:String,
    },
    matchscore:{
        type:Number,
        min:0,
        max:100,
    },
    technicalquestion:[technicalquestionschema],
    behavioralquestion:[behavioralquestionschema],
    skillgap:[skillgapschema],
    preparationplan:[preparationplanschema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"],
    },
    title:{
        type:String,
        required:[true,"title is required"],
    }

},{

     timestamps:true,
})

const interviewmodel = mongoose.model("interview",interviewreportschema);
module.exports = interviewmodel;