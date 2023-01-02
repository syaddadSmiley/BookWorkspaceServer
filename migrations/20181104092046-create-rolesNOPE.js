
query = `CREATE TABLE roles (
	id VARCHAR(50) NOT NULL UNIQUE,
	id_user VARCHAR(50) NOT NULL UNIQUE,
	role ENUM('super_admin', 'user', 'admin') NOT NULL DEFAULT 'user',
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
	);
`

module.exports = {
	up: query,
	down: (queryInterface, Sequelize) => queryInterface.dropTable('roles'),
};
