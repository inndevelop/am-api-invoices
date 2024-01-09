const {
  DATABASE,
  HOST,
  PASSWORD,
  PORT_DATABASE,
  DBUSER,
} = require("../config/config");
var mysql = require("mysql");

var connection = mysql.createPool({
  host: HOST,
  user: DBUSER,
  password: PASSWORD,
  port: PORT_DATABASE,
  database: DATABASE,
});
console.log({
  host: HOST,
  user: DBUSER,
  password: PASSWORD,
  port: PORT_DATABASE,
  database: DATABASE
});
exports.validateConnection = async () => {
  return await new Promise((resolve, reject) => {
    connection.getConnection((error, conn) => {
      if (error)
        reject({
          status_Code: 500,
          mysqlErrorMessage:error,
          message:
            `Error al intentar conectarse a la base de datos`,
        });

      resolve(conn);
    });
  });
};
