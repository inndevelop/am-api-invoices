const { validateConnection } = require("../../config/db");

const moment = require("moment-timezone");
const setDatabaseLocale = require("../../utils/database");

const createInvoicePayment = (req, res) => {
  const {
    id_invoice,
    payment_amount,
    ticket_printed,
    ticket_format,
    description,
  } = req.body;

  if (!id_invoice || !payment_amount) {
    return res.status(400).json({
      status_Code: 400,
      message:
        "los campos id_invoice, payment_amount e id_user son obligatorios.",
    });
  }

  validateConnection()
    .then(async (connection) => {
      try {
        // Obtener el id_user del usuario con sesión activa
        const id_user = res.locals.id_user;
        await connection.beginTransaction();
        const getInvoiceInfo = `SELECT * FROM invoices WHERE id_invoice = ?`;

        connection.query(getInvoiceInfo, [id_invoice], async (err, result) => {
          if (err) {
            connection.release();
            return res.status(500).json({
              status_Code: 500,
              message: "error al obtener la información de la factura",
            });
          }

          if (result.length === 0) {
            connection.release();
            return res.status(400).json({
              status_Code: 400,
              message: "la factura no existe.",
            });
          }

          const totalDue = result[0].pending_invoice_amount;

          if (parseFloat(payment_amount) <= 0 || isNaN(payment_amount)) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
              status_Code: 400,
              message:
                "el monto del pago debe ser un número válido mayor a cero.",
            });
          }

          if (parseFloat(payment_amount) > totalDue) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
              status_Code: 400,
              message: "el monto del pago no puede ser mayor al adeudo.",
              totalDue,
              payment_amount: parseFloat(payment_amount),
            });
          }

          const today = moment()
            .tz("America/Mexico_City")
            .format("YYYY-MM-DD HH:mm:ss");

          const payment_date = today;

          const balance_after_payment = totalDue - payment_amount;

          const createPaymentQuery = `
        INSERT INTO payments (id_invoice, payment_amount, balance_before_payment, balance_after_payment, id_user, payment_date, ticket_printed,ticket_format, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          connection.query(
            createPaymentQuery,
            [
              id_invoice,
              payment_amount,
              totalDue,
              balance_after_payment,
              id_user,
              payment_date,
              ticket_printed,
              ticket_format,
              description,
            ],
            (err) => {
              if (err) {
                connection.release();
                return res.status(500).json({
                  status_Code: 500,
                  message: "error al registrar el pago",
                  err,
                });
              }

              const updateInvoiceQuery =
                "UPDATE invoices SET pending_invoice_amount = pending_invoice_amount - ? WHERE id_invoice = ?";

              const updateInvoiceStatusAndDateQuery = `
                UPDATE invoices
                SET 
                    pending_invoice_amount = pending_invoice_amount - ?,
                    payment_date = ${today},
                    invoice_status = 'Pagada' 
                WHERE id_invoice = ?;
                ;`;

              const remainingBalance = totalDue - parseFloat(payment_amount);
              //verify if the remainingBalance is equals to 0, if so, we need to update the invoice status
              // and insert the payment_date date

              const updateQuery =
                remainingBalance === 0
                  ? updateInvoiceStatusAndDateQuery
                  : updateInvoiceQuery;

              connection.query(
                updateQuery,
                [payment_amount, id_invoice],
                async (err) => {
                  connection.release();
                  if (err) {
                    return res.status(500).json({
                      status_Code: 500,
                      message: "error al actualizar el saldo de la factura",
                      err,
                    });
                  }
                  await connection.commit();

                  return res.status(200).json({
                    status_Code: 200,
                    message: "pago registrado con éxito",
                    remainingBalance,
                  });
                }
              );
            }
          );
        });
      } catch (error) {
        await connection.rollback();
        console.error("Error:", error);
        const errorMessage = "Error interno";

        return res.status(500).json({
          error: true,
          message: errorMessage,
          details: error.message,
          status_Code: 500,
        });
      }
    })
    .catch(async (error) => {
      console.error("Error:", error);
      const errorMessage = "error interno";

      res.status(500).json({
        error: true,
        message: errorMessage,
        details: error.message,
        status_Code: 500,
      });
    });
};

const getInvoicePayments = (req, res) => {
  const { id_invoice } = req.body;

  if (!id_invoice) {
    return res.status(400).json({
      status_Code: 400,
      message:
        "el campo id_invoice es obligatorio para obtener los pagos de una factura.",
    });
  }

  validateConnection()
    .then((connection) => {
      const getPaymentsQuery = "SELECT * FROM payments WHERE id_invoice = ?";

      connection.query(getPaymentsQuery, [id_invoice], (err, results) => {
        connection.release();

        if (err) {
          return res.status(500).json({
            status_Code: 500,
            message: "error al obtener los pagos de la factura",
          });
        }

        const formattedResults = results.map((payment) => ({
          ...payment,
          ticket_printed: payment.ticket_printed === 1 ? true : false,
        }));

        return res.status(200).json({
          status_Code: 200,
          message:
            formattedResults.length > 0
              ? "pagos obtenidos con éxito"
              : "la factura no contiene pagos",
          body: formattedResults,
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

const getPendingInvoicesPayments = async (req, res) => {
  try {
    const connection = await validateConnection();

    // Obtener todas las facturas pendientes
    const pendingInvoicesQuery = `
      SELECT id_invoice
      FROM invoices
      WHERE invoice_status = 'Pendiente';
    `;

    connection.query(pendingInvoicesQuery, async (err, pendingInvoices) => {
      if (err) {
        console.error("Error al obtener facturas pendientes:", err);
        connection.release();
        return res.status(500).json({
          status_Code: 500,
          message: "Error interno al obtener facturas pendientes",
        });
      }

      if (!pendingInvoices || pendingInvoices.length === 0) {
        connection.release();
        return res.status(200).json({
          status_Code: 200,
          message: "No hay facturas pendientes",
          body: [],
        });
      }

      // Obtener los pagos de las facturas pendientes
      const payments = await Promise.all(
        pendingInvoices.map(async (invoice) => {
          setDatabaseLocale(connection);
          const paymentsQuery = `
            SELECT 
              id_payment, 
              id_invoice, 
              payment_amount, 
              balance_before_payment, 
              balance_after_payment, 
              id_user, 
              DATE_FORMAT(payment_date, '%e de %M %Y') AS payment_date, 
              ticket_printed, 
              ticket_format, 
              description
            FROM payments
            WHERE id_invoice = ?;
          `;

          return new Promise((resolve) => {
            connection.query(
              paymentsQuery,
              [invoice.id_invoice],
              (err, result) => {
                if (err) {
                  console.error("Error al obtener pagos:", err);
                  resolve([]);
                } else {
                  resolve(result);
                }
              }
            );
          });
        })
      );

      connection.release();

      res.status(200).json({
        status_Code: 200,
        message: "Pagos de facturas pendientes obtenidos con éxito",
        body: payments.flat(), // Flatten the array of arrays
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
  }
};

module.exports = {
  createInvoicePayment,
  getInvoicePayments,
  getPendingInvoicesPayments
};
