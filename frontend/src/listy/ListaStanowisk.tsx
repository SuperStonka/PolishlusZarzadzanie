import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, Briefcase, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Stanowisko {
  id: number;
  nazwa: string;
  opis?: string;
}

const PUSTA: Stanowisko = { id: 0, nazwa: "", opis: "" };

const ListaStanowisk: React.FC = () => {
  console.log("ListaStanowisk: Renderowanie komponentu");
  const [stanowiska, setStanowiska] = useState<Stanowisko[]>([]);
  const [editingStanowisko, setEditingStanowisko] = useState<Stanowisko | null>(null);
  const [nowe, setNowe] = useState<Stanowisko>(PUSTA);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stanowisko | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwa', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredStanowiska = useMemo(() => {
    let filtered = stanowiska;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = stanowiska.filter(stanowisko => 
        stanowisko.nazwa.toLowerCase().includes(szukany) || (stanowisko.opis && stanowisko.opis.toLowerCase().includes(szukany))
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
  }, [stanowiska, wyszukiwanie, sortConfig]);

  useEffect(() => {
    console.log("Ładowanie stanowisk...");
    fetch("/data/stanowiska.json")
      .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Załadowane stanowiska:", data);
        setStanowiska(data);
      })
      .catch(err => {
        console.error("Błąd pobierania stanowisk:", err);
        setStanowiska([]);
      });
  }, []);

  const handleSort = (key: keyof Stanowisko) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Stanowisko) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowe = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNowe({ ...nowe, [name]: value });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingStanowisko) return;
    const { name, value } = e.target;
    setEditingStanowisko({ ...editingStanowisko, [name]: value });
  };

  const handleEdit = (stanowisko: Stanowisko) => {
    setEditingStanowisko(stanowisko);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingStanowisko) {
      setStanowiska(stanowiska.map(s => s.id === editingStanowisko.id ? editingStanowisko : s));
      setEditingStanowisko(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingStanowisko) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowe.nazwa.trim()) {
        const stanowisko: Stanowisko = {
          id: Date.now(),
          nazwa: nowe.nazwa.trim(),
          opis: nowe.opis
        };
        setStanowiska([...stanowiska, stanowisko]);
        setNowe(PUSTA);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const stanowisko = stanowiska[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: stanowisko.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setStanowiska(stanowiska.filter((_, idx) => idx !== confirmDialog.itemIndex));
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
            <div className="card-title">Lista Stanowisk</div>
            <div className="card-subtitle">Zarządzanie stanowiskami i rolami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingStanowisko(null);
                setNowe(PUSTA);
              }}
            >
              <Plus size={16} />
              Dodaj stanowisko
            </button>
            <div className="card-icon">
              <Briefcase size={24} />
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
                placeholder="Szukaj stanowisk po nazwie lub opisie..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingStanowisko ? 'Edytuj stanowisko' : 'Dodaj nowe stanowisko'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStanowisko(null);
                  setNowe(PUSTA);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwa stanowiska</label>
                  <input
                    type="text"
                    name="nazwa"
                    className="form-input"
                    value={editingStanowisko ? editingStanowisko.nazwa : nowe.nazwa}
                    onChange={editingStanowisko ? handleZmienEditing : handleZmienNowe}
                    placeholder="Nazwa stanowiska"
                  />
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Opis</label>
                  <textarea
                    name="opis"
                    className="form-textarea"
                    value={editingStanowisko ? editingStanowisko.opis : nowe.opis}
                    onChange={editingStanowisko ? handleZmienEditing : handleZmienNowe}
                    placeholder="Opis stanowiska..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingStanowisko ? 'Zapisz zmiany' : 'Dodaj stanowisko'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingStanowisko(null);
                setNowe(PUSTA);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Functions Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Stanowisko
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredStanowiska.map(stanowisko => (
              <tr key={stanowisko.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon purple">
                      {(stanowisko.nazwa || 'ST').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {stanowisko.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {stanowisko.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="product-notes">
                    {stanowisko.opis || 'Brak opisu'}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(stanowisko)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(stanowiska.findIndex(s => s === stanowisko))}
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
        
        {sortedAndFilteredStanowiska.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono stanowisk spełniających kryteria wyszukiwania' : 'Brak stanowisk do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć stanowisko "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
    </div>
  );
};

export default ListaStanowisk; 