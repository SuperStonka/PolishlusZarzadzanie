import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, User, Info, Phone, Mail, Building, Clock } from 'lucide-react';

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
}

const SzczegolyProjektu: React.FC<Props> = ({ projekt, onPowrot }) => {
  const [etapy, setEtapy] = useState<Etap[]>([]);

  useEffect(() => {
    fetch("/data/etapy.json")
      .then(res => res.json())
      .then(data => setEtapy(data))
      .catch(err => console.error("Błąd pobierania etapów:", err));
  }, []);

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Szczegóły Projektu</div>
            <div className="card-subtitle">{projekt.numer} - {projekt.nazwa}</div>
          </div>
          <div className="d-flex align-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={onPowrot}
            >
              <ArrowLeft size={16} />
              Powrót
            </button>
          </div>
        </div>

        <div className="projekt-details-grid">
          <div className="projekt-section">
            <h3>Informacje podstawowe</h3>
            <div className="detail-row">
              <span className="detail-label">Numer projektu:</span>
              <span className="detail-value">{projekt.numer}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nazwa:</span>
              <span className="detail-value">{projekt.nazwa}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Data:</span>
              <span className="detail-value">{formatujDate(projekt.data)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Lokalizacja:</span>
              <span className="detail-value">{projekt.lokalizacja}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${projekt.status}`}>
                {projekt.status.replace('_', ' ')}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Etap:</span>
              <span className="detail-value">
                {etapy.find(etap => etap.id === projekt.etapId)?.nazwa || '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Utworzono:</span>
              <span className="detail-value">{formatujDate(projekt.utworzono)}</span>
            </div>
          </div>

          <div className="projekt-section">
            <h3>Kontakt zamawiający</h3>
            <div className="detail-row">
              <span className="detail-label">Zamawiający:</span>
              <span className="detail-value">{projekt.zamawiajacy}</span>
            </div>
            {projekt.kontaktZamawiajacy && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Imię i nazwisko:</span>
                  <span className="detail-value">
                    {projekt.kontaktZamawiajacy.imie} {projekt.kontaktZamawiajacy.nazwisko}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Firma:</span>
                  <span className="detail-value">{projekt.kontaktZamawiajacy.firma}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Telefon:</span>
                  <span className="detail-value">{projekt.kontaktZamawiajacy.telefon}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{projekt.kontaktZamawiajacy.email}</span>
                </div>
              </>
            )}
          </div>

          <div className="projekt-section">
            <h3>Kontakt na obiekcie</h3>
            {projekt.kontaktNaObiekcie && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Imię i nazwisko:</span>
                  <span className="detail-value">
                    {projekt.kontaktNaObiekcie.imie} {projekt.kontaktNaObiekcie.nazwisko}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stanowisko:</span>
                  <span className="detail-value">{projekt.kontaktNaObiekcie.stanowisko}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Telefon:</span>
                  <span className="detail-value">{projekt.kontaktNaObiekcie.telefon}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{projekt.kontaktNaObiekcie.email}</span>
                </div>
              </>
            )}
          </div>

          <div className="projekt-section">
            <h3>Harmonogram</h3>
            <div className="detail-row">
              <span className="detail-label">Pakowanie:</span>
              <span className="detail-value">
                {projekt.terminy.pakowanie.data ? formatujDate(projekt.terminy.pakowanie.data) : 'Nie ustawiono'}
                {projekt.terminy.pakowanie.godzina && ` ${formatujGodzine(projekt.terminy.pakowanie.godzina)}`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Montaż:</span>
              <span className="detail-value">
                {projekt.terminy.montaz.dataOd ? formatujDate(projekt.terminy.montaz.dataOd) : 'Nie ustawiono'}
                {projekt.terminy.montaz.dataDo && ` - ${formatujDate(projekt.terminy.montaz.dataDo)}`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Demontaż:</span>
              <span className="detail-value">
                {projekt.terminy.demontaz.data ? formatujDate(projekt.terminy.demontaz.data) : 'Nie ustawiono'}
                {projekt.terminy.demontaz.godzina && ` ${formatujGodzine(projekt.terminy.demontaz.godzina)}`}
              </span>
            </div>
          </div>

          {(projekt.uwagi || projekt.opis) && (
            <div className="projekt-section">
              <h3>Dodatkowe informacje</h3>
              {projekt.uwagi && (
                <div className="detail-row">
                  <span className="detail-label">Uwagi:</span>
                  <span className="detail-value">{projekt.uwagi}</span>
                </div>
              )}
              {projekt.opis && (
                <div className="detail-row">
                  <span className="detail-label">Opis:</span>
                  <span className="detail-value">{projekt.opis}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SzczegolyProjektu; 