

module.exports = (sequelize, DataTypes) => {
	const TypeWs = sequelize.define('type_ws', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		id_ws: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		kapasitas: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        harga: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdAt:
		{
			type: DataTypes.DATE, field: 'created_at',
		},
		updatedAt: {
			type: DataTypes.DATE, field: 'updated_at',
		},

	}, {});
	TypeWs.associate = function (models) {
		TypeWs.hasMany(models.Roles, {
			foreignKey: 'id_ws',
		});
	};
	return TypeWs;
};
