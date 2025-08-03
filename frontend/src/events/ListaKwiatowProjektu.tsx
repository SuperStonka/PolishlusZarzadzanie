import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Flower,
  Filter,
  Phone,
  Mail,
  X
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';

interface Kwiat {
  id: number;
  rodzaj: string;
  kolor: string;
  ilosc: number;
  zapakowane: number;
  zdjecie: string;
  dostawcaId: string;
  odmiana?: string; // Dodane pole odmiana
  uwagi?: string; // Dodane pole uwagi
  nazwa?: string;
}

interface Dostawca {
  id: string;
    nazwa: string;
    telefon: string;
    mail: string;
  czyFirma?: boolean;
  nazwaFirmy?: string;
  ulica?: string;
  kodPocztowy?: string;
  miasto?: string;
  nip?: string;
}

interface Event {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  zamawiajacy: string;
}

interface Props {
  projekt: any;
  onPowrot: () => void;
}

const ListaKwiatowProjektu: React.FC<Props> = ({ projekt, onPowrot }) => {
  const [kwiatyWEvencie, setKwiatyWEvencie] = useState<Kwiat[]>([]);
  const [wszystkieKwiaty, setWszystkieKwiaty] = useState<any[]>([]);
  const [dostawcy, setDostawcy] = useState<Dostawca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKwiat, setEditingKwiat] = useState<Kwiat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKwiat, setSelectedKwiat] = useState<Kwiat | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    kwiatId: -1,
    kwiatNazwa: ""
  });

  // Sortowanie state
  const [sortowanie, setSortowanie] = useState({
    kolumna: 'rodzaj',
    kierunek: 'asc' as 'asc' | 'desc'
  });

  // Form state
  const [formData, setFormData] = useState({
    ilosc: 1,
    zapakowane: 0
  });

  useEffect(() => {
    // Ładuj kwiaty w projekcie
    fetch("/data/kwiaty-w-projekcie.json")
      .then(res => res.json())
      .then(data => {
        const kwiatyProjektu = data[projekt.numer] || [];
        setKwiatyWEvencie(kwiatyProjektu);
      })
      .catch(err => console.error("Błąd pobierania kwiatów w projekcie:", err));

    // Ładuj wszystkie kwiaty
    fetch("/data/kwiaty.json")
      .then(res => res.json())
      .then(data => setWszystkieKwiaty(data))
      .catch(err => console.error("Błąd pobierania kwiatów:", err));

    // Ładuj dostawców
    fetch("/data/dostawcy-kwiatow.json")
      .then(res => res.json())
      .then(data => setDostawcy(data))
      .catch(err => console.error("Błąd pobierania dostawców:", err));
  }, [projekt.numer]);

  // Funkcja pomocnicza do pobierania danych dostawcy
  const getDostawca = (dostawcaId: string): Dostawca | undefined => {
    return dostawcy.find(d => d.id === dostawcaId);
  };

  // Funkcja pomocnicza do pobierania danych kwiatu z bazy po id
  const getKwiatZBazy = (id: number) => {
    return wszystkieKwiaty.find((k: any) => k.id === id);
  };

  const handleAddKwiat = (kwiat: any) => {
    const nowyKwiat: Kwiat = {
      id: Math.max(...kwiatyWEvencie.map(k => k.id), 0) + 1,
      rodzaj: kwiat.rodzaj,
      kolor: kwiat.kolor,
      ilosc: formData.ilosc,
      zapakowane: formData.zapakowane,
      zdjecie: kwiat.zdjecie,
      dostawcaId: kwiat.dostawcaId || "d1", // domyślny dostawca jeśli nie ma
      odmiana: kwiat.odmiana, // Dodaj odmianę
      uwagi: kwiat.uwagi, // Dodaj uwagi
      nazwa: kwiat.nazwa // Dodaj nazwę
    };

    setKwiatyWEvencie([...kwiatyWEvencie, nowyKwiat]);
    setShowModal(false);
    resetForm();
  };

  const handleEditKwiat = (kwiat: Kwiat) => {
    setEditingKwiat(kwiat);
    setFormData({
      ilosc: kwiat.ilosc,
      zapakowane: kwiat.zapakowane
    });
    setShowModal(true);
  };

  const handleUpdateKwiat = () => {
    if (!editingKwiat) return;

    const updatedKwiaty = kwiatyWEvencie.map(kwiat => 
      kwiat.id === editingKwiat.id 
        ? { 
            ...kwiat, 
            ilosc: formData.ilosc,
            zapakowane: formData.zapakowane,
            odmiana: editingKwiat.odmiana, // Zachowaj odmianę
            uwagi: editingKwiat.uwagi, // Zachowaj uwagi
            nazwa: editingKwiat.nazwa // Zachowaj nazwę
          }
        : kwiat
    );

    setKwiatyWEvencie(updatedKwiaty);
    setShowModal(false);
    setEditingKwiat(null);
    resetForm();
  };

  const handleDeleteKwiat = (kwiatId: number, kwiatNazwa: string) => {
    setConfirmDialog({
      isOpen: true,
      kwiatId: kwiatId,
      kwiatNazwa: kwiatNazwa
    });
  };

  const confirmDelete = () => {
    const updatedKwiaty = kwiatyWEvencie.filter(kwiat => kwiat.id !== confirmDialog.kwiatId);
    setKwiatyWEvencie(updatedKwiaty);
    setConfirmDialog({ isOpen: false, kwiatId: -1, kwiatNazwa: "" });
  };

  const resetForm = () => {
    setFormData({
      ilosc: 1,
      zapakowane: 0
    });
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const handleSort = (kolumna: string) => {
    setSortowanie(prev => ({
      kolumna,
      kierunek: prev.kolumna === kolumna && prev.kierunek === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedKwiaty = kwiatyWEvencie
    .filter(kwiat => {
      if (!kwiat || !kwiat.rodzaj || !kwiat.kolor) return false;
      
      const dostawca = kwiat.dostawcaId ? getDostawca(kwiat.dostawcaId) : undefined;
      return kwiat.rodzaj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kwiat.kolor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dostawca && dostawca.nazwa.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => {
      const aValue = a[sortowanie.kolumna as keyof Kwiat];
      const bValue = b[sortowanie.kolumna as keyof Kwiat];
      
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

  const filteredKwiaty = wszystkieKwiaty.filter(kwiat => {
    if (!kwiat || !kwiat.rodzaj || !kwiat.kolor) return false;
    
    const dostawca = kwiat.dostawcaId ? getDostawca(kwiat.dostawcaId) : undefined;
    return kwiat.rodzaj.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kwiat.kolor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dostawca && dostawca.nazwa.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="lista-produktow-eventu">
      <div className="dashboard-card">
        <div className="page-header">
          <div className="header-info">
            <div className="card-title">Kwiaty w Projekcie</div>
            <div className="card-subtitle">{projekt.numer} - {projekt.nazwa}</div>
          </div>
          <div className="header-actions">
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Dodaj kwiat
            </button>
            <button className="back-btn" onClick={onPowrot} style={{ marginLeft: 12 }}>
              <ArrowLeft size={20} />
              Powrót
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Szukaj kwiatów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <Filter size={16} />
          <span>Filtry</span>
        </div>
      </div>

      {/* Kwiaty Table */}
      <div className="table-container">
        <table className="table" style={{ tableLayout: 'auto', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: 120 }}>Nazwa</th>
              <th style={{ minWidth: 90 }}>Odmiana</th>
              <th style={{ minWidth: 90 }}>Kolor</th>
              <th style={{ minWidth: 70 }}>Ilość</th>
              <th style={{ minWidth: 70 }}>Zapakowane</th>
              <th style={{ minWidth: 180 }}>Uwagi</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedKwiaty.map((kwiat, idx) => {
              const kwiatZBazy = getKwiatZBazy(kwiat.id);
              return (
                <tr key={kwiat.id}>
                  <td style={{ minWidth: 120 }}>{kwiatZBazy?.nazwa || '-'}</td>
                  <td style={{ minWidth: 90 }}>{kwiatZBazy?.odmiana || '-'}</td>
                  <td style={{ minWidth: 90 }}>{kwiatZBazy?.kolor || '-'}</td>
                  <td style={{ minWidth: 70 }}>
                    <input
                      type="number"
                      min="1"
                      value={kwiat.ilosc}
                      className="form-input-small"
                      onChange={e => {
                        const val = parseInt(e.target.value) || 1;
                        setKwiatyWEvencie(prev => prev.map((k, i) => i === idx ? { ...k, ilosc: val } : k));
                      }}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td style={{ minWidth: 70 }}>
                    <input
                      type="number"
                      min="0"
                      value={kwiat.zapakowane}
                      className="form-input-small"
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setKwiatyWEvencie(prev => prev.map((k, i) => i === idx ? { ...k, zapakowane: val } : k));
                      }}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <input
                      type="text"
                      value={kwiat.uwagi || ''}
                      className="form-input-small"
                      onChange={e => {
                        const val = e.target.value;
                        setKwiatyWEvencie(prev => prev.map((k, i) => i === idx ? { ...k, uwagi: val } : k));
                      }}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn delete-btn"
                        onClick={() => handleDeleteKwiat(kwiat.id, kwiat.rodzaj)}
                        title="Usuń kwiat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedKwiaty.length === 0 && (
        <div className="empty-state">
          <Flower size={48} color="var(--text-muted)" />
          <p>Brak kwiatów w evencie</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setSelectedKwiat(null);
          setEditingKwiat(null);
          resetForm();
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dodaj kwiat do eventu</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                setSelectedKwiat(null);
                setEditingKwiat(null);
                resetForm();
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="product-selection">
                <h3>Wybierz kwiat:</h3>
                <div className="search-box-modal">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Szukaj kwiatów po nazwie, odmianie lub kolorze..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="products-list-modal">
                  {wszystkieKwiaty.filter(kwiat =>
                    kwiat.nazwa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    kwiat.odmiana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    kwiat.kolor.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((kwiat) => {
                    // Sprawdzaj tylko kwiaty w bieżącym projekcie
                    const isAdded = kwiatyWEvencie.some(k => k.id === kwiat.id);
                    return (
                      <div key={kwiat.id} className="produkt-item-modal" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 130, height: 130, flexShrink: 0, marginRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#23263a', borderRadius: 8 }}>
                          {kwiat.zdjecie ? (
                            <img
                              src={kwiat.zdjecie}
                              alt={kwiat.nazwa}
                              style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 8 }}
                            />
                          ) : (
                            <div className="no-image-placeholder-modal">
                              <Flower size={32} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div className="product-name" style={{ fontWeight: 600, fontSize: 18 }}>{kwiat.nazwa}</div>
                          <div className="product-category" style={{ color: '#aaa', fontSize: 15 }}>{kwiat.odmiana}</div>
                          <div className="product-category" style={{ color: '#aaa', fontSize: 15 }}>{kwiat.kolor}</div>
                        </div>
                        <button
                          className="btn-primary"
                          style={{ marginLeft: 24, minWidth: 90, opacity: isAdded ? 0.5 : 1, cursor: isAdded ? 'not-allowed' : 'pointer' }}
                          disabled={isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              handleAddKwiat({ ...kwiat, ilosc: 1, zapakowane: 0 });
                              setShowModal(false);
                              setSelectedKwiat(null);
                              setEditingKwiat(null);
                              resetForm();
                            }
                          }}
                        >
                          {isAdded ? 'Dodano' : 'Dodaj'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          isOpen={showImageModal}
          imageSrc={selectedImage}
          imageAlt="Zdjecie kwiatu"
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie kwiatu"
        message={`Czy na pewno chcesz usunąć kwiat "${confirmDialog.kwiatNazwa}"? Ta operacja jest nieodwracalna.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, kwiatId: -1, kwiatNazwa: "" })}
      />
    </div>
  );
};

export default ListaKwiatowProjektu; 