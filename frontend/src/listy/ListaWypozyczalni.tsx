import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  Building,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface Wypozyczalnia {
  id: number;
  nazwa: string;
  telefon: string;
  email: string;
  adres: string;
}

const ListaWypozyczalni: React.FC = () => {
  const [wypozyczalnie, setWypozyczalnie] = useState<Wypozyczalnia[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWypozyczalnia, setEditingWypozyczalnia] = useState<Wypozyczalnia | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    wypozyczalniaId: -1,
    wypozyczalniaNazwa: ''
  });

  const [formData, setFormData] = useState({
    nazwa: '',
    telefon: '',
    email: '',
    adres: ''
  });

  const [sortowanie, setSortowanie] = useState({
    kolumna: 'nazwa',
    kierunek: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    loadWypozyczalnie();
  }, []);

  const loadWypozyczalnie = async () => {
    try {
      const response = await fetch('/data/wypozyczalnie.json');
      const data = await response.json();
      setWypozyczalnie(data);
    } catch (error) {
      console.error('Błąd ładowania wypożyczalni:', error);
      setWypozyczalnie([]);
    }
  };

  const handleAddWypozyczalnia = () => {
    setEditingWypozyczalnia(null);
    setFormData({
      nazwa: '',
      telefon: '',
      email: '',
      adres: ''
    });
    setShowModal(true);
  };

  const handleEditWypozyczalnia = (wypozyczalnia: Wypozyczalnia) => {
    setEditingWypozyczalnia(wypozyczalnia);
    setFormData({
      nazwa: wypozyczalnia.nazwa,
      telefon: wypozyczalnia.telefon,
      email: wypozyczalnia.email,
      adres: wypozyczalnia.adres
    });
    setShowModal(true);
  };

  const handleSaveWypozyczalnia = () => {
    if (!formData.nazwa.trim() || !formData.telefon.trim() || !formData.email.trim() || !formData.adres.trim()) {
      alert('Wszystkie pola są wymagane');
      return;
    }

    if (editingWypozyczalnia) {
      // Edycja istniejącej wypożyczalni
      const updatedWypozyczalnie = wypozyczalnie.map(w => 
        w.id === editingWypozyczalnia.id 
          ? { ...w, ...formData }
          : w
      );
      setWypozyczalnie(updatedWypozyczalnie);
    } else {
      // Dodanie nowej wypożyczalni
      const newWypozyczalnia: Wypozyczalnia = {
        id: Math.max(...wypozyczalnie.map(w => w.id), 0) + 1,
        ...formData
      };
      setWypozyczalnie([...wypozyczalnie, newWypozyczalnia]);
    }

    setShowModal(false);
    setFormData({ nazwa: '', telefon: '', email: '', adres: '' });
  };

  const handleDeleteWypozyczalnia = (wypozyczalniaId: number, wypozyczalniaNazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      wypozyczalniaId,
      wypozyczalniaNazwa
    });
  };

  const confirmDelete = () => {
    const updatedWypozyczalnie = wypozyczalnie.filter(w => w.id !== confirmDialog.wypozyczalniaId);
    setWypozyczalnie(updatedWypozyczalnie);
    setConfirmDialog({ isOpen: false, wypozyczalniaId: -1, wypozyczalniaNazwa: '' });
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

  const filteredWypozyczalnie = wypozyczalnie
    .filter(wypozyczalnia =>
      wypozyczalnia.nazwa.toLowerCase().includes(search.toLowerCase()) ||
      wypozyczalnia.telefon.includes(search) ||
      wypozyczalnia.email.toLowerCase().includes(search.toLowerCase()) ||
      wypozyczalnia.adres.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortowanie.kolumna as keyof Wypozyczalnia];
      const bValue = b[sortowanie.kolumna as keyof Wypozyczalnia];
      
      if (sortowanie.kierunek === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  return (
    <div className="dashboard-container">
      {/* Wymuszenie paddingu i marginesu jak w kontaktach */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Wypożyczalni</div>
            <div className="card-subtitle">Zarządzanie wypożyczalniami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button className="btn btn-primary" onClick={handleAddWypozyczalnia}>
              <Plus size={16} /> Dodaj wypożyczalnię
            </button>
            <div className="card-icon">
              <Building size={24} />
            </div>
          </div>
        </div>
        <div className="d-flex justify-between align-center mb-3">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Szukaj wypożyczalni..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      {/* Styl tylko dla tabeli, nie dla całej karty */}
      <style>{`
        .table {
          background: transparent !important;
        }
      `}</style>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable-header" onClick={() => handleSort('nazwa')}>
                Wypożyczalnia
                <span className={`sort-icon ${sortowanie.kolumna === 'nazwa' ? 'active' : ''}`}>{getSortIcon('nazwa')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('telefon')}>
                Telefon
                <span className={`sort-icon ${sortowanie.kolumna === 'telefon' ? 'active' : ''}`}>{getSortIcon('telefon')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('email')}>
                Email
                <span className={`sort-icon ${sortowanie.kolumna === 'email' ? 'active' : ''}`}>{getSortIcon('email')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('adres')}>
                Adres
                <span className={`sort-icon ${sortowanie.kolumna === 'adres' ? 'active' : ''}`}>{getSortIcon('adres')}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredWypozyczalnie.map((wypozyczalnia) => {
              // Generowanie inicjałów jak w kontaktach
              const words = wypozyczalnia.nazwa ? wypozyczalnia.nazwa.split(' ') : [];
              let initials = '';
              if (words.length === 1) {
                initials = words[0].substring(0, 2).toUpperCase();
              } else if (words.length > 1) {
                initials = words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
              } else {
                initials = 'WY';
              }
              return (
                <tr key={wypozyczalnia.id}>
                  <td>
                    <div className="project-info">
                      <div className="project-icon blue">
                        {initials}
                      </div>
                      <div className="project-details">
                        <div className="project-title">
                          {wypozyczalnia.nazwa || 'Brak nazwy'}
                        </div>
                        <div className="project-date">
                          ID: {wypozyczalnia.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{wypozyczalnia.telefon || 'Brak telefonu'}</td>
                  <td>{wypozyczalnia.email || 'Brak email'}</td>
                  <td>{wypozyczalnia.adres || 'Brak adresu'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action-btn edit-btn" onClick={() => handleEditWypozyczalnia(wypozyczalnia)} title="Edytuj"><Edit size={16} /></button>
                      <button className="table-action-btn delete-btn" onClick={() => handleDeleteWypozyczalnia(wypozyczalnia.id, wypozyczalnia.nazwa)} title="Usuń"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredWypozyczalnie.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {search ? 'Nie znaleziono wypożyczalni spełniających kryteria wyszukiwania' : 'Brak wypożyczalni do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingWypozyczalnia ? 'Edytuj wypożyczalnię' : 'Dodaj wypożyczalnię'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nazwa wypożyczalni *</label>
                <input
                  type="text"
                  value={formData.nazwa}
                  onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
                  placeholder="Wprowadź nazwę wypożyczalni"
                />
              </div>
              <div className="form-group">
                <label>Telefon *</label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  placeholder="Wprowadź numer telefonu"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Wprowadź adres email"
                />
              </div>
              <div className="form-group">
                <label>Adres *</label>
                <input
                  type="text"
                  value={formData.adres}
                  onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                  placeholder="Wprowadź adres"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Anuluj
              </button>
              <button className="btn btn-primary" onClick={handleSaveWypozyczalnia}>
                {editingWypozyczalnia ? 'Zapisz zmiany' : 'Dodaj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć wypożyczalnię "${confirmDialog.wypozyczalniaNazwa}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, wypozyczalniaId: -1, wypozyczalniaNazwa: '' })}
      />
    </div>
  );
};

export default ListaWypozyczalni; 