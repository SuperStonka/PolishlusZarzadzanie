import React, { useEffect, useState, useMemo } from "react";
import { Edit, Trash2, Save, X, Search, Plus, ChevronUp, ChevronDown, User, Star } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Kontakt {
  id: number;
  imie: string;
  nazwisko: string;
  telefon: string;
  mail: string;
  ocena: number;
  uwagi: string;
  stanowisko: string;
  czyFirma: boolean;
  nazwaFirmy: string;
  ulica: string;
  kodPocztowy: string;
  miasto: string;
  nip: string;
  formaRozliczeniaId: number | null;
  kwota: number;
}

const PUSTY: Kontakt = {
  id: 0,
  imie: "",
  nazwisko: "",
  telefon: "",
  mail: "",
  ocena: 3,
  uwagi: "",
  stanowisko: "",
  czyFirma: false,
  nazwaFirmy: "",
  ulica: "",
  kodPocztowy: "",
  miasto: "",
  nip: "",
  formaRozliczeniaId: null,
  kwota: 0
};

interface FormaRozliczenia { id: number; nazwa: string; }

const ListaKontaktow: React.FC = () => {
  const [kontakty, setKontakty] = useState<Kontakt[]>([]);
  const [stanowiska, setStanowiska] = useState<string[]>([]);
  const [editingKontakt, setEditingKontakt] = useState<Kontakt | null>(null);
  const [nowy, setNowy] = useState<Kontakt>(PUSTY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Kontakt | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwisko', direction: 'asc' });
  const [formyRozliczen, setFormyRozliczen] = useState<FormaRozliczenia[]>([]);

  // Sortowanie i filtrowanie
  const sortedAndFilteredKontakty = useMemo(() => {
    let filtered = kontakty;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = kontakty.filter(kontakt => 
        kontakt.imie.toLowerCase().includes(szukany) ||
        kontakt.nazwisko.toLowerCase().includes(szukany) ||
        kontakt.telefon.toLowerCase().includes(szukany) ||
        kontakt.mail.toLowerCase().includes(szukany) ||
        kontakt.stanowisko.toLowerCase().includes(szukany) ||
        kontakt.uwagi.toLowerCase().includes(szukany)
      );
    }
    
    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];
        // Obsługa null/undefined
        if (aValue == null) aValue = typeof bValue === 'number' ? 0 : '';
        if (bValue == null) bValue = typeof aValue === 'number' ? 0 : '';
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue, 'pl');
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [kontakty, wyszukiwanie, sortConfig]);

  useEffect(() => {
    fetch("/data/kontakty.json")
      .then(res => res.json())
      .then(data => setKontakty(data))
      .catch(err => console.error("Błąd pobierania kontaktów:", err));
    
    fetch("/data/stanowiska.json")
      .then(res => res.json())
      .then(data => setStanowiska(data.map((s: any) => s.nazwa)))
      .catch(err => console.error("Błąd pobierania stanowisk:", err));
    fetch("/data/formy-rozliczen.json")
      .then(res => res.json())
      .then(setFormyRozliczen)
      .catch(() => setFormyRozliczen([]));
  }, []);

  const handleSort = (key: keyof Kontakt) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Kontakt) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNowy({ 
      ...nowy, 
      [name]: name === "ocena" ? parseInt(value) || 3 : value 
    });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingKontakt) return;
    const { name, value } = e.target;
    setEditingKontakt({ 
      ...editingKontakt, 
      [name]: name === "ocena" ? parseInt(value) || 3 : value 
    });
  };

  const renderStars = (ocena: number, editable: boolean = false, onChange?: (value: number) => void) => {
    return (
      <div className="ocena-tabela">
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`star ${star <= ocena ? 'filled' : ''} ${editable ? 'editable' : ''}`}
              size={editable ? 20 : 16}
              fill={star <= ocena ? '#fbbf24' : 'none'}
              color={star <= ocena ? '#fbbf24' : '#d1d5db'}
              onClick={editable && onChange ? () => onChange(star) : undefined}
            />
          ))}
        </div>
        <span className="ocena-liczba">({ocena}/5)</span>
      </div>
    );
  };

  const handleEdit = (kontakt: Kontakt) => {
    setEditingKontakt(kontakt);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingKontakt) {
      setKontakty(kontakty.map(k => k.id === editingKontakt.id ? editingKontakt : k));
      setEditingKontakt(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingKontakt) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowy.imie && nowy.nazwisko && nowy.telefon && nowy.mail && nowy.stanowisko) {
        const kontakt: Kontakt = {
          id: Date.now(),
          imie: nowy.imie,
          nazwisko: nowy.nazwisko,
          telefon: nowy.telefon,
          mail: nowy.mail,
          ocena: nowy.ocena,
          uwagi: nowy.uwagi,
          stanowisko: nowy.stanowisko,
          czyFirma: nowy.czyFirma,
          nazwaFirmy: nowy.nazwaFirmy,
          ulica: nowy.ulica,
          kodPocztowy: nowy.kodPocztowy,
          miasto: nowy.miasto,
          nip: nowy.nip,
          formaRozliczeniaId: nowy.formaRozliczeniaId,
          kwota: nowy.kwota
        };
        setKontakty([...kontakty, kontakt]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const kontakt = kontakty[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: `${kontakt.imie} ${kontakt.nazwisko}`
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setKontakty(kontakty.filter((_, idx) => idx !== confirmDialog.itemIndex));
    }
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Kontaktów</div>
            <div className="card-subtitle">Zarządzanie kontaktami i funkcjami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingKontakt(null);
                setNowy(PUSTY);
              }}
            >
              <Plus size={16} />
              Dodaj kontakt
            </button>
            <div className="card-icon">
              <User size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="d-flex justify-between align-center mb-3">
          <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
            <div className="search-container" style={{ flex: 2 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Szukaj kontaktów po imieniu, nazwisku, telefonie, funkcji..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <select
                className="form-select"
                value=""
                onChange={() => {}}
                style={{ minWidth: '150px' }}
              >
                <option value="">Wszystkie stanowiska</option>
                {stanowiska.map(stanowisko => (
                  <option key={stanowisko} value={stanowisko}>{stanowisko}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingKontakt ? 'Edytuj kontakt' : 'Dodaj nowy kontakt'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingKontakt(null);
                  setNowy(PUSTY);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Imię</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingKontakt ? editingKontakt.imie : nowy.imie}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, imie: e.target.value });
                      } else {
                        setNowy({ ...nowy, imie: e.target.value });
                      }
                    }}
                    placeholder="Imię kontaktu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwisko</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingKontakt ? editingKontakt.nazwisko : nowy.nazwisko}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, nazwisko: e.target.value });
                      } else {
                        setNowy({ ...nowy, nazwisko: e.target.value });
                      }
                    }}
                    placeholder="Nazwisko kontaktu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editingKontakt ? editingKontakt.telefon : nowy.telefon}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, telefon: e.target.value });
                      } else {
                        setNowy({ ...nowy, telefon: e.target.value });
                      }
                    }}
                    placeholder="Numer telefonu"
                  />
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingKontakt ? editingKontakt.mail : nowy.mail}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, mail: e.target.value });
                      } else {
                        setNowy({ ...nowy, mail: e.target.value });
                      }
                    }}
                    placeholder="Adres email"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stanowisko</label>
                  <select
                    className="form-select"
                    value={editingKontakt ? editingKontakt.stanowisko : nowy.stanowisko}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, stanowisko: e.target.value });
                      } else {
                        setNowy({ ...nowy, stanowisko: e.target.value });
                      }
                    }}
                  >
                    <option value="">Wybierz stanowisko</option>
                    {stanowiska.map(stanowisko => (
                      <option key={stanowisko} value={stanowisko}>{stanowisko}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Ocena</label>
                  <div className="rating-input">
                    {renderStars(
                      editingKontakt ? editingKontakt.ocena : nowy.ocena,
                      true,
                      (value) => {
                        if (editingKontakt) {
                          setEditingKontakt({ ...editingKontakt, ocena: value });
                        } else {
                          setNowy({ ...nowy, ocena: value });
                        }
                      }
                    )}
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">
                    <input
                      type="checkbox"
                      checked={editingKontakt ? editingKontakt.czyFirma : nowy.czyFirma}
                      onChange={(e) => {
                        if (editingKontakt) {
                          setEditingKontakt({ ...editingKontakt, czyFirma: e.target.checked });
                        } else {
                          setNowy({ ...nowy, czyFirma: e.target.checked });
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    Czy firma?
                  </label>
                </div>
              </div>
              
              {(editingKontakt ? editingKontakt.czyFirma : nowy.czyFirma) && (
                <>
                  <div className="d-flex gap-2">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Nazwa firmy</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingKontakt ? editingKontakt.nazwaFirmy : nowy.nazwaFirmy}
                        onChange={(e) => {
                          if (editingKontakt) {
                            setEditingKontakt({ ...editingKontakt, nazwaFirmy: e.target.value });
                          } else {
                            setNowy({ ...nowy, nazwaFirmy: e.target.value });
                          }
                        }}
                        placeholder="Nazwa firmy"
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label">Ulica</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingKontakt ? editingKontakt.ulica : nowy.ulica}
                        onChange={(e) => {
                          if (editingKontakt) {
                            setEditingKontakt({ ...editingKontakt, ulica: e.target.value });
                          } else {
                            setNowy({ ...nowy, ulica: e.target.value });
                          }
                        }}
                        placeholder="Ulica i numer"
                      />
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Kod pocztowy</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingKontakt ? editingKontakt.kodPocztowy : nowy.kodPocztowy}
                        onChange={(e) => {
                          if (editingKontakt) {
                            setEditingKontakt({ ...editingKontakt, kodPocztowy: e.target.value });
                          } else {
                            setNowy({ ...nowy, kodPocztowy: e.target.value });
                          }
                        }}
                        placeholder="00-000"
                      />
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Miasto</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingKontakt ? editingKontakt.miasto : nowy.miasto}
                        onChange={(e) => {
                          if (editingKontakt) {
                            setEditingKontakt({ ...editingKontakt, miasto: e.target.value });
                          } else {
                            setNowy({ ...nowy, miasto: e.target.value });
                          }
                        }}
                        placeholder="Miasto"
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">NIP</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingKontakt ? editingKontakt.nip : nowy.nip}
                        onChange={(e) => {
                          if (editingKontakt) {
                            setEditingKontakt({ ...editingKontakt, nip: e.target.value });
                          } else {
                            setNowy({ ...nowy, nip: e.target.value });
                          }
                        }}
                        placeholder="NIP firmy"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Forma rozliczenia</label>
                  <select
                    className="form-select"
                    value={editingKontakt ? editingKontakt.formaRozliczeniaId ?? '' : nowy.formaRozliczeniaId ?? ''}
                    onChange={e => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      if (editingKontakt) setEditingKontakt({ ...editingKontakt, formaRozliczeniaId: val });
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
                    value={editingKontakt ? editingKontakt.kwota : nowy.kwota}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      if (editingKontakt) setEditingKontakt({ ...editingKontakt, kwota: val });
                      else setNowy({ ...nowy, kwota: val });
                    }}
                    placeholder="Kwota lub stawka godzinowa"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Uwagi</label>
                  <textarea
                    className="form-textarea"
                    value={editingKontakt ? editingKontakt.uwagi : nowy.uwagi}
                    onChange={(e) => {
                      if (editingKontakt) {
                        setEditingKontakt({ ...editingKontakt, uwagi: e.target.value });
                      } else {
                        setNowy({ ...nowy, uwagi: e.target.value });
                      }
                    }}
                    placeholder="Dodatkowe uwagi o kontakcie..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingKontakt ? 'Zapisz zmiany' : 'Dodaj kontakt'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingKontakt(null);
                setNowy(PUSTY);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('imie')}
              >
                Kontakt
                <span className={`sort-icon ${sortConfig.key === 'imie' ? 'active' : ''}`}>
                  {sortConfig.key === 'imie' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'imie' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('telefon')}
              >
                Telefon
                <span className={`sort-icon ${sortConfig.key === 'telefon' ? 'active' : ''}`}>
                  {sortConfig.key === 'telefon' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'telefon' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('mail')}
              >
                Email
                <span className={`sort-icon ${sortConfig.key === 'mail' ? 'active' : ''}`}>
                  {sortConfig.key === 'mail' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'mail' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('stanowisko')}
              >
                Stanowisko
                <span className={`sort-icon ${sortConfig.key === 'stanowisko' ? 'active' : ''}`}>
                  {sortConfig.key === 'stanowisko' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'stanowisko' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('ocena')}
              >
                Ocena
                <span className={`sort-icon ${sortConfig.key === 'ocena' ? 'active' : ''}`}>
                  {sortConfig.key === 'ocena' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'ocena' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('uwagi')}
              >
                Uwagi
                <span className={`sort-icon ${sortConfig.key === 'uwagi' ? 'active' : ''}`}>
                  {sortConfig.key === 'uwagi' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'uwagi' && sortConfig.direction === 'desc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 20l-8-8h16z"/>
                    </svg>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h16z"/>
                      </svg>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l-8-8h16z"/>
                      </svg>
                    </>
                  )}
                </span>
              </th>
              <th>Forma rozliczenia</th>
              <th>Kwota / stawka godz.</th>
              <th>Firma</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredKontakty.map(kontakt => (
              <tr key={kontakt.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon green">
                      {(() => {
                        const firstInitial = kontakt.imie ? kontakt.imie.charAt(0).toUpperCase() : '';
                        const lastInitial = kontakt.nazwisko ? kontakt.nazwisko.charAt(0).toUpperCase() : '';
                        return firstInitial + lastInitial || 'KO';
                      })()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {kontakt.imie && kontakt.nazwisko ? `${kontakt.imie} ${kontakt.nazwisko}` : 'Brak danych'}
                      </div>
                      <div className="project-date">
                        ID: {kontakt.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {kontakt.telefon || 'Brak telefonu'}
                </td>
                <td>
                  {kontakt.mail || 'Brak email'}
                </td>
                <td>
                  {kontakt.stanowisko || 'Brak stanowiska'}
                </td>
                <td>
                  <div className="rating-display">
                    {renderStars(kontakt.ocena)}
                  </div>
                </td>
                <td>
                  <div className="product-notes">
                    {kontakt.uwagi || 'Brak uwag'}
                  </div>
                </td>
                <td>
                  {(() => {
                    const f = formyRozliczen.find(fr => fr.id === kontakt.formaRozliczeniaId);
                    return f ? f.nazwa : '-';
                  })()}
                </td>
                <td>{kontakt.kwota ? kontakt.kwota.toFixed(2) : '-'}</td>
                <td>
                  {kontakt.czyFirma ? (
                    <div className="firma-info">
                      <div className="firma-nazwa">{kontakt.nazwaFirmy}</div>
                      <div className="firma-adres">
                        {kontakt.ulica && kontakt.miasto ? `${kontakt.ulica}, ${kontakt.kodPocztowy} ${kontakt.miasto}` : 'Brak adresu'}
                      </div>
                      {kontakt.nip && <div className="firma-nip">NIP: {kontakt.nip}</div>}
                    </div>
                  ) : (
                    <span className="no-firma">Osoba prywatna</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(kontakt)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(kontakty.findIndex(k => k.id === kontakt.id))}
                      title="Usuń"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedAndFilteredKontakty.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono kontaktów spełniających kryteria wyszukiwania' : 'Brak kontaktów do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć kontakt "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
    </div>
  );
};

export default ListaKontaktow; 