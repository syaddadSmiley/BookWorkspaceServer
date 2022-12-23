query = `CREATE TABLE IF NOT EXISTS workingspace (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_service VARCHAR(50) NOT NULL UNIQUE,
    id_type VARCHAR(50) NOT NULL UNIQUE,
    id_url VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(150) NOT NULL,
    password VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    longtitude VARCHAR(50) NOT NULL,
    latitude VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_status enum('0','1') NOT NULL DEFAULT '0'
    );`

module.exports = {
    "up": query,
    "down": ""
}