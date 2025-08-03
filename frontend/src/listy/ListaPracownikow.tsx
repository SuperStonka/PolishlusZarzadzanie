import React, { useEffect, useState, useMemo } from "react";
import { Edit, Trash2, Save, X, Search, Plus, ChevronUp, ChevronDown, Users } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Pracownik {
  id: number;
  imie: string;
  nazwisko: string;
  telefon: string;
  mail: string;
  stanowisko: string;
  uzytkownikLogin: string | null;
  formaRozliczeniaId: number | null;
  kwota: number;
}

interface Uzytkownik {
  login: string;
  imie: string;
  nazwisko: string;
  rola: string;
  haslo: string;
  avatar?: string;
}

interface Stanowisko {
  nazwa: string;
  opis: string;
}

interface FormaRozliczenia { id: number; nazwa: string; }

const PUSTY: Pracownik = {
  id: 0,
  imie: "",
  nazwisko: "",
  telefon: "",
  mail: "",
  stanowisko: "",
  uzytkownikLogin: "",
  formaRozliczeniaId: null,
  kwota: 0
};

const ListaPracownikow: React.FC = () => {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>([]);
  const [editingPracownik, setEditingPracownik] = useState<Pracownik | null>(null);
  const [nowy, setNowy] = useState<Pracownik>(PUSTY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pracownik | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwisko', direction: 'asc' });
  const [uzytkownicy, setUzytkownicy] = useState<Uzytkownik[]>([]);
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [formyRozliczen, setFormyRozliczen] = useState<FormaRozliczenia[]>([]);

  // Sortowanie i filtrowanie
  const sortedAndFilteredPracownicy = useMemo(() => {
    let filtered = pracownicy;
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = pracownicy.filter(pracownik => {
        const fullName = `${pracownik.imie} ${pracownik.nazwisko}`.toLowerCase();
        return pracownik.imie.toLowerCase().includes(szukany) ||
          pracownik.nazwisko.toLowerCase().includes(szukany) ||
          fullName.includes(szukany) ||
          pracownik.telefon.toLowerCase().includes(szukany) ||
          pracownik.mail.toLowerCase().includes(szukany) ||
          (pracownik.stanowisko && pracownik.stanowisko.toLowerCase().includes(szukany));
      });
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];
        
        // Obsługa null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        // Specjalna obsługa dla sortowania po imieniu (łączy imię i nazwisko)
        if (sortConfig.key === 'imie') {
          aValue = `${a.imie} ${a.nazwisko}`;
          bValue = `${b.imie} ${b.nazwisko}`;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [pracownicy, wyszukiwanie, sortConfig]);

  useEffect(() => {
    fetch("/data/pracownicy.json")
      .then(res => res.json())
      .then(data => setPracownicy(data))
      .catch(err => console.error("Błąd pobierania pracowników:", err));
    fetch("/data/uzytkownicy.json")
      .then(res => res.json())
      .then(data => setUzytkownicy(data))
      .catch(err => console.error("Błąd pobierania użytkowników:", err));
    fetch("/data/stanowiska.json")
      .then(res => res.json())
      .then(data => setStanowiska(data))
      .catch(err => console.error("Błąd pobierania stanowisk:", err));
    fetch("/data/formy-rozliczen.json")
      .then(res => res.json())
      .then(setFormyRozliczen)
      .catch(() => setFormyRozliczen([]));
  }, []);

  const handleSort = (key: keyof Pracownik) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Pracownik) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNowy({ ...nowy, [name]: value });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingPracownik) return;
    const { name, value } = e.target;
    setEditingPracownik({ ...editingPracownik, [name]: value });
  };

  const handleEdit = (pracownik: Pracownik) => {
    setEditingPracownik(pracownik);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingPracownik) {
      setPracownicy(pracownicy.map(p => p.id === editingPracownik.id ? editingPracownik : p));
      setEditingPracownik(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingPracownik) {
      handleSave();
    } else {
      if (nowy.imie && nowy.nazwisko && nowy.telefon && nowy.mail && nowy.stanowisko) {
        const pracownik: Pracownik = {
          id: Date.now(),
          imie: nowy.imie,
          nazwisko: nowy.nazwisko,
          telefon: nowy.telefon,
          mail: nowy.mail,
          stanowisko: nowy.stanowisko,
          uzytkownikLogin: nowy.uzytkownikLogin,
          formaRozliczeniaId: nowy.formaRozliczeniaId,
          kwota: nowy.kwota
        };
        setPracownicy([...pracownicy, pracownik]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const pracownik = pracownicy[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: `${pracownik.imie} ${pracownik.nazwisko}`
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setPracownicy(pracownicy.filter((_, i) => i !== confirmDialog.itemIndex));
      setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
    }
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
  };

  const handleSelectUser = (uzytkownik: Uzytkownik) => {
    if (editingPracownik) {
      setEditingPracownik({
        ...editingPracownik,
        imie: uzytkownik.imie,
        nazwisko: uzytkownik.nazwisko,
        mail: editingPracownik.mail || '',
        uzytkownikLogin: uzytkownik.login
      });
    } else {
      setNowy({
        ...nowy,
        imie: uzytkownik.imie,
        nazwisko: uzytkownik.nazwisko,
        mail: nowy.mail || '',
        uzytkownikLogin: uzytkownik.login
      });
    }
    setShowUserSelector(false);
  };

  return (
    <div className="lista-pracownikow">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Pracowników</div>
            <div className="card-subtitle">Zarządzanie pracownikami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setEditingPracownik(null); }}>
              <Plus size={16} /> Dodaj pracownika
            </button>
            <div className="card-icon">
              <Users size={24} />
            </div>
          </div>
        </div>
        <div className="d-flex justify-between align-center mb-3">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Szukaj pracowników..."
              value={wyszukiwanie}
              onChange={(e) => setWyszukiwanie(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPracownik ? 'Edytuj pracownika' : 'Dodaj nowego pracownika'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPracownik(null);
                  setNowy(PUSTY);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Użytkownik</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-input"
                      value={editingPracownik ? (editingPracownik.uzytkownikLogin || '') : (nowy.uzytkownikLogin || '')}
                      readOnly
                      placeholder="Login użytkownika"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUserSelector(true)}
                      title="Wybierz z listy użytkowników"
                    >
                      Wybierz użytkownika
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Imię</label>
                  <input
                    type="text"
                    className="form-input"
                    name="imie"
                    value={editingPracownik ? editingPracownik.imie : nowy.imie}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Imię pracownika"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwisko</label>
                  <input
                    type="text"
                    className="form-input"
                    name="nazwisko"
                    value={editingPracownik ? editingPracownik.nazwisko : nowy.nazwisko}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Nazwisko pracownika"
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    className="form-input"
                    name="telefon"
                    value={editingPracownik ? editingPracownik.telefon : nowy.telefon}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Numer telefonu"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    name="mail"
                    value={editingPracownik ? editingPracownik.mail : nowy.mail}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Adres email"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stanowisko</label>
                  <select
                    className="form-input"
                    name="stanowisko"
                    value={editingPracownik ? editingPracownik.stanowisko : nowy.stanowisko}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    required
                  >
                    <option value="">Wybierz stanowisko</option>
                    {stanowiska.map(s => (
                      <option key={s.nazwa} value={s.nazwa}>{s.nazwa}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Forma rozliczenia</label>
                  <select
                    className="form-select"
                    value={editingPracownik ? editingPracownik.formaRozliczeniaId ?? '' : nowy.formaRozliczeniaId ?? ''}
                    onChange={e => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      if (editingPracownik) setEditingPracownik({ ...editingPracownik, formaRozliczeniaId: val });
                      else setNowy({ ...nowy, formaRozliczeniaId: val });
                    }}
                  >
                    <option value="">Wybierz formę rozliczenia</option>
                    {formyRozliczen.map(f => (
                      <option key={f.id} value={f.id}>{f.nazwa}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kwota / stawka godz.</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingPracownik ? editingPracownik.kwota : nowy.kwota}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      if (editingPracownik) setEditingPracownik({ ...editingPracownik, kwota: val });
                      else setNowy({ ...nowy, kwota: val });
                    }}
                    placeholder="Kwota lub stawka godzinowa"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingPracownik ? 'Zapisz zmiany' : 'Dodaj pracownika'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingPracownik(null);
                setNowy(PUSTY);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('imie')} className="sortable-header">Pracownik {getSortIcon('imie')}</th>
              <th onClick={() => handleSort('telefon')} className="sortable-header">Telefon {getSortIcon('telefon')}</th>
              <th onClick={() => handleSort('mail')} className="sortable-header">Email {getSortIcon('mail')}</th>
              <th onClick={() => handleSort('stanowisko')} className="sortable-header">Stanowisko {getSortIcon('stanowisko')}</th>
              <th onClick={() => handleSort('uzytkownikLogin')} className="sortable-header">Użytkownik {getSortIcon('uzytkownikLogin')}</th>
              <th onClick={() => handleSort('formaRozliczeniaId')} className="sortable-header">Forma rozliczenia {getSortIcon('formaRozliczeniaId')}</th>
              <th onClick={() => handleSort('kwota')} className="sortable-header">Kwota / stawka godz. {getSortIcon('kwota')}</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredPracownicy.map((pracownik, idx) => (
              <tr key={pracownik.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon green">
                      {(() => {
                        const firstInitial = pracownik.imie ? pracownik.imie.charAt(0).toUpperCase() : '';
                        const lastInitial = pracownik.nazwisko ? pracownik.nazwisko.charAt(0).toUpperCase() : '';
                        return firstInitial + lastInitial || 'PR';
                      })()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {pracownik.imie && pracownik.nazwisko ? `${pracownik.imie} ${pracownik.nazwisko}` : 'Brak danych'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{pracownik.telefon}</td>
                <td>{pracownik.mail}</td>
                <td>{pracownik.stanowisko}</td>
                <td>
                  {pracownik.uzytkownikLogin ? (
                    <div className="user-info">
                      {(() => {
                        const uzytkownik = uzytkownicy.find(u => u.login === pracownik.uzytkownikLogin);
                        return (
                          <>
                            <div className="user-avatar">
                              <img 
                                src={uzytkownik?.avatar || "/images/avatars/avatar_01.png"} 
                                alt={`Avatar ${pracownik.uzytkownikLogin}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/avatars/avatar_01.png";
                                }}
                              />
                            </div>
                            <span className="user-login">{pracownik.uzytkownikLogin}</span>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="no-user">Brak użytkownika</span>
                  )}
                </td>
                <td>
                  {(() => {
                    const f = formyRozliczen.find(fr => fr.id === pracownik.formaRozliczeniaId);
                    return f ? f.nazwa : '-';
                  })()}
                </td>
                <td>{pracownik.kwota ? pracownik.kwota.toFixed(2) : '-'}</td>
                <td>
                  <div className="table-actions">
                    <button className="table-action-btn edit-btn" onClick={() => handleEdit(pracownik)} title="Edytuj"><Edit size={16} /></button>
                    <button className="table-action-btn delete-btn" onClick={() => handleUsun(idx)} title="Usuń"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedAndFilteredPracownicy.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono pracowników spełniających kryteria wyszukiwania' : 'Brak pracowników do wyświetlenia'}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć pracownika "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Wybierz użytkownika</h2>
              <button className="modal-close" onClick={() => setShowUserSelector(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-selector-list">
                {uzytkownicy.map(uzytkownik => (
                  <div
                    key={uzytkownik.login}
                    className="user-selector-item"
                    onClick={() => handleSelectUser(uzytkownik)}
                  >
                    <div className="user-selector-info">
                      <div className="user-selector-name">
                        {uzytkownik.imie} {uzytkownik.nazwisko}
                      </div>
                      <div className="user-selector-login">
                        {uzytkownik.login}
                      </div>
                      <div className="user-selector-role">
                        {uzytkownik.rola}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaPracownikow; 