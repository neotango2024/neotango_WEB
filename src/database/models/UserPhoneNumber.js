export default (sequelize, dataTypes) => {

    let alias = "UserPhoneNumber";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: { type: dataTypes.INTEGER },
        phone_number: { type: dataTypes.STRING(70) },
        country_id: { type: dataTypes.INTEGER },
    }

    let config = {
        tableName: 'users_phone_numbers',
        paranoid: true,
        timestamps: true,
        underscored: true
    }

    const UserPhoneNumber = sequelize.define(alias, cols, config);

    UserPhoneNumber.associate = (models) => {
        const {User} = models;
        UserPhoneNumber.belongsTo(User, {
            as: 'user',
            foreignKey: 'user_id'
        })
    };

    return UserPhoneNumber;
}