export default (sequelize, dataTypes) => {

    let alias = "Cart";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        temp_cart_item_id: { type: dataTypes.INTEGER },
        user_id: { type: dataTypes.INTEGER },
        created_at: { type: dataTypes.DATE }
    }

    let config = {
        tableName: 'carts',
        timestamps: false,
    }

    const Cart = sequelize.define(alias, cols, config);

    Cart.associate = (models) => {
        const  { TempCartItem, User, Order } = models;
        Cart.hasMany(TempCartItem, {
            as: 'tempCartItems',
            foreignKey: 'temp_cart_item_id',
        })
        Cart.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
        Cart.hasOne(Order, {
            as: 'order',
            foreignKey: 'cart_id'
        })
    };

    return Cart;
}