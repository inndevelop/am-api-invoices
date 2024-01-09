const express = require("express");
const router = express.Router();
const invoices = require("../../controllers/invoices/invoicesController");
const validateToken = require("../../middlewares/authJwt");
router
  .post("/newInvoice", validateToken, invoices.createNewInvoice)
  .get("/pendingInvoices", validateToken, invoices.getPendingInvoices)
  .get("/invoiceDetail", validateToken, invoices.getInvoiceDetailsById)
  .get("/invoicesList", validateToken, invoices.getInvoices)
  .get("/invoicesById", validateToken, invoices.getInvoiceById)
  .get("/pendingInvoicesByClient", validateToken, invoices.getPendingInvoicesByClient)
  .get("/pendingInvoicesWithDetails", validateToken, invoices.pendingInvoicesWithDetails)

module.exports = router;
