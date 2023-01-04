queries = `
CREATE TABLE IF NOT EXISTS booking_ws (
    id VARCHAR(120) NOT NULL PRIMARY KEY,
    id_ws VARCHAR(120) NOT NULL,
    id_user VARCHAR(120) NOT NULL,
    id_service VARCHAR(120) NOT NULL,
    payment_status BOOLEAN NOT NULL DEFAULT 0,
    jenis_pembayaran VARCHAR(120) NOT NULL,
    total_pembayaran INTEGER NOT NULL,
    status enum('waiting','on_place','done') NOT NULL DEFAULT 'waiting',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ws) REFERENCES workspaces(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_service) REFERENCES services(id) ON DELETE CASCADE ON UPDATE NO ACTION
);
`

query2 = `
ALTER TABLE booking_ws
ADD start_date DATETIME NOT NULL AFTER id_service,
ADD end_date DATETIME NOT NULL AFTER start_date;
`

module.exports = {
    "up": queries,
    "down": ""
}