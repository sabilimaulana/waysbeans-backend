// const City = require("./City");

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    orderQuantity: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "Waiting Approve",
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  });
  // City.hasOne(Property);
  // Property.belongsTo(City);
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: "userId" }); // If only one portfolio per user
    // Transaction.belongsTo(models.User, { foreignKey: "ownerId" }); // If only one portfolio per user

    Transaction.belongsTo(models.Product, { foreignKey: "productId" }); // If only one portfolio per user
  };
  return Transaction;
};
