import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, ChevronUp, ChevronDown, User } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

interface Pracownik {
  id: number;
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
  stanowisko_id: number;
  uzytkownik_id: number | null;
  data_zatrudnienia: string;
  formaRozliczeniaId?: number | null;
  kwota?: number;
}

interface Uzytkownik {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  rola: string;
  avatar?: string;
}

interface Stanowisko {
  id: number;
  nazwa: string;
  opis: string;
}

interface FormaRozliczenia { id: number; nazwa: string; }

const PUSTY = {
  imie: '',
  nazwisko: '',
  telefon: '',
  email: '',
  stanowisko_id: 0,
  uzytkownik_id: null as number | null,
  data_zatrudnienia: '',
  formaRozliczeniaId: null as number | null,
  kwota: 0
};

const ListaPracownikow: React.FC = () => {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>([]);
  const [uzytkownicy, setUzytkownicy] = useState<Uzytkownik[]>([]);
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [formyRozliczen, setFormyRozliczen] = useState<FormaRozliczenia[]>([]);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Pracownik; direction: 'asc' | 'desc' }>({ key: 'imie', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [nowy, setNowy] = useState(PUSTY);
  const [editingPracownik, setEditingPracownik] = useState<Pracownik | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; itemIndex: number; itemName: string }>({ isOpen: false, itemIndex: -1, itemName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredAndSortedPracownicy = useMemo(() => {
    let filtered = pracownicy.filter(pracownik =>
      pracownik.imie.toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
      pracownik.nazwisko.toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
      pracownik.email.toLowerCase().includes(wyszukiwanie.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [pracownicyData, uzytkownicyData, stanowiskaData] = await Promise.all([
          api.getEmployees(),
          api.getUsers(),
          api.get('/stanowiska') // Assuming this endpoint exists
        ]);
        
        setPracownicy(pracownicyData as Pracownik[]);
        setUzytkownicy(uzytkownicyData as Uzytkownik[]);
        setStanowiska(stanowiskaData as Stanowisko[]);
        
        // For now, keep formy rozliczen as empty array since we don't have this endpoint yet
        setFormyRozliczen([]);
        
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setError("Nie udało się pobrać danych. Sprawdź połączenie z serwerem.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      if (nowy.imie && nowy.nazwisko && nowy.telefon && nowy.email && nowy.stanowisko_id) {
        const pracownik: Pracownik = {
          id: Date.now(),
          imie: nowy.imie,
          nazwisko: nowy.nazwisko,
          telefon: nowy.telefon,
          email: nowy.email,
          stanowisko_id: nowy.stanowisko_id,
          uzytkownik_id: nowy.uzytkownik_id,
          data_zatrudnienia: nowy.data_zatrudnienia,
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
        email: editingPracownik.email || '',
        uzytkownik_id: uzytkownik.id
      });
    } else {
      setNowy({
        ...nowy,
        imie: uzytkownik.imie,
        nazwisko: uzytkownik.nazwisko,
        email: nowy.email || '',
        uzytkownik_id: uzytkownik.id
      });
    }
    // setShowUserSelector(false); // This state was removed, so this line is removed
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
              <User size={24} />
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
                      value={editingPracownik ? (editingPracownik.uzytkownik_id ? uzytkownicy.find(u => u.id === editingPracownik.uzytkownik_id)?.imie : '') : (nowy.uzytkownik_id ? uzytkownicy.find(u => u.id === nowy.uzytkownik_id)?.imie : '')}
                      readOnly
                      placeholder="Login użytkownika"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        // This part needs to be implemented to show a user selector modal
                        // For now, it will just set the user to null or a default
                        if (editingPracownik) {
                          setEditingPracownik({ ...editingPracownik, uzytkownik_id: null });
                        } else {
                          setNowy({ ...nowy, uzytkownik_id: null });
                        }
                      }}
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
                    name="email"
                    value={editingPracownik ? editingPracownik.email : nowy.email}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Adres email"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stanowisko</label>
                  <select
                    className="form-input"
                    name="stanowisko_id"
                    value={editingPracownik ? editingPracownik.stanowisko_id : nowy.stanowisko_id}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    required
                  >
                    <option value="">Wybierz stanowisko</option>
                    {stanowiska.map(s => (
                      <option key={s.id} value={s.id}>{s.nazwa}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Data zatrudnienia</label>
                  <input
                    type="date"
                    className="form-input"
                    name="data_zatrudnienia"
                    value={editingPracownik ? editingPracownik.data_zatrudnienia : nowy.data_zatrudnienia}
                    onChange={editingPracownik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Data zatrudnienia"
                  />
                </div>
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
              <th onClick={() => handleSort('email')} className="sortable-header">Email {getSortIcon('email')}</th>
              <th onClick={() => handleSort('stanowisko_id')} className="sortable-header">Stanowisko {getSortIcon('stanowisko_id')}</th>
              <th onClick={() => handleSort('uzytkownik_id')} className="sortable-header">Użytkownik {getSortIcon('uzytkownik_id')}</th>
              <th onClick={() => handleSort('formaRozliczeniaId')} className="sortable-header">Forma rozliczenia {getSortIcon('formaRozliczeniaId')}</th>
              <th onClick={() => handleSort('kwota')} className="sortable-header">Kwota / stawka godz. {getSortIcon('kwota')}</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPracownicy.map((pracownik, idx) => (
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
                <td>{pracownik.email}</td>
                <td>
                  {(() => {
                    const s = stanowiska.find(st => st.id === pracownik.stanowisko_id);
                    return s ? s.nazwa : '-';
                  })()}
                </td>
                <td>
                  {(() => {
                    const u = uzytkownicy.find(u => u.id === pracownik.uzytkownik_id);
                    return u ? (
                      <div className="user-info">
                        <div className="user-avatar">
                          <img 
                            src={u.avatar || "/images/avatars/avatar_01.png"} 
                            alt={`Avatar ${u.imie} ${u.nazwisko}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/avatars/avatar_01.png";
                            }}
                          />
                        </div>
                        <span className="user-login">{u.imie} {u.nazwisko}</span>
                      </div>
                    ) : (
                      <span className="no-user">Brak użytkownika</span>
                    );
                  })()}
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
        
        {filteredAndSortedPracownicy.length === 0 && (
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
      {/* This part needs to be implemented to show a user selector modal */}
      {/* For now, it will just set the user to null or a default */}
      {/* {showUserSelector && (
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
                    key={uzytkownik.id}
                    className="user-selector-item"
                    onClick={() => handleSelectUser(uzytkownik)}
                  >
                    <div className="user-selector-info">
                      <div className="user-selector-name">
                        {uzytkownik.imie} {uzytkownik.nazwisko}
                      </div>
                      <div className="user-selector-login">
                        {uzytkownik.email}
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
      )} */}
    </div>
  );
};

export default ListaPracownikow; 