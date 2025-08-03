import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Flower2, Download } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageModal from '../components/ImageModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import '../fonts/Roboto-Regular.js'; // USUNIĘTE

interface Dostawca {
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

interface Kwiat {
  id: number;
  nazwa: string;
  odmiana: string;
  kolor: string;
  wysokosc: number;
  cena: number;
  zdjecie: string;
  dostawca: Dostawca;
}

interface PoziomZamowienia {
  cenaOd: number;
  cenaDo: number;
  ilosc: number;
}

interface PozycjaZamowienia {
  kwiatId: number;
  poziomy: PoziomZamowienia[];
}

interface Zamowienie {
  id: number;
  status: string;
  dataUtworzenia: string;
  dataRealizacji: string;
  dostawca: string;
  uwagi: string;
  pozycje: PozycjaZamowienia[];
  numerZamowienia?: string; // Added for new column
}

const defaultZamowienie: Omit<Zamowienie, 'id' | 'pozycje'> = {
  status: 'nowe',
  dataUtworzenia: new Date().toISOString().slice(0, 10),
  dataRealizacji: '',
  dostawca: '',
  uwagi: '',
  numerZamowienia: ''
};

const ZamowienieKwiaty: React.FC = () => {
  const [kwiaty, setKwiaty] = useState<Kwiat[]>([]);
  const [zamowienia, setZamowienia] = useState<Zamowienie[]>([]);
  const [selectedZamowienieId, setSelectedZamowienieId] = useState<number | null>(null);
  const [showZamowienieForm, setShowZamowienieForm] = useState(false);
  const [zamowienieForm, setZamowienieForm] = useState(defaultZamowienie);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPozycjaModal, setShowPozycjaModal] = useState(false);
  const [pozycjaForm, setPozycjaForm] = useState<{ kwiatId: number; poziomy: PoziomZamowienia[] }>({ kwiatId: 0, poziomy: [] });
  const [editingPozycjaIdx, setEditingPozycjaIdx] = useState<number | null>(null);
  const [editingPoziomIdx, setEditingPoziomIdx] = useState<{pozycjaIdx: number, poziomIdx: number} | null>(null);
  const [poziomForm, setPoziomForm] = useState<PoziomZamowienia>({ cenaOd: 0, cenaDo: 0, ilosc: 1 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{pozycjaIdx: number, poziomIdx?: number} | null>(null);
  const [view, setView] = useState<'list' | 'details'>('list');
  const [imageModal, setImageModal] = useState<{ open: boolean; src: string; alt: string }>({ open: false, src: '', alt: '' });
  const [editingZamowienie, setEditingZamowienie] = useState<Zamowienie | null>(null);

  useEffect(() => {
    loadKwiaty();
    loadZamowienia();
  }, []);

  const loadKwiaty = async () => {
    try {
      const response = await fetch('/data/kwiaty.json');
      const data = await response.json();
      setKwiaty(data);
    } catch (error) {
      console.error('Błąd podczas ładowania kwiatów:', error);
    }
  };

  const loadZamowienia = async () => {
    try {
      const response = await fetch('/data/zamowienia-kwiaty.json');
      if (response.ok) {
        const data = await response.json();
        setZamowienia(data);
        if (data.length > 0) setSelectedZamowienieId(data[0].id);
      } else {
        setZamowienia([]);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania zamówień:', error);
      setZamowienia([]);
    }
  };

  const saveZamowienia = async (newZamowienia: Zamowienie[]) => {
    try {
      const response = await fetch('/data/zamowienia-kwiaty.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZamowienia, null, 2),
      });
      if (response.ok) setZamowienia(newZamowienia);
    } catch (error) {
      console.error('Błąd podczas zapisywania zamówień:', error);
    }
  };

  const selectedZamowienie = zamowienia.find(z => z.id === selectedZamowienieId) || null;

  // --- Zamówienie ---
  const handleCreateZamowienie = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZamowienie) {
      // Edycja istniejącego zamówienia
      const newZamowienia = zamowienia.map(z =>
        z.id === editingZamowienie.id ? { ...editingZamowienie, ...zamowienieForm } : z
      );
      saveZamowienia(newZamowienia);
      setEditingZamowienie(null);
      setShowZamowienieForm(false);
      setZamowienieForm(defaultZamowienie);
      return;
    }
    // Dodawanie nowego zamówienia
    const newZamowienie: Zamowienie = {
      id: Date.now(),
      ...zamowienieForm,
      pozycje: []
    };
    const newList = [newZamowienie, ...zamowienia];
    saveZamowienia(newList);
    setSelectedZamowienieId(newZamowienie.id);
    setShowZamowienieForm(false);
    setZamowienieForm(defaultZamowienie);
  };

