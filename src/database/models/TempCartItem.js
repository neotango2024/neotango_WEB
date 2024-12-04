export default (sequelize, dataTypes) => {

    let alias = "TempCartItem";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        product_id: { type: dataTypes.STRING(36) },
        quantity: { type: dataTypes.INTEGER },
        taco_id: { type: dataTypes.INTEGER },
        size_id: { type: dataTypes.INTEGER },
        category_id: { type: dataTypes.INTEGER },
        created_at: { type: dataTypes.DATE }
    }

    let config = {
        tableName: 'temp_carts_items',
        timestamps: false,
    }

    const TempCartItem = sequelize.define(alias, cols, config);

    TempCartItem.associate = (models) => {
        const {Product} = models;
        TempCartItem.belongsTo(Product, {
            as: 'product',
            foreignKey: 'product_id'
        })
    };

    return TempCartItem;
}