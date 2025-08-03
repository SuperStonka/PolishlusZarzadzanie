import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  Car,
  User,
  Phone,
  Building,
  X
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface TypKosztu {
  id: number;
  nazwa: string;
  powiazanie: string; // 'samochod', 'pracownik', 'kontakt', 'wypozyczalnia', 'brak'
  jednostka: string; // 'szt.', 'l.', 'kg'
}

const ListaTypowKosztow: React.FC = () => {
  const [typyKosztow, setTypyKosztow] = useState<TypKosztu[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTypKosztu, setEditingTypKosztu] = useState<TypKosztu | null>(null);
  const [nowyTypKosztu, setNowyTypKosztu] = useState<TypKosztu>({ id: 0, nazwa: '', powiazanie: 'brak', jednostka: 'szt.' });
  const [search, setSearch] = useState('');
  const [sortowanie, setSortowanie] = useState({ kolumna: 'id', kierunek: 'asc' as 'asc' | 'desc' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: -1, itemName: '' });

  useEffect(() => {
    loadTypyKosztow();
  }, []);

  const loadTypyKosztow = async () => {
    try {
      const response = await fetch('/data/typy-kosztow.json');
      const data = await response.json();
      setTypyKosztow(data);
    } catch (error) {
      console.error('Błąd podczas ładowania typów kosztów:', error);
    }
  };

  const handleAddTypKosztu = () => {
    setEditingTypKosztu(null);
    setNowyTypKosztu({ id: 0, nazwa: '', powiazanie: 'brak', jednostka: 'szt.' });
    setShowModal(true);
  };

  const handleEditTypKosztu = (typKosztu: TypKosztu) => {
    setEditingTypKosztu(typKosztu);
    setNowyTypKosztu({ ...typKosztu });
    setShowModal(true);
  };

  const handleSaveTypKosztu = () => {
    if (!nowyTypKosztu.nazwa.trim()) {
      alert('Nazwa typu kosztu jest wymagana');
      return;
    }

    if (editingTypKosztu) {
      // Edytuj istniejący
      setTypyKosztow(prev => prev.map(typ => 
        typ.id === editingTypKosztu.id ? { ...nowyTypKosztu, id: editingTypKosztu.id } : typ
      ));
    } else {
      // Dodaj nowy
      const newId = Math.max(...typyKosztow.map(t => t.id), 0) + 1;
      setTypyKosztow(prev => [...prev, { ...nowyTypKosztu, id: newId }]);
    }

    setShowModal(false);
    setEditingTypKosztu(null);
    setNowyTypKosztu({ id: 0, nazwa: '', powiazanie: 'brak', jednostka: 'szt.' });
  };

  const handleDeleteTypKosztu = (typKosztuId: number, typKosztuNazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      itemId: typKosztuId,
      itemName: typKosztuNazwa
    });
  };

  const confirmDelete = () => {
    setTypyKosztow(prev => prev.filter(typ => typ.id !== confirmDialog.itemId));
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
      return <DollarSign size={16} />;
    }
    return sortowanie.kierunek === 'asc' ? <DollarSign size={16} /> : <DollarSign size={16} />;
  };

  const getPowiazanieColor = (powiazanie: string) => {
    switch (powiazanie) {
      case 'samochod':
        return 'powiazanie-samochod';
      case 'pracownik':
        return 'powiazanie-pracownik';
      case 'kontakt':
        return 'powiazanie-kontakt';
      case 'wypozyczalnia':
        return 'powiazanie-wypozyczalnia';
      default:
        return 'powiazanie-brak';
    }
  };

  const getPowiazanieIcon = (powiazanie: string) => {
    switch (powiazanie) {
      case 'samochod':
        return <Car size={12} />;
      case 'pracownik':
        return <User size={12} />;
      case 'kontakt':
        return <Phone size={12} />;
      case 'wypozyczalnia':
        return <Building size={12} />;
      default:
        return <X size={12} />;
    }
  };

  const getPowiazanieLabel = (powiazanie: string) => {
    switch (powiazanie) {
      case 'samochod':
        return 'Samochód';
      case 'pracownik':
        return 'Pracownik';
      case 'kontakt':
        return 'Kontakt';
      case 'wypozyczalnia':
        return 'Wypożyczalnia';
      default:
        return 'Brak';
    }
  };

  const filteredTypyKosztow = typyKosztow
    .filter(typ => typ.nazwa.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortowanie.kolumna as keyof TypKosztu];
      const bValue = b[sortowanie.kolumna as keyof TypKosztu];
      
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
            <div className="card-title">Lista Typów Kosztów</div>
            <div className="card-subtitle">Zarządzanie typami kosztów w systemie</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleAddTypKosztu}
            >
              <Plus size={16} />
              Dodaj typ kosztu
            </button>
            <div className="card-icon">
              <DollarSign size={24} />
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
                placeholder="Szukaj typów kosztów po nazwie..."
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
                onClick={() => handleSort('nazwa')}
              >
                Typ Kosztu
                <span className={`sort-icon ${sortowanie.kolumna === 'nazwa' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'nazwa' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'nazwa' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('powiazanie')}
              >
                Powiązanie
                <span className={`sort-icon ${sortowanie.kolumna === 'powiazanie' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'powiazanie' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'powiazanie' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('jednostka')}
              >
                Jednostka
                <span className={`sort-icon ${sortowanie.kolumna === 'jednostka' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'jednostka' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'jednostka' && sortowanie.kierunek === 'desc' ? (
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
            {filteredTypyKosztow.map((typKosztu) => (
              <tr key={typKosztu.id}>
                <td>
                  <div className="project-info">
                    <div className="project-icon orange">
                      {(typKosztu.nazwa || 'TK').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {typKosztu.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {typKosztu.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {typKosztu.nazwa || 'Brak nazwy'}
                </td>
                <td>
                  <span className={`powiazanie-badge ${getPowiazanieColor(typKosztu.powiazanie)}`}>
                    {getPowiazanieIcon(typKosztu.powiazanie)}
                    {getPowiazanieLabel(typKosztu.powiazanie)}
                  </span>
                </td>
                <td>
                  <span className="jednostka-badge">
                    {typKosztu.jednostka || 'szt.'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEditTypKosztu(typKosztu)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleDeleteTypKosztu(typKosztu.id, typKosztu.nazwa)}
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
        
        {filteredTypyKosztow.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {search ? 'Nie znaleziono typów kosztów spełniających kryteria wyszukiwania' : 'Brak typów kosztów do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTypKosztu ? 'Edytuj typ kosztu' : 'Dodaj typ kosztu'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nazwa typu kosztu *</label>
                <input
                  type="text"
                  className="form-input"
                  value={nowyTypKosztu.nazwa}
                  onChange={(e) => setNowyTypKosztu({ ...nowyTypKosztu, nazwa: e.target.value })}
                  placeholder="Wprowadź nazwę typu kosztu"
                />
              </div>
              <div className="form-group">
                <label>Powiązanie</label>
                <select
                  className="form-input"
                  value={nowyTypKosztu.powiazanie}
                  onChange={(e) => setNowyTypKosztu({ ...nowyTypKosztu, powiazanie: e.target.value })}
                >
                  <option value="brak">Brak powiązania</option>
                  <option value="samochod">Samochód</option>
                  <option value="pracownik">Pracownik</option>
                  <option value="kontakt">Kontakt</option>
                  <option value="wypozyczalnia">Wypożyczalnia</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jednostka</label>
                <select
                  className="form-input"
                  value={nowyTypKosztu.jednostka}
                  onChange={(e) => setNowyTypKosztu({ ...nowyTypKosztu, jednostka: e.target.value })}
                >
                  <option value="szt.">Sztuki</option>
                  <option value="l.">Litry</option>
                  <option value="kg">Kilogramy</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveTypKosztu}>
                {editingTypKosztu ? 'Zapisz zmiany' : 'Dodaj typ kosztu'}
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
        message={`Czy na pewno chcesz usunąć typ kosztu "${confirmDialog.itemName}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, itemId: -1, itemName: '' })}
      />
    </div>
  );
};

export default ListaTypowKosztow; 