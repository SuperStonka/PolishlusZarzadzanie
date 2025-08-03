import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronUp, ChevronDown, Flower, X, Upload, Save } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';

interface Kwiat {
  id: number;
  nazwa: string;
  kolor: string;
  cena: number;
  dostawca_id: number;
  wysokosc?: number;
  zdjecie?: string;
}

interface DostawcaKwiatow {
  id: number;
  nazwa: string;
  telefon: string;
  email: string;
  adres: string;
}

const PUSTY: Kwiat = {
  id: 0,
  nazwa: '',
  kolor: '',
  cena: 0,
  dostawca_id: 0,
  wysokosc: 0,
  zdjecie: ''
};

const ListaKwiatow: React.FC = () => {
  const [kwiaty, setKwiaty] = useState<Kwiat[]>([]);
  const [dostawcy, setDostawcy] = useState<DostawcaKwiatow[]>([]);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Kwiat; direction: 'asc' | 'desc' }>({ key: 'nazwa', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [nowy, setNowy] = useState(PUSTY);
  const [editingKwiat, setEditingKwiat] = useState<Kwiat | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; kwiatId: number; kwiatNazwa: string }>({ isOpen: false, kwiatId: 0, kwiatNazwa: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [kwiatyData, dostawcyData] = await Promise.all([
        api.getFlowers(),
        api.get('/dostawcy-kwiatow') // Assuming this endpoint exists
      ]);
      
      setKwiaty(kwiatyData as Kwiat[]);
      setDostawcy(dostawcyData as DostawcaKwiatow[]);
      
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
      setError("Nie udało się pobrać danych. Sprawdź połączenie z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  const filteredKwiaty = kwiaty.filter(kwiat =>
    kwiat.nazwa.toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
    kwiat.kolor.toLowerCase().includes(wyszukiwanie.toLowerCase())
  );

  const sortedKwiaty = [...filteredKwiaty].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
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

  const handleSort = (key: keyof Kwiat) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAdd = async () => {
    if (editingKwiat) {
      // Tryb edycji
      try {
        await api.updateFlower(editingKwiat.id, editingKwiat);
        await loadData(); // Reload data from server
        setEditingKwiat(null);
        setShowAddForm(false);
      } catch (error) {
        console.error('Błąd podczas aktualizacji kwiatu:', error);
        setError("Nie udało się zaktualizować kwiatu.");
      }
    } else {
      // Tryb dodawania
      if (nowy.nazwa && nowy.kolor && nowy.dostawca_id) {
        try {
          await api.createFlower(nowy);
          await loadData(); // Reload data from server
          setNowy(PUSTY);
          setShowAddForm(false);
        } catch (error) {
          console.error('Błąd podczas dodawania kwiatu:', error);
          setError("Nie udało się dodać kwiatu.");
        }
      }
    }
  };

  const handleEdit = (kwiat: Kwiat) => {
    setEditingKwiat(kwiat);
    setNowy(kwiat);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number, nazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      kwiatId: id,
      kwiatNazwa: nazwa
    });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteFlower(confirmDialog.kwiatId);
      await loadData(); // Reload data from server
      setConfirmDialog({ isOpen: false, kwiatId: 0, kwiatNazwa: '' });
    } catch (error) {
      console.error('Błąd podczas usuwania kwiatu:', error);
      setError("Nie udało się usunąć kwiatu.");
    }
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNowy(prev => ({
      ...prev,
      [name]: name === 'cena' || name === 'wysokosc' || name === 'dostawca_id' ? parseFloat(value) || 0 : value
    }));
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingKwiat) return;
    
    const { name, value } = e.target;
    setEditingKwiat(prev => ({
      ...prev!,
      [name]: name === 'cena' || name === 'wysokosc' || name === 'dostawca_id' ? parseFloat(value) || 0 : value
    }));
  };

  const handleZdjecieChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isEditing && editingKwiat) {
          setEditingKwiat({ ...editingKwiat, zdjecie: result });
        } else {
          setNowy({ ...nowy, zdjecie: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Ładowanie kwiatów...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadData} className="btn btn-primary">Spróbuj ponownie</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Kwiatów</div>
            <div className="card-subtitle">Zarządzanie kwiatami i ich kategoriami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingKwiat(null);
                setNowy(PUSTY);
              }}
            >
              <Plus size={16} />
              Dodaj kwiat
            </button>
            <div className="card-icon">
              <Flower size={24} />
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
                placeholder="Szukaj kwiatów po nazwie, kategorii lub kolorze..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Flower Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingKwiat ? 'Edytuj kwiat' : 'Dodaj nowy kwiat'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingKwiat(null);
                  setNowy(PUSTY);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              
              {/* Rząd 1: Zdjęcie */}
              <div className="form-group">
                <label className="form-label">Zdjęcie</label>
                <div className="image-upload-container">
                  {(editingKwiat ? editingKwiat.zdjecie : nowy.zdjecie) ? (
                    <div className="image-preview-container">
                      <img 
                        src={editingKwiat ? editingKwiat.zdjecie : nowy.zdjecie} 
                        alt="Podgląd" 
                        className="image-preview-small"
                      />
                      <button
                        type="button"
                        className="btn-icon remove-image-btn"
                        onClick={() => {
                          if (editingKwiat) {
                            setEditingKwiat({ ...editingKwiat, zdjecie: '' });
                          } else {
                            setNowy({ ...nowy, zdjecie: '' });
                          }
                        }}
                        title="Usuń zdjęcie"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder-small">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleZdjecieChange(e, !!editingKwiat)}
                        style={{ display: 'none' }}
                        id="new-kwiat-image-upload"
                      />
                      <label htmlFor="new-kwiat-image-upload" className="btn btn-secondary btn-small">
                        +
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Rząd 2: Nazwa (pełna szerokość) */}
              <div className="form-group">
                <label className="form-label">Nazwa kwiatu</label>
                <input
                  type="text"
                  name="nazwa"
                  className="form-input"
                  value={editingKwiat ? editingKwiat.nazwa : nowy.nazwa}
                  onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                  placeholder="Nazwa kwiatu"
                />
              </div>

              {/* Rząd 3: Kolor, Wysokość, Cena */}
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kolor</label>
                  <input
                    type="text"
                    name="kolor"
                    className="form-input"
                    value={editingKwiat ? editingKwiat.kolor : nowy.kolor}
                    onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                    placeholder="Kolor kwiatu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Wysokość (cm)</label>
                  <input
                    type="number"
                    name="wysokosc"
                    className="form-input"
                    value={editingKwiat ? editingKwiat.wysokosc || 0 : nowy.wysokosc || 0}
                    onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                    placeholder="Wysokość w cm"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Cena (zł)</label>
                  <input
                    type="number"
                    name="cena"
                    className="form-input"
                    value={editingKwiat ? editingKwiat.cena || 0 : nowy.cena || 0}
                    onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                    placeholder="Cena w zł"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Rząd 4: Dostawca */}
              <div className="form-group">
                <label className="form-label">Dostawca</label>
                <select
                  name="dostawca_id"
                  className="form-input"
                  value={editingKwiat ? editingKwiat.dostawca_id : nowy.dostawca_id}
                  onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                  required
                >
                  <option value="">Wybierz dostawcę</option>
                  {dostawcy.map(dostawca => (
                    <option key={dostawca.id} value={dostawca.id}>
                      {dostawca.nazwa}
                    </option>
                  ))}
                </select>
              </div>
              
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                <Save size={16} />
                {editingKwiat ? 'Zapisz zmiany' : 'Dodaj kwiat'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingKwiat(null);
                setNowy(PUSTY);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flowers Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Nazwa
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
                onClick={() => handleSort('kolor')}
              >
                Kolor
                <span className={`sort-icon ${sortConfig.key === 'kolor' ? 'active' : ''}`}>
                  {sortConfig.key === 'kolor' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'kolor' && sortConfig.direction === 'desc' ? (
                    <ChevronDown size={16} />
                  ) : (
                    <>
                      <ChevronUp size={16} />
                      <ChevronDown size={16} />
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('wysokosc')}
              >
                Wysokość (cm)
                <span className={`sort-icon ${sortConfig.key === 'wysokosc' ? 'active' : ''}`}>
                  {sortConfig.key === 'wysokosc' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'wysokosc' && sortConfig.direction === 'desc' ? (
                    <ChevronDown size={16} />
                  ) : (
                    <>
                      <ChevronUp size={16} />
                      <ChevronDown size={16} />
                    </>
                  )}
                </span>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('cena')}
              >
                Cena (zł)
                <span className={`sort-icon ${sortConfig.key === 'cena' ? 'active' : ''}`}>
                  {sortConfig.key === 'cena' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'cena' && sortConfig.direction === 'desc' ? (
                    <ChevronDown size={16} />
                  ) : (
                    <>
                      <ChevronUp size={16} />
                      <ChevronDown size={16} />
                    </>
                  )}
                </span>
              </th>
              <th>Dostawca</th>
              <th>Zdjęcie</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">Ładowanie...</td>
              </tr>
            ) : sortedKwiaty.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  {wyszukiwanie ? 'Nie znaleziono kwiatów spełniających kryteria wyszukiwania' : 'Brak kwiatów do wyświetlenia'}
                </td>
              </tr>
            ) : (
              sortedKwiaty.map((kwiat, index) => (
                <tr key={kwiat.id}>
                  <td>
                    <div className="project-info">
                      <div className="project-icon purple">
                        {(kwiat.nazwa || 'KW').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="project-details">
                        <div className="project-title">
                          {kwiat.nazwa || 'Brak nazwy'}
                        </div>
                        <div className="project-date">
                          ID: {kwiat.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {kwiat.kolor || 'Brak koloru'}
                  </td>
                  <td>{kwiat.wysokosc} cm</td>
                  <td className="text-right font-weight-500">{kwiat.cena.toFixed(2)} zł</td>
                  <td>
                    {(() => {
                      const d = dostawcy.find(ds => ds.id === kwiat.dostawca_id);
                      return d ? (
                        <div className="firma-info">
                          <div className="firma-nazwa">{d.nazwa}</div>
                          {d.adres && <div className="firma-adres">{d.adres}</div>}
                          {d.telefon && <div className="firma-adres">tel. {d.telefon}</div>}
                          {d.email && <div className="firma-adres">{d.email}</div>}
                        </div>
                      ) : <span className="no-firma">Brak</span>;
                    })()}
                  </td>
                  <td>
                    <div className="product-image-container">
                      {kwiat.zdjecie ? (
                        <img 
                          src={kwiat.zdjecie} 
                          alt={kwiat.nazwa || 'Kwiat'} 
                          className="product-image" 
                          onClick={() => {
                            setSelectedImage(kwiat.zdjecie || null);
                            setShowImageModal(true);
                          }}
                          title="Kliknij aby powiększyć"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <Flower size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-action-btn edit-btn" 
                        onClick={() => handleEdit(kwiat)}
                        title="Edytuj kwiat"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="table-action-btn delete-btn" 
                        onClick={() => handleDelete(kwiat.id, kwiat.nazwa)}
                        title="Usuń kwiat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {sortedKwiaty.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
            <div className="empty-state-text">
              {wyszukiwanie ? 'Nie znaleziono kwiatów spełniających kryteria wyszukiwania' : 'Brak kwiatów do wyświetlenia'}
            </div>
          </div>
        )}
      </div>

             {/* Confirm Dialog */}
       <ConfirmDialog
         isOpen={confirmDialog.isOpen}
         title="Potwierdź usunięcie"
         message={`Czy na pewno chcesz usunąć kwiat "${confirmDialog.kwiatNazwa}"?`}
         onConfirm={confirmDelete}
         onCancel={() => setConfirmDialog({ isOpen: false, kwiatId: 0, kwiatNazwa: '' })}
       />

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <ImageModal
          isOpen={showImageModal}
          imageSrc={selectedImage}
          imageAlt="Zdjecie kwiatu"
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default ListaKwiatow; 