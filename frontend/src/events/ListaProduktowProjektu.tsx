import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Filter,
  Building
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

interface ProduktWEventu {
  id: number;
  kod_produktu: string;
  nazwa: string;
  kategoria: string;
  kontener: string;
  ilosc: number;
  zapakowane: number;
  zwrocone: number;
  uszkodzone: number;
  zdjecie: string;
  wypozyczony?: boolean;
  wypozyczalnia?: {
    id: number;
    nazwa: string;
    telefon: string;
    email: string;
    adres: string;
  };
}

interface Produkt {
  id: number;
  kod_produktu: string;
  nazwa: string;
  kategoria: string;
  ilosc: number;
  zdjecie: string;
  uwagi: string;
}

interface Event {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  zamawiajacy: string;
}

interface Projekt {
  id: number;
  numer: string;
  nazwa: string;
  data_rozpoczecia: string;
  data_zakonczenia: string;
  lokalizacja: string;
  zamawiajacy: string;
  status: string;
  uwagi: string;
}

interface Props {
  projekt: Projekt;
  onPowrot: () => void;
}

const ListaProduktowProjektu: React.FC<Props> = ({ projekt, onPowrot }) => {
  const [produktyWProjekcie, setProduktyWProjekcie] = useState<any[]>([]);
  const [wszystkieProdukty, setWszystkieProdukty] = useState<Produkt[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProdukt, setSelectedProdukt] = useState<Produkt | null>(null);
  const [iloscDoDodania, setIloscDoDodania] = useState(1);
  const [kontener, setKontener] = useState('Karton');
  const [zapakowane, setZapakowane] = useState(0);
  const [zwrocone, setZwrocone] = useState(0);
  const [uszkodzone, setUszkodzone] = useState(0);
  const [wypozyczony, setWypozyczony] = useState(false);
  const [selectedWypozyczalnia, setSelectedWypozyczalnia] = useState<any>(null);
  const [wypozyczalnie, setWypozyczalnie] = useState<any[]>([]);
  const [searchProdukt, setSearchProdukt] = useState('');
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
  const [sortowanie, setSortowanie] = useState({
    kolumna: 'nazwa',
    kierunek: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    loadProduktyWProjekcie();
    loadWszystkieProdukty();
    loadWypozyczalnie();
  }, [projekt.numer]);

  const loadProduktyWProjekcie = async () => {
    try {
      const response = await fetch('/data/produkty-w-projekcie.json');
      const data = await response.json();
      setProduktyWProjekcie(data[projekt.numer] || []);
    } catch (error) {
      console.error('Błąd podczas ładowania produktów projektu:', error);
    }
  };

  const loadWszystkieProdukty = async () => {
    try {
              const response = await fetch('/data/produkty.json');
      const data = await response.json();
      setWszystkieProdukty(data);
    } catch (error) {
      console.error('Błąd ładowania wszystkich produktów:', error);
      setWszystkieProdukty([]);
    }
  };

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

  const handleAddProdukt = (produkt: ProduktWEventu) => {
    // Znajdź oryginalny produkt z listy wszystkich produktów
    const oryginalnyProdukt = wszystkieProdukty.find(p => p.kod_produktu === produkt.kod_produktu);
    if (oryginalnyProdukt) {
      setSelectedProdukt(oryginalnyProdukt);
      setIloscDoDodania(produkt.ilosc);
      setKontener(produkt.kontener);
      setZapakowane(produkt.zapakowane);
      setZwrocone(produkt.zwrocone);
      setUszkodzone(produkt.uszkodzone);
      setShowAddModal(true);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedProdukt(null);
    setSearchProdukt('');
    setIloscDoDodania(1);
    setKontener('Karton');
    setZapakowane(0);
    setZwrocone(0);
    setUszkodzone(0);
    setWypozyczony(false);
    setSelectedWypozyczalnia(null);
    setShowAddModal(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedProdukt) return;

    // Sprawdź czy to edycja istniejącego produktu
    const existingProductIndex = produktyWProjekcie.findIndex(p => 
      p.kod_produktu === selectedProdukt.kod_produktu
    );

    const updatedProdukt: ProduktWEventu = {
      id: existingProductIndex >= 0 ? produktyWProjekcie[existingProductIndex].id : Date.now(),
      kod_produktu: selectedProdukt.kod_produktu,
      nazwa: selectedProdukt.nazwa,
      kategoria: selectedProdukt.kategoria,
      kontener: kontener,
      ilosc: iloscDoDodania,
      zapakowane: zapakowane,
      zwrocone: zwrocone,
      uszkodzone: uszkodzone,
      zdjecie: selectedProdukt.zdjecie || "",
      wypozyczony: wypozyczony,
      wypozyczalnia: wypozyczony ? selectedWypozyczalnia : undefined
    };

    if (existingProductIndex >= 0) {
      // Edycja istniejącego produktu
      setProduktyWProjekcie(prev => prev.map((p, index) => 
        index === existingProductIndex ? updatedProdukt : p
      ));
    } else {
      // Dodanie nowego produktu
      setProduktyWProjekcie(prev => [...prev, updatedProdukt]);
    }

    setShowAddModal(false);
    setSelectedProdukt(null);
    setSearchProdukt('');
    setIloscDoDodania(1);
    setKontener('Karton');
    setZapakowane(0);
    setZwrocone(0);
    setUszkodzone(0);
  };

  const handleUsunProdukt = (produktId: number) => {
    setConfirmDialog({
      isOpen: true,
      produktId: produktId,
      produktNazwa: '' // No longer needed as per new code
    });
  };

  const confirmUsun = () => {
    setProduktyWProjekcie(prev => prev.filter(p => p.id !== confirmDialog.produktId));
    setConfirmDialog({ isOpen: false, produktId: -1, produktNazwa: '' });
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, produktId: -1, produktNazwa: '' });
  };

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      imageAlt
    });
  };

  const handleSort = (kolumna: string) => {
    setSortowanie(prev => ({
      kolumna,
      kierunek: prev.kolumna === kolumna && prev.kierunek === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedProdukty = produktyWProjekcie
    .filter(produkt =>
      produkt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
      produkt.kod_produktu.toLowerCase().includes(search.toLowerCase()) ||
      produkt.kategoria.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortowanie.kolumna as keyof ProduktWEventu];
      const bValue = b[sortowanie.kolumna as keyof ProduktWEventu];
      
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



  const kontenery = ['Karton', 'Paleta', 'Skrzynia', 'Worek', 'Pudło'];

  // Filtrowanie produktów w modalu
  const filteredProdukty = wszystkieProdukty.filter(produkt =>
    produkt.nazwa.toLowerCase().includes(searchProdukt.toLowerCase()) ||
    produkt.kod_produktu.toLowerCase().includes(searchProdukt.toLowerCase()) ||
    produkt.kategoria.toLowerCase().includes(searchProdukt.toLowerCase())
  );

  return (
    <div className="lista-produktow-eventu">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={onPowrot}>
          <ArrowLeft size={20} />
          Powrót do listy eventów
        </button>
        <div className="header-info">
          <h1>Produkty eventu: {projekt.numer}</h1>
          <p>{projekt.nazwa} - {projekt.data_rozpoczecia} - {projekt.lokalizacja}</p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={handleOpenAddModal}>
            <Plus size={16} />
            Dodaj produkt
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Szukaj produktów..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          <Filter size={16} />
          <span>Filtry</span>
        </div>
      </div>

      {/* Products Table */}
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
                onClick={() => handleSort('kod_produktu')}
              >
                Kod produktu
                <span className={`sort-icon ${sortowanie.kolumna === 'kod_produktu' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'kod_produktu' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'kod_produktu' && sortowanie.kierunek === 'desc' ? (
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
              <th>Zdjęcie</th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('nazwa')}
              >
                Nazwa
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
                onClick={() => handleSort('kategoria')}
              >
                Kategoria
                <span className={`sort-icon ${sortowanie.kolumna === 'kategoria' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'kategoria' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'kategoria' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('kontener')}
              >
                Kontener
                <span className={`sort-icon ${sortowanie.kolumna === 'kontener' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'kontener' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'kontener' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('ilosc')}
                style={{ textAlign: 'center' }}
              >
                Ilość
                <span className={`sort-icon ${sortowanie.kolumna === 'ilosc' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'ilosc' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'ilosc' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('zapakowane')}
                style={{ textAlign: 'center' }}
              >
                Zapakowane
                <span className={`sort-icon ${sortowanie.kolumna === 'zapakowane' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'zapakowane' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'zapakowane' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('zwrocone')}
                style={{ textAlign: 'center' }}
              >
                Zwrócone
                <span className={`sort-icon ${sortowanie.kolumna === 'zwrocone' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'zwrocone' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'zwrocone' && sortowanie.kierunek === 'desc' ? (
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
                onClick={() => handleSort('uszkodzone')}
                style={{ textAlign: 'center' }}
              >
                Uszkodzone
                <span className={`sort-icon ${sortowanie.kolumna === 'uszkodzone' ? 'active' : ''}`}>
                  {sortowanie.kolumna === 'uszkodzone' && sortowanie.kierunek === 'asc' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-8 8h16z"/>
                    </svg>
                  ) : sortowanie.kolumna === 'uszkodzone' && sortowanie.kierunek === 'desc' ? (
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
              <th>Wypożyczalnia</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProdukty.map((produkt) => (
              <tr key={produkt.id} className={produkt.wypozyczony ? 'rented-product' : ''}>
                <td>{produkt.id}</td>
                <td>
                  <div className="product-code">
                    <Package size={14} />
                    {produkt.kod_produktu}
                  </div>
                </td>
                <td>
                  {produkt.zdjecie ? (
                    <img 
                      src={produkt.zdjecie} 
                      alt={produkt.nazwa}
                      className="product-image-small clickable"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      onClick={() => handleImageClick(produkt.zdjecie, produkt.nazwa)}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <Package size={16} />
                    </div>
                  )}
                </td>
                <td>
                  <div className="product-name">{produkt.nazwa}</div>
                </td>
                <td>
                  <span className="category-badge">{produkt.kategoria}</span>
                </td>
                <td>
                  <span className="container-badge">{produkt.kontener}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="quantity">{produkt.ilosc}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`packed ${produkt.zapakowane === produkt.ilosc ? 'complete' : ''}`}>
                    {produkt.zapakowane}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="returned">{produkt.zwrocone}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`damaged ${produkt.uszkodzone > 0 ? 'has-damage' : ''}`}>
                    {produkt.uszkodzone}
                  </span>
                </td>
                <td>
                  {produkt.wypozyczony && produkt.wypozyczalnia ? (
                    <div className="wypozyczalnia-info">
                      <Building size={14} />
                      <span>{produkt.wypozyczalnia.nazwa}</span>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleAddProdukt(produkt)}
                      title="Edytuj produkt"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleUsunProdukt(produkt.id)}
                      title="Usuń produkt"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedProdukty.length === 0 && (
          <div className="empty-state">
            <Package size={48} color="var(--text-muted)" />
            <p>Brak produktów w tym evencie</p>
            <button className="add-btn" onClick={handleOpenAddModal}>
              <Plus size={16} />
              Dodaj pierwszy produkt
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setSearchProdukt('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj produkt do eventu</h2>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                setSearchProdukt('');
              }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {!selectedProdukt ? (
                <div className="product-selection">
                  <h3>Wybierz produkt:</h3>
                  <div className="search-box-modal">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Szukaj produktów po nazwie, kodzie lub kategorii..."
                      value={searchProdukt}
                      onChange={(e) => setSearchProdukt(e.target.value)}
                    />
                  </div>
                  <div className="products-grid">
                    {filteredProdukty.map((produkt) => (
                      <div
                        key={produkt.id}
                        className="product-card"
                        onClick={() => setSelectedProdukt(produkt)}
                      >
                        <div className="product-image">
                          {produkt.zdjecie ? (
                            <img 
                              src={produkt.zdjecie} 
                              alt={produkt.nazwa}
                              className="product-image-modal"
                            />
                          ) : (
                            <div className="no-image-placeholder-modal">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="product-info">
                          <div className="product-code">{produkt.kod_produktu}</div>
                          <div className="product-name">{produkt.nazwa}</div>
                          <div className="product-category">{produkt.kategoria}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="product-details">
                  <h3>Szczegóły produktu:</h3>
                  <div className="selected-product">
                    <div className="selected-product-content">
                      <div className="selected-product-image">
                        {selectedProdukt.zdjecie ? (
                          <img 
                            src={selectedProdukt.zdjecie} 
                            alt={selectedProdukt.nazwa}
                            className="product-image-selected"
                          />
                        ) : (
                          <div className="no-image-placeholder-large">
                            <Package size={32} />
                          </div>
                        )}
                      </div>
                      <div className="selected-product-info">
                        <div className="product-code">{selectedProdukt.kod_produktu}</div>
                        <div className="product-name">{selectedProdukt.nazwa}</div>
                        <div className="product-category">{selectedProdukt.kategoria}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Ilość:</label>
                    <input
                      type="number"
                      min="1"
                      value={iloscDoDodania}
                      onChange={(e) => setIloscDoDodania(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kontener:</label>
                    <select value={kontener} onChange={(e) => setKontener(e.target.value)}>
                      {kontenery.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Zapakowane:</label>
                      <input
                        type="number"
                        min="0"
                        max={iloscDoDodania}
                        value={zapakowane}
                        onChange={(e) => setZapakowane(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Zwrócone:</label>
                      <input
                        type="number"
                        min="0"
                        value={zwrocone}
                        onChange={(e) => setZwrocone(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Uszkodzone:</label>
                      <input
                        type="number"
                        min="0"
                        value={uszkodzone}
                        onChange={(e) => setUszkodzone(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: '0 0 auto', marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={wypozyczony}
                          onChange={(e) => setWypozyczony(e.target.checked)}
                        />
                        Produkt wypożyczony
                      </label>
                    </div>

                    {wypozyczony && (
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Wypożyczalnia:</label>
                        <select 
                          value={selectedWypozyczalnia?.id || ''} 
                          onChange={(e) => {
                            const wypozyczalnia = wypozyczalnie.find(w => w.id === parseInt(e.target.value));
                            setSelectedWypozyczalnia(wypozyczalnia || null);
                          }}
                        >
                          <option value="">Wybierz wypożyczalnię</option>
                          {wypozyczalnie.map(wypozyczalnia => (
                            <option key={wypozyczalnia.id} value={wypozyczalnia.id}>
                              {wypozyczalnia.nazwa}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowAddModal(false);
                setSearchProdukt('');
              }}>
                Anuluj
              </button>
              {selectedProdukt && (
                <button className="btn-primary" onClick={handleConfirmAdd}>
                  Dodaj produkt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie produktu"
        message={`Czy na pewno chcesz usunąć produkt "${confirmDialog.produktNazwa}" z eventu?`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="image-modal-overlay" onClick={() => setImageModal({ isOpen: false, imageSrc: '', imageAlt: '' })}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close"
              onClick={() => setImageModal({ isOpen: false, imageSrc: '', imageAlt: '' })}
            >
              ×
            </button>
            <img 
              src={imageModal.imageSrc} 
              alt={imageModal.imageAlt}
              className="image-modal-image"
            />
            <div className="image-modal-caption">{imageModal.imageAlt}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProduktowProjektu; 