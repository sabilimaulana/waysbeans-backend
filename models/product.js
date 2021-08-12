"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.hasOne(models.Cart, { foreignKey: "productId" });
      Product.hasOne(models.TransactionProduct); //Column name : ProductId
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.STRING,
      stock: DataTypes.STRING,
      description: DataTypes.STRING,
      photo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
