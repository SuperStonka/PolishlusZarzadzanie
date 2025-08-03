import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

interface FormaRozliczenia {
  id: number;
  nazwa: string;
}

const PUSTA_FORMA: FormaRozliczenia = { id: 0, nazwa: '' };

const FormyRozliczen: React.FC = () => {
  const [formy, setFormy] = useState<FormaRozliczenia[]>([]);
  const [nowa, setNowa] = useState<FormaRozliczenia>(PUSTA_FORMA);
  const [editing, setEditing] = useState<FormaRozliczenia | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number, nazwa: string}>({isOpen: false, id: 0, nazwa: ''});

  useEffect(() => {
    fetch('/data/formy-rozliczen.json')
      .then(res => res.json())
      .then(setFormy)
      .catch(() => setFormy([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editing) {
      setEditing({ ...editing, [name]: value });
    } else {
      setNowa({ ...nowa, [name]: value });
    }
  };

  const handleSave = () => {
    if (editing) {
      setFormy(formy.map(f => f.id === editing.id ? editing : f));
      setEditing(null);
      setShowModal(false);
      setNowa(PUSTA_FORMA);
    } else {
      const id = Date.now();
      setFormy([...formy, { ...nowa, id }]);
      setNowa(PUSTA_FORMA);
      setShowModal(false);
    }
  };

  const handleEdit = (f: FormaRozliczenia) => {
    setEditing(f);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setNowa(PUSTA_FORMA);
    setShowModal(true);
  };

  const handleDelete = (f: FormaRozliczenia) => {
    setConfirmDialog({ isOpen: true, id: f.id, nazwa: f.nazwa });
  };
  const confirmDelete = () => {
    setFormy(formy.filter(f => f.id !== confirmDialog.id));
    setConfirmDialog({ isOpen: false, id: 0, nazwa: '' });
  };
  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, id: 0, nazwa: '' });
  };

  return (
    <div>
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Formy rozliczeń</div>
            <div className="card-subtitle">Zarządzanie formami rozliczeń</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={16} /> Dodaj formę
            </button>
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Inicjały</th>
              <th>Nazwa</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {formy.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>
                  <div className="project-icon purple">
                    {(f.nazwa || 'FR').substring(0, 2).toUpperCase()}
                  </div>
                </td>
                <td>{f.nazwa}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="table-action-btn edit-btn" onClick={() => handleEdit(f)} title="Edytuj">
                      <Edit size={16} />
                    </button>
                    <button className="table-action-btn delete-btn" onClick={() => handleDelete(f)} title="Usuń">
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
              <h2>{editing ? 'Edytuj formę rozliczenia' : 'Dodaj nową formę rozliczenia'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditing(null); setNowa(PUSTA_FORMA); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nazwa</label>
                <input type="text" name="nazwa" className="form-input" value={editing ? editing.nazwa : nowa.nazwa} onChange={handleChange} required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} /> {editing ? 'Zapisz zmiany' : 'Dodaj formę'}
              </button>
              <button className="btn" onClick={() => { setShowModal(false); setEditing(null); setNowa(PUSTA_FORMA); }}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
      {confirmDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Potwierdź usunięcie</h2>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              Czy na pewno chcesz usunąć formę rozliczenia "{confirmDialog.nazwa}"?
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={confirmDelete}>Usuń</button>
              <button className="btn" onClick={cancelDelete}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormyRozliczen; 