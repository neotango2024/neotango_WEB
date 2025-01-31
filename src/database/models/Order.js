export default (sequelize, dataTypes) => {

    let alias = "Order";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        tra_id: { type: dataTypes.STRING(15) },
        user_id: { type: dataTypes.STRING(36) },
        first_name: { type: dataTypes.STRING(150) },
        last_name: { type: dataTypes.STRING(150) },
        email: { type: dataTypes.STRING(150) },
        dni: { type: dataTypes.STRING(40) },
        total: { type: dataTypes.DECIMAL(10,2) },
        order_status_id: { type: dataTypes.INTEGER },
        shipping_types_id: { type: dataTypes.INTEGER },
        payment_types_id: { type: dataTypes.INTEGER },
        language: { type: dataTypes.STRING(3) },
        //Billing Address Snapshot
        billing_address_street: { type: dataTypes.STRING(200) },
        billing_address_detail: { type: dataTypes.STRING(200) },
        billing_address_city: { type: dataTypes.STRING(200) },
        billing_address_province: { type: dataTypes.STRING(200) },
        billing_address_zip_code: { type: dataTypes.STRING(200) },
        billing_address_label: { type: dataTypes.STRING(200) },
        billing_address_country_name: { type: dataTypes.STRING(200) },
        //Shipping Address Snapshot
        shipping_address_street: { type: dataTypes.STRING(200) },
        shipping_address_detail: { type: dataTypes.STRING(200) },
        shipping_address_city: { type: dataTypes.STRING(200) },
        shipping_address_province: { type: dataTypes.STRING(200) },
        shipping_address_zip_code: { type: dataTypes.STRING(200) },
        shipping_address_label: { type: dataTypes.STRING(200) },
        shipping_address_country_name: { type: dataTypes.STRING(200) },
        //Phone Snapshot
        phone_code: { type: dataTypes.STRING(50) },
        phone_number: { type: dataTypes.STRING(100) },
        currency_id: {type: dataTypes.INTEGER}
    }

    let config = {
        tableName: 'orders',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Order = sequelize.define(alias, cols, config);

    Order.associate = (models) => {
        const {  User, Address, PhoneNumber, OrderItem } = models;
        Order.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        });
        Order.hasMany(OrderItem,{
            as:'orderItems',
            foreignKey:'order_id'
        });
    };

    return Order;
}