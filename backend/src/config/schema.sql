-- Polishlus Database Schema
-- This file contains all the table definitions for the Polishlus packing application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    imie VARCHAR(50) NOT NULL,
    nazwisko VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    haslo VARCHAR(255) NOT NULL,
    rola VARCHAR(20) DEFAULT 'user',
    avatar VARCHAR(255),
    aktywny BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permission groups table
CREATE TABLE IF NOT EXISTS grupy_uprawnien (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User permissions junction table
CREATE TABLE IF NOT EXISTS uzytkownicy_grupy (
    id SERIAL PRIMARY KEY,
    uzytkownik_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    grupa_id INTEGER REFERENCES grupy_uprawnien(id) ON DELETE CASCADE,
    UNIQUE(uzytkownik_id, grupa_id)
);

-- Positions table
CREATE TABLE IF NOT EXISTS stanowiska (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS pracownicy (
    id SERIAL PRIMARY KEY,
    imie VARCHAR(50) NOT NULL,
    nazwisko VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telefon VARCHAR(20),
    stanowisko_id INTEGER REFERENCES stanowiska(id),
    uzytkownik_id INTEGER REFERENCES users(id),
    data_zatrudnienia DATE DEFAULT CURRENT_DATE,
    aktywny BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS kontakty (
    id SERIAL PRIMARY KEY,
    imie VARCHAR(50) NOT NULL,
    nazwisko VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telefon VARCHAR(20),
    firma VARCHAR(100),
    stanowisko_id INTEGER REFERENCES stanowiska(id),
    adres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product categories table
CREATE TABLE IF NOT EXISTS kategorie_produktow (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS produkty (
    id SERIAL PRIMARY KEY,
    kod VARCHAR(50) UNIQUE NOT NULL,
    nazwa VARCHAR(200) NOT NULL,
    kategoria_id INTEGER REFERENCES kategorie_produktow(id),
    opis TEXT,
    cena DECIMAL(10,2),
    jednostka VARCHAR(20) DEFAULT 'szt.',
    aktywny BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flower suppliers table
CREATE TABLE IF NOT EXISTS dostawcy_kwiatow (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(100),
    adres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flowers table
CREATE TABLE IF NOT EXISTS kwiaty (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    kolor VARCHAR(50),
    cena DECIMAL(10,2),
    dostawca_id INTEGER REFERENCES dostawcy_kwiatow(id),
    aktywny BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Containers table
CREATE TABLE IF NOT EXISTS pojemniki (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    rozmiar VARCHAR(50),
    pojemnosc VARCHAR(50),
    material VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rental companies table
CREATE TABLE IF NOT EXISTS wypozyczalnie (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(100),
    adres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost types table
CREATE TABLE IF NOT EXISTS typy_kosztow (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    powiazanie VARCHAR(50),
    jednostka VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS samochody (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    numer_rejestracyjny VARCHAR(20) UNIQUE NOT NULL,
    typ VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS eventy (
    id SERIAL PRIMARY KEY,
    numer VARCHAR(50) UNIQUE NOT NULL,
    nazwa VARCHAR(200) NOT NULL,
    data DATE NOT NULL,
    lokalizacja TEXT,
    status VARCHAR(50) DEFAULT 'nowe',
    opis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event stages table
CREATE TABLE IF NOT EXISTS etapy_eventow (
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT,
    kolejność INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products in events table
CREATE TABLE IF NOT EXISTS produkty_w_eventach (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES eventy(id) ON DELETE CASCADE,
    produkt_id INTEGER REFERENCES produkty(id) ON DELETE CASCADE,
    ilosc INTEGER DEFAULT 1,
    spakowane INTEGER DEFAULT 0,
    zwrocone INTEGER DEFAULT 0,
    uszkodzone INTEGER DEFAULT 0,
    uwagi TEXT,
    wypozyczony BOOLEAN DEFAULT false,
    wypozyczalnia_id INTEGER REFERENCES wypozyczalnie(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flowers in events table
CREATE TABLE IF NOT EXISTS kwiaty_w_eventach (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES eventy(id) ON DELETE CASCADE,
    kwiat_id INTEGER REFERENCES kwiaty(id) ON DELETE CASCADE,
    ilosc INTEGER DEFAULT 1,
    spakowane INTEGER DEFAULT 0,
    zwrocone INTEGER DEFAULT 0,
    uszkodzone INTEGER DEFAULT 0,
    uwagi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event costs table
CREATE TABLE IF NOT EXISTS koszty_eventow (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES eventy(id) ON DELETE CASCADE,
    typ_kosztu_id INTEGER REFERENCES typy_kosztow(id),
    powiazany_element_id INTEGER,
    powiazany_element_typ VARCHAR(50),
    ilosc DECIMAL(10,2) DEFAULT 1,
    cena_netto DECIMAL(10,2),
    cena_brutto DECIMAL(10,2),
    wartosc_netto DECIMAL(10,2),
    wartosc_brutto DECIMAL(10,2),
    ma_fakture BOOLEAN DEFAULT false,
    numer_faktury VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS wiadomosci_chat (
    id SERIAL PRIMARY KEY,
    nadawca_id INTEGER REFERENCES users(id),
    odbiorca_id INTEGER REFERENCES users(id),
    tresc TEXT NOT NULL,
    zdjecia TEXT[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS powiadomienia (
    id SERIAL PRIMARY KEY,
    uzytkownik_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    typ VARCHAR(50) NOT NULL,
    tytul VARCHAR(200) NOT NULL,
    tresc TEXT,
    przeczytane BOOLEAN DEFAULT false,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status updates table
CREATE TABLE IF NOT EXISTS aktualizacje_statusu (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES eventy(id) ON DELETE CASCADE,
    uzytkownik_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    opis TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eventy_data ON eventy(data);
CREATE INDEX IF NOT EXISTS idx_eventy_status ON eventy(status);
CREATE INDEX IF NOT EXISTS idx_produkty_w_eventach_event_id ON produkty_w_eventach(event_id);
CREATE INDEX IF NOT EXISTS idx_kwiaty_w_eventach_event_id ON kwiaty_w_eventach(event_id);
CREATE INDEX IF NOT EXISTS idx_koszty_eventow_event_id ON koszty_eventow(event_id);
CREATE INDEX IF NOT EXISTS idx_wiadomosci_chat_timestamp ON wiadomosci_chat(timestamp);
CREATE INDEX IF NOT EXISTS idx_powiadomienia_uzytkownik_id ON powiadomienia(uzytkownik_id);
CREATE INDEX IF NOT EXISTS idx_aktualizacje_statusu_event_id ON aktualizacje_statusu(event_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventy_updated_at BEFORE UPDATE ON eventy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 