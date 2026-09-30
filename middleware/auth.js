const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).send({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};

module.exports = auth;
