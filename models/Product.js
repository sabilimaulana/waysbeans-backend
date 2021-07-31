module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    stock: {
      type: DataTypes.STRING,
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
  Product.associate = (models) => {
    // Product.belongsTo(models.Cart, { foreignKey: "productId" }); // If only one portfolio per user
    // Product.hasOne(models.Transaction, { foreignKey: "propertyId" });
    // Product.belongsTo(models.User, { foreignKey: "ownerId" }); // If only one portfolio per user
    //   // Proper.hasOne(models.Property, { foreignKey: "cityId" }); // If only one portfolio per user
    //   // If only one portfolio per user
  };
  return Product;
};
