export default (sequelize, dataTypes) => {

    let alias = "Product";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        name: { type: dataTypes.STRING(200) },
        english_description: { type: dataTypes.TEXT },
        spanish_description: { type: dataTypes.TEXT },
        ars_price: { type: dataTypes.INTEGER },
        usd_price: { type: dataTypes.INTEGER },
        sku: { type: dataTypes.STRING(200) },
        category_id: { type: dataTypes.INTEGER },
    }

    let config = {
        tableName: 'products',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Product = sequelize.define(alias, cols, config);

    Product.associate = (models) => {
        const {ProductFile, ProductSizeTacoColorQuantity} = models;
        Product.hasMany(ProductFile, {
            as: 'files',
            foreignKey: 'product_id'
        })
        Product.hasMany(ProductSizeTacoColorQuantity, {
            as: 'sizeTacoColorQuantity',
            foreignKey: 'product_id'
        })
    };

    return Product;
}