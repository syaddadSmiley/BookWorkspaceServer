

module.exports = (sequelize, DataTypes) => {
    const TypeWs = sequelize.define('services', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        id_ws: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_type_ws: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        finish_date: {
            type: DataTypes.DATE,
            allowNull: false
        },

    }, {});
    TypeWs.associate = function (models) {
        TypeWs.hasMany(models.Roles, {
            foreignKey: 'id_ws',
            foreignKey: 'id_type_ws',
            foreignKey: 'id_user',
        });
    };
    return TypeWs;
};
