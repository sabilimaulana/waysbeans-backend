// const { authTransaction } = require("../helpers/authSchema");
const db = require("../../models");
const { Transaction, User } = require("../../models");
const { Op } = require("sequelize");
const Product = require("../../models/Product");
const { allow } = require("joi");
const e = require("express");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

exports.addTransaction = async (req, res) => {
  try {
    if (typeof req.body.products === "string") {
      req.body.products = JSON.parse(req.body.products);

      if (!req.file) {
        return res
          .status(400)
          .json({ status: "Failed", message: "attachment is required" });
      }
    }

    const { userId } = req;

    const { name, email, phone, address, total, status, zipCode, products } =
      req.body;

    // Mengecek apakah product id yang dimasukkan ada atau tidak
    let isValidProductId = true;

    await Promise.all(
      products.map(async (product) => {
        const productData = await db.Product.findOne({
          where: {
            id: product.id,
          },
        });

        if (!productData) {
          isValidProductId = false;
        }
      })
    );

    if (!isValidProductId) {
      res.status(400).json({
        status: "Failed",
        message: "One of the product id is invalid",
      });
    } else {
      // Transaksinya dibuat dulu
      const transactionResult = await Transaction.create({
        name,
        email,
        phone,
        address,
        total,
        status,
        userId,
        zipCode,
        attachment: req.file?.path,
      });

      // console.log(result.id);

      const newTransactionProduct = [];

      await Promise.all(
        products.map(async (product) => {
          const productData = await db.Product.findOne({
            where: {
              id: product.id,
            },
          });

          const result = await db.TransactionProduct.create({
            TransactionId: transactionResult.id,
            ProductId: product.id,
            orderQuantity: product.orderQuantity,

            name: productData.name,
            price: productData.price,
            description: productData.description,
            photo: productData.photo,
          });
          newTransactionProduct.push(result.dataValues);
        })
      );

      const newResult = {
        ...transactionResult.dataValues,
        products: newTransactionProduct,
      };

      await db.Cart.destroy({ where: { userId } });

      res.status(200).json({
        status: "Success",
        data: { transaction: newResult },
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const result = await db.Transaction.findAll({
      order: [["id", "DESC"]],
      attributes: {
        exclude: ["updatedAt", "userId"],
      },
      include: [
        {
          model: db.TransactionProduct,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: db.User,
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Get all transactions successfully", data: result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.updateTransaction = async (req, res) => {
  const { id } = req.params;

  const { userId } = req;

  const {
    name,
    email,
    phone,
    address,
    total,
    status,
    productId,
    orderQuantity,
    zipCode,
  } = req.body;

  if (status === "On Process")
    try {
      const user = await db.User.findOne({ where: { id: userId } });

      if (user.listAs !== "Seller") {
        return res
          .status(400)
          .json({ status: "Failed", message: "You are not the admin." });
      }

      const result = await db.Transaction.update(
        {
          name,
          email,
          phone,
          address,
          total,
          status,
          productId,
          orderQuantity,
          zipCode,
          attachment: req.file?.path,
        },
        {
          where: { id },
        }
      );

      if (result[0] === 0) {
        res.status(400).json({ message: "Id transaction is doesn't exist" });
      } else {
        db.Transaction.findOne({
          include: [
            {
              model: db.TransactionProduct,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: db.User,
              attributes: { exclude: ["createdAt", "updatedAt", "password"] },
            },
          ],
          where: { id },
          attributes: {
            exclude: ["userId"],
          },
        })
          .then(async (result) => {
            if (status === "On Process") {
              // Mengurangi stock dari masing-masing barang(product)
              result.TransactionProducts.map(async (transactionProduct) => {
                const result = await db.Product.findOne({
                  where: { id: transactionProduct.ProductId },
                });

                await db.Product.update(
                  {
                    stock: +result.stock - +transactionProduct.orderQuantity,
                  },
                  { where: { id: transactionProduct.ProductId } }
                );
              });
            }

            res.status(200).json({
              message: `Transaction with id ${id} has been updated`,
              data: result,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
          });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "Failed", message: "Internal server error", error });
    }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.Transaction.findOne({
      include: [
        {
          model: db.TransactionProduct,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: db.User,
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
      where: { id },
      attributes: {
        exclude: ["userId"],
      },
    });

    if (!result) {
      return res.status(400).json({
        message:
          "Get transaction detail by id is failed because id doesn't exist",
      });
    }

    res.status(200).json({
      message: "Get transaction detail by id succesfully",
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { userId } = req;

    const result = await db.Transaction.findAll({
      where: {
        userId,
      },
      include: [{ model: db.TransactionProduct }, { model: db.User }],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: `Get order with user id: ${userId} successfully`,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

// exports.getHistory = async (req, res) => {
//   try {
//     const { userId } = req;

//     let result;
//     let newResult;
//     const userData = await User.findOne({ where: { id: userId } });
//     console.log(userData.listAs);
//     if (userData.listAs === "Tenant") {
//       result = await db.Transaction.findAll({
//         where: {
//           userId,
//           [Op.or]: [{ status: "Cancel" }, { status: "Approved" }],
//         },
//         include: { model: Property },
//       });
//     } else {
//       result = await db.Transaction.findAll({
//         where: {
//           ownerId: userId,
//           [Op.or]: [{ status: "Cancel" }, { status: "Approved" }],
//         },
//         include: { model: Property },
//       });
//     }

//     newResult = await Promise.all(
//       result.map(async (transaction) => {
//         const resultUser = await User.findOne({
//           where: { id: transaction.userId },
//           attributes: { exclude: ["createdAt", "updatedAt", "password"] },
//         });
//         const resultOwner = await User.findOne({
//           where: { id: transaction.ownerId },
//           attributes: { exclude: ["createdAt", "updatedAt", "password"] },
//         });
//         transaction.dataValues.userData = await resultUser;
//         transaction.dataValues.ownerData = await resultOwner;
//         if (transaction.dataValues.attachment) {
//           transaction.dataValues.attachment =
//             BASE_URL + transaction.dataValues.attachment;
//         }

//         return transaction;
//       })
//     );

//     return res.status(200).json({
//       message: `Get history with user id: ${userId} successfully`,
//       data: newResult,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: "Failed", message: "Internal server error", error });
//   }
// };
