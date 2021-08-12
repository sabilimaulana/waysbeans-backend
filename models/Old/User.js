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

    listAs: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  // User.associate = (models) => {
  //   User.hasOne(models.Transaction, { foreignKey: "userId" }); // If only one portfolio per user
  //   User.hasOne(models.Transaction, { foreignKey: "ownerId" }); // If only one portfolio per user

  //   User.hasOne(models.Property, { foreignKey: "ownerId" }); // If only one portfolio per user
  // };

  return User;
};
