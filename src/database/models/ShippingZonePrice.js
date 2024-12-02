export default (sequelize, dataTypes) => {

    let alias = "ShippingZonePrice";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        zone: { type: dataTypes.STRING(100) },
        ars_price: { type: dataTypes.INTEGER },
        usd_price: { type: dataTypes.INTEGER }
    }

    let config = {
        tableName: 'shipping_zones_prices',
        timestamps: false,
    }

    const ShippingZonePrice = sequelize.define(alias, cols, config);

    ShippingZonePrice.associate = (models) => {
      
    };

    return ShippingZonePrice;
}