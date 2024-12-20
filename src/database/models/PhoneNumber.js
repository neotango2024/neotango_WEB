export default (sequelize, dataTypes) => {

    let alias = "PhoneNumber";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        phone_number: { type: dataTypes.STRING(70) },
        country_id: { type: dataTypes.INTEGER },
        user_id: { type: dataTypes.STRING(36) },
    }

    let config = {
        tableName: 'phone_numbers',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const PhoneNumber = sequelize.define(alias, cols, config);

    PhoneNumber.associate = (models) => {
        const {Order, User} = models;
        PhoneNumber.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return PhoneNumber;
}