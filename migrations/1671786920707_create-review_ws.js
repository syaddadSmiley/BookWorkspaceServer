queries = `
CREATE TABLE IF NOT EXISTS review_ws (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(50) NOT NULL,
    id_user VARCHAR(50) NOT NULL,
    nilai DECIMAL(3, 2) NOT NULL,
    komen VARCHAR(300) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workspaces(id),
    FOREIGN KEY (id_user) REFERENCES users(id)
);
`

module.exports = {
    "up": queries,
    "down": ""
}