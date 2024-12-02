export default (sequelize, dataTypes) => {

    let alias = "ProductSizeTacoQuantity";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false
        },
        product_id: { type: dataTypes.STRING(36) },
        taco_id: { type: dataTypes.INTEGER },
        size_id: { type: dataTypes.INTEGER },
        quantity: { type: dataTypes.INTEGER },
    }

    let config = {
        tableName: 'products_sizes_tacos_quantity',
        timestamps: false
    }

    const ProductSizeTacoQuantity = sequelize.define(alias, cols, config);

    ProductSizeTacoQuantity.associate = (models) => {
        const {Product} = models;
        ProductSizeTacoQuantity.belongsTo(Product, {
            as: 'product',
            foreignKey: 'product_id'
        })
    };

    return ProductSizeTacoQuantity;
}