const db = require("../../models");
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const { Op } = require("sequelize");
require("dotenv").config();

const JWT_KEY = process.env.JWT_KEY;

const { authUser } = require("../helpers/authSchema");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.User.findOne({
      where: {
        email,
      },
    });

    if (result) {
      const isValidPassword = await bcrypt.compare(password, result.password);
      if (!isValidPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Email or Password dont match",
        });
      }

      const token = jwt.sign({ email, id: result.id }, JWT_KEY, {
        expiresIn: "1h",
      });
      res.status(200).json({
        status: "Success",
        data: {
          user: {
            email,
            token,
          },
        },
      });
    } else {
      res.status(401).json({
        status: "Failed",
        message: "Data doesn't match with the database",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};

exports.register = async (req, res) => {
  try {
    const userValidate = await authUser.validateAsync(req.body);

    const { password, fullname, email, listAs } = req.body;

    const hashStrenght = 10;
    const hashedPassword = await bcrypt.hash(password, hashStrenght);

    const result = await db.User.findOne({
      where: {
        email,
      },
    });

    if (result) {
      res.status(401).json({ message: "Email is already exist" });
    } else {
      User.create({
        password: hashedPassword,
        fullname,
        email,
        listAs,
      }).then((result) => {
        // console.log(result);
        const token = jwt.sign({ email, id: result.id }, JWT_KEY, {
          expiresIn: "1h",
        });

        res.status(200).json({
          status: "Success",
          // message: "Add user to database successfully",
          data: {
            user: {
              email,
              token,
            },
          },
        });
      });
    }
  } catch (error) {
    if (error.isJoi === true) {
      res.status(422).json({ error: error.details[0].message });
    } else {
      res
        .status(500)
        .json({ status: "Failed", message: "Internal server error", error });
      console.log(error);
    }
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req;

    const user = await db.User.findOne({
      where: {
        id: userId,
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    // console.log(user);

    res.status(200).json({
      status: "Success",
      // message: "Add user to database successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.isJoi === true) {
      res.status(422).json({ error: error.details[0].message });
    } else {
      res
        .status(500)
        .json({ status: "Failed", message: "Internal server error", error });
      console.log(error);
    }
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req;

    const result = db.User.update(
      { photo: req.file.path },
      { where: { id: userId } }
    );

    if (result[0] === 0) {
      res
        .status(400)
        .json({ message: `User with id: ${userId} doesn't exist` });
    } else {
      db.User.findOne({ where: { id: userId } }).then((result) => {
        res.status(200).json({
          message: "Update profile picture successfully",
          data: result,
        });
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Internal server error", error });
  }
};
