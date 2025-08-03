import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  FileText, 
  AlertTriangle,
  User,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Hash,
  Tag,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  User as UserIcon,
  UserCheck as UserCheckIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertTriangleIcon,
  Check,
  X,
  Copy,
  Info,
  MessageSquare,
  Plus,
  CalendarDays,
  Flower
} from 'lucide-react';

import ConfirmDialog from '../components/ConfirmDialog';

interface KontaktZamawiajacy {
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
  firma: string;
}

interface KontaktNaObiekcie {
  imie: string;
  nazwisko: string;
  telefon: string;
  email: string;
  stanowisko: string;
}

interface TerminyEvent {
  pakowanie: {
    data: string;
    godzina: string;
  };
  demontaz: {
    data: string;
    godzina: string;
  };
  montaz: {
    dataOd: string;
    dataDo: string;
  };
}

interface Projekt {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  zamawiajacy: string;
  kontaktZamawiajacy: KontaktZamawiajacy;
  kontaktNaObiekcie: KontaktNaObiekcie;
  terminy: TerminyEvent;
  status: string;
  etapId?: number;
  uwagi: string;
  utworzono: string;
  opis: string;
}

interface Etap {
  id: number;
  nazwa: string;
  opis: string;
}

interface Props {
  onWybierzProjekt: (projekt: Projekt) => void;
  onEdytujProjekt: (projekt: Projekt) => void;
  onZarzadzajProdukty: (projekt: Projekt) => void;
  onZarzadzajKwiaty: (projekt: Projekt) => void;
  onDodajProjekt: () => void;
}

