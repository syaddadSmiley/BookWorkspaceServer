queries = `
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(50) NOT NULL,
    id_type_ws VARCHAR(50) NOT NULL,
    id_user VARCHAR(50) NOT NULL,
    start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workspaces(id),
    FOREIGN KEY (id_type_ws) REFERENCES type_ws(id)
);
`

module.exports = {
    "up": queries,
    "down": ""
}