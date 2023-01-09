
module.exports = (sequelize, DataTypes) => {
    const BookingWs = sequelize.define('booking_ws', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        id_ws: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_service: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_type_ws: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        end_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jenis_pembayaran: {
            type: DataTypes.STRING,
            allowNull: false
        },
        total_pembayaran: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE, field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE, field: 'updated_at',
        },
    }, {});
    BookingWs.associate = function (models) {
        BookingWs.belongsTo(models.users, {
            foreignKey: 'id_user',
        });
        BookingWs.belongsTo(models.workspaces, {
            foreignKey: 'id_ws',
        });
        BookingWs.belongsTo(models.services, {
            foreignKey: 'id_service',
        });
        // associations can be defined here
    };
    return BookingWs;
};
