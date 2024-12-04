export default (sequelize, dataTypes) => {

    let alias = "PhoneNumber";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        phone_number: { type: dataTypes.STRING(70) },
        country_id: { type: dataTypes.INTEGER },
    }

    let config = {
        tableName: 'phone_numbers',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const UserPhoneNumber = sequelize.define(alias, cols, config);

    UserPhoneNumber.associate = (models) => {
        const {Order} = models;
        UserPhoneNumber.hasMany(Order, {
            as: 'orders',
            foreignKey: 'phone_id'
        })
    };

    return UserPhoneNumber;
}