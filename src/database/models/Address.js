export default (sequelize, dataTypes) => {

    let alias = "Address";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        street: { type: dataTypes.STRING(255) },
        detail: { type: dataTypes.STRING(45) },
        city: { type: dataTypes.STRING(100) },
        province: { type: dataTypes.STRING(100) },
        zip_code: { type: dataTypes.STRING(10) },
        label: {type: dataTypes.STRING(100)},
        country_id: { type: dataTypes.STRING(36)},
        user_id: { type: dataTypes.STRING(36)},
    }

    let config = {
        tableName: 'addresses',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Address = sequelize.define(alias, cols, config);

    Address.associate = (models) => {
        const {Order, User} = models;
        Address.hasMany(Order, {
            as: 'billingOrders',
            foreignKey: 'billing_address_id'
        })
        Address.hasMany(Order, {
            as: 'shippingOrders',
            foreignKey: 'shipping_address_id'
        })
        Address.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return Address;
}