  // --- Pozycje ---
  const handleAddPozycja = () => {
    setPozycjaForm({ kwiatId: 0, poziomy: [] });
    setEditingPozycjaIdx(null);
    setShowPozycjaModal(true);
  };

  const handleEditPozycja = (idx: number) => {
    if (!selectedZamowienie) return;
    setPozycjaForm({
      kwiatId: selectedZamowienie.pozycje[idx].kwiatId,
      poziomy: [...selectedZamowienie.pozycje[idx].poziomy]
    });
    setEditingPozycjaIdx(idx);
    setShowPozycjaModal(true);
  };

  const handleSavePozycja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZamowienie) return;
    if (!pozycjaForm.kwiatId || pozycjaForm.poziomy.length === 0) {
      alert('Wybierz kwiat i dodaj przynajmniej jeden poziom.');
      return;
    }
    let newPozycje = [...selectedZamowienie.pozycje];
    if (editingPozycjaIdx !== null) {
      newPozycje[editingPozycjaIdx] = { ...pozycjaForm };
    } else {
      newPozycje.push({ ...pozycjaForm });
    }
    const newZamowienia = zamowienia.map(z =>
      z.id === selectedZamowienie.id ? { ...z, pozycje: newPozycje } : z
    );
    saveZamowienia(newZamowienia);
    setShowPozycjaModal(false);
    setPozycjaForm({ kwiatId: 0, poziomy: [] });
    setEditingPozycjaIdx(null);
  };

  const handleDeletePozycja = (idx: number) => {
    setDeleteTarget({ pozycjaIdx: idx });
    setShowConfirmDialog(true);
  };

  const confirmDeletePozycja = () => {
    if (!selectedZamowienie || deleteTarget === null) return;
    const newPozycje = selectedZamowienie.pozycje.filter((_, i) => i !== deleteTarget.pozycjaIdx);
    const newZamowienia = zamowienia.map(z =>
      z.id === selectedZamowienie.id ? { ...z, pozycje: newPozycje } : z
    );
    saveZamowienia(newZamowienia);
    setShowConfirmDialog(false);
    setDeleteTarget(null);
  };

  // --- Poziomy ---
  const handleAddPoziom = () => {
    setPoziomForm({ cenaOd: 0, cenaDo: 0, ilosc: 1 });
    setEditingPoziomIdx(null);
  };
  const handleEditPoziom = (pozycjaIdx: number, poziomIdx: number) => {
    const poziom = pozycjaForm.poziomy[poziomIdx];
    setPoziomForm({ ...poziom });
    setEditingPoziomIdx({ pozycjaIdx, poziomIdx });
  };
  const handleSavePoziom = (e: React.FormEvent) => {
    e.preventDefault();
    if (poziomForm.cenaOd < 0 || poziomForm.cenaDo < 0 || poziomForm.ilosc <= 0) {
      alert('Wprowadź poprawne wartości.');
      return;
    }
    if (poziomForm.cenaOd > poziomForm.cenaDo) {
      alert('Cena od nie może być większa niż do.');
      return;
    }
    let newPoziomy = [...pozycjaForm.poziomy];
    if (editingPoziomIdx) {
      newPoziomy[editingPoziomIdx.poziomIdx] = { ...poziomForm };
    } else {
      newPoziomy.push({ ...poziomForm });
    }
    setPozycjaForm({ ...pozycjaForm, poziomy: newPoziomy });
    setPoziomForm({ cenaOd: 0, cenaDo: 0, ilosc: 1 });
    setEditingPoziomIdx(null);
  };
  const handleDeletePoziom = (pozycjaIdx: number, poziomIdx: number) => {
    setDeleteTarget({ pozycjaIdx, poziomIdx });
    setShowConfirmDialog(true);
  };
  const confirmDeletePoziom = () => {
    if (deleteTarget && deleteTarget.poziomIdx !== undefined) {
      let newPoziomy = [...pozycjaForm.poziomy];
      newPoziomy.splice(deleteTarget.poziomIdx, 1);
      setPozycjaForm({ ...pozycjaForm, poziomy: newPoziomy });
      setShowConfirmDialog(false);
      setDeleteTarget(null);
    }
  };

  // --- Widok ---
  const handleDownloadPDF = async (zamowienie: Zamowienie) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Czcionka helvetica (wbudowana, obsługuje polskie znaki)
    doc.setFont('helvetica', 'normal');

    // Funkcja do pobierania base64 obrazka
    async function getImageBase64(url: string) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }

    // Logo
    let logoHeight = 60;
    let logoWidth = 120;
    let logoY = margin + 8;
    let logoX = margin + 8;
    try {
      const logoUrl = '/images/logo.png';
      const img = await fetch(logoUrl).then(r => r.blob());
      const reader = new FileReader();
      await new Promise(resolve => {
        reader.onload = function(e) {
          if (e.target && typeof e.target.result === 'string') {
            doc.addImage(e.target.result, 'PNG', logoX, logoY, logoWidth, logoHeight);
          }
          resolve(null);
        };
        reader.readAsDataURL(img);
      });
    } catch {}

    // Dane dostawcy
    let dostawcaY = logoY;
    let dostawcaX = margin + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Dostawca:', dostawcaX, dostawcaY + 8);
    doc.setFont('helvetica', 'normal');
    let dostawcaText = [
      zamowienie.dostawca || '-',
      'Warszawa 22-22',
      'ul. Kwiatowa 12',
      '+48 123 456 789',
      'zamowienia@flowerparadise.pl'
    ];
    dostawcaText.forEach((line, i) => {
      doc.text(line, dostawcaX, dostawcaY + 28 + i * 16);
    });
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'normal');
    doc.textWithLink('zamowienia@flowerparadise.pl', dostawcaX, dostawcaY + 28 + 4 * 16, { url: 'mailto:zamowienia@flowerparadise.pl' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Daty po prawej
    doc.setFontSize(9);
    let dataX = pageWidth - margin - 160;
    doc.text(`Data: ${zamowienie.dataUtworzenia || '-'}`, dataX, logoY + 8);
    doc.text(`Data realizacji: ${zamowienie.dataRealizacji || '-'}`, dataX, logoY + 28);

    // Tytuł i numer zamówienia na środku
    doc.setFontSize(13);
    const tytul = 'Zamówienie numer';
    const numer = zamowienie.numerZamowienia || '---';
    doc.setFont('helvetica', 'normal');
    const tytulWidth = doc.getTextWidth(tytul);
    const numerWidth = doc.getTextWidth(numer);
    doc.setFont('helvetica', 'normal');
    const centerX = pageWidth / 2;
    let tytulY = logoY + logoHeight + 80;
    doc.text(tytul, centerX - (tytulWidth + numerWidth + 8) / 2, tytulY);
    doc.setFont('helvetica', 'bold');
    doc.text(numer, centerX - (tytulWidth + numerWidth + 8) / 2 + tytulWidth + 8, tytulY);
    doc.setFont('helvetica', 'normal');

    const pozycje = zamowienie.pozycje || [];
    // Przygotuj osobną tablicę z obrazkami i podpisami
    const images = await Promise.all(pozycje.map(async (poz: any, idx: number) => {
      const kwiat = kwiaty.find(k => k.id === poz.kwiatId);
      let imgData = '';
      if (kwiat?.zdjecie) {
        try { imgData = await getImageBase64(kwiat.zdjecie); } catch {}
      }
      return { img: imgData, podpis: kwiat?.nazwa ? `${kwiat.nazwa} ${kwiat.odmiana || ''}`.trim() : '' };
    }));

    // Do tabeli przekazuj tylko pusty string w kolumnie „Zdjęcie”
    const tableBody = pozycje.map((poz: any, idx: number) => {
      const kwiat = kwiaty.find(k => k.id === poz.kwiatId);
      return [
        idx + 1,
        '', // kolumna Zdjęcie
        kwiat?.nazwa || '-',
        kwiat?.odmiana || '-',
        kwiat?.kolor || '-',
        kwiat?.wysokosc ? `${kwiat.wysokosc} cm` : '-',
        (poz.poziomy as any[]).map((p: any) => `${p.cenaOd} - ${p.cenaDo} zł / ${p.ilosc} szt.`).join('\n')
      ];
    });

    autoTable(doc, {
      head: [[
        'LP', 'Zdjęcie', 'Nazwa', 'Odmiana', 'Kolor', 'Wysokość', 'Poziom Cen'
      ]],
      body: tableBody,
      startY: tytulY + 24,
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', halign: 'center' },
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', cellPadding: 1.5 },
      bodyStyles: { minCellHeight: 110 },
      columnStyles: {
        0: { cellWidth: 28, halign: 'center' }, // LP
        1: { cellWidth: 110, halign: 'center' }, // Zdjęcie
        2: { cellWidth: 70, halign: 'center' }, // Nazwa
        3: { cellWidth: 70, halign: 'center' }, // Odmiana
        4: { cellWidth: 70, halign: 'center' }, // Kolor
        5: { cellWidth: 50, halign: 'center' }, // Wysokość
        6: { cellWidth: 120, halign: 'left', fontSize: 6 }
      },
      didDrawCell: data => {
        doc.setFont('helvetica', 'normal');
        // Zdjęcie
        if (data.column.index === 1 && data.section === 'body') {
          const row = data.row.index;
          const { img } = images[row] || {};
          if (img && img.startsWith('data:image')) {
            const imgSize = 100;
            const x = data.cell.x + (data.cell.width - imgSize) / 2;
            const y = data.cell.y + 2;
            doc.addImage(img, 'JPEG', x, y, imgSize, imgSize);
          }
        }
      }
    });

    // Uwagi pod tabelą
    let uwagiY = (doc as any).lastAutoTable.finalY + 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Uwagi:', margin + 8, uwagiY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(zamowienie.uwagi || '-', margin + 60, uwagiY, {
      maxWidth: pageWidth - margin * 2 - 60,
      lineHeightFactor: 1.2
    });
    doc.setFont('helvetica', 'normal');

    doc.save(`zamowienie_kwiaty_${zamowienie.numerZamowienia || zamowienie.id}.pdf`);
  };

  return (
    <div>
      {view === 'list' && (
        <>
          <div className="card-header">
            <div>
              <div className="card-title">Lista zamówień kwiatów</div>
              <div className="card-subtitle">Zarządzanie zamówieniami kwiatów</div>
            </div>
            <div className="d-flex align-center gap-2">
              <button className="btn btn-primary" onClick={() => setShowZamowienieForm(true)}>
                <Plus size={16} /> Dodaj zamówienie
              </button>
            </div>
          </div>
          <div className="d-flex justify-between align-center mb-3">
            <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
              <div className="search-container" style={{ flex: 2 }}>
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Szukaj zamówień po dostawcy, statusie..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>LP</th>
                  <th>Numer zamówienia</th>
                  <th>Status</th>
                  <th>Data utworzenia</th>
                  <th>Data realizacji</th>
                  <th>Dostawca</th>
                  <th>Uwagi</th>
                  <th>Liczba pozycji</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {zamowienia.filter(z =>
                  z.dostawca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  z.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  z.uwagi.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((z, idx) => (
                  <tr key={z.id}>
                    <td>{idx + 1}</td>
                    <td>{z.numerZamowienia || '-'}</td>
                    <td>{z.status}</td>
                    <td>{z.dataUtworzenia}</td>
                    <td>{z.dataRealizacji}</td>
                    <td>{z.dostawca}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={z.uwagi}>{z.uwagi}</td>
                    <td>{z.pozycje.length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="table-action-btn primary-btn" title="Pozycje zamówienia" onClick={() => { setSelectedZamowienieId(z.id); setView('details'); }}>
                          <Flower2 size={18} />
                        </button>
                        <button className="table-action-btn download-btn" title="Pobierz PDF" onClick={() => handleDownloadPDF(z)}>
                          <Download size={18} />
                        </button>
                        <button className="table-action-btn edit-btn" title="Edytuj zamówienie" onClick={() => { setEditingZamowienie(z); setZamowienieForm({ status: z.status, dataUtworzenia: z.dataUtworzenia, dataRealizacji: z.dataRealizacji, dostawca: z.dostawca, uwagi: z.uwagi, numerZamowienia: z.numerZamowienia }); setShowZamowienieForm(true); }}>
                          <Edit size={16} />
                        </button>
                        <button className="table-action-btn delete-btn" title="Usuń zamówienie" onClick={() => { setDeleteTarget({ pozycjaIdx: -1 }); setShowConfirmDialog(true); }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'details' && selectedZamowienie && (
        <>
          <div className="card-header">
            <div>
              <div className="card-title">Zamówienie: {selectedZamowienie.dostawca} ({selectedZamowienie.dataRealizacji})</div>
              <div className="card-subtitle">Pozycje kwiatów w zamówieniu</div>
            </div>
            <div className="d-flex align-center gap-2">
              <button className="btn" onClick={() => setView('list')}>Powrót do listy</button>
              <button className="btn btn-primary" onClick={handleAddPozycja}>
                <Plus size={16} /> Dodaj kwiat do zamówienia
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>LP</th>
                  <th>Zdjęcie</th>
                  <th>Nazwa</th>
                  <th>Odmiana</th>
                  <th>Kolor</th>
                  <th>Wysokość</th>
                  <th>Poziomy (cena od-do, ilość)</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {selectedZamowienie.pozycje.map((pozycja, idx) => {
                  const kwiat = kwiaty.find(k => k.id === pozycja.kwiatId);
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        {kwiat?.zdjecie && (
                          <img
                            src={kwiat.zdjecie}
                            alt={kwiat.nazwa}
                            className="table-image"
                            style={{ maxWidth: 100, maxHeight: 100, cursor: 'pointer', borderRadius: 8, border: '1px solid #eee' }}
                            onClick={() => setImageModal({ open: true, src: kwiat.zdjecie, alt: kwiat.nazwa || '' })}
                          />
                        )}
                      </td>
                      <td>{kwiat?.nazwa}</td>
                      <td>{kwiat?.odmiana}</td>
                      <td>{kwiat?.kolor}</td>
                      <td>{kwiat?.wysokosc}</td>
                      <td>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {pozycja.poziomy.map((poziom, pidx) => (
                            <li key={pidx} style={{ marginBottom: 4 }}>
                              <span className="price-range">{poziom.cenaOd} - {poziom.cenaDo} zł</span>
                              <span className="quantity-badge" style={{ marginLeft: 8 }}>{poziom.ilosc} szt.</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => handleEditPozycja(idx)} title="Edytuj pozycję">
                            <Edit size={20} color="#b8862a" style={{ transition: 'transform 0.15s' }} />
                          </button>
                          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => handleDeletePozycja(idx)} title="Usuń pozycję">
                            <Trash2 size={20} color="#ea5455" style={{ transition: 'transform 0.15s' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showZamowienieForm && (
        <div className="modal-overlay" onClick={() => {
          setShowZamowienieForm(false);
          setEditingZamowienie(null);
          setZamowienieForm(defaultZamowienie);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingZamowienie ? 'Edytuj zamówienie' : 'Dodaj zamówienie'}</h2>
              <button className="modal-close" onClick={() => {
                setShowZamowienieForm(false);
                setEditingZamowienie(null);
                setZamowienieForm(defaultZamowienie);
              }}>×</button>
            </div>
            <form onSubmit={handleCreateZamowienie} className="modal-body">
              <div className="form-group">
                <label>Numer zamówienia:</label>
                <input
                  type="text"
                  value={zamowienieForm.numerZamowienia || ''}
                  onChange={e => setZamowienieForm(f => ({ ...f, numerZamowienia: e.target.value }))}
                  required
                  placeholder="np. 001/06/2024"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={zamowienieForm.status} onChange={e => setZamowienieForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="nowe">Nowe</option>
                    <option value="w realizacji">W realizacji</option>
                    <option value="zrealizowane">Zrealizowane</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data utworzenia</label>
                  <input type="date" value={zamowienieForm.dataUtworzenia} onChange={e => setZamowienieForm(f => ({ ...f, dataUtworzenia: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Data realizacji</label>
                  <input type="date" value={zamowienieForm.dataRealizacji} onChange={e => setZamowienieForm(f => ({ ...f, dataRealizacji: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Dostawca</label>
                  <input type="text" value={zamowienieForm.dostawca} onChange={e => setZamowienieForm(f => ({ ...f, dostawca: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Uwagi</label>
                  <textarea value={zamowienieForm.uwagi} onChange={e => setZamowienieForm(f => ({ ...f, uwagi: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowZamowienieForm(false); setEditingZamowienie(null); }}>Anuluj</button>
                <button type="submit" className="btn btn-primary">{editingZamowienie ? 'Zapisz zmiany' : 'Utwórz zamówienie'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPozycjaModal && (
        <div className="modal-overlay" onClick={() => setShowPozycjaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPozycjaIdx !== null ? 'Edytuj pozycję' : 'Dodaj pozycję'}</h3>
              <button className="modal-close" onClick={() => setShowPozycjaModal(false)}>×</button>
            </div>
            <form onSubmit={handleSavePozycja} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Kwiat</label>
                  <select
                    value={pozycjaForm.kwiatId}
                    onChange={e => setPozycjaForm(f => ({ ...f, kwiatId: Number(e.target.value) }))}
                    required
                    disabled={editingPozycjaIdx !== null}
                  >
                    <option value="">Wybierz kwiat</option>
                    {kwiaty.map(kwiat => (
                      <option key={kwiat.id} value={kwiat.id}>
                        {kwiat.nazwa} - {kwiat.odmiana} ({kwiat.kolor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Poziomy cenowe</label>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAddPoziom} style={{ marginLeft: 8 }}>Dodaj poziom</button>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {pozycjaForm.poziomy.map((poziom, pidx) => (
                      <li key={pidx} style={{ marginBottom: 4 }}>
                        <span className="price-range">{poziom.cenaOd} - {poziom.cenaDo} zł</span>
                        <span className="quantity-badge" style={{ marginLeft: 8 }}>{poziom.ilosc} szt.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {editingPoziomIdx === null && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Cena od (zł)</label>
                    <input type="number" step="0.01" min="0" value={poziomForm.cenaOd} onChange={e => setPoziomForm(f => ({ ...f, cenaOd: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label>Cena do (zł)</label>
                    <input type="number" step="0.01" min="0" value={poziomForm.cenaDo} onChange={e => setPoziomForm(f => ({ ...f, cenaDo: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label>Ilość (szt.)</label>
                    <input type="number" min="1" value={poziomForm.ilosc} onChange={e => setPoziomForm(f => ({ ...f, ilosc: parseInt(e.target.value) }))} />
                  </div>
                  <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleSavePoziom}>Dodaj poziom</button>
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPozycjaModal(false)}>Anuluj</button>
                <button type="submit" className="btn btn-primary">{editingPozycjaIdx !== null ? 'Zapisz zmiany' : 'Dodaj pozycję'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Potwierdź usunięcie"
          message={deleteTarget && deleteTarget.poziomIdx !== undefined ? "Czy na pewno chcesz usunąć ten poziom?" : "Czy na pewno chcesz usunąć tę pozycję?"}
          onConfirm={deleteTarget && deleteTarget.poziomIdx !== undefined ? confirmDeletePoziom : confirmDeletePozycja}
          onCancel={() => { setShowConfirmDialog(false); setDeleteTarget(null); }}
        />
      )}
      {imageModal.open && (
        <ImageModal
          isOpen={imageModal.open}
          imageSrc={imageModal.src}
          imageAlt={imageModal.alt}
          onClose={() => setImageModal({ open: false, src: '', alt: '' })}
        />
      )}
    </div>
  );
};

export default ZamowienieKwiaty; 