
module.exports = (sequelize, DataTypes) => {
	const Roles = sequelize.define('roles', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		id_user: {
			type: DataTypes.STRING,
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM('user'),
			allowNull: false,
		},
		createdAt:{
			type: DataTypes.DATE, field: 'created_at',
		},
		updatedAt: {
			type: DataTypes.DATE, field: 'updated_at',
		},
	}, {});
	Roles.associate = function (models) {
		Roles.belongsTo(models.users, {
			foreignKey: 'id_user',
		}); 
		// associations can be defined here
	};
	return Roles;
};
