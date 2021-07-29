const { authProperty, authProduct } = require("../helpers/authSchema");
const db = require("../../models");
const { Product } = require("../../models");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

exports.getAllProducts = async (req, res) => {
  //baru selesai membuat multiple query filter, tinggal bikin yang single query filter
  if (Object.keys(req.query).length > 0) {
    // try {
    //   const result = await db.Property.findAll({
    //     include: {
    //       model: City,
    //       attributes: { exclude: ["createdAt", "updatedAt"] },
    //     },
    //     attributes: { exclude: ["createdAt", "updatedAt", "cityId"] },
    //   });
    //   if (req.query.belowYearPrice && req.query.belowArea) {
    //     const newResult = result.filter((property) => {
    //       if (
    //         parseInt(property.yearPrice) <=
    //           parseInt(req.query.belowYearPrice) &&
    //         parseInt(property.area) <= parseInt(req.query.belowArea)
    //       ) {
    //         return true;
    //       }
    //     });
    //     res.send(newResult);
    //   }
    //   res.send(result);
    // } catch (error) {
    //   res
    //     .status(500)
    //     .json({ status: "Failed", message: "Internal server error", error });
    // }
  } else {
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

    if (checkListAs.listAs === "Customer") {
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

    console.log(req.file);

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
