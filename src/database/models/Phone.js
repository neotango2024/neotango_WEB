export default (sequelize, dataTypes) => {

    let alias = "Phone";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        phone_number: { type: dataTypes.STRING(70) },
        country_id: { type: dataTypes.STRING(36) },
        user_id: { type: dataTypes.STRING(36) },
        default: { type: dataTypes.BOOLEAN },
    }

    let config = {
        tableName: 'phone_numbers',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Phone = sequelize.define(alias, cols, config);

    Phone.associate = (models) => {
        const {User} = models;
        Phone.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return Phone;
}