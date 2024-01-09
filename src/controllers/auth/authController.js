const { validateConnection } = require("../../config/db");
const { SECRET } = require("../../config/config");
const jwt = require("jsonwebtoken");

const authLogin = (req, res) => {
  const { user_name, password } = req.body;

  validateConnection()
    .then((connection) => {
      const query = `
      SELECT id_user, user_name, status
      FROM users
      WHERE user_name = ? AND password = ? AND status = 'Activo';
    `;

      connection.query(query, [user_name, password], (err, results) => {
        connection.release();
        if (err) {
          return res.status(500).json({
            status_Code: 500,
            message: "el usuario no existe",
          });
        }
        if (results.length === 0) {
          return res.status(200).json({
            status_Code: 200,
            message: "el usuario o la contrasena son incorrectos",
          });
        } else {
          const user = results[0];
          try {
            // Generar un token JWT y enviarlo como respuesta
            const token = jwt.sign(
              { id_user: user.id_user, user_name: user.user_name },
              SECRET,
              {
                expiresIn: "24h",
              }
            );
            res.status(200).json({
              status_Code: 200,
              body: { ...user, token },
              message: "usuario válido",
            });
          } catch (error) {
            res.status(400).json({ error: "error al generar JWT" });
          }
        }
      });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

module.exports = {
  authLogin,
};
