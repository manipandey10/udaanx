const interviewmodel = require("../model/interview.model");
const {generateinterviewreport,generateinterviewreportpdf} = require("../services/ai.service");
const pdfparse = require("pdf-parse");  

async function generateinterviewreportcontroller(req,res){
  try{
    if (!req.file) {
        return res.status(400).json({
            message:"A PDF resume is required"
        });
    }

    const {selfdescription,jobdescription} = req.body;
    if (!selfdescription?.trim() || !jobdescription?.trim()) {
        return res.status(400).json({
            message:"Self description and job description are required"
        });
    }

    const resumecontent = await(new pdfparse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
    const interviewreportbyai = await generateinterviewreport({
        resume:resumecontent.text,
        selfdescription,
        jobdescription
    });
    const {matchScore, ...reportFields} = interviewreportbyai;
    const interviewreport = await interviewmodel.create({
            user:req.user._id,
            resume:resumecontent.text,
            selfdescription,
            jobdescription,     
            ...reportFields,
            matchscore:matchScore
    })
    res.status(201).json({
        message:"Interview Report Generated Successfully",
        interviewreport
    })
    }catch(err){
        console.error("Error generating interview report:", err);
        res.status(500).json({
            message:"Failed to generate interview report",
            
        });
    }
}

async function allreportfetchcontroller(req,res){
    const interviewreports = await interviewmodel.find({
        user:req.user._id
    }).sort({createdAt:-1}).select("-resume -selfdescription -jobdescription -__v");
    return res.status(200).json({
        message:"All interview reports fetched sucessfully",
        interviewreports
    })
}

async function getreportbyidcontroller(req,res){
    const {id} = req.params;
    const interviewreport = await interviewmodel.findOne({
        _id:id,
        user:req.user._id
    });

    if (!interviewreport) {
        return res.status(404).json({
            message:"Interview report not found"
        });
    }

    return res.status(200).json({
        message:"Interview report fetched successfully",
        interviewreport
    });
}
async function generateinterviewreportpdfcontroller(req,res){
        const {id} = req.params;
        const interviewreport = await interviewmodel.findOne({
            _id:id,
            user:req.user._id
        });
        if(!interviewreport){
            return res.status(404).json({
                message:"Interview report not found"
            });
        }
        const {selfdescription,jobdescription,resume} = interviewreport;
        const pdfbuffer = await generateinterviewreportpdf({
            selfdescription,
            jobdescription,
            resume
        })
        res.set({
            "Content-Type":"application/pdf",
            "Content-Disposition":`attachment; filename="tailored_resume_${id}.pdf"`,
        })
        return res.send(pdfbuffer);
    
    }





module.exports = {generateinterviewreportcontroller,allreportfetchcontroller,getreportbyidcontroller,generateinterviewreportpdfcontroller};