upQuery = `
    CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(120) NOT NULL,
        id_user VARCHAR(120) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        `limit` INTEGER NOT NULL DEFAULT 0,
        expired_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

query2 = `
ALTER TABLE otps 
add `limit` INTEGER NOT NULL DEFAULT 0 
after otp

ALTER TABLE `otps` CHANGE `expired_at` `expired_at` TIMESTAMP NULL DEFAULT NULL;
`


module.exports = {
    "up": upQuery,
    "down": ""
}