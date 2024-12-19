export default (sequelize, dataTypes) => {

    let alias = "Order";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        cart_id: { type: dataTypes.STRING(36) },
        user_id: { type: dataTypes.STRING(36) },
        phone_id: { type: dataTypes.STRING(36) },
        tra_id: { type: dataTypes.STRING(15) },
        order_status_id: { type: dataTypes.INTEGER },
        total: { type: dataTypes.DECIMAL },
        billing_address_id: { type: dataTypes.STRING(36) },
        shipping_address_id: { type: dataTypes.STRING(36) }
    }

    let config = {
        tableName: 'orders',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Order = sequelize.define(alias, cols, config);

    Order.associate = (models) => {
        const {  User, Address, PhoneNumber } = models;
        Order.belongsTo(PhoneNumber, {
            as: 'phone',
            foreignKey: 'phone_id'
        })
        Order.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
        Order.belongsTo(Address, {
            as: 'billingAddress',
            foreignKey: 'billing_address_id'
        })
        Order.belongsTo(Address, {
            as: 'shippingAddress',
            foreignKey: 'shipping_address_id'
        })
    };

    return Order;
}