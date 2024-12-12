export default (sequelize, dataTypes) => {
    let alias = "Country";

    let cols = {
        id: {
            type: dataTypes.STRING(36),
            primaryKey: true,
        },
        name: { type: dataTypes.STRING(100) },
        phone_code: { type: dataTypes.TEXT },
        nick: { type: dataTypes.STRING(30)},
        abbreviation: {type: dataTypes.STRING(10)},
        flag: {type: dataTypes.STRING(10)},

    }

    let config = {
        tableName: 'countries',
        paranoid: true
    }

    const Country = sequelize.define(alias, cols, config);

    return Country;
}