const { validateConnection } = require("../../config/db");
const createProduct = (req, res) => {
  const { product_description, product_price } = req.body;

  if (!product_description || !product_price) {
    return res.status(400).json({
      status_Code: 400,
      message: "La descripción del producto y el precio son obligatorios.",
    });
  }
  
  if (product_price < 0) {
    return res.status(400).json({
      status_Code: 400,
      message: "El precio del producto debe ser mayor a 0",
    });
  }


  validateConnection()
    .then((connection) => {
      const insertProductQuery = `
          INSERT INTO products_catalog (product_description, product_price)
          VALUES (?, ?)
        `;

      connection.query(
        insertProductQuery,
        [product_description, product_price],
        (err) => {
          connection.release();

          if (err) {
            console.error("Error:", err);
            return res.status(500).json({
              status_Code: 500,
              message: "Error al intentar crear el producto.",
            });
          }

          return res.status(201).json({
            status_Code: 201,
            message: "Producto creado con éxito.",
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

const getProducts = (req, res) => {
  validateConnection()
    .then((connection) => {
      const query = `
        SELECT *
        FROM products_catalog;
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
            statusMessage: "No hay productos",
            body: results,
          });
        } else {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "Operación exitosa",
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

const getProductById = (req, res) => {
  const { id_product } = req.body;

  validateConnection()
    .then((connection) => {
      const query = `
        SELECT * FROM products_catalog 
        WHERE id_product = ?
      `;
      connection.query(query, [id_product], (err, results) => {
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
            statusMessage: "El producto no existe o no contiene información",
            body: results,
          });
        } else {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "Operación exitosa",
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

const deleteProduct = (req, res) => {
  const { id_product } = req.body;

  validateConnection()
    .then((connection) => {
      const deleteQuery = `
          DELETE FROM products_catalog 
          WHERE id_product = ?;
        `;
      connection.query(deleteQuery, [id_product], (err) => {
        connection.release();

        if (err) {
          console.error("Error:", err);
          res.status(500).json({
            status_Code: 500,
            statusMessage: "Error al intentar eliminar el producto",
            error: err.message,
          });
        } else {
          res.status(200).json({
            status_Code: 200,
            statusMessage: "Producto eliminado con éxito",
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

const updateProductInfo = (req, res) => {
  const { id_product, product_description, product_price } = req.body;

  if (!id_product) {
    return res.status(400).json({
      status_Code: 400,
      message:
        "El ID del producto es necesario para actualizar la información.",
    });
  }

  validateConnection()
    .then((connection) => {
      const getProductInfo = `SELECT * FROM products_catalog WHERE id_product = ?`;

      connection.query(getProductInfo, [id_product], (err, result) => {
        if (err) {
          connection.release();
          return res.status(500).json({
            status_Code: 500,
            message: "Error al obtener la información del producto",
          });
        }

        if (result.length === 0) {
          connection.release();
          return res.status(200).json({
            status_Code: 200,
            message: "Producto no encontrado",
          });
        }

        const updatedFields = {};
        if (product_description !== undefined && product_description !== "") {
          updatedFields.product_description = product_description;
        }
        if (product_price !== undefined && product_price !== "") {
          updatedFields.product_price = product_price;
        }

        if (Object.keys(updatedFields).length === 0) {
          connection.release();
          return res.status(400).json({
            status_Code: 400,
            message: "No se proporcionaron datos para actualizar.",
          });
        }

        const updateProductInfo = `UPDATE products_catalog SET ? WHERE id_product = ?`;

        connection.query(
          updateProductInfo,
          [updatedFields, id_product],
          (err) => {
            connection.release();
            if (err) {
              return res.status(500).json({
                status_Code: 500,
                message: "Error al actualizar la información del producto",
              });
            }

            return res.status(200).json({
              status_Code: 200,
              message: "Información del producto actualizada con éxito",
            });
          }
        );
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
  createProduct,
  getProducts,
  getProductById,
  updateProductInfo,
  deleteProduct,
};
