DROP DATABASE AM;
CREATE DATABASE AM;
USE AM;
SET lc_time_names = 'es_ES';
CREATE TABLE users (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  status ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE clients (
  id_client INT PRIMARY KEY AUTO_INCREMENT,
  client_name VARCHAR(255) NOT NULL,
  client_store_name VARCHAR(255),
  created_at TIMESTAMP,
  status ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE products_catalog (
  id_product INT PRIMARY KEY AUTO_INCREMENT,
  product_description TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  status ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE invoices (
  id_invoice INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT,
  id_client INT,
  folio_invoice VARCHAR(50) NOT NULL,
  sale_date TIMESTAMP,
  invoice_total_amount DECIMAL(10, 2) NOT NULL,
  pending_invoice_amount DECIMAL(10, 2) NOT NULL,
  invoice_status ENUM('Pendiente', 'Pagada') DEFAULT 'Pendiente',
  payment_type ENUM('Credito', 'Efectivo') NOT NULL,
  payment_date TIMESTAMP,
  total_products INT NOT NULL,
  ticket_printed BOOLEAN DEFAULT false,
  ticket_format TEXT,
  FOREIGN KEY (id_user) REFERENCES users(id_user),
  FOREIGN KEY (id_client) REFERENCES clients(id_client)
);

CREATE TABLE invoice_details (
  id_detail_invoice INT PRIMARY KEY AUTO_INCREMENT,
  id_invoice INT,
  id_product INT,
  product_price DECIMAL(10, 2) NOT NULL,
  product_amount INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (id_invoice) REFERENCES invoices(id_invoice),
  FOREIGN KEY (id_product) REFERENCES products_catalog(id_product)
);

CREATE TABLE payments (
  id_payment INT PRIMARY KEY AUTO_INCREMENT,
  id_invoice INT,
  payment_amount DECIMAL(10, 2) NOT NULL,
  balance_before_payment DECIMAL(10, 2) NOT NULL,
  balance_after_payment DECIMAL(10, 2) NOT NULL,
  id_user INT,
  payment_date TIMESTAMP,
  ticket_printed BOOLEAN DEFAULT false,
  ticket_format TEXT,
  description TEXT,
  FOREIGN KEY (id_invoice) REFERENCES invoices(id_invoice),
  FOREIGN KEY (id_user) REFERENCES users(id_user)
);

#creacion de usuarios
INSERT INTO users (user_name, password, created_at, status)
VALUES ('user', '123456', NOW(), 'Activo');
SELECT * FROM USERS;
#creacion de clientes
INSERT INTO clients (client_name, client_store_name, created_at, status)
VALUES
  ('Juan Carlos Hernandez', 'Abarrotes JC', NOW(), 'Activo'),
  ('Luis Espinoza Galves', 'Abarrotera Espinoza', NOW(), 'Activo'),
  ('Karla Julieta Sanchez Perez', 'Seveneleven', NOW(), 'Activo'),
  ('Ricardo Jaimes Ceja', 'Otso', NOW(), 'Activo'),
  ('Daniel Valdivar Gutierres', 'La tiendita', NOW(), 'Activo');
  
#creacion de productos
INSERT INTO products_catalog (product_description, product_price)
VALUES
  ('Arroz 1kg', 2.99),
  ('Frijoles 500g', 1.99),
  ('Aceite vegetal 1L', 4.49),
  ('Harina de maíz 2kg', 3.99),
  ('Leche en polvo 400g', 5.99),
  ('Jabón en barra 200g', 0.99),
  ('Papel higiénico 4 rollos', 2.79),
  ('Detergente líquido 1L', 3.49),
  ('Cereal de avena 500g', 4.99),
  ('Azúcar 1kg', 1.49);
  
    select * from invoices;
  
  SELECT *
  FROM invoices
  WHERE invoice_status = 'Pendiente';
  
 SELECT 
    id_detail_invoice, 
    id_invoice, 
    invoice_details.id_product, 
    products_catalog.product_description,
    products_catalog.product_price, 
    product_amount, 
    total
  FROM invoice_details
  INNER JOIN products_catalog ON invoice_details.id_product = products_catalog.id_product
  WHERE id_invoice = 3;

select * from products_catalog;