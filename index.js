const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;
const cors = require("cors");
require("dotenv").config();

const user = require("./src/routes/user");
const product = require("./src/routes/product");
const cart = require("./src/routes/cart");
const transaction = require("./src/routes/transaction");

const db = require("./models");

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

//routes
app.use("/api/v1/", user);
app.use("/api/v1/", cart);
app.use("/api/v1/", product);
app.use("/api/v1/", transaction);

app.use("/", (req, res) => {
  res.send("lala");
});

// db.sequelize.sync({ force: true }).then((req) => {
//   app.listen(PORT, () => {
//     console.log("App is running on localhost on ", PORT);
//     // console.log(process.env.JWT_KEY);
//   });
// });

// db.sequelize.sync().then((req) => {
//   app.listen(PORT, () => {
//     console.log("App is running on localhost on ", PORT);
//     // console.log(process.env.JWT_KEY);
//   });
// });

app.listen(PORT, () => {
  console.log("App is running on localhost on ", PORT);
  // console.log(process.env.JWT_KEY);
});
