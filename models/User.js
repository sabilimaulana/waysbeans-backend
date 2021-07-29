module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    // username: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fullname: {
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
    photo: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    // address: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
    listAs: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // gender: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
    // phone: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
    // urlImage: {
    //   type: DataTypes.STRING,
    //   defaultValue: "",
    // },
  });

  // User.associate = (models) => {
  //   User.hasOne(models.Transaction, { foreignKey: "userId" }); // If only one portfolio per user
  //   User.hasOne(models.Transaction, { foreignKey: "ownerId" }); // If only one portfolio per user

  //   User.hasOne(models.Property, { foreignKey: "ownerId" }); // If only one portfolio per user
  // };

  return User;
};
