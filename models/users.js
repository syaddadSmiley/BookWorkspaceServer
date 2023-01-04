

module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define('users', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.ENUM('user'),
			allowNull: false,
			defaultValue: 'user',
		},
		verified: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
		},
		mobile_number: {
			type: DataTypes.STRING,
		},
		user_img: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		createdAt:
		{
			type: DataTypes.DATE, field: 'created_at',
		},
		updatedAt: {
			type: DataTypes.DATE, field: 'updated_at',
		},
		deleted_status: {
			type: DataTypes.STRING,
		},

	}, {});
	return Users;
};
