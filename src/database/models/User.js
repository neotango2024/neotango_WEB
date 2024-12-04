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
        username: { type: dataTypes.STRING(200) },
        password: { type: dataTypes.STRING(255) },
        email: { type: dataTypes.STRING(255) },
        user_role_id: { type: dataTypes.INTEGER },
        phone_number_id: { type: dataTypes.STRING(36) },
        password_token: { type: dataTypes.TEXT },
        verified_email: { type: dataTypes.TINYINT },
    }

    let config = {
        tableName: 'users',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const User = sequelize.define(alias, cols, config);

    User.associate = (models) => {
        const {Cart, UserPhoneNumber} = models;
        User.hasOne(Cart, {
            as: 'cart',
            foreignKey: 'user_id'
        })
        User.hasMany(UserPhoneNumber, {
            as: 'phoneNumber',
            foreignKey: 'user_id'
        })
    };

    return User;
}