const ListaProjektow: React.FC<Props> = ({ onWybierzProjekt, onEdytujProjekt, onZarzadzajProdukty, onZarzadzajKwiaty, onDodajProjekt }) => {
  const [projekty, setProjekty] = useState<Projekt[]>([]);
  const [produktyWProjektach, setProduktyWProjektach] = useState<{[key: string]: any[]}>({});
  const [kwiatyWProjektach, setKwiatyWProjektach] = useState<{[key: string]: any[]}>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEtap, setFilterEtap] = useState("");
  const [sortowanie, setSortowanie] = useState("data");
  const [selectedProjektProdukty, setSelectedProjektProdukty] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    projektId: -1,
    projektNumer: ""
  });
  const [etapy, setEtapy] = useState<Etap[]>([]);
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    type: 'dates' | 'uwagi' | 'opis' | null;
    title: string;
    content: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    content: ''
  });

  useEffect(() => {
    // Ładuj projekty
    fetch("/data/projekty.json")
      .then(res => res.json())
      .then(data => setProjekty(data))
      .catch(err => console.error("Błąd pobierania projektów:", err));

    // Ładuj produkty w projektach
    fetch("/data/produkty-w-projekcie.json")
      .then(res => res.json())
      .then(data => setProduktyWProjektach(data))
      .catch(err => console.error("Błąd pobierania produktów w projektach:", err));

    // Ładuj kwiaty w projektach
    fetch("/data/kwiaty-w-projekcie.json")
      .then(res => res.json())
      .then(data => setKwiatyWProjektach(data))
      .catch(err => console.error("Błąd pobierania kwiatów w projektach:", err));

    // Ładuj etapy
    fetch("/data/etapy.json")
      .then(res => res.json())
      .then(data => {
        setEtapy(data);
      })
      .catch(err => console.error("Błąd pobierania etapów:", err));
  }, []);

  const filteredProjekty = projekty
    .filter(projekt => 
      projekt.numer.toLowerCase().includes(search.toLowerCase()) ||
      projekt.nazwa.toLowerCase().includes(search.toLowerCase()) ||
      projekt.zamawiajacy.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktZamawiajacy?.firma?.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktZamawiajacy?.imie?.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktZamawiajacy?.nazwisko?.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktNaObiekcie?.imie?.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktNaObiekcie?.nazwisko?.toLowerCase().includes(search.toLowerCase()) ||
      projekt.kontaktNaObiekcie?.stanowisko?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(projekt => filterStatus ? projekt.status === filterStatus : true)
    .filter(projekt => filterEtap ? projekt.etapId === parseInt(filterEtap) : true)
    .sort((a, b) => {
      if (sortowanie === "data") return new Date(a.data).getTime() - new Date(b.data).getTime();
      if (sortowanie === "numer") return a.numer.localeCompare(b.numer);
      if (sortowanie === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const formatujDate = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pl-PL');
    } catch {
      return data;
    }
  };

  const formatujGodzine = (godzina: string) => {
    if (!godzina) return '';
    return godzina.includes(':') ? godzina : `${godzina}:00`;
  };

  const handleProduktyClick = (projekt: Projekt, e: React.MouseEvent) => {
    e.stopPropagation();
    onZarzadzajProdukty(projekt);
  };

  const handleKwiatyClick = (projekt: Projekt, e: React.MouseEvent) => {
    e.stopPropagation();
    onZarzadzajKwiaty(projekt);
  };

  const toggleProduktyDropdown = (projektId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjektProdukty(selectedProjektProdukty === projektId ? null : projektId);
  };

  const handleEdytuj = (projekt: Projekt, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdytujProjekt(projekt);
  };

  const handleUsun = (projektId: number, projektNumer: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      projektId: projektId,
      projektNumer: projektNumer
    });
  };

  const handlePodglad = (projekt: Projekt, e: React.MouseEvent) => {
    e.stopPropagation();
    onWybierzProjekt(projekt);
  };

  const handleDuplikuj = (projekt: Projekt, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Utwórz kopię projektu z nowym ID i numerem
    const nowyProjekt: Projekt = {
      ...projekt,
      id: Math.max(...projekty.map(e => e.id)) + 1, // Nowe ID
      numer: `${projekt.numer}-KOPIA`, // Nowy numer
      status: 'aktywne', // Reset statusu
      etapId: 1, // Reset etapu
      utworzono: new Date().toISOString().split('T')[0], // Nowa data utworzenia
      uwagi: projekt.uwagi ? `${projekt.uwagi} (KOPIA)` : 'Kopia projektu',
      opis: projekt.opis ? `${projekt.opis} (KOPIA)` : projekt.opis
    };
    
    // Dodaj nowy projekt do listy
    setProjekty([...projekty, nowyProjekt]);
    
    // Opcjonalnie: pokaż komunikat o sukcesie
    console.log('Projekt został zduplikowany:', nowyProjekt.numer);
  };

  const confirmUsun = () => {
    if (confirmDialog.projektId >= 0) {
      setProjekty(projekty.filter(projekt => projekt.id !== confirmDialog.projektId));
      setSelectedProjektProdukty(null);
    }
    setConfirmDialog({ isOpen: false, projektId: -1, projektNumer: "" });
  };

  const cancelUsun = () => {
    setConfirmDialog({ isOpen: false, projektId: -1, projektNumer: "" });
  };

  const openModal = (type: 'dates' | 'uwagi' | 'opis', title: string, content: string) => {
    setModalData({
      isOpen: true,
      type,
      title,
      content
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      type: null,
      title: '',
      content: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nowe': return 'status-success';
      case 'w_trakcie': return 'status-warning';
      case 'zakonczone': return 'status-neutral';
      case 'anulowane': return 'status-danger';
      default: return 'status-success';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Projektów</div>
            <div className="card-subtitle">Zarządzanie projektami i wydarzeniami</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={onDodajProjekt}
            >
              <Plus size={16} />
              Dodaj projekt
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-between align-center mb-3">
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Szukaj projektów..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Wszystkie statusy</option>
            <option value="nowe">Nowe</option>
            <option value="w_trakcie">W trakcie</option>
            <option value="zakonczone">Zakończone</option>
            <option value="anulowane">Anulowane</option>
          </select>
          <select
            value={filterEtap}
            onChange={(e) => setFilterEtap(e.target.value)}
            className="filter-select"
          >
            <option value="">Wszystkie etapy</option>
            {etapy.map(etap => (
              <option key={etap.id} value={etap.id}>
                {etap.nazwa}
              </option>
            ))}
          </select>
          <select
            value={sortowanie}
            onChange={(e) => setSortowanie(e.target.value)}
            className="filter-select"
          >
            <option value="data">Sortuj po dacie</option>
            <option value="numer">Sortuj po numerze</option>
            <option value="status">Sortuj po statusie</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Numer</th>
              <th>Nazwa</th>
              <th>Data</th>
              <th>Lokalizacja</th>
              <th>Zamawiający</th>
              <th>Kontakt na obiekcie</th>
              <th>Etap</th>
              <th>Produkty / Kwiaty</th>
              <th>Status</th>
              <th>Info</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjekty.map(projekt => (
              <tr key={projekt.id} className="table-row-clickable">
                <td>
                  <div className="project-info">
                    <div className="project-details">
                      <div className="project-title">
                        {projekt.numer}
                      </div>
                      <div className="project-date">
                        ID: {projekt.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="event-type">{projekt.nazwa}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{formatujDate(projekt.data)}</span>
                    <button
                      className="detail-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const datesContent = `
                          <div style="font-size: 14px; line-height: 1.5; color: var(--text-primary);">
                            <div style="margin-bottom: 12px;">
                              <strong>Pakowanie:</strong><br/>
                              ${projekt.terminy.pakowanie.data ? formatujDate(projekt.terminy.pakowanie.data) : 'Nie ustawiono'}${projekt.terminy.pakowanie.godzina ? ` ${projekt.terminy.pakowanie.godzina}` : ''}
                            </div>
                            <div style="margin-bottom: 12px;">
                              <strong>Montaż:</strong><br/>
                              ${projekt.terminy.montaz.dataOd ? formatujDate(projekt.terminy.montaz.dataOd) : 'Nie ustawiono'}${projekt.terminy.montaz.dataDo ? ` - ${formatujDate(projekt.terminy.montaz.dataDo)}` : ''}
                            </div>
                            <div>
                              <strong>Demontaż:</strong><br/>
                              ${projekt.terminy.demontaz.data ? formatujDate(projekt.terminy.demontaz.data) : 'Nie ustawiono'}${projekt.terminy.demontaz.godzina ? ` ${projekt.terminy.demontaz.godzina}` : ''}
                            </div>
                          </div>
                        `;
                        openModal('dates', 'Harmonogram projektu', datesContent);
                      }}
                      title="Pokaż harmonogram"
                      style={{ padding: '2px', margin: 0 }}
                    >
                      <CalendarDays size={14} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="location-info">
                    <span className="location-text">{projekt.lokalizacja}</span>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-name">
                      {projekt.kontaktZamawiajacy?.imie} {projekt.kontaktZamawiajacy?.nazwisko}
                    </div>
                    {projekt.kontaktZamawiajacy?.firma && (
                      <div className="contact-company">{projekt.kontaktZamawiajacy.firma}</div>
                    )}
                    {projekt.kontaktZamawiajacy?.telefon && (
                      <div className="contact-phone">
                        <Phone size={12} />
                        {projekt.kontaktZamawiajacy.telefon}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-name">
                      {projekt.kontaktNaObiekcie?.imie} {projekt.kontaktNaObiekcie?.nazwisko}
                    </div>
                    {projekt.kontaktNaObiekcie?.stanowisko && (
                      <div className="contact-position">{projekt.kontaktNaObiekcie.stanowisko}</div>
                    )}
                    <div className="contact-actions">
                      {projekt.kontaktNaObiekcie?.telefon && (
                        <div className="contact-phone">
                          <Phone size={12} />
                          {projekt.kontaktNaObiekcie.telefon}
                        </div>
                      )}

                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="event-stage"
                  >
                    {etapy.find(etap => etap.id === projekt.etapId)?.nazwa || '-'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div 
                      className="products-count clickable"
                      onClick={(e) => handleProduktyClick(projekt, e)}
                      title="Zobacz produkty projektu"
                    >
                      <Package size={16} />
                      <span>{produktyWProjektach[projekt.numer]?.length || 0}</span>
                    </div>
                    <div 
                      className="products-count clickable"
                      onClick={(e) => handleKwiatyClick(projekt, e)}
                      title="Zobacz kwiaty projektu"
                    >
                      <Flower size={16} />
                      <span>{kwiatyWProjektach[projekt.numer]?.length || 0}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(projekt.status)}`}>
                    {projekt.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className="details-icons">
                    {projekt.uwagi && projekt.uwagi.trim() !== '' && (
                      <button
                        className="detail-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('uwagi', 'Uwagi do projektu', projekt.uwagi);
                        }}
                        title="Pokaż uwagi"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    )}
                    {projekt.opis && projekt.opis.trim() !== '' && (
                      <button
                        className="detail-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('opis', 'Opis projektu', projekt.opis);
                        }}
                        title="Pokaż opis"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}
                    {(!projekt.uwagi || projekt.uwagi.trim() === '') && 
                     (!projekt.opis || projekt.opis.trim() === '') && (
                      <span className="no-details">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn view-btn"
                      onClick={(e) => handlePodglad(projekt, e)}
                      title="Podgląd projektu"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      className="table-action-btn duplicate-btn"
                      onClick={(e) => handleDuplikuj(projekt, e)}
                      title="Duplikuj projekt"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="table-action-btn edit-btn"
                      onClick={(e) => handleEdytuj(projekt, e)}
                      title="Edytuj projekt"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={(e) => handleUsun(projekt.id, projekt.numer, e)}
                      title="Usuń projekt"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProjekty.length === 0 && (
          <div className="empty-state">
            <Search size={48} color="var(--text-muted)" />
            <p>Nie znaleziono projektów</p>
          </div>
        )}
      </div>
      
      {/* Modal dla szczegółów projektu */}
      {modalData.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalData.title}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div dangerouslySetInnerHTML={{ __html: modalData.content }} />
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź usunięcie projektu"
        message={`Czy na pewno chcesz usunąć projekt "${confirmDialog.projektNumer}"? Ta operacja jest nieodwracalna.`}
        onConfirm={confirmUsun}
        onCancel={cancelUsun}
      />

    </div>
  );
};

export default ListaProjektow; 