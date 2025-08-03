import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Upload, X, Package, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';

interface Produkt {
  id: number;
  kod_produktu: string;
  nazwa: string;
  kategoria: string;
  ilosc: number;
  zdjecie?: string;
  uwagi?: string;
}

const PUSTY: Produkt = {
  id: 0,
  kod_produktu: '',
  nazwa: '',
  kategoria: '',
  ilosc: 0,
  zdjecie: '',
  uwagi: ''
};

const ListaProduktow: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [kategoriaFilter, setKategoriaFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProdukt, setEditingProdukt] = useState<Produkt | null>(null);
  const [nowy, setNowy] = useState<Produkt>(PUSTY);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    produktId: -1,
    produktNazwa: ''
  });
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Produkt | null;
    direction: 'asc' | 'desc';
  }>({ key: 'kod_produktu', direction: 'asc' });

  useEffect(() => {
    loadProdukty();
  }, []);

  const loadProdukty = async () => {
    try {
      const response = await fetch('/data/produkty.json');
      const data = await response.json();
      setProdukty(data);
    } catch (error) {
      console.error('Błąd podczas ładowania produktów:', error);
    }
  };

  const filteredProdukty = produkty.filter(produkt => {
    const matchesSearch = (produkt.nazwa || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
                         (produkt.kategoria || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
                         (produkt.kod_produktu || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
                         (produkt.uwagi || '').toLowerCase().includes(wyszukiwanie.toLowerCase());
    
    const matchesCategory = !kategoriaFilter || (produkt.kategoria || '') === kategoriaFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProdukty = [...filteredProdukty].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const handleSort = (key: keyof Produkt) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const handleAdd = () => {
    if (editingProdukt) {
      // Tryb edycji
      setProdukty(produkty.map(p => p.id === editingProdukt.id ? editingProdukt : p));
      setEditingProdukt(null);
      setShowAddForm(false);
    } else {
      // Tryb dodawania
             if (nowy.nazwa && nowy.kategoria && nowy.kod_produktu) {
         const produkt: Produkt = {
           ...nowy,
           id: Date.now()
         };
        setProdukty([...produkty, produkt]);
        setNowy(PUSTY);
        setShowAddForm(false);
      }
    }
  };

  const handleEdit = (produkt: Produkt) => {
    setEditingProdukt(produkt);
    setNowy(produkt);
    setShowAddForm(true);
  };

  const handleDelete = (id: number, nazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      produktId: id,
      produktNazwa: nazwa
    });
  };

  const confirmDelete = () => {
    if (confirmDialog.produktId >= 0) {
      setProdukty(produkty.filter(p => p.id !== confirmDialog.produktId));
    }
    setConfirmDialog({ isOpen: false, produktId: -1, produktNazwa: '' });
  };

  const handleImageUpload = (file: File, isEditing: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (isEditing && editingProdukt) {
        setEditingProdukt({ ...editingProdukt, zdjecie: imageData });
      } else {
        setNowy({ ...nowy, zdjecie: imageData });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleZmienNowy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNowy(prev => ({ ...prev, [name]: value }));
  };

  const handleZmienEditing = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingProdukt) {
      setEditingProdukt(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Produktów</div>
            <div className="card-subtitle">Zarządzanie produktami i kategoriami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingProdukt(null);
                setNowy(PUSTY);
              }}
            >
              <Plus size={16} />
              Dodaj produkt
            </button>
            <div className="card-icon">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="d-flex justify-between align-center mb-3">
          <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
            <div className="search-container" style={{ flex: 2 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Szukaj produktów po nazwie, kodzie, kategorii lub uwagach..."
                value={wyszukiwanie}
                onChange={(e) => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <select
                className="form-select"
                value={kategoriaFilter}
                onChange={(e) => setKategoriaFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="">Wszystkie kategorie</option>
                <option value="Ceramika">Ceramika</option>
                <option value="Szkło">Szkło</option>
                <option value="Metal">Metal</option>
                <option value="Dekoracje">Dekoracje</option>
                <option value="Naturalne">Naturalne</option>
                <option value="Porcelana">Porcelana</option>
                <option value="Plastik">Plastik</option>
                <option value="Beton">Beton</option>
                <option value="Drewno">Drewno</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProdukt ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProdukt(null);
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
                  {(editingProdukt ? editingProdukt.zdjecie : nowy.zdjecie) ? (
                  <div className="image-preview-container">
                    <img 
                        src={editingProdukt ? editingProdukt.zdjecie : nowy.zdjecie} 
                      alt="Podgląd" 
                      className="image-preview-small"
                    />
                    <button
                      type="button"
                      className="btn-icon remove-image-btn"
                      onClick={() => {
                        if (editingProdukt) {
                          setEditingProdukt({ ...editingProdukt, zdjecie: '' });
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, !!editingProdukt);
                      }}
                      style={{ display: 'none' }}
                      id="new-product-image-upload"
                    />
                    <label htmlFor="new-product-image-upload" className="btn btn-secondary btn-small">
                      +
                    </label>
                  </div>
                )}
              </div>
            </div>

              {/* Rząd 2: Kod, Kategoria, Ilość */}
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kod produktu</label>
                  <input
                    type="text"
                    name="kod_produktu"
                    className="form-input"
                    value={editingProdukt ? editingProdukt.kod_produktu : nowy.kod_produktu}
                    onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                    placeholder="Kod produktu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kategoria</label>
                  <select
                    name="kategoria"
                    className="form-select"
                    value={editingProdukt ? editingProdukt.kategoria : nowy.kategoria}
                    onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                  >
                    <option value="">Wybierz kategorie</option>
                    <option value="Ceramika">Ceramika</option>
                    <option value="Szkło">Szkło</option>
                    <option value="Metal">Metal</option>
                    <option value="Dekoracje">Dekoracje</option>
                    <option value="Naturalne">Naturalne</option>
                    <option value="Porcelana">Porcelana</option>
                    <option value="Plastik">Plastik</option>
                    <option value="Beton">Beton</option>
                    <option value="Drewno">Drewno</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Ilość</label>
                  <input
                    type="number"
                    name="ilosc"
                    className="form-input"
                    value={editingProdukt ? editingProdukt.ilosc : nowy.ilosc}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingProdukt) {
                        setEditingProdukt({ ...editingProdukt, ilosc: value });
                      } else {
                        setNowy({ ...nowy, ilosc: value });
                      }
                    }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Rząd 3: Nazwa (pełna szerokość) */}
              <div className="form-group">
                <label className="form-label">Nazwa produktu</label>
                <input
                  type="text"
                  name="nazwa"
                  className="form-input"
                  value={editingProdukt ? editingProdukt.nazwa : nowy.nazwa}
                  onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                  placeholder="Nazwa produktu"
                />
              </div>

              {/* Rząd 4: Uwagi (pełna szerokość) */}
              <div className="form-group">
                <label className="form-label">Uwagi</label>
                <textarea
                  name="uwagi"
                  className="form-textarea"
                  value={editingProdukt ? editingProdukt.uwagi : nowy.uwagi}
                  onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                  placeholder="Dodatkowe uwagi o produkcie..."
                  rows={3}
                />
          </div>
          
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editingProdukt ? 'Zapisz zmiany' : 'Dodaj produkt'}
              </button>
              <button className="btn" onClick={() => {
                setShowAddForm(false);
                setEditingProdukt(null);
                setNowy(PUSTY);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('kod_produktu')}
              >
                Kod produktu
                <span className={`sort-icon ${sortConfig.key === 'kod_produktu' ? 'active' : ''}`}>
                  {sortConfig.key === 'kod_produktu' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'kod_produktu' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('nazwa')}
              >
                Nazwa
                <span className={`sort-icon ${sortConfig.key === 'nazwa' ? 'active' : ''}`}>
                  {sortConfig.key === 'nazwa' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'nazwa' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('kategoria')}
              >
                Kategoria
                <span className={`sort-icon ${sortConfig.key === 'kategoria' ? 'active' : ''}`}>
                  {sortConfig.key === 'kategoria' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'kategoria' && sortConfig.direction === 'desc' ? (
                    <ChevronDown size={16} />
                  ) : (
                    <>
                      <ChevronUp size={16} />
                      <ChevronDown size={16} />
                    </>
                  )}
                </span>
              </th>
              <th>Zdjęcie</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('ilosc')}
              >
                Ilość
                <span className={`sort-icon ${sortConfig.key === 'ilosc' ? 'active' : ''}`}>
                  {sortConfig.key === 'ilosc' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'ilosc' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('uwagi')}
              >
                Uwagi
                <span className={`sort-icon ${sortConfig.key === 'uwagi' ? 'active' : ''}`}>
                  {sortConfig.key === 'uwagi' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'uwagi' && sortConfig.direction === 'desc' ? (
                    <ChevronDown size={16} />
                  ) : (
                    <>
                      <ChevronUp size={16} />
                      <ChevronDown size={16} />
                    </>
                  )}
                </span>
              </th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedProdukty.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {wyszukiwanie || kategoriaFilter ? 'Brak produktów spełniających kryteria wyszukiwania' : 'Brak produktów'}
                </td>
              </tr>
            ) : (
              sortedProdukty.map(produkt => (
              <tr key={produkt.id}>
                <td>
                  {produkt.kod_produktu || 'Brak kodu'}
                </td>
                <td>
                  <div className="project-info">
                    <div className="project-icon purple">
                      {(produkt.nazwa || 'PR').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {produkt.nazwa || 'Brak nazwy'}
                      </div>
                      <div className="project-date">
                        ID: {produkt.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {produkt.kategoria || 'Brak kategorii'}
                </td>
                <td>
                  <div className="product-image-container">
                    {produkt.zdjecie ? (
                      <img 
                        src={produkt.zdjecie} 
                        alt={produkt.nazwa || 'Produkt'} 
                        className="product-image"
                        onClick={() => setImageModal({
                          isOpen: true,
                          imageSrc: produkt.zdjecie!,
                          imageAlt: produkt.nazwa || 'Produkt'
                        })}
                        title="Kliknij aby powiększyć"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <Upload size={16} />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  {produkt.ilosc || 0}
                </td>
                <td>
                    <div className="product-notes" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={produkt.uwagi || ''}>
                    {produkt.uwagi || 'Brak uwag'}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(produkt)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleDelete(produkt.id, produkt.nazwa || '')}
                      title="Usuń"
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
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć produkt "${confirmDialog.produktNazwa}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, produktId: -1, produktNazwa: '' })}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
        onClose={() => setImageModal({ isOpen: false, imageSrc: '', imageAlt: '' })}
      />
    </div>
  );
};

export default ListaProduktow; 