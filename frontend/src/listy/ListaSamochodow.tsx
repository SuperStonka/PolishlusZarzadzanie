import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Car,
  ChevronUp,
  ChevronDown,
  Hash
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Samochod {
  id: number;
  model: string;
  numer_rejestracyjny: string;
  typ: string;
}

const ListaSamochodow: React.FC = () => {
  const [samochody, setSamochody] = useState<Samochod[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSamochod, setEditingSamochod] = useState<Samochod | null>(null);
  const [nowySamochod, setNowySamochod] = useState<Samochod>({ id: 0, model: '', numer_rejestracyjny: '', typ: '' });
  const [search, setSearch] = useState('');
  const [sortowanie, setSortowanie] = useState({ kolumna: 'id', kierunek: 'asc' as 'asc' | 'desc' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: -1, itemName: '' });

  useEffect(() => {
    loadSamochody();
  }, []);

  const loadSamochody = async () => {
    try {
      const response = await fetch('/data/samochody.json');
      const data = await response.json();
      setSamochody(data);
    } catch (error) {
      console.error('Błąd podczas ładowania samochodów:', error);
    }
  };

  const handleAddSamochod = () => {
    setEditingSamochod(null);
    setNowySamochod({ id: 0, model: '', numer_rejestracyjny: '', typ: '' });
    setShowModal(true);
  };

  const handleEditSamochod = (samochod: Samochod) => {
    setEditingSamochod(samochod);
    setNowySamochod({ ...samochod });
    setShowModal(true);
  };

  const handleSaveSamochod = () => {
    if (!nowySamochod.model.trim()) {
      alert('Model samochodu jest wymagany');
      return;
    }
    if (!nowySamochod.typ.trim()) {
      alert('Typ samochodu jest wymagany');
      return;
    }
    if (!nowySamochod.numer_rejestracyjny.trim()) {
      alert('Numer rejestracyjny jest wymagany');
      return;
    }

    if (editingSamochod) {
      // Edytuj istniejący
      setSamochody(prev => prev.map(samochod => 
        samochod.id === editingSamochod.id ? { ...nowySamochod, id: editingSamochod.id } : samochod
      ));
    } else {
      // Dodaj nowy
      const newId = Math.max(...samochody.map(s => s.id), 0) + 1;
      setSamochody(prev => [...prev, { ...nowySamochod, id: newId }]);
    }

    setShowModal(false);
    setEditingSamochod(null);
    setNowySamochod({ id: 0, model: '', numer_rejestracyjny: '', typ: '' });
  };

  const handleDeleteSamochod = (samochodId: number, samochodModel: string) => {
    setConfirmDialog({
      isOpen: true,
      itemId: samochodId,
      itemName: samochodModel
    });
  };

  const confirmDelete = () => {
    setSamochody(prev => prev.filter(samochod => samochod.id !== confirmDialog.itemId));
    setConfirmDialog({ isOpen: false, itemId: -1, itemName: '' });
  };

  const handleSort = (kolumna: string) => {
    setSortowanie(prev => ({
      kolumna,
      kierunek: prev.kolumna === kolumna && prev.kierunek === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (kolumna: string) => {
    if (sortowanie.kolumna !== kolumna) {
      return <ChevronUp size={16} />;
    }
    return sortowanie.kierunek === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const filteredSamochody = samochody
    .filter(samochod => 
      samochod.model.toLowerCase().includes(search.toLowerCase()) ||
      samochod.numer_rejestracyjny.toLowerCase().includes(search.toLowerCase()) ||
      samochod.typ.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortowanie.kolumna as keyof Samochod];
      const bValue = b[sortowanie.kolumna as keyof Samochod];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortowanie.kierunek === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortowanie.kierunek === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  return (
    <div>
      {/* Header */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Samochodów</div>
            <div className="card-subtitle">Zarządzanie flotą samochodową</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleAddSamochod}
            >
              <Plus size={16} />
              Dodaj samochód
            </button>
            <div className="card-icon">
              <Car size={24} />
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
                placeholder="Szukaj samochodów po modelu, typie lub numerze rejestracyjnym..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('id')}
              >
                ID
                <span className={`sort-icon ${sortowanie.kolumna === 'id' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'id' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'id' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('model')}
              >
                Samochód
                <span className={`sort-icon ${sortowanie.kolumna === 'model' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'model' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'model' && sortowanie.kierunek === 'desc' ? (
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
                <span className={`sort-icon ${sortowanie.kolumna === 'typ' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'typ' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'typ' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('numer_rejestracyjny')}
              >
                Numer rejestracyjny
                <span className={`sort-icon ${sortowanie.kolumna === 'numer_rejestracyjny' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'numer_rejestracyjny' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'numer_rejestracyjny' && sortowanie.kierunek === 'desc' ? (
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
            {filteredSamochody.map((samochod) => (
              <tr key={samochod.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon blue">
                      {(samochod.model || 'SA').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {samochod.model || 'Brak modelu'}
                      </div>
                      <div className="project-date">
                        ID: {samochod.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {samochod.model || 'Brak modelu'}
                </td>
                <td>
                  <span className="car-type-badge">
                    <Car size={12} />
                    {samochod.typ || 'Brak typu'}
                  </span>
                </td>
                <td>
                  <span className="car-plate-badge">
                    <Hash size={12} />
                    {samochod.numer_rejestracyjny || 'Brak numeru'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEditSamochod(samochod)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleDeleteSamochod(samochod.id, samochod.model)}
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
        
        {filteredSamochody.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {search ? 'Nie znaleziono samochodów spełniających kryteria wyszukiwania' : 'Brak samochodów do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSamochod ? 'Edytuj samochód' : 'Dodaj samochód'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Model samochodu *</label>
                <input
                  type="text"
                  className="form-input"
                  value={nowySamochod.model}
                  onChange={(e) => setNowySamochod({ ...nowySamochod, model: e.target.value })}
                  placeholder="np. Ford Transit"
                />
              </div>
              <div className="form-group">
                <label>Typ samochodu *</label>
                <select
                  className="form-input"
                  value={nowySamochod.typ}
                  onChange={(e) => setNowySamochod({ ...nowySamochod, typ: e.target.value })}
                >
                  <option value="">Wybierz typ samochodu</option>
                  <option value="Osobowy">Osobowy</option>
                  <option value="Dostawczy">Dostawczy</option>
                  <option value="Dostawczy z windą">Dostawczy z windą</option>
                  <option value="Plandeka">Plandeka</option>
                  <option value="Ciężarowy">Ciężarowy</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              <div className="form-group">
                <label>Numer rejestracyjny *</label>
                <input
                  type="text"
                  className="form-input"
                  value={nowySamochod.numer_rejestracyjny}
                  onChange={(e) => setNowySamochod({ ...nowySamochod, numer_rejestracyjny: e.target.value })}
                  placeholder="np. WA 12345"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveSamochod}>
                {editingSamochod ? 'Zapisz zmiany' : 'Dodaj samochód'}
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć samochód "${confirmDialog.itemName}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, itemId: -1, itemName: '' })}
      />
    </div>
  );
};

export default ListaSamochodow; 