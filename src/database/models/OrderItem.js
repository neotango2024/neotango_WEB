export default (sequelize, dataTypes) => {
    let alias = "OrderItem";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true
        },
        order_id: { type: dataTypes.STRING(36) },
        variation_id: { type: dataTypes.STRING(36) }, //Dejo la variation en vez del producto para poder manejar mejor el stock
        eng_name: {type: dataTypes.STRING(255)},
        es_name: {type: dataTypes.STRING(255)},
        price: { type: dataTypes.DECIMAL(10,2) },
        quantity: {type: dataTypes.INTEGER},
        taco: {type: dataTypes.STRING(20)},
        size: {type: dataTypes.STRING(20)},
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
        OrderItem.belongsTo(models.Variation, {
            as: 'variation',
            foreignKey: 'variation_id'
        });
    };

    return OrderItem;
}