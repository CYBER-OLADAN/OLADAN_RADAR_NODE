const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

module.exports = roleGuard;
