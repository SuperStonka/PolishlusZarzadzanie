import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface KategoriaProduktow {
  id: number;
  nazwa: string;
}

const PUSTA: KategoriaProduktow = { id: 0, nazwa: "" };

const ListaKategoriiProduktow: React.FC = () => {
  console.log("ListaKategoriiProduktow: Renderowanie komponentu");
  const [kategorie, setKategorie] = useState<KategoriaProduktow[]>([]);
  const [nowa, setNowa] = useState<KategoriaProduktow>(PUSTA);
  const [editingKategoria, setEditingKategoria] = useState<KategoriaProduktow | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ""
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof KategoriaProduktow | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwa', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredKategorie = useMemo(() => {
    let filtered = kategorie;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = kategorie.filter(kategoria => 
        kategoria.nazwa.toLowerCase().includes(szukany)
      );
    }
    
    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue && bValue) {
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    
    return filtered;
  }, [kategorie, wyszukiwanie, sortConfig]);

  useEffect(() => {
    console.log("Ładowanie kategorii produktów...");
    fetch("/data/kategorieProduktow.json")
      .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Załadowane kategorie:", data);
        setKategorie(data);
      })
      .catch(err => {
        console.error("Błąd pobierania kategorii:", err);
        // Fallback - ustaw puste dane aby komponent się wyrenderował
        setKategorie([]);
      });
  }, []);

  const handleSort = (key: keyof KategoriaProduktow) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof KategoriaProduktow) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowa = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNowa({ ...nowa, [name]: value });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingKategoria) return;
    const { name, value } = e.target;
    setEditingKategoria({ ...editingKategoria, [name]: value });
  };

  const handleEdit = (kategoria: KategoriaProduktow) => {
    setEditingKategoria(kategoria);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingKategoria) {
      setKategorie(kategorie.map(k => k.id === editingKategoria.id ? editingKategoria : k));
      setEditingKategoria(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingKategoria) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowa.nazwa.trim()) {
        const kategoria: KategoriaProduktow = {
          id: Date.now(),
          nazwa: nowa.nazwa.trim()
        };
        setKategorie([...kategorie, kategoria]);
        setNowa(PUSTA);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const kategoria = kategorie[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: kategoria.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setKategorie(kategorie.filter((_, idx) => idx !== confirmDialog.itemIndex));
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
            <div className="card-title">Lista Kategorii Produktów</div>
            <div className="card-subtitle">Zarządzanie kategoriami i klasyfikacją produktów</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingKategoria(null);
                setNowa(PUSTA);
              }}
            >
              <Plus size={16} />
              Dodaj kategorię
            </button>
            <div className="card-icon">
              <Tag size={24} />
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
                placeholder="Szukaj kategorii po nazwie..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingKategoria ? 'Edytuj kategorię' : 'Dodaj nową kategorię'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingKategoria(null);
                  setNowa(PUSTA);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwa kategorii</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingKategoria ? editingKategoria.nazwa : nowa.nazwa}
                    onChange={editingKategoria ? handleZmienEditing : handleZmienNowa}
                    placeholder="Nazwa kategorii"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingKategoria ? 'Zapisz zmiany' : 'Dodaj kategorię'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingKategoria(null);
                setNowa(PUSTA);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Kategoria
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

              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredKategorie.map(kategoria => (
              <tr key={kategoria.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon orange">
                      {(kategoria.nazwa || 'KA').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {kategoria.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {kategoria.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(kategoria)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(kategorie.findIndex(k => k === kategoria))}
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
        
        {sortedAndFilteredKategorie.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono kategorii spełniających kryteria wyszukiwania' : 'Brak kategorii do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć kategorię "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
    </div>
  );
};

export default ListaKategoriiProduktow; 