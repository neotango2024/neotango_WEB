export default (sequelize, dataTypes) => {

    let alias = "Color";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        color: { type: dataTypes.STRING(255) },
    }

    let config = {
        tableName: 'colors',
        timestamps: false
    }

    const Color = sequelize.define(alias, cols, config);

    Color.associate = (models) => {
    };

    return Color;
}