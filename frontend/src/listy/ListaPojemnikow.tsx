import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, Box, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';


interface Pojemnik {
  id: number;
  nazwa: string;
  typ: string;
  lokalizacja: string;
  pojemnosc: number;
}

const PUSTY: Pojemnik = { id: 0, nazwa: "", typ: "", lokalizacja: "", pojemnosc: 0 };

const ListaPojemnikow: React.FC = () => {
  const [pojemniki, setPojemniki] = useState<Pojemnik[]>([]);
  const [editingPojemnik, setEditingPojemnik] = useState<Pojemnik | null>(null);
  const [nowy, setNowy] = useState<Pojemnik>(PUSTY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pojemnik | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwa', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredPojemniki = useMemo(() => {
    let filtered = pojemniki;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
              filtered = pojemniki.filter(pojemnik => 
          pojemnik.nazwa.toLowerCase().includes(szukany) ||
          pojemnik.typ.toLowerCase().includes(szukany) ||
          pojemnik.lokalizacja.toLowerCase().includes(szukany)
        );
    }
    
    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
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
  }, [pojemniki, wyszukiwanie, sortConfig]);

  useEffect(() => {
    fetch("/data/pojemniki.json")
      .then(res => res.json())
      .then(data => setPojemniki(data))
      .catch(err => console.error("Błąd pobierania pojemników:", err));
  }, []);

  const handleSort = (key: keyof Pojemnik) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Pojemnik) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNowy({ ...nowy, [name]: value });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPojemnik) return;
    const { name, value } = e.target;
    setEditingPojemnik({ ...editingPojemnik, [name]: value });
  };

  const handleEdit = (pojemnik: Pojemnik) => {
    setEditingPojemnik(pojemnik);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingPojemnik) {
      setPojemniki(pojemniki.map(p => p.id === editingPojemnik.id ? editingPojemnik : p));
      setEditingPojemnik(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingPojemnik) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowy.nazwa && nowy.typ) {
                  const pojemnik: Pojemnik = {
            id: Date.now(),
            nazwa: nowy.nazwa,
            typ: nowy.typ,
            lokalizacja: nowy.lokalizacja,
            pojemnosc: nowy.pojemnosc
          };
        setPojemniki([...pojemniki, pojemnik]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const pojemnik = pojemniki[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: pojemnik.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setPojemniki(pojemniki.filter((_, idx) => idx !== confirmDialog.itemIndex));
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
            <div className="card-title">Lista Pojemników</div>
            <div className="card-subtitle">Zarządzanie pojemnikami i ich zawartością</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingPojemnik(null);
                setNowy(PUSTY);
              }}
            >
              <Plus size={16} />
              Dodaj pojemnik
            </button>
            <div className="card-icon">
              <Box size={24} />
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
                placeholder="Szukaj pojemników po nazwie, typie lub lokalizacji..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Container Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPojemnik ? 'Edytuj pojemnik' : 'Dodaj nowy pojemnik'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPojemnik(null);
                  setNowy(PUSTY);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwa</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingPojemnik ? editingPojemnik.nazwa : nowy.nazwa}
                    onChange={editingPojemnik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Nazwa pojemnika"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Typ</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingPojemnik ? editingPojemnik.typ : nowy.typ}
                    onChange={editingPojemnik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Typ pojemnika"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Lokalizacja</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingPojemnik ? editingPojemnik.lokalizacja : nowy.lokalizacja}
                    onChange={editingPojemnik ? handleZmienEditing : handleZmienNowy}
                    placeholder="Lokalizacja"
                  />
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Pojemność</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingPojemnik ? editingPojemnik.pojemnosc : nowy.pojemnosc}
                    onChange={editingPojemnik ? handleZmienEditing : handleZmienNowy}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingPojemnik ? 'Zapisz zmiany' : 'Dodaj pojemnik'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingPojemnik(null);
                setNowy(PUSTY);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Containers Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Pojemnik
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
                onClick={() => handleSort('typ')}
              >
                Typ
                <span className={`sort-icon ${sortConfig.key === 'typ' ? 'active' : ''}`}>
                  {sortConfig.key === 'typ' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'typ' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('lokalizacja')}
              >
                Lokalizacja
                <span className={`sort-icon ${sortConfig.key === 'lokalizacja' ? 'active' : ''}`}>
                  {sortConfig.key === 'lokalizacja' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'lokalizacja' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('pojemnosc')}
              >
                Pojemność
                <span className={`sort-icon ${sortConfig.key === 'pojemnosc' ? 'active' : ''}`}>
                  {sortConfig.key === 'pojemnosc' && sortConfig.direction === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortConfig.key === 'pojemnosc' && sortConfig.direction === 'desc' ? (
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
            {sortedAndFilteredPojemniki.map(pojemnik => (
              <tr key={pojemnik.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon purple">
                      {(pojemnik.nazwa || 'PO').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {pojemnik.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {pojemnik.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {pojemnik.typ || 'Brak typu'}
                </td>
                <td>
                  {pojemnik.lokalizacja || 'Brak lokalizacji'}
                </td>
                <td>
                  {pojemnik.pojemnosc || 0}
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(pojemnik)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(pojemniki.findIndex(p => p === pojemnik))}
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
        
        {sortedAndFilteredPojemniki.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono pojemników spełniających kryteria wyszukiwania' : 'Brak pojemników do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć pojemnik "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />

    </div>
  );
};

export default ListaPojemnikow; 