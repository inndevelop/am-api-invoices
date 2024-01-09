const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/config");

function getTokenData(req) {
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
    return ({ id_user, user_name } = decoded);
  });
}

module.exports = getTokenData;
