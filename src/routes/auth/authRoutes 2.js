const express = require("express");
const router = express.Router();
const auth = require("../../controllers/auth/authController");
const validateToken = require("../../middlewares/authJwt");
router
.post("/", auth.authLogin)


module.exports = router;
