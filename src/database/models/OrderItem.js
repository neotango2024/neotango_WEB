export default (sequelize, dataTypes) => {
    let alias = "OrderItem";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true
        },
        order_id: { type: dataTypes.STRING(36) },
        product_id: { type: dataTypes.STRING(36) },
        name: {type: dataTypes.STRING(255)},
        price: { type: dataTypes.DECIMAL(10,2) },
        quantity: {type: dataTypes.INTEGER},
        discount: { type: dataTypes.TINYINT },
    }

    let config = {
        tableName: 'order_items',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const OrderItem = sequelize.define(alias, cols, config);

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            as: 'order',
            foreignKey: 'order_id'
        });
        OrderItem.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'product_id'
        });
    };

    return OrderItem;
}