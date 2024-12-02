export default (sequelize, dataTypes) => {

    let alias = "ProductFile";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        product_id: { type: dataTypes.STRING(36) },
        file: { type: dataTypes.STRING(255) }
    }

    let config = {
        tableName: 'products_files',
        timestamps: false
    }

    const ProductFiles = sequelize.define(alias, cols, config);

    ProductFiles.associate = (models) => {
        const {Product} = models;
        ProductFiles.belongsTo(Product, {
            as: 'product',
            foreignKey: 'product_id'
        })
    };

    return ProductFiles;
}