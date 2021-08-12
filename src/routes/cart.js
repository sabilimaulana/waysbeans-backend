const { Router } = require("express");
const checkAuth = require("../middleware/checkAuth");
const db = require("../../models");

// Harusnya ini ada di .env

const router = Router();

router.post("/cart", checkAuth, async (req, res) => {
  try {
    const { userId } = req;
    const { productId, orderQuantity } = req.body;

    db.Cart.create({
      userId,
      productId,
      orderQuantity,
    });

    res.status(200).json({ status: "Success" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
});

router.patch("/cart/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(req.body);
    const { userId } = req;
    const { productId, orderQuantity } = req.body;

    await db.Cart.update(
      {
        orderQuantity,
      },
      { where: { id } }
    );

    const result = await db.Cart.findAll({
      where: {
        userId,
      },
      include: {
        model: db.Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    res.status(200).json({ status: "Success", dataAfterUpdated: result });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
});

router.delete("/cart/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(req.body);
    const { userId } = req;
    const { productId, orderQuantity } = req.body;

    const deletedCart = await db.Cart.findOne({ where: { id } });

    if (deletedCart) {
      await db.Cart.destroy({ where: { id } });

      const result = await db.Cart.findAll({
        where: {
          userId,
        },
        include: {
          model: db.Product,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      res.status(200).json({ status: "Success", dataAfterUpdated: result });
    } else {
      res.status(400).json({
        status: "Failed",
        message: `Delete cart by id: ${id} failed, because cart with that id doesn't exist`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
    console.log(error);
  }
});

router.get("/carts", checkAuth, async (req, res) => {
  try {
    const { userId } = req;

    const result = await db.Cart.findAll({
      where: {
        userId,
      },
      include: {
        model: db.Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    res.status(200).json({ status: "Success", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
    console.log(error);
  }
});

router.get("/cart/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { userId } = req;

    const result = await db.Cart.findOne({
      where: { id },
      include: {
        model: db.Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (result) {
      res.status(200).json({ status: "Success", cart: result });
    } else {
      res.status(400).json({
        status: "Failed",
        message: `Delete cart by id: ${id} failed, because cart with that id doesn't exist`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
    console.log(error);
  }
});

module.exports = router;
