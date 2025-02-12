export default (sequelize, dataTypes) => {
  let alias = "User";

  let cols = {
    id: {
      type: dataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    first_name: { type: dataTypes.STRING(200) },
    last_name: { type: dataTypes.STRING(200) },
    email: { type: dataTypes.STRING(255) },
    password: { type: dataTypes.STRING(255) },
    user_role_id: { type: dataTypes.INTEGER },
    gender_id: { type: dataTypes.INTEGER },
    password_token: { type: dataTypes.TEXT },
    verified_email: { type: dataTypes.TINYINT },
    verification_code: { type: dataTypes.STRING(6) },
    expiration_time: { type: dataTypes.DATE },
    payment_type_id: { type: dataTypes.INTEGER },
  };

  let config = {
    tableName: "users",
    paranoid: true,
    timestamps: true,
    underscored: true,
    // defaultScope: { //ASI DEBERIA SER EL MODELO PARA NO TRAER LA SENSITIVE DATA
    //   attributes: {
    //     exclude: ["password", "createdAt", "updatedAt", "deletedAt"],
    //   },
    // },
    // scopes: {
    //   withPassword: {
    //     attributes: {},
    //   },
    // },
  };

  const User = sequelize.define(alias, cols, config);

  User.associate = (models) => {
    const { TempCartItem, Order, Phone, Address } = models;
    User.hasMany(TempCartItem, {
      as: "tempCartItems",
      foreignKey: "user_id",
    });
    User.hasMany(Order, {
      as: "orders",
      foreignKey: "user_id",
    });
    User.hasMany(Phone, {
      as: "phones",
      foreignKey: "user_id",
    });
    User.hasMany(Address, {
      as: "addresses",
      foreignKey: "user_id",
    });
  };

  return User;
};
