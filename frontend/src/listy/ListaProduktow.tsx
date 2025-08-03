import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronUp, ChevronDown, Package, X, Upload } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';

interface Produkt {
  id: number;
  kod: string;
  nazwa: string;
  kategoria_id: number;
  opis?: string;
  cena?: number;
  jednostka?: string;
  zdjecie?: string;
  ilosc?: number;
  uwagi?: string;
}

interface KategoriaProduktu {
  id: number;
  nazwa: string;
  opis?: string;
}

const PUSTY: Produkt = {
  id: 0,
  kod: '',
  nazwa: '',
  kategoria_id: 0,
  opis: '',
  cena: 0,
  jednostka: '',
  zdjecie: '',
  ilosc: 0,
  uwagi: ''
};

const ListaProduktow: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [kategorie, setKategorie] = useState<KategoriaProduktu[]>([]);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [kategoriaFilter, setKategoriaFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProdukt, setEditingProdukt] = useState<Produkt | null>(null);
  const [nowy, setNowy] = useState<Produkt>(PUSTY);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    produktId: number;
    produktNazwa: string;
  }>({ isOpen: false, produktId: 0, produktNazwa: '' });
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Produkt | null;
    direction: 'asc' | 'desc';
  }>({ key: 'kod', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [produktyData, kategorieData] = await Promise.all([
        api.getProducts(),
        api.get('/kategorie-produktow') // Assuming this endpoint exists
      ]);
      
      setProdukty(produktyData as Produkt[]);
      setKategorie(kategorieData as KategoriaProduktu[]);
      
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
      setError("Nie udało się pobrać danych. Sprawdź połączenie z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProdukty = produkty.filter(produkt => {
    const matchesSearch = (produkt.nazwa || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
                         (produkt.kod || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
                         (produkt.opis || '').toLowerCase().includes(wyszukiwanie.toLowerCase());
    
    const matchesCategory = !kategoriaFilter || produkt.kategoria_id.toString() === kategoriaFilter;
    
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

  const handleAdd = async () => {
    if (editingProdukt) {
      // Tryb edycji
      try {
        await api.updateProduct(editingProdukt.id, editingProdukt);
        await loadData(); // Reload data from server
        setEditingProdukt(null);
        setShowAddForm(false);
      } catch (error) {
        console.error('Błąd podczas aktualizacji produktu:', error);
        setError("Nie udało się zaktualizować produktu.");
      }
    } else {
      // Tryb dodawania
      if (nowy.nazwa && nowy.kod && nowy.kategoria_id) {
        try {
          await api.createProduct(nowy);
          await loadData(); // Reload data from server
          setNowy(PUSTY);
          setShowAddForm(false);
        } catch (error) {
          console.error('Błąd podczas dodawania produktu:', error);
          setError("Nie udało się dodać produktu.");
        }
      }
    }
  };

  const handleEdit = (produkt: Produkt) => {
    setEditingProdukt(produkt);
    setNowy(produkt);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number, nazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      produktId: id,
      produktNazwa: nazwa
    });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteProduct(confirmDialog.produktId);
      await loadData(); // Reload data from server
      setConfirmDialog({ isOpen: false, produktId: 0, produktNazwa: '' });
    } catch (error) {
      console.error('Błąd podczas usuwania produktu:', error);
      setError("Nie udało się usunąć produktu.");
    }
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
                {kategorie.map(kategoria => (
                  <option key={kategoria.id} value={kategoria.id}>
                    {kategoria.nazwa}
                  </option>
                ))}
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
                    name="kod"
                    className="form-input"
                    value={editingProdukt ? editingProdukt.kod : nowy.kod}
                    onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                    placeholder="Kod produktu"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kategoria</label>
                  <select
                    name="kategoria_id"
                    className="form-select"
                    value={editingProdukt ? editingProdukt.kategoria_id : nowy.kategoria_id}
                    onChange={editingProdukt ? handleZmienEditing : handleZmienNowy}
                  >
                    <option value="">Wybierz kategorie</option>
                    {kategorie.map(kategoria => (
                      <option key={kategoria.id} value={kategoria.id}>
                        {kategoria.nazwa}
                      </option>
                    ))}
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
                onClick={() => handleSort('kod')}
              >
                Kod produktu
                <span className={`sort-icon ${sortConfig.key === 'kod' ? 'active' : ''}`}>
                  {sortConfig.key === 'kod' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'kod' && sortConfig.direction === 'desc' ? (
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
                onClick={() => handleSort('kategoria_id')}
              >
                Kategoria
                <span className={`sort-icon ${sortConfig.key === 'kategoria_id' ? 'active' : ''}`}>
                  {sortConfig.key === 'kategoria_id' && sortConfig.direction === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : sortConfig.key === 'kategoria_id' && sortConfig.direction === 'desc' ? (
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
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">Ładowanie produktów...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center text-danger">{error}</td>
              </tr>
            ) : sortedProdukty.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {wyszukiwanie || kategoriaFilter ? 'Brak produktów spełniających kryteria wyszukiwania' : 'Brak produktów'}
                </td>
              </tr>
            ) : (
              sortedProdukty.map(produkt => (
              <tr key={produkt.id}>
                <td>
                  {produkt.kod || 'Brak kodu'}
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
                  {kategorie.find(k => k.id === produkt.kategoria_id)?.nazwa || 'Brak kategorii'}
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
        onCancel={() => setConfirmDialog({ isOpen: false, produktId: 0, produktNazwa: '' })}
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