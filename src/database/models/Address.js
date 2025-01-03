export default (sequelize, dataTypes) => {

    let alias = "Address";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        user_id: { type: dataTypes.STRING(36)},
        street: { type: dataTypes.STRING(255) },
        detail: { type: dataTypes.STRING(60) },
        zip_code: { type: dataTypes.STRING(10) },
        label: {type: dataTypes.STRING(100)},
        city: { type: dataTypes.STRING(100) },
        province: { type: dataTypes.STRING(100) },
        country_id: { type: dataTypes.STRING(36)},
        first_name: { type: dataTypes.STRING(255) },
        last_name: { type: dataTypes.STRING(255) },
    }

    let config = {
        tableName: 'addresses',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const Address = sequelize.define(alias, cols, config);

    Address.associate = (models) => {
        const {User} = models;
        Address.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return Address;
}