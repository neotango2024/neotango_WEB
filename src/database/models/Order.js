export default (sequelize, dataTypes) => {

    let alias = "Order";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        tra_id: { type: dataTypes.STRING(15) },
        cart_id: { type: dataTypes.STRING(36) },
        user_id: { type: dataTypes.STRING(36) },
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
        const { Cart } = models;
        Order.belongsTo(Cart, {
            as: 'cart',
            foreignKey: 'cart_id'
        })
        Order.belongsTo(Cart, {
            as: 'user',
            foreignKey: 'user_id'
        })
        Order.belongsTo(Cart, {
            as: 'billingAddress',
            foreignKey: 'billing_address_id'
        })
        Order.belongsTo(Cart, {
            as: 'shippingAddress',
            foreignKey: 'shipping_address_id'
        })
    };

    return Order;
}