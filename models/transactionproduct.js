"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      TransactionProduct.belongsTo(models.Transaction); //Column name : TransactionId
      TransactionProduct.belongsTo(models.Product); //Column name : ProductId
    }
  }
  TransactionProduct.init(
    {
      name: DataTypes.STRING,
      orderQuantity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      description: DataTypes.STRING(1500),
      photo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TransactionProduct",
    }
  );
  return TransactionProduct;
};
