const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_KEY = process.env.JWT_KEY;

module.exports = (req, res, next) => {
  try {
    // console.log(req.headers.authorization);
    // Untuk memisahkan 'Bearer' dan 'token'
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);

    // Meneruskan id user untuk dipakai di controllers
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Auth Failed" });
  }
};
