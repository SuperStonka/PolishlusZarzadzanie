import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import { Calendar as CalendarIcon } from 'lucide-react';

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

interface Event {
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
  etap: string;
  uwagi: string;
  utworzono: string;
  opis: string;
}

interface CalendarViewProps {
  onWybierzEvent: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onWybierzEvent }) => {
  const [projekty, setProjekty] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Ładuj projekty
    fetch("/data/projekty.json")
      .then(res => res.json())
      .then(data => setProjekty(data))
      .catch(err => console.error("Błąd pobierania projektów:", err));
  }, []);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
  };

  const handleEventClick = (event: Event) => {
    console.log('Kliknięto projekt:', event);
    // Tutaj możesz dodać logikę nawigacji do szczegółów projektu
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Kalendarz Projektów</div>
            <div className="card-subtitle">Harmonogram projektów i wydarzeń</div>
          </div>
        </div>
      </div>
      
      <Calendar 
        projekty={projekty}
        onEventClick={handleEventClick}
        selectedDate={currentDate.toISOString().split('T')[0]}
      />
    </div>
  );
};

export default CalendarView; 