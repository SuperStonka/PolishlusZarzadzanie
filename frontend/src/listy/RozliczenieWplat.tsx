import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, ChevronUp, ChevronDown, Search, Calculator, ArrowLeft, X, CreditCard } from 'lucide-react';

interface Event {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  wartoscNetto?: number;
  wartoscBrutto?: number;
  zamawiajacy: string;
}

interface Wplata {
  id: number;
  projektId: number;
  data: string;
  kwota: number;
  kto: string;
  forma: string;
  uwagi: string;
  maFakture: boolean;
  numerFaktury?: string;
}

const RozliczenieWplat: React.FC = () => {
  const [projekty, setProjekty] = useState<Event[]>([]);
  const [wplaty, setWplaty] = useState<Wplata[]>([]);
  const [selectedProjekt, setSelectedProjekt] = useState<Event | null>(null);
  const [newWplata, setNewWplata] = useState<Wplata>({
    id: 0,
    projektId: 0,
    data: new Date().toISOString().split('T')[0],
    kwota: 0,
    kto: '',
    forma: 'gotowka',
    uwagi: '',
    maFakture: false,
    numerFaktury: ''
  });
  const [sortowanie, setSortowanie] = useState('data');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Ładuj projekty
    fetch('/data/projekty.json').then(res => res.json()).then(setProjekty);
    
    // Ładuj wpłaty
    fetch('/data/wplaty-projektow.json').then(res => res.json()).then(setWplaty);
  }, []);

  const filteredProjekty = projekty
    .filter(projekt => 
      projekt.numer.toLowerCase().includes(search.toLowerCase()) ||
      projekt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
      projekt.zamawiajacy.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortowanie === "data") return new Date(a.data).getTime() - new Date(b.data).getTime();
      if (sortowanie === "numer") return a.numer.localeCompare(b.numer);
      if (sortowanie === "wartosc") return (a.wartoscBrutto || 0) - (b.wartoscBrutto || 0);
      return 0;
    });

  const filteredWplaty = selectedProjekt 
    ? wplaty.filter(wplata => wplata.projektId === selectedProjekt.id)
    : [];

  const sumaWplat = filteredWplaty.reduce((sum, wplata) => sum + wplata.kwota, 0);
  const pozostaloDoZaplaty = (selectedProjekt?.wartoscBrutto || 0) - sumaWplat;

  const handleWybierzProjekt = (projekt: Event) => {
    setSelectedProjekt(projekt);
  };

  const handleDodajWplate = () => {
    if (!selectedProjekt) {
      alert('Wybierz projekt');
      return;
    }

    if (newWplata.kwota <= 0) {
      alert('Wprowadź kwotę wpłaty');
      return;
    }

    if (!newWplata.kto.trim()) {
      alert('Wprowadź kto wpłacił');
      return;
    }

    const nowaWplata: Wplata = {
      ...newWplata,
      id: Math.max(...wplaty.map(w => w.id), 0) + 1,
      projektId: selectedProjekt.id
    };

    setWplaty([...wplaty, nowaWplata]);
    setNewWplata({
      id: 0,
      projektId: 0,
      data: new Date().toISOString().split('T')[0],
      kwota: 0,
      kto: '',
      forma: 'gotowka',
      uwagi: '',
      maFakture: false,
      numerFaktury: ''
    });
  };

  const handleUsunWplate = (id: number) => {
    setWplaty(wplaty.filter(w => w.id !== id));
  };

  const handleBackToList = () => {
    setSelectedProjekt(null);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  return (
    <div className="kalkulacja">
      <div className="dashboard-card">
        <div className="card-header">
          <div className="d-flex align-center justify-between w-100">
            {selectedProjekt && (
              <button className="btn btn-secondary btn-sm" onClick={handleBackToList}>
                <ArrowLeft size={16} />
                Powrót
              </button>
            )}
            <div className="header-center">
              <div className="card-title">
                {selectedProjekt ? `Rozliczenie Wpłat - ${selectedProjekt.numer}` : 'Rozliczenie Wpłat'}
              </div>
              <div className="card-subtitle">
                {selectedProjekt ? `Projekt: ${selectedProjekt.nazwa} (${selectedProjekt.data})` : 'Zarządzanie wpłatami za projekty'}
              </div>
            </div>
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {!selectedProjekt ? (
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
                    <th>Numer</th>
                    <th>Nazwa</th>
                    <th>Data</th>
                    <th>Lokalizacja</th>
                    <th>Wartość netto</th>
                    <th>Wartość brutto</th>
                    <th>Suma wpłat</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjekty.map(projekt => {
                    const projektWplaty = wplaty.filter(w => w.projektId === projekt.id);
                    const sumaWplatProjektu = projektWplaty.reduce((sum, w) => sum + w.kwota, 0);
                    
                    return (
                      <tr key={projekt.id} onClick={() => handleWybierzProjekt(projekt)} className="table-row-clickable">
                        <td>
                          <div className="project-info">
                            <div className="project-icon blue">
                              {(projekt.numer || 'PR').substring(0, 2).toUpperCase()}
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
                        <td>
                          <span className="event-type">{projekt.nazwa}</span>
                        </td>
                        <td>{formatDate(projekt.data)}</td>
                        <td>
                          <div className="location-info">
                            <span className="location-text">{projekt.lokalizacja}</span>
                          </div>
                        </td>
                        <td className="wartosc-netto-cell">{formatCurrency(projekt.wartoscNetto || 0)} zł</td>
                        <td className="wartosc-netto-cell">{formatCurrency(projekt.wartoscBrutto || 0)} zł</td>
                        <td>{formatCurrency(sumaWplatProjektu)} zł</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn primary-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWybierzProjekt(projekt);
                              }}
                              title="Rozlicz wpłaty"
                            >
                              <Calculator size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredProjekty.length === 0 && (
                <div className="empty-state">
                  <Search size={48} color="var(--text-muted)" />
                  <p>Nie znaleziono projektów</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>




                        <div className="kalkulacja-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Data wpłaty</label>
                  <input
                    type="date"
                    value={newWplata.data}
                    onChange={(e) => setNewWplata({...newWplata, data: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Kto wpłacił</label>
                  <input
                    type="text"
                    value={newWplata.kto}
                    onChange={(e) => setNewWplata({...newWplata, kto: e.target.value})}
                    className="form-input"
                    placeholder="Imię i nazwisko"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kwota (zł)</label>
                  <input
                    type="number"
                    value={newWplata.kwota}
                    onChange={(e) => setNewWplata({...newWplata, kwota: Number(e.target.value)})}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Forma płatności</label>
                  <select
                    value={newWplata.forma}
                    onChange={(e) => setNewWplata({...newWplata, forma: e.target.value as any})}
                    className="form-input"
                  >
                    <option value="gotowka">Gotówka</option>
                    <option value="przelew">Przelew</option>
                    <option value="karta">Karta</option>
                    <option value="czek">Czek</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newWplata.maFakture}
                      onChange={(e) => setNewWplata({...newWplata, maFakture: e.target.checked, numerFaktury: e.target.checked ? newWplata.numerFaktury : ''})}
                      style={{ marginRight: '8px' }}
                    />
                    Czy ma fakturę?
                  </label>
                </div>
                {newWplata.maFakture && (
                  <div className="form-group">
                    <label>Numer faktury</label>
                    <input
                      type="text"
                      value={newWplata.numerFaktury || ''}
                      onChange={(e) => setNewWplata({...newWplata, numerFaktury: e.target.value})}
                      className="form-input"
                      placeholder="np. FV/2024/001"
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Uwagi</label>
                <textarea
                  value={newWplata.uwagi}
                  onChange={(e) => setNewWplata({...newWplata, uwagi: e.target.value})}
                  className="form-input"
                  rows={3}
                  placeholder="Dodatkowe informacje o wpłacie..."
                />
              </div>
              
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleDodajWplate}
                >
                  <Plus size={16} />
                  Dodaj wpłatę
                </button>
              </div>
            </div>

            {/* Lista wpłat */}
            {filteredWplaty.length > 0 && (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Kwota</th>
                        <th>Kto</th>
                        <th>Forma</th>
                        <th>Faktura</th>
                        <th>Uwagi</th>
                        <th>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWplaty.map(wplata => (
                        <tr key={wplata.id}>
                          <td>{formatDate(wplata.data)}</td>
                          <td className="wartosc-netto-cell">{formatCurrency(wplata.kwota)} zł</td>
                          <td>{wplata.kto}</td>
                          <td>
                            <span className={`payment-method payment-${wplata.forma}`}>
                              {wplata.forma}
                            </span>
                          </td>
                          <td>
                            {wplata.maFakture ? (
                              <div className="faktura-info">
                                <span>{wplata.numerFaktury || 'Brak numeru'}</span>
                              </div>
                            ) : (
                              <span className="no-faktura">Brak faktury</span>
                            )}
                          </td>
                          <td>{wplata.uwagi || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="table-action-btn delete-btn"
                                onClick={() => handleUsunWplate(wplata.id)}
                                title="Usuń wpłatę"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Podsumowanie */}
                <div className="kalkulacja-podsumowanie">
                  <div className="podsumowanie-item">
                    <span>Suma wpłat:</span>
                    <span className="suma-netto">{formatCurrency(sumaWplat)} zł</span>
                  </div>
                  <div className="podsumowanie-item">
                    <span>Wartość projektu brutto:</span>
                    <span className="suma-brutto">{formatCurrency(selectedProjekt.wartoscBrutto || 0)} zł</span>
                  </div>
                  <div className="podsumowanie-item total">
                    <span>Pozostało do zapłaty:</span>
                    <span className={`suma-vat ${pozostaloDoZaplaty < 0 ? 'negative' : ''}`}>
                      {formatCurrency(pozostaloDoZaplaty)} zł
                    </span>
                  </div>
                </div>
              </>
            )}

            {filteredWplaty.length === 0 && (
              <div className="empty-state">
                <CreditCard size={48} color="var(--text-muted)" />
                <p>Brak wpłat dla tego projektu</p>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default RozliczenieWplat; 