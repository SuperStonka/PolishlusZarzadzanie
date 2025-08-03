import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import ListaProjektow from '../events/ListaProjektow';
import CalendarView from '../components/CalendarView';
import Zdarzenia from '../components/Zdarzenia';
import ListaUzytkownikow from '../listy/ListaUzytkownikow';
import ListaKontaktow from '../listy/ListaKontaktow';
import ListaProduktow from '../listy/ListaProduktow';
import ListaKategoriiProduktow from '../listy/ListaKategoriiProduktow';
import ListaKwiatow from '../listy/ListaKwiatow';
import ListaPojemnikow from '../listy/ListaPojemnikow';
import ListaPracownikow from '../listy/ListaPracownikow';
import ListaSamochodow from '../listy/ListaSamochodow';
import ListaTypowKosztow from '../listy/ListaTypowKosztow';
import ListaWypozyczalni from '../listy/ListaWypozyczalni';
import SzczegolyProjektu from '../events/SzczegolyProjektu';
import EdycjaProjektu from '../events/EdycjaProjektu';
import DodajProduktyDoProjektu from '../events/DodajProduktyDoProjektu';
import ListaProduktowProjektu from '../events/ListaProduktowProjektu';
import ListaKwiatowProjektu from '../events/ListaKwiatowProjektu';
import Kalkulacja from '../listy/Kalkulacja';
import EventChatView from '../components/EventChatView';
import RozliczenieWplat from '../listy/RozliczenieWplat';
import ListaEtapow from '../listy/ListaEtapow';
import ListaStanowisk from '../listy/ListaStanowisk';
import ListaGrupUprawnien from '../listy/ListaGrupUprawnien';
import ZamowienieKwiaty from '../listy/ZamowienieKwiaty';
import ListaDostawcowKwiatow from '../listy/ListaDostawcowKwiatow';
import FormyRozliczen from '../listy/FormyRozliczen';
import '../styles/App.css';

interface TerminyProjekt {
  pakowanie: {
    data: string;
    godzina: string;
  };
  demontaz: {
    data: string;
    godzina: string;
  };
  montaz: {
    dataOd: string;
    dataDo: string;
  };
}

interface KontaktZamawiajacy {
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
  firma: string;
}

interface KontaktNaObiekcie {
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
  stanowisko: string;
}

interface ProduktWProjekcie {
  id: number;
  kod: string;
  nazwa: string;
  kategoria: string;
  kontener: string;
  ilosc: number;
  zapakowane: number;
  zwrocone: number;
  uszkodzone: number;
  dostawca: string;
  uwagi: string;
}

interface Projekt {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  zamawiajacy: string;
  kontaktZamawiajacy: KontaktZamawiajacy;
  kontaktNaObiekcie: KontaktNaObiekcie;
  terminy: TerminyProjekt;
  status: string;
  etapId?: number;
  uwagi: string;
  utworzono: string;
  opis: string;
  wartoscNetto?: number;
  wartoscBrutto?: number;
  produkty?: ProduktWProjekcie[];
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'projekty' | 'calendar' | 'chat' | 'zdarzenia' | 'details' | 'edit' | 'add' | 'products' | 'projekt-products' | 'projekt-flowers' | 'lists' | 'formy-rozliczen'>('projekty');
  const [currentList, setCurrentList] = useState<string>('');
  const [selectedProjekt, setSelectedProjekt] = useState<Projekt | null>(null);
  const [editingProjekt, setEditingProjekt] = useState<Projekt | null>(null);
  const [addingProjekt, setAddingProjekt] = useState<Projekt | null>(null);
  const [managingProductsProjekt, setManagingProductsProjekt] = useState<Projekt | null>(null);
  const [managingFlowersProjekt, setManagingFlowersProjekt] = useState<Projekt | null>(null);

  const [projektStats, setProjektStats] = useState({ aktywne: 0, w_trakcie: 0 });
  const [hasNewProjekty, setHasNewProjekty] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  // Ładowanie statystyk projektów
  useEffect(() => {
    fetch("/data/projekty.json")
      .then(res => res.json())
      .then(data => {
        const aktywne = data.filter((projekt: Projekt) => projekt.status === 'aktywne').length;
        const w_trakcie = data.filter((projekt: Projekt) => projekt.status === 'w_trakcie').length;
        setProjektStats({ aktywne, w_trakcie });
      })
      .catch(err => console.error("Błąd pobierania statystyk projektów:", err));
  }, []);

  const handleWybierzProjekt = (projekt: Projekt) => {
    setSelectedProjekt(projekt);
    setCurrentView('details');
  };

  const handleEdytujProjekt = (projekt: Projekt) => {
    setEditingProjekt(projekt);
    setCurrentView('edit');
  };

  const handleZarzadzajProdukty = (projekt: Projekt) => {
    setManagingProductsProjekt(projekt);
    setCurrentView('projekt-products');
  };

  const handleZarzadzajKwiaty = (projekt: Projekt) => {
    setManagingFlowersProjekt(projekt);
    setCurrentView('projekt-flowers');
  };

