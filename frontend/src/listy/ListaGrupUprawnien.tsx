import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, Shield, ChevronUp, ChevronDown, Users, Lock, Unlock } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface GrupaUprawnien {
  id: number;
  nazwa: string;
  opis: string;
  uprawnienia: {
    zarzadzanieProduktami: boolean;
    zarzadzaniePracownikami: boolean;
    zarzadzanieKontaktami: boolean;
    zarzadzanieEventami: boolean;
    zarzadzanieUzytkownikami: boolean;
    przegladanieRaportow: boolean;
    edycjaUstawien: boolean;
  };
  liczbaUzytkownikow: number;
  aktywna: boolean;
}

const PUSTA: GrupaUprawnien = {
  id: 0,
  nazwa: "",
  opis: "",
  uprawnienia: {
    zarzadzanieProduktami: false,
    zarzadzaniePracownikami: false,
    zarzadzanieKontaktami: false,
    zarzadzanieEventami: false,
    zarzadzanieUzytkownikami: false,
    przegladanieRaportow: false,
    edycjaUstawien: false
  },
  liczbaUzytkownikow: 0,
  aktywna: true
};

const ListaGrupUprawnien: React.FC = () => {
  console.log("ListaGrupUprawnien: Renderowanie komponentu");
  const [grupy, setGrupy] = useState<GrupaUprawnien[]>([]);
  const [editingGrupa, setEditingGrupa] = useState<GrupaUprawnien | null>(null);
  const [nowa, setNowa] = useState<GrupaUprawnien>(PUSTA);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GrupaUprawnien | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwa', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredGrupy = useMemo(() => {
    let filtered = grupy;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = grupy.filter(grupa => 
        grupa.nazwa.toLowerCase().includes(szukany) ||
        grupa.opis.toLowerCase().includes(szukany)
      );
    }
    
    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        // Obsługa undefined wartości
        const aStr = aValue?.toString() || '';
        const bStr = bValue?.toString() || '';
        
        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [grupy, wyszukiwanie, sortConfig]);

  useEffect(() => {
    console.log("Ładowanie grup uprawnień...");
    fetch("/data/grupyUprawnien.json")
      .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Załadowane grupy uprawnień:", data);
        setGrupy(data);
      })
      .catch(err => {
        console.error("Błąd pobierania grup uprawnień:", err);
        setGrupy([]);
      });
  }, []);

  const handleSort = (key: keyof GrupaUprawnien) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof GrupaUprawnien) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowa = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const uprawnienieName = name as keyof typeof nowa.uprawnienia;
      setNowa({ 
        ...nowa, 
        uprawnienia: { ...nowa.uprawnienia, [uprawnienieName]: checked }
      });
    } else {
      setNowa({ 
        ...nowa, 
        [name]: value 
      });
    }
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingGrupa) return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const uprawnienieName = name as keyof typeof editingGrupa.uprawnienia;
      setEditingGrupa({ 
        ...editingGrupa, 
        uprawnienia: { ...editingGrupa.uprawnienia, [uprawnienieName]: checked }
      });
    } else {
      setEditingGrupa({ 
        ...editingGrupa, 
        [name]: value 
      });
    }
  };

  const handleEdit = (grupa: GrupaUprawnien) => {
    setEditingGrupa(grupa);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingGrupa) {
      setGrupy(grupy.map(g => g.id === editingGrupa.id ? editingGrupa : g));
      setEditingGrupa(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingGrupa) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowa.nazwa.trim()) {
        const grupa: GrupaUprawnien = {
          id: Date.now(),
          nazwa: nowa.nazwa.trim(),
          opis: nowa.opis.trim(),
          uprawnienia: nowa.uprawnienia,
          liczbaUzytkownikow: 0,
          aktywna: nowa.aktywna
        };
        setGrupy([...grupy, grupa]);
        setNowa(PUSTA);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const grupa = grupy[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: grupa.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setGrupy(grupy.filter((_, idx) => idx !== confirmDialog.itemIndex));
    }
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: "" });
  };

  const renderUprawnienia = (uprawnienia: GrupaUprawnien['uprawnienia']) => {
    const uprawnieniaList = [
      { key: 'zarzadzanieProduktami', label: 'Zarządzanie produktami' },
      { key: 'zarzadzaniePracownikami', label: 'Zarządzanie pracownikami' },
      { key: 'zarzadzanieKontaktami', label: 'Zarządzanie kontaktami' },
      { key: 'zarzadzanieEventami', label: 'Zarządzanie eventami' },
      { key: 'zarzadzanieUzytkownikami', label: 'Zarządzanie użytkownikami' },
      { key: 'przegladanieRaportow', label: 'Przeglądanie raportów' },
      { key: 'edycjaUstawien', label: 'Edycja ustawień' }
    ];

    return (
      <div className="uprawnienia-grid">
        {uprawnieniaList.map(({ key, label }) => (
          <div key={key} className="uprawnienie-item">
            {uprawnienia[key as keyof typeof uprawnienia] ? (
              <Lock size={14} className="uprawnienie-icon active" />
            ) : (
              <Unlock size={14} className="uprawnienie-icon inactive" />
            )}
            <span className="uprawnienie-label">{label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Grup Uprawnień</div>
            <div className="card-subtitle">Zarządzanie grupami uprawnień użytkowników</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingGrupa(null);
                setNowa(PUSTA);
              }}
            >
              <Plus size={16} />
              Dodaj grupę
            </button>
            <div className="card-icon">
              <Shield size={24} />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="d-flex justify-between align-center mb-3">
          <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
            <div className="search-container" style={{ flex: 2 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Szukaj grup po nazwie lub opisie..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Group Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingGrupa ? 'Edytuj grupę uprawnień' : 'Dodaj nową grupę uprawnień'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGrupa(null);
                  setNowa(PUSTA);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
          
          <div className="d-flex gap-2">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nazwa grupy</label>
              <input
                type="text"
                name="nazwa"
                className="form-input"
                value={editingGrupa ? editingGrupa.nazwa : nowa.nazwa}
                onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                placeholder="Nazwa grupy uprawnień"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Opis</label>
              <input
                type="text"
                name="opis"
                className="form-input"
                value={editingGrupa ? editingGrupa.opis : nowa.opis}
                onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                placeholder="Opis grupy uprawnień"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Uprawnienia</label>
            <div className="uprawnienia-form-grid">
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="zarzadzanieProduktami"
                  checked={editingGrupa ? editingGrupa.uprawnienia.zarzadzanieProduktami : nowa.uprawnienia.zarzadzanieProduktami}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="zarzadzanieProduktami"
                />
                <label htmlFor="zarzadzanieProduktami">Zarządzanie produktami</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="zarzadzaniePracownikami"
                  checked={editingGrupa ? editingGrupa.uprawnienia.zarzadzaniePracownikami : nowa.uprawnienia.zarzadzaniePracownikami}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="zarzadzaniePracownikami"
                />
                <label htmlFor="zarzadzaniePracownikami">Zarządzanie pracownikami</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="zarzadzanieKontaktami"
                  checked={editingGrupa ? editingGrupa.uprawnienia.zarzadzanieKontaktami : nowa.uprawnienia.zarzadzanieKontaktami}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="zarzadzanieKontaktami"
                />
                <label htmlFor="zarzadzanieKontaktami">Zarządzanie kontaktami</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="zarzadzanieEventami"
                  checked={editingGrupa ? editingGrupa.uprawnienia.zarzadzanieEventami : nowa.uprawnienia.zarzadzanieEventami}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="zarzadzanieEventami"
                />
                <label htmlFor="zarzadzanieEventami">Zarządzanie eventami</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="zarzadzanieUzytkownikami"
                  checked={editingGrupa ? editingGrupa.uprawnienia.zarzadzanieUzytkownikami : nowa.uprawnienia.zarzadzanieUzytkownikami}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="zarzadzanieUzytkownikami"
                />
                <label htmlFor="zarzadzanieUzytkownikami">Zarządzanie użytkownikami</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="przegladanieRaportow"
                  checked={editingGrupa ? editingGrupa.uprawnienia.przegladanieRaportow : nowa.uprawnienia.przegladanieRaportow}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="przegladanieRaportow"
                />
                <label htmlFor="przegladanieRaportow">Przeglądanie raportów</label>
              </div>
              
              <div className="uprawnienie-checkbox">
                <input
                  type="checkbox"
                  name="edycjaUstawien"
                  checked={editingGrupa ? editingGrupa.uprawnienia.edycjaUstawien : nowa.uprawnienia.edycjaUstawien}
                  onChange={editingGrupa ? handleZmienEditing : handleZmienNowa}
                  id="edycjaUstawien"
                />
                <label htmlFor="edycjaUstawien">Edycja ustawień</label>
              </div>
            </div>
          </div>
          
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingGrupa ? 'Zapisz zmiany' : 'Dodaj grupę'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingGrupa(null);
                setNowa(PUSTA);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Grupa
                <span className={`sort-icon ${sortConfig.key === 'nazwa' ? 'active' : ''}`}>
                  {sortConfig.key === 'nazwa' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'nazwa' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('opis')}
              >
                Opis
                <span className={`sort-icon ${sortConfig.key === 'opis' ? 'active' : ''}`}>
                  {sortConfig.key === 'opis' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'opis' && sortConfig.direction === 'desc' ? (
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
              <th>Uprawnienia</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('liczbaUzytkownikow')}
              >
                Użytkownicy
                <span className={`sort-icon ${sortConfig.key === 'liczbaUzytkownikow' ? 'active' : ''}`}>
                  {sortConfig.key === 'liczbaUzytkownikow' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'liczbaUzytkownikow' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('aktywna')}
              >
                Status
                <span className={`sort-icon ${sortConfig.key === 'aktywna' ? 'active' : ''}`}>
                  {sortConfig.key === 'aktywna' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'aktywna' && sortConfig.direction === 'desc' ? (
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredGrupy.map(grupa => (
              <tr key={grupa.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon purple">
                      {(grupa.nazwa || 'GU').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {grupa.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {grupa.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="product-notes">
                    {grupa.opis || 'Brak opisu'}
                  </div>
                </td>
                <td>
                  {renderUprawnienia(grupa.uprawnienia)}
                </td>
                <td>
                  <div className="uzytkownicy-info">
                    <Users size={16} className="uzytkownicy-icon" />
                    <span>{grupa.liczbaUzytkownikow}</span>
                  </div>
                </td>
                <td>
                  <div className={`status-badge ${grupa.aktywna ? 'status-active' : 'status-inactive'}`}>
                    {grupa.aktywna ? 'Aktywna' : 'Nieaktywna'}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(grupa)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(grupy.findIndex(g => g.id === grupa.id))}
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
        
        {sortedAndFilteredGrupy.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono grup spełniających kryteria wyszukiwania' : 'Brak grup do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć grupę "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
    </div>
  );
};

export default ListaGrupUprawnien; 