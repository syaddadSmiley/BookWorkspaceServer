upQuery = `
    CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

module.exports = {
    "up": upQuery,
    "down": ""
}