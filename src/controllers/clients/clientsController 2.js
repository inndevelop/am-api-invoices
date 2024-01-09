const { validateConnection } = require("../../config/db");

const createClient = (req, res) => {
  const { client_name, client_store_name } = req.body;

  if (!client_name) {
    return res.status(400).json({
      status_Code: 400,
      message: "El nombre del cliente es obligatorio.",
    });
  }

  validateConnection()
    .then((connection) => {
      const insertClientQuery = `
        INSERT INTO clients (client_name, client_store_name, created_at)
        VALUES (?, ?, NOW())
      `;

      connection.query(
        insertClientQuery,
        [client_name, client_store_name || null],
        (err) => {
          connection.release();

          if (err) {
            console.error("Error:", err);
            return res.status(500).json({
              status_Code: 500,
              message: "Error al intentar crear el cliente.",
            });
          }

          return res.status(201).json({
            status_Code: 201,
            message: "Cliente creado con éxito.",
          });
        }
      );
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};
const getClients = (req, res) => {
  validateConnection()
    .then((connection) => {
      const query = `
        SELECT *
        FROM clients;
      `;
      connection.query(query, (err, results) => {
        connection.release();

        if (err) {
          console.error("Error:", err);
          res.status(500).json({
            status_Code: 500,
            statusMessage: "Error en el servidor",
            error: err.message,
          });
        }

        if (results.length === 0) {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "no hay usuarios",
            body: results,
          });
        } else {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "operación exitosa",
            body: results,
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};
const getClientById = (req, res) => {
  const { id_client } = req.body;

  validateConnection()
    .then((connection) => {
      const query = `
        SELECT * FROM clients 
        WHERE id_client = ?
      `;
      connection.query(query, [id_client], (err, results) => {
        connection.release();

        if (err) {
          console.error("Error:", err);
          res.status(500).json({
            status_Code: 500,
            statusMessage: "Error en el servidor",
            error: err.message,
          });
        }

        if (results.length === 0) {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "el usuario no existe, o no contiene información",
            body: results,
          });
        } else {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "operación exitosa",
            body: results,
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};
const deactivateClient = (req, res) => {
  const { id_client } = req.body;

  validateConnection()
    .then((connection) => {
      console.log(id_client);

      const checkClientStatus = `SELECT status FROM clients WHERE id_client = ?`;

      connection.query(checkClientStatus, [id_client], (err, result) => {
        connection.release();
        if (err) {
          return res.status(500).json({
            status_Code: 500,
            message: "Error al verificar el estado del usuario",
          });
        }

        if (result.length === 0 || result[0].status === "Inactivo") {
          return res.status(400).json({
            status_Code: 400,
            result,
            message: "El usuario ya está inactivo o no encontrado",
          });
        }

        const updateClientStatus = `UPDATE clients SET status = 'Inactivo' WHERE id_client = ?`;

        connection.query(updateClientStatus, [id_client], (err) => {
          if (err) {
            return res.status(500).json({
              status_Code: 500,
              message: "Error al desactivar el usuario",
            });
          }

          return res.status(200).json({
            status_Code: 200,
            message: "Usuario desactivado con éxito",
          });
        });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};

const activateClient = (req, res) => {
  const { id_client } = req.body;

  validateConnection()
    .then((connection) => {
      console.log(id_client);

      const checkClientStatus = `SELECT status FROM clients WHERE id_client = ?`;

      connection.query(checkClientStatus, [id_client], (err, result) => {
        connection.release();
        if (err) {
          return res.status(500).json({
            status_Code: 500,
            message: "Error al verificar el estado del usuario",
          });
        }

        if (result.length === 0 || result[0].status === "Activo") {
          return res.status(400).json({
            status_Code: 400,
            result,
            message: "El usuario ya está activo o no encontrado",
          });
        }

        const updateClientStatus = `UPDATE clients SET status = 'Activo' WHERE id_client = ?`;

        connection.query(updateClientStatus, [id_client], (err) => {
          if (err) {
            return res.status(500).json({
              status_Code: 500,
              message: "Error al activar el usuario",
            });
          }

          return res.status(200).json({
            status_Code: 200,
            message: "Usuario activado con éxito",
          });
        });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};

const updateClientInfo = (req, res) => {
  const { id_client, client_name, client_store_name } = req.body;

  if (!id_client) {
    return res.status(400).json({
      status_Code: 400,
      message: "El ID del cliente es necesario para actualizar la información.",
    });
  }

  validateConnection()
    .then((connection) => {
      const getClientInfo = `SELECT * FROM clients WHERE id_client = ?`;

      connection.query(getClientInfo, [id_client], (err, result) => {
        if (err) {
          connection.release();
          return res.status(500).json({
            status_Code: 500,
            message: "Error al obtener la información del cliente",
          });
        }

        if (result.length === 0) {
          connection.release();
          return res.status(404).json({
            status_Code: 404,
            message: "Cliente no encontrado",
          });
        }

        const updatedFields = {};
        if (client_name !== undefined && client_name !== "") {
          updatedFields.client_name = client_name;
        }
        if (client_store_name !== undefined && client_store_name !== "") {
          updatedFields.client_store_name = client_store_name;
        }

        if (Object.keys(updatedFields).length === 0) {
          connection.release();
          return res.status(400).json({
            status_Code: 400,
            message: "No se proporcionaron datos para actualizar.",
          });
        }

        const updateClienInfo = `UPDATE clients SET ? WHERE id_client = ?`;

        connection.query(updateClienInfo, [updatedFields, id_client], (err) => {
          connection.release();
          if (err) {
            return res.status(500).json({
              status_Code: 500,
              message: "Error al actualizar la información del cliente",
            });
          }

          return res.status(200).json({
            status_Code: 200,
            message: "Información del cliente actualizada con éxito",
          });
        });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const errorMessage = "Error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  deactivateClient,
  activateClient,
  updateClientInfo,
};
