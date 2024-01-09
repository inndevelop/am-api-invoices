const { validateConnection } = require("../../config/db");
const setDatabaseLocale = require("../../utils/database");
const { generateUniqueFolio } = require("../../utils/folioUtils");
const moment = require("moment-timezone");
const createNewInvoice = async (req, res) => {
  const {
    id_client,
    invoice_total_amount,
    pending_invoice_amount,
    payment_type,
    total_products,
    invoice_detail,
    ticket_printed,
    ticket_format,
  } = req.body;

  // Obtener el id_user del usuario con sesión activa
  const id_user = res.locals.id_user;

  // Crear un folio único usando la función de utilidad
  const folio_invoice = generateUniqueFolio();

  // Determinar el estado de la factura según el tipo de pago
  const invoice_status = payment_type === "Efectivo" ? "Pagada" : "Pendiente";

  const today = moment()
    .tz("America/Mexico_City")
    .format("YYYY-MM-DD HH:mm:ss");

  // Determinar la fecha de pago según el tipo de pago
  const payment_date = payment_type === "Efectivo" ? today : null;

  // Determinar la fecha de venta según el tipo de pago
  const sale_date = today;

  const connection = await validateConnection();

  try {
    // Insertar la nueva factura en la tabla de invoices
    const result = await connection.query(
      `INSERT INTO invoices (id_user, id_client, sale_date, invoice_total_amount, pending_invoice_amount, payment_type, payment_date, invoice_status, total_products, folio_invoice, ticket_printed, ticket_format)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_user,
        id_client,
        sale_date,
        invoice_total_amount,
        pending_invoice_amount,
        payment_type,
        payment_date,
        invoice_status,
        total_products,
        folio_invoice,
        ticket_printed,
        ticket_format,
      ],
      async function (err, result) {
        if (err) {
          console.error("Error al insertar la factura:", err);
          throw err;
        }

        // Obtener el ID de la factura insertada
        const invoiceId = result.insertId;

        // Insertar los detalles de la factura en la tabla de invoice_details
        const detailsValues = invoice_detail.map((detail) => [
          invoiceId,
          detail.id_product,
          detail.product_price,
          detail.product_amount,
          detail.product_price * detail.product_amount,
        ]);

        await connection.query(
          `INSERT INTO invoice_details (id_invoice, id_product, product_price, product_amount, total)
             VALUES ?`,
          [detailsValues]
        );

        return res.status(200).json({
          status_Code: 200,
          message: "Factura creada con éxito",
        });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = "Error interno";

    res.status(500).json({
      error: true,
      message: errorMessage,
      details: error.message,
      status_Code: 500,
    });
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

const getInvoices = (req, res) => {
  validateConnection()
    .then(async (connection) => {
      // Establecer el idioma al comienzo de cada conexión
      await setDatabaseLocale(connection);
      return connection;
    })
    .then((connection) => {
      // Resto del código para obtener todas las facturas
      const query = `
        SELECT 
          id_invoice,
          folio_invoice,
          DATE_FORMAT(sale_date, '%e de %M %Y') AS formatted_sale_date,
          invoice_total_amount,
          pending_invoice_amount,
          payment_type,
          total_products,
          CASE 
            WHEN invoice_status = 'Pendiente' THEN 'Pendiente de pago'
            ELSE invoice_status
          END AS invoice_status,
          IF(ticket_printed, true, false) AS ticket_printed,
          CASE 
            WHEN payment_date IS NOT NULL THEN DATE_FORMAT(payment_date, '%e de %M %Y')
            ELSE NULL
          END AS payment_date
        FROM invoices;
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
            statusMessage: "No hay facturas existentes",
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

const getPendingInvoices = (req, res) => {
  validateConnection()
    .then((connection) => {
      setDatabaseLocale(connection);
      const setLocaleQuery = `
        SET lc_time_names = 'es_ES';
      `;

      connection.query(setLocaleQuery, (localeErr) => {
        if (localeErr) {
          console.error("Error al establecer el idioma:", localeErr);
          connection.release();
          return res.status(500).json({
            status_Code: 500,
            statusMessage: "Error interno al establecer el idioma",
            error: localeErr.message,
          });
        }

        const query = `
          SELECT 
          id_invoice,
          id_client,
          folio_invoice,
          DATE_FORMAT(sale_date, '%e de %M %Y') AS sale_date,
          invoice_total_amount,
          pending_invoice_amount,
          payment_type,
          total_products,
          CASE 
            WHEN invoice_status = 'Pendiente' THEN 'Pendiente de pago'
            ELSE invoice_status
          END AS invoice_status,
          IF(ticket_printed, true, false) AS ticket_printed,
          ticket_format,
          CASE 
            WHEN payment_date IS NOT NULL THEN DATE_FORMAT(payment_date, '%e de %M %Y')
            ELSE NULL
          END AS payment_date
          FROM invoices
          WHERE invoice_status = 'Pendiente';
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
              statusMessage: "No hay facturas pendientes",
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

const getInvoiceDetailsById = (req, res) => {
  const { id_invoice } = req.body;

  validateConnection()
    .then((connection) => {
      const query = `
          SELECT id_detail_invoice, id_invoice, pc.product_description, invoice_details.product_price, product_amount, total
          FROM invoice_details
          JOIN products_catalog pc ON invoice_details.id_product = pc.id_product
          WHERE id_invoice = ?;
        `;

      connection.query(query, [id_invoice], (err, results) => {
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
            statusMessage: "La factura no tiene detalles",
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

const getInvoiceById = (req, res) => {
  const { id_invoice } = req.body;

  validateConnection()
    .then(async (connection) => {
      await setDatabaseLocale(connection);
      return connection;
    })
    .then((connection) => {
      const query = `
        SELECT 
        id_invoice,
        id_client,
        folio_invoice,
        DATE_FORMAT(sale_date, '%e de %M %Y') AS sale_date,
        invoice_total_amount,
        pending_invoice_amount,
        payment_type,
        total_products,
        CASE 
          WHEN invoice_status = 'Pendiente' THEN 'Pendiente de pago'
          ELSE invoice_status
        END AS invoice_status,
        IF(ticket_printed, true, false) AS ticket_printed,
        ticket_format,
        CASE 
          WHEN payment_date IS NOT NULL THEN DATE_FORMAT(payment_date, '%e de %M %Y')
          ELSE NULL
        END AS payment_date
        FROM invoices
        WHERE id_invoice = ?;
      `;

      connection.query(query, [id_invoice], (err, results) => {
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
            statusMessage: "La factura no existe",
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

const getPendingInvoicesByClient = async (req, res) => {
  const { id_client } = req.body;

  const connection = await validateConnection();

  try {
    validateConnection()
      .then((connection) => {
        const query = `
        SELECT *
        FROM invoices
        WHERE id_client = ? AND invoice_status = 'Pendiente';
      `;
        connection.query(query, [id_client], (err, results) => {
          connection.release();

          if (results.length === 0) {
            return res.status(200).json({
              status_Code: 200,
              statusMessage: "No hay facturas pendientes para este cliente",
              body: results,
            });
          } else {
            return res.status(200).json({
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
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = "Error interno";

    res.status(500).json({
      error: true,
      message: errorMessage,
      details: error.message,
      status_Code: 500,
    });
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

const pendingInvoicesWithDetails = async (req, res) => {
  try {
    const connection = await validateConnection();
    setDatabaseLocale(connection);

    const pendingInvoicesQuery = `
      SELECT 
        id_invoice,
        id_client,
        folio_invoice,
        DATE_FORMAT(sale_date, '%e de %M %Y') AS sale_date,
        invoice_total_amount,
        pending_invoice_amount,
        payment_type,
        total_products,
        CASE 
          WHEN invoice_status = 'Pendiente' THEN 'Pendiente de pago'
          ELSE invoice_status
        END AS invoice_status,
        IF(ticket_printed, true, false) AS ticket_printed,
        ticket_format,
        CASE 
          WHEN payment_date IS NOT NULL THEN DATE_FORMAT(payment_date, '%e de %M %Y')
          ELSE NULL
        END AS payment_date
      FROM invoices
      WHERE invoice_status = 'Pendiente';
    `;

    const pendingInvoices = await new Promise((resolve, reject) => {
      connection.query(pendingInvoicesQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (!pendingInvoices || pendingInvoices.length === 0) {
      connection.release();
      return res.status(200).json({
        status_Code: 200,
        message: "No hay facturas pendientes",
        body: [],
      });
    }

    const invoicesWithDetails = await Promise.all(
      pendingInvoices.map(async (invoice) => {
        const detailsQuery = `
          SELECT
            id_detail_invoice,
            id_invoice,
            invoice_details.id_product,
            products_catalog.product_description,
            products_catalog.product_price,
            product_amount,
            total
          FROM invoice_details
          INNER JOIN products_catalog ON invoice_details.id_product = products_catalog.id_product
          WHERE id_invoice = ?;
        `;

        const data = await new Promise((resolve, reject) => {
          connection.query(
            detailsQuery,
            [invoice.id_invoice],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });

        return {
          id_invoice: invoice.id_invoice,
          id_client: invoice.id_client,
          folio_invoice: invoice.folio_invoice,
          sale_date: invoice.sale_date,
          invoice_total_amount: invoice.invoice_total_amount,
          pending_invoice_amount: invoice.pending_invoice_amount,
          invoice_status: invoice.invoice_status,
          payment_type: invoice.payment_type,
          total_products: invoice.total_products,
          ticket_printed: invoice.ticket_printed === 0 ? false : true,
          ticket_format: invoice.ticket_format,
          payment_date: invoice.payment_date,
          details: data,
        };
      })
    );

    connection.release();

    res.status(200).json({
      status_Code: 200,
      message: "facturas pendientes con detalles obtenidas con éxito",
      body: invoicesWithDetails,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = "Error interno";

    res.status(500).json({
      error: true,
      message: errorMessage,
      details: error.message,
      status_Code: 500,
    });
  }
};



module.exports = {
  createNewInvoice,
  getPendingInvoices,
  getInvoiceDetailsById,
  getInvoices,
  getInvoiceById,
  getPendingInvoicesByClient,
  pendingInvoicesWithDetails,
};
