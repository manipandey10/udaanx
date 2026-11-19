const express = require("express");
const router = express.Router();
const authmiddleware = require("../middleware/auth.middleware");
const interviewcontroller = require("../controller/interview.controller");
const { upload } = require("../middleware/multer.middleware");


router.post("/report",authmiddleware.validuser,upload.single("resume"),interviewcontroller.generateinterviewreportcontroller);
router.get("/allreport/fetch",authmiddleware.validuser,interviewcontroller.allreportfetchcontroller);
router.get("/report/:id",authmiddleware.validuser,interviewcontroller.getreportbyidcontroller);
router.post("/report/pdf/:id",authmiddleware.validuser,interviewcontroller.generateinterviewreportpdfcontroller);



module.exports = router;