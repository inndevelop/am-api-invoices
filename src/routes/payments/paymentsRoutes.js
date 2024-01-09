const express = require("express");
const router = express.Router();
const payments = require("../../controllers/payments/paymentsController");
const validateToken = require("../../middlewares/authJwt");

router.post("/createPayment", validateToken, payments.createInvoicePayment)
.get("/getPayments", validateToken, payments.getInvoicePayments)
.get("/pendingPaymentInvoices", validateToken, payments.getPendingInvoicesPayments)


module.exports = router;
