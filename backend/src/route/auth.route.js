const express = require("express");
const router = express.Router();
const authcontroller = require("../controller/auth.controller")
const authmiddleware = require("../middleware/auth.middleware")

router.post("/register",authcontroller.userregister);
router.post("/login",authcontroller.userlogin);
router.post("/verify-email",authcontroller.userverifyemail);
router.post("/resend-verification",authcontroller.userresendverification);
router.get("/logout",authcontroller.userlogout)
router.get("/getme",authmiddleware.validuser,authcontroller.usergetme)






module.exports = router