import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, Minus, Package, Check, X, Hash, Tag, Box, Package2, RotateCcw, AlertTriangle, Trash2, Edit } from 'lucide-react';
import ImageModal from '../components/ImageModal';

// Używamy interfejsów z App.tsx
interface ProduktWProjekcie {
  id: number;
  kod: string;
  nazwa: string;
  kategoria: string;
  kontener: string;
  ilosc: number;
  zapakowane: number;
  zwrocone: number;
  uszkodzone: number;
  dostawca: string;
  uwagi: string;
}

interface Projekt {
  id: number;
  numer: string;
  nazwa: string;
  produkty?: ProduktWProjekcie[];
}

interface Props {
  projekt: Projekt;
  onPowrot: () => void;
}

const DodajProduktyDoProjektu: React.FC<Props> = ({ projekt, onPowrot }) => {
  const [produkty, setProdukty] = useState<any[]>([]);
  const [produktyWProjekcie, setProduktyWProjekcie] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedKategoria, setSelectedKategoria] = useState('');
  const [kategorie, setKategorie] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProdukt, setEditingProdukt] = useState<ProduktWProjekcie | null>(null);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [produktyResponse, produktyWProjekcieResponse, kategorieResponse] = await Promise.all([
        fetch('/data/produkty.json'),
        fetch('/data/produkty-w-projekcie.json'),
        fetch('/data/kategorieProduktow.json')
      ]);

      const produktyData = await produktyResponse.json();
      const produktyWProjekcieData = await produktyWProjekcieResponse.json();
      const kategorieData = await kategorieResponse.json();

      setProdukty(produktyData);
      setProduktyWProjekcie(produktyWProjekcieData[projekt.numer] || []);
      setKategorie(kategorieData);
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
    }
  };

  const filteredProdukty = produkty.filter(produkt => {
    const matchesSearch = produkt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
                         produkt.kod_produktu.toLowerCase().includes(search.toLowerCase());
    const matchesKategoria = !selectedKategoria || produkt.kategoria === selectedKategoria;
    return matchesSearch && matchesKategoria;
  });

  // Pobierz unikalne kategorie z produktów w projekcie
  const kategorieWProjekcie = Array.from(new Set(produktyWProjekcie.map(produkt => produkt.kategoria))).sort();

  const filteredProduktyWProjekcie = produktyWProjekcie.filter(produkt => {
    const matchesSearch = produkt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
                         produkt.kod_produktu.toLowerCase().includes(search.toLowerCase()) ||
                         (produkt.uwagi || '').toLowerCase().includes(search.toLowerCase());
    const matchesKategoria = !selectedKategoria || produkt.kategoria === selectedKategoria;
    return matchesSearch && matchesKategoria;
  });

  const handleDodajProdukt = (produkt: any) => {
    const nowyProdukt = {
      id: Date.now(),
      kod_produktu: produkt.kod_produktu,
      nazwa: produkt.nazwa,
      kategoria: produkt.kategoria,
      kontener: produkt.kontener,
      ilosc: 1,
      zapakowane: 0,
      zwrocone: 0,
      uszkodzone: 0,
      dostawca: produkt.dostawca || '',
      uwagi: '',
      zdjecie: produkt.zdjecie || ''
    };

    setProduktyWProjekcie(prev => [...prev, nowyProdukt]);
    setShowAddModal(false);
  };

  const handleUsunProdukt = (produktId: number) => {
    setProduktyWProjekcie(prev => prev.filter(p => p.id !== produktId));
  };

  const handleZmienIlosc = (produktId: number, field: string, value: number | string) => {
    setProduktyWProjekcie(prev => prev.map(p => 
      p.id === produktId ? { ...p, [field]: value } : p
    ));
  };

  const handleEdit = (produkt: ProduktWProjekcie) => {
    setEditingProdukt(produkt);
    setShowAddModal(true);
  };

  const handleSaveEdit = () => {
    if (editingProdukt) {
      setProduktyWProjekcie(prev => prev.map(p => 
        p.id === editingProdukt.id ? editingProdukt : p
      ));
      setEditingProdukt(null);
      setShowAddModal(false);
    }
  };

  // Sprawdź czy produkt jest już dodany do projektu
  const isProduktDodany = (produktKod: string) => {
    return produktyWProjekcie.some(p => p.kod_produktu === produktKod);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Produkty w Projekcie</div>
            <div className="card-subtitle">{projekt.numer} - {projekt.nazwa}</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingProdukt(null);
                setShowAddModal(true);
              }}
            >
              <Plus size={16} />
              Dodaj produkt
            </button>
            <button
              className="btn btn-secondary"
              onClick={onPowrot}
            >
              <ArrowLeft size={16} />
              Powrót
            </button>
          </div>
        </div>
      </div>

      {/* Wyszukiwanie produktów w projekcie */}
      <div className="d-flex justify-between align-center mb-3">
        <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
          <div className="search-container" style={{ flex: 2 }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Szukaj produktów w projekcie po kodzie, nazwie lub uwagach..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <select
              className="form-select"
              value={selectedKategoria}
              onChange={(e) => setSelectedKategoria(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">Wszystkie kategorie</option>
              {kategorieWProjekcie.map(kategoria => (
                <option key={kategoria} value={kategoria}>
                  {kategoria}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela produktów w projekcie */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Kod produktu</th>
              <th>Nazwa</th>
              <th>Zdjęcie</th>
              <th>Kontener</th>
              <th>Ilość</th>
              <th>Zapakowane</th>
              <th>Zwrocone</th>
              <th>Uszkodzone</th>
              <th>Uwagi</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduktyWProjekcie.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">
                  {search ? 'Brak produktów spełniających kryteria wyszukiwania' : 'Brak produktów w projekcie'}
                </td>
              </tr>
            ) : (
              filteredProduktyWProjekcie.map(produkt => (
                <tr key={produkt.id}>
                  <td>{produkt.kod_produktu}</td>
                  <td>{produkt.nazwa}</td>
                  <td>
                    <div className="product-image-container">
                      {produkt.zdjecie ? (
                        <img 
                          src={produkt.zdjecie} 
                          alt={produkt.nazwa || 'Produkt'} 
                          className="product-image"
                          onClick={() => setImageModal({
                            isOpen: true,
                            imageSrc: produkt.zdjecie,
                            imageAlt: produkt.nazwa || 'Produkt'
                          })}
                          title="Kliknij aby powiększyć"
                          style={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{produkt.kontener}</td>
                  <td>
                    <input
                      type="number"
                      value={produkt.ilosc}
                      onChange={(e) => handleZmienIlosc(produkt.id, 'ilosc', Number(e.target.value))}
                      className="form-input-small"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={produkt.zapakowane}
                      onChange={(e) => handleZmienIlosc(produkt.id, 'zapakowane', Number(e.target.value))}
                      className="form-input-small"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={produkt.zwrocone}
                      onChange={(e) => handleZmienIlosc(produkt.id, 'zwrocone', Number(e.target.value))}
                      className="form-input-small"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={produkt.uszkodzone}
                      onChange={(e) => handleZmienIlosc(produkt.id, 'uszkodzone', Number(e.target.value))}
                      className="form-input-small"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={produkt.uwagi}
                      onChange={(e) => handleZmienIlosc(produkt.id, 'uwagi', e.target.value)}
                      className="form-input-small"
                      placeholder="Uwagi..."
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn delete-btn"
                        onClick={() => handleUsunProdukt(produkt.id)}
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

      {/* Modal dodawania/edycji produktu */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProdukt ? 'Edytuj produkt' : 'Dodaj produkt do projektu'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProdukt(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Filtry wyszukiwania */}
              <div className="d-flex gap-2 mb-3">
                <div className="search-container" style={{ width: '50%' }}>
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Szukaj produktów..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <select
                  value={selectedKategoria}
                  onChange={(e) => setSelectedKategoria(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="">Wszystkie kategorie</option>
                  {kategorie.map(kat => (
                    <option key={kat.id} value={kat.nazwa}>
                      {kat.nazwa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista dostępnych produktów */}
              <div className="produkty-list-modal">
                {filteredProdukty.length === 0 ? (
                  <div className="text-center p-3">
                    Brak produktów spełniających kryteria wyszukiwania
                  </div>
                ) : (
                                                        filteredProdukty.map(produkt => (
                     <div key={produkt.id} className="produkt-item-modal">
                       <div className="produkt-image-small" style={{ marginRight: '20px' }}>
                         {produkt.zdjecie ? (
                           <img 
                             src={produkt.zdjecie} 
                             alt={produkt.nazwa || 'Produkt'} 
                             className="product-image-small"
                             title={produkt.nazwa || 'Produkt'}
                             style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                           />
                         ) : (
                           <div className="no-image-placeholder-modal" style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Package size={16} />
                           </div>
                         )}
                       </div>
                       <div className="produkt-info">
                         <div className="produkt-kod">{produkt.kod_produktu}</div>
                         <div className="produkt-nazwa">{produkt.nazwa}</div>
                         <div className="produkt-kategoria">{produkt.kategoria}</div>
                         <div className="produkt-kontener">{produkt.kontener}</div>
                       </div>
                       <button
                         className={`btn btn-sm ${isProduktDodany(produkt.kod_produktu) ? 'btn-secondary' : 'btn-primary'}`}
                         onClick={() => handleDodajProdukt(produkt)}
                         disabled={isProduktDodany(produkt.kod_produktu)}
                         title={isProduktDodany(produkt.kod_produktu) ? 'Produkt już dodany do projektu' : 'Dodaj produkt do projektu'}
                       >
                         {isProduktDodany(produkt.kod_produktu) ? (
                           <>
                             <Check size={14} />
                             Dodano
                           </>
                         ) : (
                           <>
                             <Plus size={14} />
                             Dodaj
                           </>
                         )}
                       </button>
                     </div>
                   ))
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn" onClick={() => {
                setShowAddModal(false);
                setEditingProdukt(null);
              }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

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

export default DodajProduktyDoProjektu;