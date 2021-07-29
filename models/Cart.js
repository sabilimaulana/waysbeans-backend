module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define("Cart", {
    orderQuantity: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // urlSecondImage: {
    //   type: DataTypes.STRING,
    //   defaultValue: "",
    // },
    // urlThirdImage: {
    //   type: DataTypes.STRING,
    //   defaultValue: "",
    // },
    // urlFourthImage: {
    //   type: DataTypes.STRING,
    //   defaultValue: "",
    // },
  });
  // City.hasOne(Property);
  // Property.belongsTo(City);
  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: "userId" }); // If only one portfolio per user
    Cart.belongsTo(models.Product, { foreignKey: "productId" });
    // Cart.hasOne(models.Transaction, { foreignKey: "propertyId" });
    // Cart.belongsTo(models.User, { foreignKey: "ownerId" }); // If only one portfolio per user

    // Proper.hasOne(models.Property, { foreignKey: "cityId" }); // If only one portfolio per user
    // If only one portfolio per user
  };
  return Cart;
};
