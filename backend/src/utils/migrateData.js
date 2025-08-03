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

    // Read JSON files from frontend
    const frontendDataPath = path.join(__dirname, '../../frontend/public/data');
    
    // Migrate users
    console.log('📝 Migrating users...');
    const users = await readJsonFile(path.join(frontendDataPath, 'uzytkownicy.json'));
    for (const user of users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (imie, nazwisko, email, haslo, rola, avatar) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
        [user.imie, user.nazwisko, user.email, hashedPassword, user.rola, user.avatar]
      );
    }

    // Migrate permission groups
    console.log('👥 Migrating permission groups...');
    const grupyUprawnien = await readJsonFile(path.join(frontendDataPath, 'grupyUprawnien.json'));
    for (const grupa of grupyUprawnien) {
      await db.query(
        'INSERT INTO grupy_uprawnien (nazwa, opis) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [grupa.nazwa, grupa.opis]
      );
    }

    // Migrate positions
    console.log('💼 Migrating positions...');
    const stanowiska = await readJsonFile(path.join(frontendDataPath, 'stanowiska.json'));
    for (const stanowisko of stanowiska) {
      await db.query(
        'INSERT INTO stanowiska (nazwa, opis) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [stanowisko.nazwa, stanowisko.opis]
      );
    }

    // Migrate employees
    console.log('👨‍💼 Migrating employees...');
    const pracownicy = await readJsonFile(path.join(frontendDataPath, 'pracownicy.json'));
    for (const pracownik of pracownicy) {
      await db.query(
        'INSERT INTO pracownicy (imie, nazwisko, email, telefon, stanowisko_id, data_zatrudnienia) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [pracownik.imie, pracownik.nazwisko, pracownik.email, pracownik.telefon, pracownik.stanowisko_id, pracownik.data_zatrudnienia]
      );
    }

    // Migrate contacts
    console.log('📞 Migrating contacts...');
    const kontakty = await readJsonFile(path.join(frontendDataPath, 'kontakty.json'));
    for (const kontakt of kontakty) {
      await db.query(
        'INSERT INTO kontakty (imie, nazwisko, email, telefon, firma, stanowisko, adres) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [kontakt.imie, kontakt.nazwisko, kontakt.email, kontakt.telefon, kontakt.firma, kontakt.stanowisko, kontakt.adres]
      );
    }

    // Migrate product categories
    console.log('📦 Migrating product categories...');
    const kategorieProduktow = await readJsonFile(path.join(frontendDataPath, 'kategorieProduktow.json'));
    for (const kategoria of kategorieProduktow) {
      await db.query(
        'INSERT INTO kategorie_produktow (nazwa, opis) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [kategoria.nazwa, kategoria.opis]
      );
    }

    // Migrate products
    console.log('🛍️ Migrating products...');
    const produkty = await readJsonFile(path.join(frontendDataPath, 'produkty.json'));
    for (const produkt of produkty) {
      await db.query(
        'INSERT INTO produkty (kod, nazwa, kategoria_id, opis, cena, jednostka) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (kod) DO NOTHING',
        [produkt.kod, produkt.nazwa, produkt.kategoria_id, produkt.opis, produkt.cena, produkt.jednostka]
      );
    }

    // Migrate flowers
    console.log('🌸 Migrating flowers...');
    const kwiaty = await readJsonFile(path.join(frontendDataPath, 'kwiaty.json'));
    for (const kwiat of kwiaty) {
      await db.query(
        'INSERT INTO kwiaty (nazwa, kolor, cena, dostawca_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [kwiat.nazwa, kwiat.kolor, kwiat.cena, kwiat.dostawca_id]
      );
    }

    // Migrate flower suppliers
    console.log('🏪 Migrating flower suppliers...');
    const dostawcyKwiatow = await readJsonFile(path.join(frontendDataPath, 'dostawcy-kwiatow.json'));
    for (const dostawca of dostawcyKwiatow) {
      await db.query(
        'INSERT INTO dostawcy_kwiatow (nazwa, telefon, email, adres) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [dostawca.nazwa, dostawca.telefon, dostawca.email, dostawca.adres]
      );
    }

    // Migrate containers
    console.log('📦 Migrating containers...');
    const pojemniki = await readJsonFile(path.join(frontendDataPath, 'pojemniki.json'));
    for (const pojemnik of pojemniki) {
      await db.query(
        'INSERT INTO pojemniki (nazwa, rozmiar, pojemnosc, material) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [pojemnik.nazwa, pojemnik.rozmiar, pojemnik.pojemnosc, pojemnik.material]
      );
    }

    // Migrate rental companies
    console.log('🏢 Migrating rental companies...');
    const wypozyczalnie = await readJsonFile(path.join(frontendDataPath, 'wypozyczalnie.json'));
    for (const wypozyczalnia of wypozyczalnie) {
      await db.query(
        'INSERT INTO wypozyczalnie (nazwa, telefon, email, adres) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [wypozyczalnia.nazwa, wypozyczalnia.telefon, wypozyczalnia.email, wypozyczalnia.adres]
      );
    }

    // Migrate cost types
    console.log('💰 Migrating cost types...');
    const typyKosztow = await readJsonFile(path.join(frontendDataPath, 'typy-kosztow.json'));
    for (const typKosztu of typyKosztow) {
      await db.query(
        'INSERT INTO typy_kosztow (nazwa, powiazanie, jednostka) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [typKosztu.nazwa, typKosztu.powiazanie, typKosztu.jednostka]
      );
    }

    // Migrate cars
    console.log('🚗 Migrating cars...');
    const samochody = await readJsonFile(path.join(frontendDataPath, 'samochody.json'));
    for (const samochod of samochody) {
      await db.query(
        'INSERT INTO samochody (model, numer_rejestracyjny, typ) VALUES ($1, $2, $3) ON CONFLICT (numer_rejestracyjny) DO NOTHING',
        [samochod.model, samochod.numer_rejestracyjny, samochod.typ]
      );
    }

    // Migrate events
    console.log('📅 Migrating events...');
    const eventy = await readJsonFile(path.join(frontendDataPath, 'eventy.json'));
    for (const event of eventy) {
      await db.query(
        'INSERT INTO eventy (numer, nazwa, data, lokalizacja, status, opis) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (numer) DO NOTHING',
        [event.numer, event.nazwa, event.data, event.lokalizacja, event.status, event.opis]
      );
    }

    // Migrate products in events
    console.log('📦 Migrating products in events...');
    const produktyWEventach = await readJsonFile(path.join(frontendDataPath, 'produkty-w-eventach.json'));
    for (const produktWEvencie of produktyWEventach) {
      await db.query(
        'INSERT INTO produkty_w_eventach (event_id, produkt_id, ilosc, spakowane, zwrocone, uszkodzone, uwagi, wypozyczony, wypozyczalnia_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [
          produktWEvencie.event_id,
          produktWEvencie.produkt_id,
          produktWEvencie.ilosc,
          produktWEvencie.spakowane,
          produktWEvencie.zwrocone,
          produktWEvencie.uszkodzone,
          produktWEvencie.uwagi,
          produktWEvencie.wypozyczony || false,
          produktWEvencie.wypozyczalnia_id
        ]
      );
    }

    // Migrate flowers in events
    console.log('🌸 Migrating flowers in events...');
    const kwiatyWEventach = await readJsonFile(path.join(frontendDataPath, 'kwiaty-w-eventach.json'));
    for (const kwiatWEvencie of kwiatyWEventach) {
      await db.query(
        'INSERT INTO kwiaty_w_eventach (event_id, kwiat_id, ilosc, spakowane, zwrocone, uszkodzone, uwagi) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [
          kwiatWEvencie.event_id,
          kwiatWEvencie.kwiat_id,
          kwiatWEvencie.ilosc,
          kwiatWEvencie.spakowane,
          kwiatWEvencie.zwrocone,
          kwiatWEvencie.uszkodzone,
          kwiatWEvencie.uwagi
        ]
      );
    }

    // Migrate event costs
    console.log('💰 Migrating event costs...');
    const kosztyEventow = await readJsonFile(path.join(frontendDataPath, 'koszty-eventow.json'));
    for (const koszt of kosztyEventow) {
      await db.query(
        'INSERT INTO koszty_eventow (event_id, typ_kosztu_id, powiazany_element_id, powiazany_element_typ, ilosc, cena_netto, cena_brutto, wartosc_netto, wartosc_brutto, ma_fakture, numer_faktury) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING',
        [
          koszt.event_id,
          koszt.typ_kosztu_id,
          koszt.powiazany_element_id,
          koszt.powiazany_element_typ,
          koszt.ilosc,
          koszt.cena_netto,
          koszt.cena_brutto,
          koszt.wartosc_netto,
          koszt.wartosc_brutto,
          koszt.ma_fakture,
          koszt.numer_faktury
        ]
      );
    }

    // Migrate chat messages
    console.log('💬 Migrating chat messages...');
    const wiadomosciChat = await readJsonFile(path.join(frontendDataPath, 'eventChat.json'));
    for (const wiadomosc of wiadomosciChat) {
      await db.query(
        'INSERT INTO wiadomosci_chat (nadawca_id, odbiorca_id, tresc, zdjecia, timestamp) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [
          wiadomosc.nadawca_id,
          wiadomosc.odbiorca_id,
          wiadomosc.tresc,
          wiadomosc.zdjecia || [],
          wiadomosc.timestamp
        ]
      );
    }

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