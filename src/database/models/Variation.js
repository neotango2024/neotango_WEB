export default (sequelize, dataTypes) => {

    let alias = "Variation";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false
        },
        product_id: { type: dataTypes.STRING(36) },
        taco_id: { type: dataTypes.INTEGER },
        size_id: { type: dataTypes.INTEGER },
        // color_id: { type: dataTypes.INTEGER },
        quantity: { type: dataTypes.INTEGER },
    }

    let config = {
        tableName: 'variations',
        timestamps: false
    }

    const Variation = sequelize.define(alias, cols, config);

    Variation.associate = (models) => {
        const { Product } = models;
        Variation.belongsTo(Product, {
            as: 'product',
            foreignKey: 'product_id'
        })
    };

    return Variation;
}