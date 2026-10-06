const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
};

const adminOnly = authorize(["admin"]);

const userOnly = authorize(["user"]);

module.exports = { authorize, adminOnly, userOnly };