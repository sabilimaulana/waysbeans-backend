// const { authTransaction } = require("../helpers/authSchema");
const db = require("../../models");

const midtransClient = require("midtrans-client");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

exports.addTransaction = async (req, res) => {
  try {
    if (typeof req.body.products === "string") {
      req.body.products = JSON.parse(req.body.products);

      // if (!req.file) {
      //   return res
      //     .status(400)
      //     .json({ status: "Failed", message: "attachment is required" });
      // }
    }

    const { userId } = req;

    const userData = await db.User.findOne({
      where: { id: userId },
      attributes: { exclude: ["createdAt", "updatedAt", "password"] },
    });

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
      const transactionResult = await db.Transaction.create({
        name,
        email,
        phone,
        address,
        total,
        status,
        userId,
        zipCode,
        // attachment: req.file?.path,
      });

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

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      console.log("server key", process.env.MIDTRANS_SERVER_KEY);
      console.log("client key", process.env.MIDTRANS_CLIENT_KEY);

      const parameter = {
        transaction_details: {
          order_id: newResult.id,
          gross_amount: newResult.total,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          full_name: userData.fullname,
          email: userData.email,
        },
      };

      console.log("parameter", parameter);
      const payment = await snap.createTransaction(parameter);
      console.log("payment", payment);
      console.log("newResult", newResult);

      res.status(200).json({
        status: "Success",
        data: { payment, transaction: newResult },
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// Notifikasi untuk payment gateway
exports.notification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);

    const transactionData = await db.Transaction.findOne({
      where: {
        id: statusResponse.order_id,
      },
    });

    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        updateTransaction(orderId, "Pending");
        return res.status(200);
      } else if (fraudStatus == "accept") {
        if (transactionData.status === "Pending") {
          updateTransaction(orderId, "Waiting Approve");
        }
        return res.status(200);
      }
      return res.status(200);
    } else if (transactionStatus == "settlement") {
      if (transactionData.status === "Pending") {
        updateTransaction(orderId, "Waiting Approve");
      }
      return res.status(200);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      updateTransaction(orderId, "Failed");
      return res.status(200);
    } else if (transactionStatus == "pending") {
      updateTransaction(orderId, "Pending");
      return res.status(200);
    }
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
};

const updateTransaction = async (id, status) => {
  await db.Transaction.update(
    {
      status,
    },
    {
      where: {
        id,
      },
    }
  );
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

  if (status === "On Process") {
    const user = await db.User.findOne({ where: { id: userId } });

    if (user.listAs !== "Seller") {
      return res
        .status(400)
        .json({ status: "Failed", message: "You are not the admin." });
    }
  }

  try {
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
