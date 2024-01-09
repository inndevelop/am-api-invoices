const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { PORT } = require("./config/config");

//importing routes
const authRouter = require("./routes/auth/authRoutes");
const clientsRouter = require("./routes/clients/clientsRoutes");
const productsRouter = require("./routes/products/productRoutes");
const invoiceRouter = require("./routes/invoices/invoicesRoutes");
const paymentsRouter = require("./routes/payments/paymentsRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.disable("etag");

//routes
//auth routes
app.use("/api/v1/login", authRouter);
//clients routes
app.use("/api/v1/clients", clientsRouter);
//products routes
app.use("/api/v1/products", productsRouter);
//invoices routes
app.use("/api/v1/invoices", invoiceRouter);
//payments routes
app.use("/api/v1/payments", paymentsRouter);

//starting the server
app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
  console.log(`Server on port ${PORT}`);
});
