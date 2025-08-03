import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Save, X, Search } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

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

const PUSTY: Dostawca = {
  id: '',
  nazwa: '',
  telefon: '',
  mail: '',
  czyFirma: false,
  nazwaFirmy: '',
  ulica: '',
  kodPocztowy: '',
  miasto: '',
  nip: ''
};

const ListaDostawcowKwiatow: React.FC = () => {
  const [dostawcy, setDostawcy] = useState<Dostawca[]>([]);
  const [wyszukiwanie, setWyszukiwanie] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nowy, setNowy] = useState<Dostawca>(PUSTY);
  const [editing, setEditing] = useState<Dostawca | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: string, name: string}>({isOpen: false, id: '', name: ''});

  useEffect(() => {
    fetch('/data/dostawcy-kwiatow.json')
      .then(res => res.json())
      .then(setDostawcy)
      .catch(() => setDostawcy([]));
  }, []);

  const filtered = dostawcy.filter(d =>
    d.nazwa.toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
    (d.nazwaFirmy || '').toLowerCase().includes(wyszukiwanie.toLowerCase()) ||
    (d.miasto || '').toLowerCase().includes(wyszukiwanie.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (editing) {
      setEditing({ ...editing, [name]: type === 'checkbox' ? checked : value });
    } else {
      setNowy({ ...nowy, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSave = () => {
    if (editing) {
      setDostawcy(dostawcy.map(d => d.id === editing.id ? editing : d));
      setEditing(null);
      setShowModal(false);
      setNowy(PUSTY);
    } else {
      const id = 'd' + (Date.now());
      setDostawcy([...dostawcy, { ...nowy, id }]);
      setNowy(PUSTY);
      setShowModal(false);
    }
  };

  const handleEdit = (d: Dostawca) => {
    setEditing(d);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setNowy(PUSTY);
    setShowModal(true);
  };

  const handleDelete = (d: Dostawca) => {
    setConfirmDialog({ isOpen: true, id: d.id, name: d.nazwa });
  };
  const confirmDelete = () => {
    setDostawcy(dostawcy.filter(d => d.id !== confirmDialog.id));
    setConfirmDialog({ isOpen: false, id: '', name: '' });
  };
  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, id: '', name: '' });
  };

  return (
    <div>
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista dostawców kwiatów</div>
            <div className="card-subtitle">Zarządzanie dostawcami kwiatów</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={16} /> Dodaj dostawcę
            </button>
          </div>
        </div>
        <div className="d-flex justify-between align-center mb-3">
          <div className="d-flex gap-2 align-center" style={{ flex: 1 }}>
            <div className="search-container" style={{ flex: 2 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Szukaj dostawcy po nazwie, firmie lub mieście..."
                value={wyszukiwanie}
                onChange={e => setWyszukiwanie(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
            <thead>
              <tr>
                <th>Inicjały</th>
                <th>Nazwa</th>
                <th>Firma</th>
                <th>Adres</th>
                <th>Miasto</th>
                <th>NIP</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr key={d.id}>
                  <td>
                    <div className="project-icon purple">
                      {(d.nazwa || 'DS').substring(0, 2).toUpperCase()}
                    </div>
                  </td>
                  <td>{d.nazwa}</td>
                  <td>{d.czyFirma ? d.nazwaFirmy : '-'}</td>
                  <td>{d.ulica || '-'}</td>
                  <td>{d.miasto || '-'}</td>
                  <td>{d.nip || '-'}</td>
                  <td>{d.telefon || '-'}</td>
                  <td>{d.mail || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="table-action-btn edit-btn" onClick={() => handleEdit(d)} title="Edytuj dostawcę">
                        <Edit size={16} />
                      </button>
                      <button className="table-action-btn delete-btn" onClick={() => handleDelete(d)} title="Usuń dostawcę">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Edytuj dostawcę' : 'Dodaj nowego dostawcę'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); setNowy(PUSTY); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nazwa</label>
                <input type="text" name="nazwa" className="form-input" value={editing ? editing.nazwa : nowy.nazwa} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input type="text" name="telefon" className="form-input" value={editing ? editing.telefon : nowy.telefon} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="mail" className="form-input" value={editing ? editing.mail : nowy.mail} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Nazwa firmy</label>
                <input type="text" name="nazwaFirmy" className="form-input" value={editing ? editing.nazwaFirmy : nowy.nazwaFirmy} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Ulica</label>
                <input type="text" name="ulica" className="form-input" value={editing ? editing.ulica : nowy.ulica} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Kod pocztowy</label>
                <input type="text" name="kodPocztowy" className="form-input" value={editing ? editing.kodPocztowy : nowy.kodPocztowy} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Miasto</label>
                <input type="text" name="miasto" className="form-input" value={editing ? editing.miasto : nowy.miasto} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">NIP</label>
                <input type="text" name="nip" className="form-input" value={editing ? editing.nip : nowy.nip} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} /> {editing ? 'Zapisz zmiany' : 'Dodaj dostawcę'}
              </button>
              <button className="btn" onClick={() => { setShowModal(false); setEditing(null); setNowy(PUSTY); }}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Potwierdź usunięcie"
          message={`Czy na pewno chcesz usunąć dostawcę "${confirmDialog.name}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ListaDostawcowKwiatow; 