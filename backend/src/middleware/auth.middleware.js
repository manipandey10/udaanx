const usermodel = require("../model/user.model")
const blacklistedmodel = require("../model/blacklisted.model")
const jwt = require("jsonwebtoken")
async function validuser(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"TOKEN DOES NOT PROVIDED."
        })
    }
    const istokenblacklisted = await blacklistedmodel.findOne({
        token
    })
    if(istokenblacklisted){
        return res.status(401).json({
            message:"Token is Blacklisted.",
        })
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user = await usermodel.findById(
            decoded.id,
        )
        if(!user){
            return res.status(401).json({
                message:"User account not found.",
            })
        }
        req.user= user;
        next()
    }catch(err){
        return res.status(401).json({
            message:"Token is invalid !"
        })

    }

}
module.exports = {validuser}