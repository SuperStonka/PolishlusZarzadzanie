import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Save,
  FileText,
  Receipt,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Search
} from 'lucide-react';

interface TypKosztu {
  id: number;
  nazwa: string;
  powiazanie: string;
  jednostka: string;
}

interface Event {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  wartoscNetto?: number;
  wartoscBrutto?: number;
  etapId?: number;
}

interface Etap {
  id: number;
  nazwa: string;
  opis: string;
}

interface PowiazanyElement {
  id: number;
  nazwa: string;
}

interface PozycjaKalkulacji {
  id: number;
  projektId: number;
  typKosztuId: number;
  powiazanyElementId?: number;
  powiazanyElementTyp?: string;
  ilosc: number;
  cenaNetto: number;
  cenaBrutto: number;
  wartoscNetto: number;
  wartoscBrutto: number;
  maFakture: boolean;
  numerFaktury?: string;
}

const Kalkulacja: React.FC = () => {
  const [projekty, setProjekty] = useState<Event[]>([]);
  const [typyKosztow, setTypyKosztow] = useState<TypKosztu[]>([]);
  const [samochody, setSamochody] = useState<any[]>([]);
  const [pracownicy, setPracownicy] = useState<any[]>([]);
  const [kontakty, setKontakty] = useState<any[]>([]);
  const [wypozyczalnie, setWypozyczalnie] = useState<any[]>([]);
  const [koszty, setKoszty] = useState<any[]>([]);
  const [etapy, setEtapy] = useState<Etap[]>([]);
  const [selectedProjekt, setSelectedProjekt] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newPozycja, setNewPozycja] = useState<PozycjaKalkulacji>({
    id: 0,
    projektId: 0,
    typKosztuId: 0,
    powiazanyElementId: undefined,
    powiazanyElementTyp: undefined,
    ilosc: 1,
    cenaNetto: 0,
    cenaBrutto: 0,
    wartoscNetto: 0,
    wartoscBrutto: 0,
    maFakture: false,
    numerFaktury: undefined
  });
  const [sortowanie, setSortowanie] = useState('data');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projektyResponse, typyResponse, samochodyResponse, pracownicyResponse, kontaktyResponse, wypozyczalnieResponse, kosztyResponse, etapyResponse] = await Promise.all([
        fetch('/data/projekty.json'),
        fetch('/data/typy-kosztow.json'),
        fetch('/data/samochody.json'),
        fetch('/data/pracownicy.json'),
        fetch('/data/kontakty.json'),
        fetch('/data/wypozyczalnie.json'),
        fetch('/data/koszty-projektow.json'),
        fetch('/data/etapy.json')
      ]);

      const projektyData = await projektyResponse.json();
      const typyData = await typyResponse.json();
      const samochodyData = await samochodyResponse.json();
      const pracownicyData = await pracownicyResponse.json();
      const kontaktyData = await kontaktyResponse.json();
      const wypozyczalnieData = await wypozyczalnieResponse.json();
      const kosztyData = await kosztyResponse.json();
      const etapyData = await etapyResponse.json();

      setProjekty(projektyData.map((e: any) => ({
        ...e,
        wartoscNetto: e.wartoscNetto || 0,
        wartoscBrutto: e.wartoscBrutto || 0
      })));
      setTypyKosztow(typyData);
      setSamochody(samochodyData);
      setPracownicy(pracownicyData);
      setKontakty(kontaktyData);
      setWypozyczalnie(wypozyczalnieData);
      setKoszty(kosztyData);
      setEtapy(etapyData);
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
    }
  };

  const getPowiazaneElementy = (powiazanie: string): PowiazanyElement[] => {
    switch (powiazanie) {
      case 'samochod':
        return samochody;
      case 'pracownik':
        return pracownicy;
      case 'kontakt':
        return kontakty;
      case 'wypozyczalnia':
        return wypozyczalnie;
      default:
        return [];
    }
  };

  const obliczWartosci = (ilosc: number, cenaNetto: number, cenaBrutto: number) => {
    const vat = 0.23; // 23% VAT
    let netto = cenaNetto;
    let brutto = cenaBrutto;

    if (cenaNetto > 0 && cenaBrutto === 0) {
      brutto = cenaNetto * (1 + vat);
    } else if (cenaBrutto > 0 && cenaNetto === 0) {
      netto = cenaBrutto / (1 + vat);
    }

    return {
      wartoscNetto: ilosc * netto,
      wartoscBrutto: ilosc * brutto
    };
  };

  const handleTypKosztuChange = (typKosztu: TypKosztu) => {
    setNewPozycja({
      ...newPozycja,
      typKosztuId: typKosztu.id
    });
  };

  const handleCenaChange = (field: 'cenaNetto' | 'cenaBrutto', value: number) => {
    const ilosc = newPozycja.ilosc || 1;
    const vat = 23; // Domyślnie 23% VAT
    
    let cenaNetto: number;
    let cenaBrutto: number;
    
    if (field === 'cenaNetto') {
      cenaNetto = value;
      cenaBrutto = value * (1 + vat / 100); // Przelicz netto na brutto
    } else {
      cenaBrutto = value;
      cenaNetto = value / (1 + vat / 100); // Przelicz brutto na netto
    }
    
    const wartoscNetto = ilosc * cenaNetto;
    const wartoscBrutto = ilosc * cenaBrutto;
    
    setNewPozycja({
      ...newPozycja,
      cenaNetto,
      cenaBrutto,
      wartoscNetto,
      wartoscBrutto
    });
  };

  const handleIloscChange = (ilosc: number) => {
    const cenaNetto = newPozycja.cenaNetto || 0;
    const cenaBrutto = newPozycja.cenaBrutto || 0;
    
    const wartoscNetto = ilosc * cenaNetto;
    const wartoscBrutto = ilosc * cenaBrutto;
    
    setNewPozycja({
      ...newPozycja,
      ilosc,
      wartoscNetto,
      wartoscBrutto
    });
  };

  const handleDodajPozycje = () => {
    if (!selectedProjekt) {
      alert('Brak wybranego projektu');
      return;
    }

    if (!newPozycja.typKosztuId) {
      alert('Wybierz typ kosztu');
      return;
    }

    if (newPozycja.ilosc === 0 || (newPozycja.cenaNetto === 0 && newPozycja.cenaBrutto === 0)) {
      alert('Wprowadź ilość i cenę');
      return;
    }

    const nowaPozycjaId = Math.max(...koszty.map(p => p.id), 0) + 1;
    const pozycja: PozycjaKalkulacji = {
      id: nowaPozycjaId,
      projektId: selectedProjekt.id,
      typKosztuId: newPozycja.typKosztuId,
      powiazanyElementId: newPozycja.powiazanyElementId,
      powiazanyElementTyp: newPozycja.powiazanyElementTyp,
      ilosc: newPozycja.ilosc,
      cenaNetto: newPozycja.cenaNetto,
      cenaBrutto: newPozycja.cenaBrutto,
      wartoscNetto: newPozycja.wartoscNetto,
      wartoscBrutto: newPozycja.wartoscBrutto,
      maFakture: newPozycja.maFakture,
      numerFaktury: newPozycja.numerFaktury
    };

    setKoszty([...koszty, pozycja]);
    setNewPozycja({
      id: 0,
      projektId: 0,
      typKosztuId: 0,
      powiazanyElementId: undefined,
      powiazanyElementTyp: undefined,
      ilosc: 1,
      cenaNetto: 0,
      cenaBrutto: 0,
      wartoscNetto: 0,
      wartoscBrutto: 0,
      maFakture: false,
      numerFaktury: undefined
    });
  };

  const handleUsunPozycje = (id: number) => {
    setKoszty(koszty.filter(p => p.id !== id));
  };

  const handleFakturaChange = (id: number, maFakture: boolean, numerFaktury?: string) => {
    setKoszty(koszty.map(p => 
      p.id === id ? { ...p, maFakture, numerFaktury } : p
    ));
  };

  const handlePozycjeKosztowe = (projekt: Event) => {
    setSelectedProjekt(projekt);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedProjekt(null);
    setNewPozycja({
      id: 0,
      projektId: 0,
      typKosztuId: 0,
      powiazanyElementId: undefined,
      powiazanyElementTyp: undefined,
      ilosc: 1,
      cenaNetto: 0,
      cenaBrutto: 0,
      wartoscNetto: 0,
      wartoscBrutto: 0,
      maFakture: false,
      numerFaktury: undefined
    });
  };

  // Filtruj pozycje tylko dla wybranego projektu
  const pozycjeProjektu = selectedProjekt ? koszty.filter(p => p.projektId === selectedProjekt.id) : [];

  // Funkcje sortowania
  const handleSort = (key: string) => {
    setSortowanie(key);
  };

  const getSortIcon = (key: string) => {
    if (sortowanie !== key) return null;
    return <ChevronUp size={16} />;
  };

  // Sortowanie pozycji
  const sortedPozycjeProjektu = [...pozycjeProjektu].sort((a, b) => {
    if (sortowanie === '') return 0;
    
    let aValue: any, bValue: any;
    
    switch (sortowanie) {
      case 'typKosztu':
        const typA = typyKosztow.find(t => t.id === a.typKosztuId);
        const typB = typyKosztow.find(t => t.id === b.typKosztuId);
        aValue = typA?.nazwa || '';
        bValue = typB?.nazwa || '';
        break;
      case 'ilosc':
        aValue = a.ilosc;
        bValue = b.ilosc;
        break;
      case 'cenaNetto':
        aValue = a.cenaNetto;
        bValue = b.cenaNetto;
        break;
      case 'cenaBrutto':
        aValue = a.cenaBrutto;
        bValue = b.cenaBrutto;
        break;
      case 'wartoscNetto':
        aValue = a.wartoscNetto;
        bValue = b.wartoscNetto;
        break;
      case 'wartoscBrutto':
        aValue = a.wartoscBrutto;
        bValue = b.wartoscBrutto;
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue, 'pl');
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }
    
    return 0;
  });

  const sumaNetto = pozycjeProjektu.reduce((sum, p) => sum + p.wartoscNetto, 0);
  const sumaBrutto = pozycjeProjektu.reduce((sum, p) => sum + p.wartoscBrutto, 0);
  const vat = sumaBrutto - sumaNetto;

  // Funkcja formatowania walutowego
  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="kalkulacja">
      <div className="dashboard-card">
        <div className="card-header">
          <div className="d-flex align-center justify-between w-100">
            {showForm && (
              <button className="btn btn-secondary btn-sm" onClick={handleBackToList}>
                <ArrowLeft size={16} />
                Powrót
              </button>
            )}
            <div className="header-center">
              <div className="card-title">
                {showForm ? `Kalkulacja Kosztów - ${selectedProjekt?.numer}` : 'Kalkulacja Kosztów Projektów'}
              </div>
              <div className="card-subtitle">
                {showForm ? `Projekt: ${selectedProjekt?.nazwa} (${selectedProjekt?.data})` : 'Wybierz projekt do kalkulacji kosztów'}
              </div>
            </div>
            <div className="card-icon">
              <Calculator size={24} />
            </div>
          </div>
        </div>
      </div>
      {/* Styl tylko dla tabeli, nie dla całej karty */}
      <style>{`
        .table {
          background: transparent !important;
        }
        .wartosc-netto-cell {
          color: #fff !important;
          font-weight: 600;
        }
        .cena-cell {
          color: var(--text-secondary) !important;
        }
      `}</style>
        {!showForm ? (
        <>
          <div className="d-flex justify-between align-center mb-3">
            <div className="search-container">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Szukaj projektów..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container">
              <select
                value={sortowanie}
                onChange={(e) => setSortowanie(e.target.value)}
                className="filter-select"
              >
                <option value="data">Sortuj po dacie</option>
                <option value="numer">Sortuj po numerze</option>
                <option value="wartosc">Sortuj po wartości</option>
              </select>
            </div>
          </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <div className="project-info">
                        <div className="project-icon orange">
                          EV
                        </div>
                        <div className="project-details">
                      <div className="project-title">Projekt</div>
                      <div className="project-date">Informacje o projekcie</div>
                        </div>
                      </div>
                    </th>
                    <th>Data</th>
                    <th>Lokalizacja</th>
                <th>Wartość netto</th>
                <th>Wartość brutto</th>
                    <th>Podsumowanie kosztów</th>
                    <th>Pozycje kosztowe</th>
                  </tr>
                </thead>
                <tbody>
              {projekty
                .filter(projekt => 
                  projekt.numer.toLowerCase().includes(search.toLowerCase()) ||
                  projekt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
                  projekt.lokalizacja.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) => {
                  if (sortowanie === "data") return new Date(a.data).getTime() - new Date(b.data).getTime();
                  if (sortowanie === "numer") return a.numer.localeCompare(b.numer);
                  if (sortowanie === "wartosc") return (a.wartoscBrutto || 0) - (b.wartoscBrutto || 0);
                  return 0;
                })
                .map(projekt => {
                const projektPozycje = koszty.filter(p => p.projektId === projekt.id);
                const projektSumaNetto = projektPozycje.reduce((sum, p) => sum + p.wartoscNetto, 0);
                const projektSumaBrutto = projektPozycje.reduce((sum, p) => sum + p.wartoscBrutto, 0);
                    return (
                  <tr key={projekt.id}>
                        <td>
                          <div className="project-info">
                            <div className="project-icon blue">
                          {(projekt.numer || 'EV').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="project-details">
                              <div className="project-title">
                            {projekt.nazwa || 'Brak nazwy'}
                              </div>
                              <div className="project-date">
                            {projekt.numer} - {projekt.data}
                              </div>
                            </div>
                          </div>
                        </td>
                    <td>{projekt.data}</td>
                    <td>{projekt.lokalizacja}</td>
                    <td>{formatCurrency(projekt.wartoscNetto)} zł</td>
                    <td>{formatCurrency(projekt.wartoscBrutto)} zł</td>
                        <td>
                          <div className="koszty-podsumowanie">
                            <div className="koszty-ilosc">
                          {projektPozycje.length} pozycji
                            </div>
                            <div className="koszty-suma">
                          {formatCurrency(projektSumaBrutto)} zł
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            className="table-action-btn primary-btn"
                        onClick={() => handlePozycjeKosztowe(projekt)}
                            title="Pozycje kosztowe"
                          >
                            <DollarSign size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </>
        ) : (
          <>
            {/* Formularz dodawania pozycji */}
            <div className="kalkulacja-form">

              <div className="form-row">
                <div className="form-group">
                  <label>Typ kosztu *</label>
                  <select
                    className="form-input"
                    value={newPozycja.typKosztuId || ''}
                    onChange={(e) => {
                      const typ = typyKosztow.find(t => t.id === Number(e.target.value));
                      if (typ) handleTypKosztuChange(typ);
                    }}
                  >
                    <option value="">Wybierz typ kosztu</option>
                    {typyKosztow.map(typ => (
                      <option key={typ.id} value={typ.id}>{typ.nazwa}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ilość *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newPozycja.ilosc || ''}
                    onChange={(e) => handleIloscChange(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    placeholder="1"
                  />
                </div>

                <div className="form-group">
                  <label>Cena netto (zł)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newPozycja.cenaNetto || ''}
                    onChange={(e) => handleCenaChange('cenaNetto', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Cena brutto (zł)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newPozycja.cenaBrutto || ''}
                    onChange={(e) => handleCenaChange('cenaBrutto', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Wartość netto (zł)</label>
                  <input
                    type="number"
                    className="form-input form-input-readonly"
                    value={formatCurrency(newPozycja.wartoscNetto)}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Wartość brutto (zł)</label>
                  <input
                    type="number"
                    className="form-input form-input-readonly"
                    value={formatCurrency(newPozycja.wartoscBrutto)}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newPozycja.maFakture || false}
                      onChange={(e) => setNewPozycja({ ...newPozycja, maFakture: e.target.checked })}
                    />
                    Ma fakturę
                  </label>
                </div>

                {newPozycja.maFakture && (
                  <div className="form-group">
                    <label>Numer faktury</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newPozycja.numerFaktury || ''}
                      onChange={(e) => setNewPozycja({ ...newPozycja, numerFaktury: e.target.value })}
                      placeholder="np. FV/2024/001"
                    />
                  </div>
                )}
              </div>

              {/* Przycisk dodawania pozycji */}
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleDodajPozycje}>
                  <Plus size={16} />
                  Dodaj pozycję
                </button>
              </div>
            </div>

            {/* Lista pozycji */}
            {pozycjeProjektu.length > 0 && (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>LP</th>
                        <th onClick={() => handleSort('typKosztu')} className="sortable-header">
                          Typ kosztu {getSortIcon('typKosztu')}
                        </th>
                        <th onClick={() => handleSort('ilosc')} className="sortable-header">
                          Ilość {getSortIcon('ilosc')}
                        </th>
                        <th onClick={() => handleSort('cenaNetto')} className="sortable-header">
                          Cena netto {getSortIcon('cenaNetto')}
                        </th>
                        <th onClick={() => handleSort('cenaBrutto')} className="sortable-header">
                          Cena brutto {getSortIcon('cenaBrutto')}
                        </th>
                        <th onClick={() => handleSort('wartoscNetto')} className="sortable-header">
                          Wartość netto {getSortIcon('wartoscNetto')}
                        </th>
                        <th onClick={() => handleSort('wartoscBrutto')} className="sortable-header">
                          Wartość brutto {getSortIcon('wartoscBrutto')}
                        </th>
                        <th>Faktura</th>
                        <th>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPozycjeProjektu.map((pozycja, index) => {
                        // Znajdź samochód jeśli powiązanie to samochód
                        const samochod = pozycja.powiazanyElement && pozycja.typKosztu.powiazanie === 'samochod' 
                          ? samochody.find(s => s.id === pozycja.powiazanyElement!.id)
                          : null;
                        // Znajdź kontakt jeśli powiązanie to kontakt
                        const kontakt = pozycja.powiazanyElement && pozycja.typKosztu.powiazanie === 'kontakt' 
                          ? kontakty.find(k => k.id === pozycja.powiazanyElement!.id)
                          : null;
                        
                        const typKosztu = typyKosztow.find(t => t.id === pozycja.typKosztuId);
                        
                        return (
                          <tr key={pozycja.id}>
                            <td className="lp-cell">
                              {index + 1}
                            </td>
                            <td>
                              <div className="project-info">
                                <div className="project-icon blue">
                                  {typKosztu?.nazwa.substring(0, 2).toUpperCase() || 'KO'}
                                </div>
                                <div className="project-details">
                                  <div className="project-title">
                                    {typKosztu?.nazwa || 'Nieznany typ'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="ilosc-badge">
                                {pozycja.ilosc}
                                    </span>
                            </td>
                            <td className="cena-cell">
                              {formatCurrency(pozycja.cenaNetto)} zł
                            </td>
                            <td className="cena-cell">
                              {formatCurrency(pozycja.cenaBrutto)} zł
                            </td>
                            <td>
                              {formatCurrency(pozycja.wartoscNetto)} zł
                            </td>
                            <td>
                              {formatCurrency(pozycja.wartoscBrutto)} zł
                            </td>
                            <td>
                              {pozycja.maFakture ? (
                                <div className="faktura-info">
                                  <Receipt size={12} />
                                  <span className="faktura-numer">
                                    {pozycja.numerFaktury || 'Brak numeru'}
                                  </span>
                                </div>
                              ) : (
                                <span className="no-faktura">Brak</span>
                              )}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="table-action-btn delete-btn"
                                  onClick={() => handleUsunPozycje(pozycja.id)}
                                  title="Usuń"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Podsumowanie */}
                <div className="kalkulacja-podsumowanie">
                  <div className="podsumowanie-item">
                    <span>Suma netto:</span>
                    <span className="suma-netto">{formatCurrency(sumaNetto)} zł</span>
                  </div>
                  <div className="podsumowanie-item">
                    <span>VAT (23%):</span>
                    <span className="suma-vat">{formatCurrency(vat)} zł</span>
                  </div>
                  <div className="podsumowanie-item total">
                    <span>Suma brutto:</span>
                    <span className="suma-brutto">{formatCurrency(sumaBrutto)} zł</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
    </div>
  );
};

export default Kalkulacja; 