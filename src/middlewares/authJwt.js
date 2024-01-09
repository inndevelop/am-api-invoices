const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/config");
const { validateConnection } = require("../config/db");

function validateToken(req, res, next) {
  const token = req.headers["token"];
  if (!token) {
    return res
      .status(401)
      .json({ message: "El token no existe en las cabeceras" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "El token no es válido o ha expirado" });
    }

    const { id_user, user_name } = decoded;
    res.locals.id_user = id_user;
    res.locals.user_name = user_name;

    validateConnection()
      .then((conn) => {
        conn.release();
        try {
          conn.query(
            `
          SELECT *
          FROM users 
          WHERE id_user = ? AND status = 'Activo'`,
            [id_user],

            (err, results) => {
              if (err) {
                return res.status(500).json({
                  status_Code: 500,
                  message: "Error al intentar conectarse a la base de datos",
                });
              } else if (!results || results.length <= 0) {
                return res.status(401).json({
                  message:
                    "El usuario asociado al token no está activo o no existe",
                });
              } else {
                next();
              }
            }
          );
        } catch (error) {
          res.status(400).json({
            error,
            message: "El usuario no existe",
            details: error.message,
            status_Code: 400,
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ errorMessage: "Error interno del servidor" });
      });
  });
}

module.exports = validateToken;
