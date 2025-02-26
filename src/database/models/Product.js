export default (sequelize, dataTypes) => {

    let alias = "Product";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        eng_name: {type: dataTypes.STRING(255)},
        es_name: { type: dataTypes.STRING(255) },
        english_description: { type: dataTypes.TEXT },
        spanish_description: { type: dataTypes.TEXT },
        ars_price: { type: dataTypes.DECIMAL(10,2) },
        usd_price: { type: dataTypes.DECIMAL(10,2) },
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
        const {File, Variation} = models;
        Product.hasMany(File, {
            as: 'files',
            foreignKey: 'product_id'
        })
        Product.hasMany(Variation, {
            as: 'variations',
            foreignKey: 'product_id'
        })
    };

    return Product;
}