
module.exports = (sequelize, DataTypes) => {
    const Otp = sequelize.define('otps', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        id_user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        otp: {
            type: DataTypes.NUMBER,
            allowNull: true,
        },
        limit: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        expired_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE, field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE, field: 'updated_at',
        },
    }, {});
    Otp.associate = function (models) {
        Otp.belongsTo(models.users, {
            foreignKey: 'id_user',
        });
        // associations can be defined here
    };
    return Otp;
};
