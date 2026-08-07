-- Esquema de base de datos para API-JWT
-- Ejecutar contra una base de datos PostgreSQL vacia

DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    -- 1 = admin, 2 = vet, 3 = user (cliente)
    role_id SMALLINT NOT NULL DEFAULT 3 CHECK (role_id IN (1, 2, 3)),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(80),
    age SMALLINT CHECK (age >= 0),
    owner_name VARCHAR(120),
    image_url TEXT,
    created_by INTEGER REFERENCES users(uid) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Usuario admin de prueba (password: Admin123!)
-- Genera tu propio hash con bcrypt antes de usar en produccion.
-- INSERT INTO users (username, email, password, role_id)
-- VALUES ('admin', 'admin@example.com', '$2a$10$REEMPLAZA_ESTE_HASH', 1);

INSERT INTO pets (name, species, breed, age, owner_name, image_url) VALUES
('Firulais', 'Perro', 'Labrador', 3, 'Carlos Perez', 'https://images.dog.ceo/breeds/labrador/n02099712_1052.jpg'),
('Michi', 'Gato', 'Siames', 2, 'Ana Gomez', 'https://cdn2.thecatapi.com/images/16s.png'),
('Rocky', 'Perro', 'Bulldog', 5, 'Luis Torres', 'https://images.dog.ceo/breeds/bulldog-english/n02096585_1042.jpg'),
('Kiwi', 'Ave', 'Periquito', 1, 'Maria Diaz', NULL),
('Nala', 'Gato', 'Persa', 4, 'Jorge Ruiz', 'https://cdn2.thecatapi.com/images/5h0.jpg'),
('Toby', 'Perro', 'Beagle', 2, 'Sofia Leon', NULL);
