queries = `
CREATE TABLE IF NOT EXISTS booking_ws (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(50) NOT NULL,
    id_user VARCHAR(50) NOT NULL,
    id_service VARCHAR(50) NOT NULL,
    payment_status BOOLEAN NOT NULL DEFAULT 0,
    jenis_pembayaran VARCHAR(50) NOT NULL,
    total_pembayaran INTEGER NOT NULL,
    status enum('waiting','on_place','done') NOT NULL DEFAULT 'waiting',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workingspaces(id),
    FOREIGN KEY (id_user) REFERENCES users(uid),
    FOREIGN KEY (id_service) REFERENCES services(id)
);
`

module.exports = {
    "up": queries,
    "down": ""
}