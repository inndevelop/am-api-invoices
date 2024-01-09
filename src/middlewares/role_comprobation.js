const role_comprobation = (roles) => {
  return (req, res, next) => {
    const userRole = res.locals.role;

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: no tienes el rol requerido." });
    }

    // Si el rol es válido, permite que la solicitud continúe
    next();
  };
};

module.exports = role_comprobation;
