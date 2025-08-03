import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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

interface CalendarProps {
  projekty: Event[];
  onEventClick: (event: Event) => void;
  selectedDate?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  pakowanieEvents: Event[];
  montazEvents: Event[];
  demontazEvents: Event[];
}

const Calendar: React.FC<CalendarProps> = ({ projekty, onEventClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate));
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Dodaj dni z poprzedniego miesiąca
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Dodaj dni bieżącego miesiąca
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Dodaj dni z następnego miesiąca
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push(nextDate);
    }
    
    return days;
  }, [currentMonth]);

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projekty.filter(event => event.data === dateStr);
  };

  const getPakowanieEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projekty.filter(event => 
      event.terminy?.pakowanie?.data === dateStr
    );
  };

  const getMontazEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projekty.filter(event => {
      const montaz = event.terminy?.montaz;
      if (!montaz) return false;
      const montazStart = new Date(montaz.dataOd);
      const montazEnd = new Date(montaz.dataDo);
      const currentDate = new Date(dateStr);
      return currentDate >= montazStart && currentDate <= montazEnd;
    });
  };

  const getDemontazEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projekty.filter(event => 
      event.terminy?.demontaz?.data === dateStr
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pakowanie':
        return 'bg-purple-500';
      case 'montaż':
        return 'bg-green-500';
      case 'demontaż':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pakowanie':
        return 'P';
      case 'montaż':
        return 'M';
      case 'demontaż':
        return 'D';
      default:
        return 'E';
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.events.length > 0 && onEventClick) {
      onEventClick(day.events[0]);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn"
          onClick={previousMonth}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="calendar-title">
          <CalendarIcon size={20} />
          <h2>{formatDate(currentDate)}</h2>
        </div>
        
        <button 
          className="calendar-nav-btn"
          onClick={nextMonth}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        {/* Dni tygodnia */}
        <div className="calendar-weekdays">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Dni kalendarza */}
        <div className="calendar-days">
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.getMonth() !== currentMonth.getMonth() ? 'other-month' : ''} ${day.toDateString() === new Date().toDateString() ? 'today' : ''} ${getDayEvents(day).length > 0 ? 'has-events' : ''}`}
              data-event-count={getDayEvents(day).length + getPakowanieEvents(day).length + getMontazEvents(day).length + getDemontazEvents(day).length}
              onClick={() => handleDayClick({
                date: day,
                isCurrentMonth: day.getMonth() === currentMonth.getMonth(),
                isToday: day.toDateString() === new Date().toDateString(),
                events: getDayEvents(day),
                pakowanieEvents: getPakowanieEvents(day),
                montazEvents: getMontazEvents(day),
                demontazEvents: getDemontazEvents(day)
              })}
            >
              <div className="calendar-day-number">
                {day.getDate()}
              </div>
              
              <div className="calendar-day-events">
                {/* Eventy główne */}
                {getDayEvents(day).map((event, eventIndex) => (
                  <div
                    key={`event-${event.id}-${eventIndex}`}
                    className="calendar-event main-event"
                    title={`${event.nazwa} - ${event.numer}`}
                  >
                    <div className="event-content">
                      <div className="event-title">{event.nazwa}</div>
                      <div className="event-number">{event.numer}</div>
                    </div>
                  </div>
                ))}
                
                {/* Eventy pakowania */}
                {getPakowanieEvents(day).map((event, eventIndex) => (
                  <div
                    key={`pakowanie-${event.id}-${eventIndex}`}
                    className="calendar-event pakowanie-event"
                    title={`Pakowanie: ${event.numer} - ${event.nazwa}`}
                  >
                    <div className="event-content">
                      <div className="event-type">P</div>
                      <div className="event-number">{event.numer}</div>
                    </div>
                  </div>
                ))}
                
                {/* Eventy montażu */}
                {getMontazEvents(day).map((event, eventIndex) => (
                  <div
                    key={`montaz-${event.id}-${eventIndex}`}
                    className="calendar-event montaz-event"
                    title={`Montaż: ${event.numer} - ${event.nazwa}`}
                  >
                    <div className="event-content">
                      <div className="event-type">M</div>
                      <div className="event-number">{event.numer}</div>
                    </div>
                  </div>
                ))}
                
                {/* Eventy demontażu */}
                {getDemontazEvents(day).map((event, eventIndex) => (
                  <div
                    key={`demontaz-${event.id}-${eventIndex}`}
                    className="calendar-event demontaz-event"
                    title={`Demontaż: ${event.numer} - ${event.nazwa}`}
                  >
                    <div className="event-content">
                      <div className="event-type">D</div>
                      <div className="event-number">{event.numer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color main-event"></div>
          <span>Event główny</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pakowanie-event"></div>
          <span>Pakowanie</span>
        </div>
        <div className="legend-item">
          <div className="legend-color montaz-event"></div>
          <span>Montaż</span>
        </div>
        <div className="legend-item">
          <div className="legend-color demontaz-event"></div>
          <span>Demontaż</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 