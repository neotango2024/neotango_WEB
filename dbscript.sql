CREATE TABLE user_roles (
	id INT PRIMARY KEY AUTO_INCREMENT,
    role VARCHAR(20) NOT NULL
);
CREATE TABLE shipping_zones_prices (
	id INT PRIMARY KEY AUTO_INCREMENT,
    zone VARCHAR(100) NOT NULL,
    usd_price INT NOT NULL,
    ars_price INT NOT NULL
);

CREATE TABLE users (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    username VARCHAR(200) NOT NULL,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NOT NULL,
    user_role_id INT NOT NULL,
    FOREIGN KEY(user_role_id) REFERENCES user_roles(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE users_phone_numbers (
	id INT PRIMARY KEY,
	user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    phone_number VARCHAR(70) NOT NULL,
    country_id INT NOT NULL
);

CREATE TABLE products (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    name VARCHAR(200) NOT NULL,
	english_description TEXT NOT NULL,
    spanish_description TEXT NOT NULL,
    ars_price INT NOT NULL,
    usd_price INT NOT NULL,
    sku VARCHAR(200),
	created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NOT NULL,
	category_id INT NOT NULL
);

CREATE TABLE products_sizes_tacos_quantity (
	id INT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
	size_id INT NOT NULL,
	taco_id INT NOT NULL,
    quantity INT NOT NULL
);

CREATE TABLE products_files (
	id INT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    file VARCHAR(255) NOT NULL
);

CREATE TABLE temp_carts_items (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    product_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    quantity INT NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE carts (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    temp_cart_item_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (temp_cart_item_id) REFERENCES temp_carts_items(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    created_at DATETIME NOT NULL
);

CREATE TABLE orders_statuses (
	id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE orders (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    cart_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
	total DECIMAL(10, 2),
    order_status_id INT NOT NULL,
    FOREIGN KEY (order_status_id) REFERENCES orderS_statuses(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NOT NULL
);

RENAME TABLE users_phone_numbers TO phone_numbers;

ALTER TABLE phone_numbers
MODIFY COLUMN id VARCHAR(36);

CREATE TABLE addresses (
	id VARCHAR(36) PRIMARY KEY UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE,
    street VARCHAR(200) NOT NULL,
	detail TEXT NOT NULL,
    zip_code INT NOT NULL,
    province VARCHAR(200) NOT NULL,
    country_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
	phone_number_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (phone_number_id) REFERENCES phone_numbers(id)
	ON UPDATE CASCADE
    ON DELETE CASCADE
);

ALTER TABLE phone_numbers
DROP FOREIGN KEY phone_numbers_ibfk_1;

ALTER TABLE phone_numbers
DROP COLUMN user_id;

ALTER TABLE users
ADD COLUMN phone_number_id VARCHAR(36);

ALTER TABLE users
ADD CONSTRAINT fk_phone_number
FOREIGN KEY (phone_number_id) REFERENCES phone_numbers(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

