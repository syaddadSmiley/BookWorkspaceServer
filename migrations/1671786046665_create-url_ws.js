queries = `
CREATE TABLE IF NOT EXISTS url_ws (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workingspaces(id)
);
`

module.exports = {
    "up": queries,
    "down": ""
}