queries = `
CREATE TABLE IF NOT EXISTS type_ws (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(50) NOT NULL,
    kapasitas MEDIUMINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    harga INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workspaces(id)
);
`

module.exports = {
    "up": queries,
    "down": ""
}