const setDatabaseLocale = (connection) => {
  return new Promise((resolve, reject) => {
    const setLocaleQuery = `
        SET lc_time_names = 'es_ES';
      `;

    connection.query(setLocaleQuery, (err) => {
      if (err) {
        console.error("Error al establecer el idioma:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = setDatabaseLocale;
