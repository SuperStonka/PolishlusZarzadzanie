import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Calendar, MapPin, Users, Clock, Package, User, Phone, Mail, Building } from 'lucide-react';

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
  projekt: Projekt;
  onPowrot: () => void;
  onZapisz: (projekt: Projekt) => void;
  isNew?: boolean;
}

const EdycjaProjektu: React.FC<Props> = ({ projekt, onPowrot, onZapisz, isNew = false }) => {
  const [formData, setFormData] = useState<Projekt>(projekt);
  const [etapy, setEtapy] = useState<Etap[]>([]);

  useEffect(() => {
    fetch("/data/etapy.json")
      .then(res => res.json())
      .then(data => setEtapy(data))
      .catch(err => console.error("Błąd pobierania etapów:", err));
  }, []);

  const handleInputChange = (field: keyof Projekt, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKontaktChange = (type: 'zamawiajacy' | 'naObiekcie', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`kontakt${type === 'zamawiajacy' ? 'Zamawiajacy' : 'NaObiekcie'}`]: {
        ...prev[`kontakt${type === 'zamawiajacy' ? 'Zamawiajacy' : 'NaObiekcie'}`],
        [field]: value
      }
    }));
  };

  const handleTerminyChange = (typ: 'pakowanie' | 'montaz' | 'demontaz', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      terminy: {
        ...prev.terminy,
        [typ]: {
          ...prev.terminy[typ],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onZapisz(formData);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              {isNew ? 'Nowy Projekt' : 'Edycja Projektu'}
            </div>
            <div className="card-subtitle">
              {isNew ? 'Dodaj nowy projekt' : `${projekt.numer} - ${projekt.nazwa}`}
            </div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={onPowrot}
            >
              <ArrowLeft size={16} />
              Powrót
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              <Save size={16} />
              {isNew ? 'Utwórz' : 'Zapisz'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="projekt-form">
          <div className="form-sections">
            <div className="form-section">
              <h3>Informacje podstawowe</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Numer projektu *</label>
                  <input
                    type="text"
                    value={formData.numer}
                    onChange={(e) => handleInputChange('numer', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nazwa *</label>
                  <input
                    type="text"
                    value={formData.nazwa}
                    onChange={(e) => handleInputChange('nazwa', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lokalizacja *</label>
                  <input
                    type="text"
                    value={formData.lokalizacja}
                    onChange={(e) => handleInputChange('lokalizacja', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="form-input"
                  >
                    <option value="aktywne">Aktywne</option>
                    <option value="w_trakcie">W trakcie</option>
                    <option value="zakonczone">Zakończone</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Etap</label>
                  <select
                    value={formData.etapId || ''}
                    onChange={(e) => handleInputChange('etapId', Number(e.target.value))}
                    className="form-input"
                  >
                    <option value="">Wybierz etap</option>
                    {etapy.map(etap => (
                      <option key={etap.id} value={etap.id}>
                        {etap.nazwa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zamawiający *</label>
                  <input
                    type="text"
                    value={formData.zamawiajacy}
                    onChange={(e) => handleInputChange('zamawiajacy', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Kontakt zamawiający</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Imię</label>
                  <input
                    type="text"
                    value={formData.kontaktZamawiajacy?.imie || ''}
                    onChange={(e) => handleKontaktChange('zamawiajacy', 'imie', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nazwisko</label>
                  <input
                    type="text"
                    value={formData.kontaktZamawiajacy?.nazwisko || ''}
                    onChange={(e) => handleKontaktChange('zamawiajacy', 'nazwisko', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Firma</label>
                  <input
                    type="text"
                    value={formData.kontaktZamawiajacy?.firma || ''}
                    onChange={(e) => handleKontaktChange('zamawiajacy', 'firma', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    value={formData.kontaktZamawiajacy?.telefon || ''}
                    onChange={(e) => handleKontaktChange('zamawiajacy', 'telefon', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.kontaktZamawiajacy?.email || ''}
                    onChange={(e) => handleKontaktChange('zamawiajacy', 'email', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Kontakt na obiekcie</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Imię</label>
                  <input
                    type="text"
                    value={formData.kontaktNaObiekcie?.imie || ''}
                    onChange={(e) => handleKontaktChange('naObiekcie', 'imie', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nazwisko</label>
                  <input
                    type="text"
                    value={formData.kontaktNaObiekcie?.nazwisko || ''}
                    onChange={(e) => handleKontaktChange('naObiekcie', 'nazwisko', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stanowisko</label>
                  <input
                    type="text"
                    value={formData.kontaktNaObiekcie?.stanowisko || ''}
                    onChange={(e) => handleKontaktChange('naObiekcie', 'stanowisko', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input
                    type="tel"
                    value={formData.kontaktNaObiekcie?.telefon || ''}
                    onChange={(e) => handleKontaktChange('naObiekcie', 'telefon', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.kontaktNaObiekcie?.email || ''}
                    onChange={(e) => handleKontaktChange('naObiekcie', 'email', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Harmonogram</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data pakowania</label>
                  <input
                    type="date"
                    value={formData.terminy.pakowanie.data || ''}
                    onChange={(e) => handleTerminyChange('pakowanie', 'data', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Godzina pakowania</label>
                  <input
                    type="time"
                    value={formData.terminy.pakowanie.godzina || ''}
                    onChange={(e) => handleTerminyChange('pakowanie', 'godzina', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data montażu od</label>
                  <input
                    type="date"
                    value={formData.terminy.montaz.dataOd || ''}
                    onChange={(e) => handleTerminyChange('montaz', 'dataOd', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Data montażu do</label>
                  <input
                    type="date"
                    value={formData.terminy.montaz.dataDo || ''}
                    onChange={(e) => handleTerminyChange('montaz', 'dataDo', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data demontażu</label>
                  <input
                    type="date"
                    value={formData.terminy.demontaz.data || ''}
                    onChange={(e) => handleTerminyChange('demontaz', 'data', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Godzina demontażu</label>
                  <input
                    type="time"
                    value={formData.terminy.demontaz.godzina || ''}
                    onChange={(e) => handleTerminyChange('demontaz', 'godzina', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Dodatkowe informacje</h3>
              
              <div className="form-group">
                <label>Opis</label>
                <textarea
                  value={formData.opis || ''}
                  onChange={(e) => handleInputChange('opis', e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Opis projektu..."
                />
              </div>

              <div className="form-group">
                <label>Uwagi</label>
                <textarea
                  value={formData.uwagi || ''}
                  onChange={(e) => handleInputChange('uwagi', e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Dodatkowe uwagi..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EdycjaProjektu; 