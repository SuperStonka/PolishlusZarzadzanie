const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Migration function
async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');

    // Read JSON files from backend data directory
    const dataPath = path.join(__dirname, '../../data');
    
    // Migrate users
    console.log('📝 Migrating users...');
    const users = await readJsonFile(path.join(dataPath, 'uzytkownicy.json'));
    for (const user of users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (imie, nazwisko, email, haslo, rola, avatar) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
        [user.imie, user.nazwisko, user.mail, hashedPassword, user.rola, user.avatar]
      );
    }

    // Migrate permission groups
    console.log('👥 Migrating permission groups...');
    const grupyUprawnien = await readJsonFile(path.join(dataPath, 'grupyUprawnien.json'));
    for (const grupa of grupyUprawnien) {
      await db.query(
        'INSERT INTO grupy_uprawnien (id, nazwa, opis) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [grupa.id, grupa.nazwa, grupa.opis]
      );
    }

    // Migrate positions
    console.log('💼 Migrating positions...');
    const stanowiska = await readJsonFile(path.join(dataPath, 'stanowiska.json'));
    for (const stanowisko of stanowiska) {
      await db.query(
        'INSERT INTO stanowiska (id, nazwa, opis) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [stanowisko.id, stanowisko.nazwa, stanowisko.opis]
      );
    }

    // Migrate employees
    console.log('👨‍💼 Migrating employees...');
    const pracownicy = await readJsonFile(path.join(dataPath, 'pracownicy.json'));
    for (const pracownik of pracownicy) {
      await db.query(
        'INSERT INTO pracownicy (id, imie, nazwisko, email, telefon, stanowisko_id, data_zatrudnienia) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [pracownik.id, pracownik.imie, pracownik.nazwisko, pracownik.mail, pracownik.telefon, pracownik.stanowisko_id, pracownik.data_zatrudnienia]
      );
    }

    // Migrate contacts
    console.log('📞 Migrating contacts...');
    const kontakty = await readJsonFile(path.join(dataPath, 'kontakty.json'));
    for (const kontakt of kontakty) {
      await db.query(
        'INSERT INTO kontakty (id, imie, nazwisko, email, telefon, firma, stanowisko, adres) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [kontakt.id, kontakt.imie, kontakt.nazwisko, kontakt.mail, kontakt.telefon, kontakt.nazwaFirmy, kontakt.stanowisko, `${kontakt.ulica}, ${kontakt.kodPocztowy} ${kontakt.miasto}`]
      );
    }

    // Migrate product categories
    console.log('📦 Migrating product categories...');
    const kategorieProduktow = await readJsonFile(path.join(dataPath, 'kategorieProduktow.json'));
    for (const kategoria of kategorieProduktow) {
      await db.query(
        'INSERT INTO kategorie_produktow (id, nazwa, opis) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [kategoria.id, kategoria.nazwa, kategoria.opis]
      );
    }

    // Migrate products
    console.log('🛍️ Migrating products...');
    const produkty = await readJsonFile(path.join(dataPath, 'produkty.json'));
    for (const produkt of produkty) {
      await db.query(
        'INSERT INTO produkty (id, kod, nazwa, kategoria_id, opis, cena, jednostka) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [produkt.id, produkt.kod_produktu, produkt.nazwa, produkt.kategoria, produkt.uwagi, produkt.cena, produkt.jednostka]
      );
    }

    // Migrate flowers
    console.log('🌸 Migrating flowers...');
    const kwiaty = await readJsonFile(path.join(dataPath, 'kwiaty.json'));
    for (const kwiat of kwiaty) {
      await db.query(
        'INSERT INTO kwiaty (id, nazwa, kolor, cena, dostawca_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [kwiat.id, kwiat.nazwa, kwiat.kolor, kwiat.cena, kwiat.dostawcaId]
      );
    }

    // Migrate flower suppliers
    console.log('🏪 Migrating flower suppliers...');
    const dostawcyKwiatow = await readJsonFile(path.join(dataPath, 'dostawcy-kwiatow.json'));
    for (const dostawca of dostawcyKwiatow) {
      await db.query(
        'INSERT INTO dostawcy_kwiatow (id, nazwa, telefon, email, adres) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [dostawca.id, dostawca.nazwa, dostawca.telefon, dostawca.mail, `${dostawca.ulica}, ${dostawca.kodPocztowy} ${dostawca.miasto}`]
      );
    }

    // Migrate containers
    console.log('📦 Migrating containers...');
    const pojemniki = await readJsonFile(path.join(dataPath, 'pojemniki.json'));
    for (const pojemnik of pojemniki) {
      await db.query(
        'INSERT INTO pojemniki (id, nazwa, rozmiar, pojemnosc, material) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [pojemnik.id, pojemnik.nazwa, pojemnik.typ, pojemnik.typ, pojemnik.typ]
      );
    }

    // Migrate rental companies
    console.log('🏢 Migrating rental companies...');
    const wypozyczalnie = await readJsonFile(path.join(dataPath, 'wypozyczalnie.json'));
    for (const wypozyczalnia of wypozyczalnie) {
      await db.query(
        'INSERT INTO wypozyczalnie (id, nazwa, telefon, email, adres) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [wypozyczalnia.id, wypozyczalnia.nazwa, wypozyczalnia.telefon, wypozyczalnia.email, wypozyczalnia.adres]
      );
    }

    // Migrate cost types
    console.log('💰 Migrating cost types...');
    const typyKosztow = await readJsonFile(path.join(dataPath, 'typy-kosztow.json'));
    for (const typKosztu of typyKosztow) {
      await db.query(
        'INSERT INTO typy_kosztow (id, nazwa, powiazanie, jednostka) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [typKosztu.id, typKosztu.nazwa, typKosztu.powiazanie, typKosztu.jednostka]
      );
    }

    // Migrate cars
    console.log('🚗 Migrating cars...');
    const samochody = await readJsonFile(path.join(dataPath, 'samochody.json'));
    for (const samochod of samochody) {
      await db.query(
        'INSERT INTO samochody (id, model, numer_rejestracyjny, typ) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [samochod.id, samochod.model, samochod.numer_rejestracyjny, samochod.typ]
      );
    }

    // Migrate events
    console.log('📅 Migrating events...');
    const eventy = await readJsonFile(path.join(dataPath, 'projekty.json'));
    for (const event of eventy) {
      await db.query(
        'INSERT INTO eventy (id, numer, nazwa, data, lokalizacja, status, opis) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [event.id, event.numer, event.nazwa, event.data, event.lokalizacja, event.status, event.opis]
      );
    }

    // Migrate products in events
    console.log('📦 Migrating products in events...');
    const produktyWEventach = await readJsonFile(path.join(dataPath, 'produkty-w-projekcie.json'));
    // Skip complex structure for now - TODO: implement proper mapping
    console.log('⚠️ Skipping products in events - complex structure needs manual mapping');

    // Migrate flowers in events
    console.log('🌸 Migrating flowers in events...');
    const kwiatyWEventach = await readJsonFile(path.join(dataPath, 'kwiaty-w-projekcie.json'));
    // Skip complex structure for now - TODO: implement proper mapping
    console.log('⚠️ Skipping flowers in events - complex structure needs manual mapping');

    // Migrate event costs
    console.log('💰 Migrating event costs...');
    const kosztyEventow = await readJsonFile(path.join(dataPath, 'koszty-projektow.json'));
    for (const koszt of kosztyEventow) {
      await db.query(
        'INSERT INTO koszty_eventow (id, event_id, typ_kosztu_id, powiazany_element_id, powiazany_element_typ, ilosc, cena_netto, cena_brutto, wartosc_netto, wartosc_brutto, ma_fakture, numer_faktury) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING',
        [
          koszt.id,
          koszt.projektId,
          koszt.typKosztuId,
          koszt.powiazanyElementId,
          koszt.powiazanyElementTyp,
          koszt.ilosc,
          koszt.cenaNetto,
          koszt.cenaBrutto,
          koszt.wartoscNetto,
          koszt.wartoscBrutto,
          koszt.maFakture,
          koszt.numerFaktury
        ]
      );
    }

    // Migrate chat messages
    console.log('💬 Migrating chat messages...');
    const wiadomosciChat = await readJsonFile(path.join(dataPath, 'projektChat.json'));
    // Skip complex structure for now - TODO: implement proper mapping
    console.log('⚠️ Skipping chat messages - complex structure needs manual mapping');

    console.log('✅ Data migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Events: ${eventy.length}`);
    console.log(`   - Products: ${produkty.length}`);
    console.log(`   - Flowers: ${kwiaty.length}`);
    console.log(`   - Employees: ${pracownicy.length}`);
    console.log(`   - Contacts: ${kontakty.length}`);
    console.log(`   - Cost types: ${typyKosztow.length}`);
    console.log(`   - Cars: ${samochody.length}`);
    console.log(`   - Rental companies: ${wypozyczalnie.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData().then(() => {
    console.log('🎉 Migration script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateData }; 