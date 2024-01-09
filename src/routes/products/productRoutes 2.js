const express = require("express");
const router = express.Router();
const products = require("../../controllers/products/productsController");
const validateToken = require("../../middlewares/authJwt");

router
  .post("/createProduct", validateToken, products.createProduct)
  .get("/getProducts", validateToken, products.getProducts)
  .get("/getProductInfo", validateToken, products.getProductById)
  .put("/updateInfo", validateToken, products.updateProductInfo)
  .delete("/removeFromList", validateToken, products.deleteProduct);

module.exports = router;
