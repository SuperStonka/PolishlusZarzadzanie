import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, X, Search, Plus, Flower, ChevronUp, ChevronDown, Upload, Save } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';

interface Kwiat {
  id: number;
  nazwa: string;
  odmiana: string;
  kolor: string;
  wysokosc: number;
  cena: number;
  zdjecie: string;
  dostawcaId: string;
}

interface Dostawca {
  id: string;
  nazwa: string;
  telefon?: string;
  mail?: string;
  czyFirma?: boolean;
  nazwaFirmy?: string;
  ulica?: string;
  kodPocztowy?: string;
  miasto?: string;
  nip?: string;
}

const PUSTY: Kwiat = {
  id: 0,
  nazwa: "",
  odmiana: "",
  kolor: "",
  wysokosc: 0,
  cena: 0,
  zdjecie: "",
  dostawcaId: ""
};

const ListaKwiatow: React.FC = () => {
  const [kwiaty, setKwiaty] = useState<Kwiat[]>([]);
  const [dostawcy, setDostawcy] = useState<Dostawca[]>([]);
  const [nowy, setNowy] = useState<Kwiat>(PUSTY);
  const [editingKwiat, setEditingKwiat] = useState<Kwiat | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemIndex: number;
    itemName: string;
  }>({ isOpen: false, itemIndex: -1, itemName: "" });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Kwiat | null;
    direction: 'asc' | 'desc';
  }>({ key: 'nazwa', direction: 'asc' });

  // Sortowanie i filtrowanie
  const sortedAndFilteredKwiaty = useMemo(() => {
    let filtered = kwiaty;
    
    // Filtrowanie
    if (wyszukiwanie.trim()) {
      const szukany = wyszukiwanie.toLowerCase().trim();
      filtered = kwiaty.filter(kwiat => 
        kwiat.nazwa.toLowerCase().includes(szukany) ||
        kwiat.odmiana.toLowerCase().includes(szukany) ||
        kwiat.kolor.toLowerCase().includes(szukany) ||
        kwiat.dostawcaId.toLowerCase().includes(szukany) ||
        kwiat.cena.toString().includes(szukany)
      );
    }
    
    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
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
  }, [kwiaty, wyszukiwanie, sortConfig]);

  useEffect(() => {
    setLoading(true);
    fetch('/data/kwiaty.json')
      .then(response => response.json())
      .then(data => {
        setKwiaty(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching kwiaty:', error);
        setLoading(false);
      });
    fetch('/data/dostawcy-kwiatow.json')
      .then(res => res.json())
      .then(setDostawcy)
      .catch(() => setDostawcy([]));
  }, []);

  const handleSort = (key: keyof Kwiat) => {
    setSortConfig(prevConfig => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNowy(prev => ({
      ...prev,
      [name]: name === 'cena' || name === 'wysokosc' ? parseFloat(value) || 0 : value
    }));
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingKwiat) return;
    
    const { name, value } = e.target;
    setEditingKwiat(prev => ({
      ...prev!,
      [name]: name === 'cena' || name === 'wysokosc' ? parseFloat(value) || 0 : value
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

  const renderPodgladZdjecia = (zdjecie: string) => {
    if (!zdjecie) {
      return (
        <div className="brak-zdjecia">
          <Flower className="lucide-icon" size={24} color="#888" />
          <span>Brak zdjęcia</span>
        </div>
      );
    }
    return <img src={zdjecie} alt="Podgląd" className="podglad-zdjecia" />;
  };

  const handleEdit = (kwiat: Kwiat) => {
    setEditingKwiat(kwiat);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingKwiat) {
      setKwiaty(kwiaty.map(k => k.id === editingKwiat.id ? editingKwiat : k));
      setEditingKwiat(null);
      setShowAddForm(false);
    }
  };

  const handleAdd = () => {
    if (editingKwiat) {
      // Tryb edycji
      handleSave();
    } else {
      // Tryb dodawania
      if (nowy.nazwa && nowy.odmiana && nowy.kolor && nowy.cena > 0) {
        const kwiat: Kwiat = {
          id: Date.now(),
          nazwa: nowy.nazwa,
          odmiana: nowy.odmiana,
          kolor: nowy.kolor,
          wysokosc: nowy.wysokosc,
          cena: nowy.cena,
          zdjecie: nowy.zdjecie,
          dostawcaId: nowy.dostawcaId
        };
        setKwiaty([...kwiaty, kwiat]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleUsun = (index: number) => {
    const kwiat = kwiaty[index];
    setConfirmDialog({
      isOpen: true,
      itemIndex: index,
      itemName: kwiat.nazwa
    });
  };

  const confirmUsun = () => {
    if (confirmDialog.itemIndex >= 0) {
      setKwiaty(kwiaty.filter((_, idx) => idx !== confirmDialog.itemIndex));
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

              {/* Rząd 3: Kolor, Odmiana, Cena */}
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
                  <label className="form-label">Odmiana</label>
                  <input
                    type="text"
                    name="odmiana"
                    className="form-input"
                    value={editingKwiat ? editingKwiat.odmiana : nowy.odmiana}
                    onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                    placeholder="Odmiana kwiatu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 0.7 }}>
                  <label className="form-label">Cena (zł)</label>
                  <input
                    type="number"
                    name="cena"
                    className="form-input"
                    value={editingKwiat ? editingKwiat.cena : nowy.cena}
                    onChange={editingKwiat ? handleZmienEditing : handleZmienNowy}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Separator */}
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

              {/* Rząd 4: Nazwa dostawcy (pełna szerokość) */}
              <div className="form-group">
                <label className="form-label">Dostawca</label>
                <select
                  name="dostawcaId"
                  className="form-input"
                  value={editingKwiat ? editingKwiat.dostawcaId : nowy.dostawcaId}
                  onChange={e => {
                    if (editingKwiat) setEditingKwiat({ ...editingKwiat, dostawcaId: e.target.value });
                    else setNowy({ ...nowy, dostawcaId: e.target.value });
                  }}
                  required
                >
                  <option value="">Wybierz dostawcę</option>
                  {dostawcy.map(d => (
                    <option key={d.id} value={d.id}>{d.nazwa}</option>
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
                onClick={() => handleSort('odmiana')}
              >
                Odmiana
                <span className={`sort-icon ${sortConfig.key === 'odmiana' ? 'active' : ''}`}>
                  {sortConfig.key === 'odmiana' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'odmiana' && sortConfig.direction === 'desc' ? (
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
            ) : sortedAndFilteredKwiaty.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  {wyszukiwanie ? 'Nie znaleziono kwiatów spełniających kryteria wyszukiwania' : 'Brak kwiatów do wyświetlenia'}
                </td>
              </tr>
            ) : (
              sortedAndFilteredKwiaty.map((kwiat, index) => (
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
                  <td>{kwiat.odmiana}</td>
                  <td>
                    {kwiat.kolor || 'Brak koloru'}
                  </td>
                  <td>{kwiat.wysokosc} cm</td>
                  <td className="text-right font-weight-500">{kwiat.cena.toFixed(2)} zł</td>
                  <td>
                    {(() => {
                      const d = dostawcy.find(ds => ds.id === kwiat.dostawcaId);
                      return d ? (
                        <div className="firma-info">
                          <div className="firma-nazwa">{d.nazwa}</div>
                          {d.nazwaFirmy && <div className="firma-nazwa">{d.nazwaFirmy}</div>}
                          {d.ulica && <div className="firma-adres">{d.ulica}</div>}
                          {(d.kodPocztowy || d.miasto) && <div className="firma-adres">{d.kodPocztowy} {d.miasto}</div>}
                          {d.telefon && <div className="firma-adres">tel. {d.telefon}</div>}
                          {d.mail && <div className="firma-adres">{d.mail}</div>}
                          {d.nip && <div className="firma-nip">NIP: {d.nip}</div>}
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
                            setSelectedImage(kwiat.zdjecie);
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
                        onClick={() => handleUsun(index)}
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
        
        {sortedAndFilteredKwiaty.length === 0 && !loading && (
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
         message={`Czy na pewno chcesz usunąć kwiat "${confirmDialog.itemName}"?`}
         onConfirm={confirmUsun}
         onCancel={cancelUsun}
       />

      {/* Image Modal */}
      {showImageModal && (
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