query = `CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id)
);`;

module.exports = {
    "up": query,
    "down": ""
}