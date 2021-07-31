// const City = require("./City");

module.exports = (sequelize, DataTypes) => {
  const TransactionProduct = sequelize.define("TransactionProduct", {
    orderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    description: {
      type: DataTypes.STRING(1500),
      defaultValue: "",
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  });
  // City.hasOne(Property);
  // Property.belongsTo(City);
  TransactionProduct.associate = (models) => {
    TransactionProduct.belongsTo(models.Transaction);
    TransactionProduct.belongsTo(models.Product);
  };
  return TransactionProduct;
};
