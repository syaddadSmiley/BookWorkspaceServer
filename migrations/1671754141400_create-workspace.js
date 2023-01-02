query = `
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_user VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(150) NOT NULL,
    password VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    longtitude VARCHAR(50) NOT NULL,
    latitude VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT NULL DEFAULT NULL,
    deleted_status enum('0','1') NOT NULL DEFAULT '0'
);
`

query2 = `
    ALTER TABLE workspaces
ADD id_user VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
AFTER id;
`

module.exports = {
    "up": query,
    "down": ""
}