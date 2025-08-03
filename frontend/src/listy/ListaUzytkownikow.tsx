import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User, Shield, ChevronUp, ChevronDown, Image, Key } from 'lucide-react';
import '../styles/ListaUzytkownikow.css';

interface GrupaUprawnien {
  id: number;
  nazwa: string;
  opis: string;
  aktywna: boolean;
}

interface Uzytkownik {
  id: number;
  login: string;
  imie: string;
  nazwisko: string;
  rola: number; // id grupy uprawnień
  haslo: string;
  mail: string;
  avatar?: string; // ścieżka do avatara
}

const ListaUzytkownikow: React.FC = () => {
  const [uzytkownicy, setUzytkownicy] = useState<Uzytkownik[]>([]);
  const [grupyUprawnien, setGrupyUprawnien] = useState<GrupaUprawnien[]>([]);
  const [search, setSearch] = useState('');
  const [filterRola, setFilterRola] = useState<number | ''>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Uzytkownik | null;
    direction: 'asc' | 'desc';
  }>({ key: 'imie', direction: 'asc' });
  const [editingUser, setEditingUser] = useState<Uzytkownik | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetch("/data/uzytkownicy.json")
      .then(res => res.json())
      .then(data => setUzytkownicy(data))
      .catch(err => console.error("Błąd pobierania użytkowników:", err));
    fetch("/data/grupyUprawnien.json")
      .then(res => res.json())
      .then(data => setGrupyUprawnien(data))
      .catch(err => console.error("Błąd pobierania grup uprawnień:", err));
  }, []);

  const getNazwaGrupy = (id: number) => {
    const grupa = grupyUprawnien.find(g => g.id === id);
    return grupa ? grupa.nazwa : '';
  };

  const handleSort = (key: keyof Uzytkownik) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Uzytkownik) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={16} className="sort-icon inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon active" />
      : <ChevronDown size={16} className="sort-icon active" />;
  };

  const filteredUzytkownicy = uzytkownicy
    .filter(uzytkownik => {
      const searchLower = search.toLowerCase();
      const grupaNazwa = getNazwaGrupy(uzytkownik.rola).toLowerCase();
      const fullName = `${uzytkownik.imie} ${uzytkownik.nazwisko}`.toLowerCase();
      const matchesSearch = 
        uzytkownik.login.toLowerCase().includes(searchLower) ||
        uzytkownik.imie.toLowerCase().includes(searchLower) ||
        uzytkownik.nazwisko.toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower) ||
        uzytkownik.mail.toLowerCase().includes(searchLower) ||
        grupaNazwa.includes(searchLower);
      const matchesRole = !filterRola || uzytkownik.rola === filterRola;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue: string | number = a[sortConfig.key] || '';
      let bValue: string | number = b[sortConfig.key] || '';
      
      // Specjalna obsługa dla roli (wyświetl nazwę grupy)
      if (sortConfig.key === 'rola') {
        aValue = getNazwaGrupy(a.rola);
        bValue = getNazwaGrupy(b.rola);
      }
      
      // Specjalna obsługa dla sortowania po imieniu (łączy imię i nazwisko)
      if (sortConfig.key === 'imie') {
        aValue = `${a.imie} ${a.nazwisko}`;
        bValue = `${b.imie} ${b.nazwisko}`;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const role = grupyUprawnien.filter(g => g.aktywna);

  const getRoleColor = (rolaId: number) => {
    const grupa = grupyUprawnien.find(g => g.id === rolaId);
    if (!grupa) return 'role-default';
    switch (grupa.nazwa) {
      case 'Administrator':
        return 'role-admin';
      case 'Kierownik':
        return 'role-opiekun';
      case 'Pracownik':
        return 'role-magazynier';
      case 'Gość':
        return 'role-wspolpracownik';
      default:
        return 'role-default';
    }
  };

  const handleEdit = (uzytkownik: Uzytkownik) => {
    setEditingUser(uzytkownik);
  };

  const handleDelete = (login: string) => {
    if (window.confirm(`Czy na pewno chcesz usunąć użytkownika ${login}?`)) {
      setUzytkownicy(uzytkownicy.filter(u => u.login !== login));
    }
  };

  const handleResetPassword = (login: string) => {
    if (window.confirm(`Czy na pewno chcesz zresetować hasło użytkownika ${login}?`)) {
      // Symulacja resetowania hasła - w rzeczywistej aplikacji byłoby to API call
      const updatedUsers = uzytkownicy.map(u => 
        u.login === login ? { ...u, haslo: 'nowehaslo123' } : u
      );
      setUzytkownicy(updatedUsers);
      alert(`Hasło użytkownika ${login} zostało zresetowane na: nowehaslo123`);
    }
  };

  const handleSave = (uzytkownik: Uzytkownik) => {
    if (editingUser) {
      setUzytkownicy(uzytkownicy.map(u => u.login === editingUser.login ? uzytkownik : u));
      setEditingUser(null);
    } else if (isAddingUser) {
      setUzytkownicy([...uzytkownicy, uzytkownik]);
      setIsAddingUser(false);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsAddingUser(false);
  };

  return (
    <div className="lista-uzytkownikow">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Lista Użytkowników</div>
            <div className="card-subtitle">Zarządzanie kontami użytkowników systemu</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setIsAddingUser(true)}
            >
              <Plus size={16} />
              Dodaj użytkownika
            </button>
            <div className="card-icon">
              <User size={24} />
            </div>
          </div>
        </div>
        <div className="d-flex justify-between align-center mb-3">
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Szukaj użytkowników..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="d-flex gap-2">
            <select
              value={filterRola}
              onChange={(e) => setFilterRola(e.target.value ? Number(e.target.value) : '')}
              className="form-select"
              style={{ minWidth: '150px' }}
            >
              <option value="">Wszystkie grupy</option>
              {role.map(r => (
                <option key={r.id} value={r.id}>{r.nazwa}</option>
              ))}
            </select>


          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('imie')} className="sortable-header">
                Użytkownik {getSortIcon('imie')}
              </th>
              <th onClick={() => handleSort('login')} className="sortable-header">
                Login {getSortIcon('login')}
              </th>
              <th onClick={() => handleSort('mail')} className="sortable-header">
                Email {getSortIcon('mail')}
              </th>
              <th onClick={() => handleSort('rola')} className="sortable-header">
                Grupa uprawnień {getSortIcon('rola')}
              </th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredUzytkownicy.map(uzytkownik => (
              <tr key={uzytkownik.login}>
                <td>
                  <div className="project-info">
                    <div className="user-avatar">
                      <img 
                        src={uzytkownik.avatar || "/images/avatars/avatar_01.png"} 
                        alt={`Avatar ${uzytkownik.login}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/avatars/avatar_01.png";
                        }}
                      />
                    </div>
                    <div className="project-details">
                      <div className="project-title">
                        {uzytkownik.imie && uzytkownik.nazwisko ? `${uzytkownik.imie} ${uzytkownik.nazwisko}` : 'Brak danych'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="user-login">{uzytkownik.login}</span>
                </td>
                <td>{uzytkownik.mail}</td>
                <td>
                  <span className={`role-badge ${getRoleColor(uzytkownik.rola)}`}>
                    <Shield size={12} />
                    {getNazwaGrupy(uzytkownik.rola)}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="table-action-btn reset-password-btn"
                      onClick={() => handleResetPassword(uzytkownik.login)}
                      title="Resetuj hasło"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      className="table-action-btn edit-btn"
                      onClick={() => handleEdit(uzytkownik)}
                      title="Edytuj"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="table-action-btn delete-btn"
                      onClick={() => handleDelete(uzytkownik.login)}
                      title="Usuń"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUzytkownicy.length === 0 && (
          <div className="empty-state">
            <p>Nie znaleziono użytkowników</p>
          </div>
        )}
      </div>
      {(editingUser || isAddingUser) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Edytuj użytkownika' : 'Dodaj użytkownika'}</h2>
              <button className="modal-close" onClick={handleCancel}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <UserForm
                user={editingUser || {
                  id: 0,
                  login: '',
                  imie: '',
                  nazwisko: '',
                  rola: role.length > 0 ? role[0].id : 1,
                  haslo: '',
                  mail: ''
                }}
                onSave={handleSave}
                onCancel={handleCancel}
                isNew={!editingUser}
                grupyUprawnien={role}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface UserFormProps {
  user: Uzytkownik;
  onSave: (user: Uzytkownik) => void;
  onCancel: () => void;
  isNew: boolean;
  grupyUprawnien: GrupaUprawnien[];
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isNew, grupyUprawnien }) => {
  const [formData, setFormData] = useState<Uzytkownik>(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label>Login</label>
        <input
          type="text"
          value={formData.login}
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
          required
          disabled={!isNew}
        />
      </div>
      <div className="form-group">
        <label>Imię</label>
        <input
          type="text"
          value={formData.imie}
          onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Nazwisko</label>
        <input
          type="text"
          value={formData.nazwisko}
          onChange={(e) => setFormData({ ...formData, nazwisko: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.mail}
          onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Grupa uprawnień</label>
        <select
          value={formData.rola}
          onChange={(e) => setFormData({ ...formData, rola: Number(e.target.value) })}
          required
        >
          {grupyUprawnien.map(grupa => (
            <option key={grupa.id} value={grupa.id}>{grupa.nazwa}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Hasło</label>
        <input
          type="password"
          value={formData.haslo}
          onChange={(e) => setFormData({ ...formData, haslo: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Avatar</label>
        <div className="avatar-selector">
          <div className="avatar-preview">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <User size={24} />
              </div>
            )}
          </div>
          <div className="avatar-options">
            <div className="avatar-grid">
              {[
                '/images/avatars/avatar_01.png',
                '/images/avatars/avatar_02.png',
                '/images/avatars/avatar_03.png',
                '/images/avatars/avatar_04.png',
                '/images/avatars/avatar_05.png',
                '/images/avatars/avatar_06.png',
                '/images/avatars/avatar_07.png',
                '/images/avatars/avatar_08.png',
                '/images/avatars/avatar_09.png',
                '/images/avatars/avatar_10.png',
                '/images/avatars/avatar_11.png',
                '/images/avatars/avatar_12.png'
              ].map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, avatar })}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setFormData({ ...formData, avatar: undefined })}
            >
              Usuń avatar
            </button>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Anuluj
        </button>
        <button type="submit" className="btn btn-primary">
          {isNew ? 'Dodaj' : 'Zapisz'}
        </button>
      </div>
    </form>
  );
};

export default ListaUzytkownikow; 