  const handleDodajProjekt = () => {
    const newProjekt: Projekt = {
      id: 0,
      numer: '',
      nazwa: '',
      data: '',
      lokalizacja: '',
      zamawiajacy: '',
      kontaktZamawiajacy: {
        imie: '',
        nazwisko: '',
        telefon: '',
        email: '',
        firma: ''
      },
      kontaktNaObiekcie: {
        imie: '',
        nazwisko: '',
        telefon: '',
        email: '',
        stanowisko: ''
      },
      terminy: {
        pakowanie: { data: '', godzina: '' },
        demontaz: { data: '', godzina: '' },
        montaz: { dataOd: '', dataDo: '' }
      },
      status: 'aktywne',
      etapId: 1,
      uwagi: '',
      utworzono: new Date().toISOString().split('T')[0],
      opis: '',
      wartoscNetto: 0,
      wartoscBrutto: 0
    };
    setAddingProjekt(newProjekt);
    setCurrentView('add');
  };

  const handleBackToProjekty = () => {
    setCurrentView('projekty');
    setSelectedProjekt(null);
    setEditingProjekt(null);
    setAddingProjekt(null);
    setManagingProductsProjekt(null);
    setManagingFlowersProjekt(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as any);
    setCurrentList('');
  };

  const handleListClick = (list: string) => {
    setCurrentView('lists');
    setCurrentList(list);
  };

  const renderListContent = () => {
    switch (currentList) {
      case 'uzytkownicy':
        return <ListaUzytkownikow />;
      case 'kontakty':
        return <ListaKontaktow />;
      case 'produkty':
        return <ListaProduktow />;
      case 'kategorie-produktow':
        console.log("App.tsx: Renderowanie ListaKategoriiProduktow");
        return <ListaKategoriiProduktow />;
      case 'kwiaty':
        return <ListaKwiatow />;
      case 'pojemniki':
        return <ListaPojemnikow />;
      case 'pracownicy':
        return <ListaPracownikow />;
      case 'samochody':
        return <ListaSamochodow />;
      case 'typy-kosztow':
        return <ListaTypowKosztow />;
      case 'wypozyczalnie':
        return <ListaWypozyczalni />;
      case 'kalkulacja':
        return <Kalkulacja />;
      case 'rozliczenie-wplat':
        return <RozliczenieWplat />;
      case 'etapy':
        return <ListaEtapow />;
      case 'stanowiska':
        return <ListaStanowisk />;
      case 'grupy-uprawnien':
        return <ListaGrupUprawnien />;
      case 'zamowienie-kwiaty':
        return <ZamowienieKwiaty />;
      case 'dostawcy-kwiatow':
        return <ListaDostawcowKwiatow />;
      case 'formy-rozliczen':
        return <FormyRozliczen />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'projekty':
        return (
          <ListaProjektow
            onWybierzProjekt={handleWybierzProjekt}
            onEdytujProjekt={handleEdytujProjekt}
            onZarzadzajProdukty={handleZarzadzajProdukty}
            onZarzadzajKwiaty={handleZarzadzajKwiaty}
            onDodajProjekt={handleDodajProjekt}
          />
        );
      case 'calendar':
        return <CalendarView onWybierzEvent={(event) => {
          // Konwertuj Event na Projekt i wybierz
          const projekt: Projekt = {
            ...event,
            kontaktZamawiajacy: event.kontaktZamawiajacy,
            kontaktNaObiekcie: event.kontaktNaObiekcie,
            terminy: event.terminy,
            status: event.status,
            etapId: 1, // Domyślna wartość
            uwagi: event.uwagi,
            utworzono: event.utworzono,
            opis: event.opis,
            wartoscNetto: 0,
            wartoscBrutto: 0
          };
          handleWybierzProjekt(projekt);
        }} />;
      case 'chat':
        return <EventChatView />;
      case 'zdarzenia':
        return <Zdarzenia />;
      case 'details':
        return selectedProjekt ? (
          <SzczegolyProjektu
            projekt={selectedProjekt}
            onPowrot={handleBackToProjekty}
          />
        ) : null;
      case 'edit':
        return editingProjekt ? (
          <EdycjaProjektu
            projekt={editingProjekt}
            onPowrot={handleBackToProjekty}
            onZapisz={(projekt) => {
              console.log('Zapisano projekt:', projekt);
              handleBackToProjekty();
            }}
          />
        ) : null;
      case 'add':
        return addingProjekt ? (
          <EdycjaProjektu
            projekt={addingProjekt}
            onPowrot={handleBackToProjekty}
            onZapisz={(projekt) => {
              console.log('Dodano nowy projekt:', projekt);
              handleBackToProjekty();
            }}
            isNew={true}
          />
        ) : null;
      case 'projekt-products':
        return managingProductsProjekt ? (
          <DodajProduktyDoProjektu
            projekt={managingProductsProjekt}
            onPowrot={handleBackToProjekty}
          />
        ) : null;
      case 'projekt-flowers':
        return managingFlowersProjekt ? (
          <ListaKwiatowProjektu
            projekt={managingFlowersProjekt}
            onPowrot={handleBackToProjekty}
          />
        ) : null;
      case 'lists':
        return renderListContent();
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        currentList={currentList}
        onViewChange={handleViewChange}
        onListClick={handleListClick}
        projektStats={projektStats}
        hasNewProjekty={hasNewProjekty}
        hasNewMessages={hasNewMessages}
        hasNewNotifications={hasNewNotifications}
      />
      <div className="main-content">
        <Header />
        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
