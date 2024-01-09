// utils.js

function generateUniqueFolio() {
  const prefix = "AM";
  const uniqueString = Math.random().toString(36).substring(2, 12);
  const uniqueFolio = `${prefix}${uniqueString}`;
  return uniqueFolio.toUpperCase();
}

module.exports = {
  generateUniqueFolio,
};
