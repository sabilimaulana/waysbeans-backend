const { authProduct } = require("../helpers/authSchema");
const db = require("../../models");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

exports.getAllProducts = async (req, res) => {
  try {
    const result = await db.Product.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    // Menambahkan base url kepada path gambar product
    const newResult = result.map((product) => {
      if (product.photo) {
        product.photo = BASE_URL + product.photo;
      }

      return product;
    });

    res.status(200).json({
      status: "Success",
      // message: "Get all products successfully",
      data: { products: result },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.Product.findOne({
      where: {
        id,
      },
    });

    if (!result) {
      return res.status(400).json({
        message: "Get product detail by id is failed because id doesn't exist",
      });
    }

    if (result.photo) {
      result.photo = BASE_URL + result.photo;
    }

    res.status(200).json({
      message: "Get product detail by id succesfully",
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { userId: adminId } = req;

    const checkListAs = await db.User.findOne({ where: { id: adminId } });

    if (checkListAs.listAs !== "Seller") {
      return res.status(401).json({
        status: "Failed",
        message: "Add product failed because you're not a Seller",
      });
    }

    const productValidate = await authProduct.validateAsync(req.body);

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "Failed", message: "photo is required" });
    }

    const { name, price, stock, description } = req.body;

    const result = await db.Product.create({
      name,
      price,
      description,
      stock,
      photo: req.file?.path,
    });

    res.status(200).json({
      status: "Success",
      message: "Add product to database successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi) {
      res.status(422).json({ error: error.details[0].message });
    } else {
      res
        .status(500)
        .json({ status: "Failed", message: "Internal server error", error });
    }

    console.log(error);
  }
};

exports.deleteProduct = async (req, res) => {
  const { userId } = req;

  const checkListAs = await db.User.findOne({ where: { id: userId } });

  if (checkListAs.listAs !== "Seller") {
    return res.status(401).json({
      status: "Failed",
      message: "Add property failed because you're not the Seller",
    });
  }

  const { id } = req.params;

  try {
    const result = await db.Product.findOne({
      where: {
        id,
      },
    });
    if (!result) {
      res.status(400).json({
        message: `Delete product by id is failed because id: ${id} doesn't exist`,
      });
    } else {
      db.Product.destroy({
        where: { id },
      });
      res
        .status(200)
        .json({ message: `Delete product by id: ${id} successfully` });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

// Untuk mengedit property berdasarkan id
// dengan body berbentuk form
exports.updateProduct = async (req, res) => {
  const { userId } = req;

  const checkListAs = await db.User.findOne({ where: { id: userId } });

  if (checkListAs.listAs === "Tenant") {
    return res.status(401).json({
      status: "Failed",
      message: "Add property failed because you're not the Owner",
    });
  }

  const { id } = req.params;

  const { name, price, description, stock } = req.body;

  try {
    const result = await db.Product.update(
      {
        name,
        price,
        description,
        stock,
        photo: req.file?.path,
      },
      { where: { id } }
    );

    if (result[0] === 0) {
      res.status(400).json({ message: "Id product is doesn't exist" });
    } else {
      db.Product.findOne({
        where: { id },
      })
        .then((result) => {
          res.status(200).json({
            message: `Product with id ${id} has been updated`,
            data: result,
          });
        })
        .catch((error) => {
          res.status(500).json({
            status: "Failed",
            message: "Internal server error",
            error,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};
