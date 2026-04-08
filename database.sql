CREATE DATABASE IF NOT EXISTS njehi;
USE njehi;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('actif', 'inactif') DEFAULT 'actif',
  role ENUM('etudiant', 'professeur', 'admin') DEFAULT 'etudiant'
);

CREATE TABLE profils (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  telephone VARCHAR(20),
  adresse VARCHAR(255),
  wilaya VARCHAR(100),
  photo_profil VARCHAR(255),
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);