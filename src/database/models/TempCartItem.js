export default (sequelize, dataTypes) => {

    let alias = "TempCartItem";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        variation_id: { type: dataTypes.STRING(36) },
        user_id: { type: dataTypes.STRING(36) },
        quantity: { type: dataTypes.INTEGER },
        created_at: { type: dataTypes.DATE },
    }

    let config = {
        tableName: 'temp_carts_items',
        timestamps: false,
    }

    const TempCartItem = sequelize.define(alias, cols, config);

    TempCartItem.associate = (models) => {
        const {Variation, User} = models;
        TempCartItem.belongsTo(Variation, {
            as: 'variation',
            foreignKey: 'variation_id'
        })
        TempCartItem.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return TempCartItem;
}