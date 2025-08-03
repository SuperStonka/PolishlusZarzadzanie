import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Etap {
  id: number;
  nazwa: string;
  opis: string;
}

const PUSTY: Etap = { id: 0, nazwa: '', opis: '' };

const ListaEtapow: React.FC = () => {
  const [etapy, setEtapy] = useState<Etap[]>([]);
  const [editingEtap, setEditingEtap] = useState<Etap | null>(null);
  const [nowy, setNowy] = useState<Etap>(PUSTY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemIndex: -1,
    itemName: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Etap | null;
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredEtapy = useMemo(() => {
    let filtered = etapy;
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = etapy.filter(etap =>
        etap.nazwa.toLowerCase().includes(szukany) ||
        etap.opis.toLowerCase().includes(szukany)
      );
    }
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [etapy, wyszukiwanie, sortConfig]);

  useEffect(() => {
    fetch('/data/etapy.json')
      .then(res => res.json())
      .then(data => setEtapy(data))
      .catch(err => console.error('Błąd pobierania etapów:', err));
  }, []);

  const handleSort = (key: keyof Etap) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Etap) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNowy({ ...nowy, [name]: value });
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingEtap) return;
    const { name, value } = e.target;
    setEditingEtap({ ...editingEtap, [name]: value });
  };

  const handleEdit = (etap: Etap) => {
    setEditingEtap(etap);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingEtap) {
      setEtapy(etapy.map(e => e.id === editingEtap.id ? editingEtap : e));
      setEditingEtap(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingEtap) {
      handleSave();
    } else {
      if (nowy.nazwa) {
        const etap: Etap = {
          id: Date.now(),
          nazwa: nowy.nazwa,
          opis: nowy.opis
        };
        setEtapy([...etapy, etap]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const etap = etapy[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: etap.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setEtapy(etapy.filter((_, idx) => idx !== confirmDialog.itemIndex));
    }
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: '' });
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, itemIndex: -1, itemName: '' });
  };

  return (
    <div>
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Etapów</div>
            <div className="card-subtitle">Zarządzanie etapami eventów</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingEtap(null);
                setNowy(PUSTY);
              }}
            >
              <Plus size={16} />
              Dodaj etap
            </button>
          </div>
        </div>
        <div className="d-flex justify-between align-center mb-3">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Szukaj etapów po nazwie lub opisie..."
              value={wyszukiwanie}
              onChange={(e) => setWyszukiwanie(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingEtap ? 'Edytuj etap' : 'Dodaj nowy etap'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEtap(null);
                  setNowy(PUSTY);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Nazwa etapu</label>
                  <input
                    type="text"
                    className="form-input"
                    name="nazwa"
                    value={editingEtap ? editingEtap.nazwa : nowy.nazwa}
                    onChange={editingEtap ? handleZmienEditing : handleZmienNowy}
                    placeholder="Nazwa etapu"
                  />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Opis</label>
                  <textarea
                    className="form-textarea"
                    name="opis"
                    value={editingEtap ? editingEtap.opis : nowy.opis}
                    onChange={editingEtap ? handleZmienEditing : handleZmienNowy}
                    placeholder="Opis etapu..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingEtap ? 'Zapisz zmiany' : 'Dodaj etap'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingEtap(null);
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
              <th className="sortable-header" onClick={() => handleSort('id')}>ID
                <span className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`}>{getSortIcon('id')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('nazwa')}>Etap
                <span className={`sort-icon ${sortConfig.key === 'nazwa' ? 'active' : ''}`}>{getSortIcon('nazwa')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('opis')}>Opis
                <span className={`sort-icon ${sortConfig.key === 'opis' ? 'active' : ''}`}>{getSortIcon('opis')}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredEtapy.map(etap => (
              <tr key={etap.id}>
                <td>{etap.id}</td>
                <td>
                  <div className="project-info">
                    <div className="project-icon orange">
                      {(etap.nazwa || 'ET').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {etap.nazwa || 'Brak nazwy'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{etap.opis || 'Brak opisu'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(etap)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsun(etapy.findIndex(e => e === etap))}
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
        {sortedAndFilteredEtapy.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono etapów spełniających kryteria wyszukiwania' : 'Brak etapów do wyświetlenia'}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć etap "${confirmDialog.itemName}"?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />
    </div>
  );
};

export default ListaEtapow; 