

module.exports = (sequelize, DataTypes) => {
    const Services = sequelize.define('services', {
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
        createdAt: {
            type: DataTypes.DATE, field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE, field: 'updated_at',
        },

    }, {});
    Services.associate = function (models) {
        // // console.log(models.workspaces);
        Services.belongsTo(models.users, {
            foreignKey: 'id_user',
        });
        Services.belongsTo(models.workspaces, {
            foreignKey: 'id_ws',
        });
        Services.belongsTo(models.type_ws, {
            foreignKey: 'id_type_ws',
        });
    };
    return Services;
};
