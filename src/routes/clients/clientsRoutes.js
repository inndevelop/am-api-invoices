const express = require("express");
const router = express.Router();
const clients = require("../../controllers/clients/clientsController");
const validateToken = require("../../middlewares/authJwt");
router
  .post("/createClient", validateToken, clients.createClient)
  .get("/", validateToken, clients.getClients)
  .get("/getClientInfo", validateToken, clients.getClientById)
  .post("/deactivate", validateToken, clients.deactivateClient)
  .post("/activate", validateToken, clients.activateClient)
  .put("/updateInfo", validateToken, clients.updateClientInfo);

module.exports = router;
