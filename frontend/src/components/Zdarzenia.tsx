import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Clock, Settings, Bell, MapPin, User, Filter, Search } from 'lucide-react';

interface Zdarzenie {
  id: number;
  type: 'new_event' | 'chat_message' | 'calendar_reminder' | 'system_alert';
  title: string;
  message: string;
  data?: {
    numer?: string;
    nazwa?: string;
    data?: string;
    lokalizacja?: string;
    userName?: string;
    eventName?: string;
    daysUntil?: number;
  };
  czas: string;
  priority: 'low' | 'medium' | 'high';
}

const Zdarzenia: React.FC = () => {
  const [zdarzenia, setZdarzenia] = useState<Zdarzenie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    loadZdarzenia();
  }, []);

  const loadZdarzenia = async () => {
    try {
      const response = await fetch('/data/zdarzenia.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować zdarzeń');
      }
      
      const data = await response.json();
      setZdarzenia(data);
    } catch (error) {
      console.error('Błąd ładowania zdarzeń:', error);
      setZdarzenia([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getZdarzenieIcon = (type: string) => {
    switch (type) {
      case 'new_event':
        return <Calendar size={20} />;
      case 'chat_message':
        return <MessageSquare size={20} />;
      case 'calendar_reminder':
        return <Clock size={20} />;
      case 'system_alert':
        return <Settings size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ea5455';
      case 'medium':
        return '#ff9f43';
      case 'low':
        return '#28c76f';
      default:
        return '#6e6b7b';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_event':
        return 'Nowe zlecenie';
      case 'chat_message':
        return 'Wiadomość chat';
      case 'calendar_reminder':
        return 'Przypomnienie';
      case 'system_alert':
        return 'Alert systemowy';
      default:
        return 'Inne';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Wysokie';
      case 'medium':
        return 'Średnie';
      case 'low':
        return 'Niskie';
      default:
        return 'Nieznane';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Przed chwilą';
    } else if (diffInHours < 24) {
      return `${diffInHours} godzin temu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dni temu`;
    }
  };

  const filteredZdarzenia = zdarzenia.filter(zdarzenie => {
    const matchesSearch = 
      zdarzenie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zdarzenie.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zdarzenie.data?.numer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zdarzenie.data?.nazwa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zdarzenie.data?.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || zdarzenie.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || zdarzenie.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="zdarzenia-container">
        <div className="zdarzenia-loading">
          <p>Ładowanie zdarzeń...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zdarzenia-container">
      <div className="zdarzenia-header">
        <h1>Wszystkie zdarzenia</h1>
        <p>Przegląd wszystkich zdarzeń w systemie</p>
      </div>

      <div className="zdarzenia-filters">
        <div className="search-filter">
          <Search size={16} />
          <input
            type="text"
            placeholder="Szukaj zdarzeń..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Typ:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Wszystkie typy</option>
              <option value="new_event">Nowe zlecenia</option>
              <option value="chat_message">Wiadomości chat</option>
              <option value="calendar_reminder">Przypomnienia</option>
              <option value="system_alert">Alerty systemowe</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Priorytet:</label>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">Wszystkie priorytety</option>
              <option value="high">Wysokie</option>
              <option value="medium">Średnie</option>
              <option value="low">Niskie</option>
            </select>
          </div>
        </div>
      </div>

      <div className="zdarzenia-stats">
        <div className="stat-item">
          <span className="stat-label">Wszystkie:</span>
          <span className="stat-value">{zdarzenia.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Wysokie:</span>
          <span className="stat-value high">{zdarzenia.filter(z => z.priority === 'high').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Średnie:</span>
          <span className="stat-value medium">{zdarzenia.filter(z => z.priority === 'medium').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Niskie:</span>
          <span className="stat-value low">{zdarzenia.filter(z => z.priority === 'low').length}</span>
        </div>
      </div>

      <div className="zdarzenia-list">
        {filteredZdarzenia.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} color="var(--text-muted)" />
            <p>Brak zdarzeń spełniających kryteria</p>
          </div>
        ) : (
          filteredZdarzenia.map(zdarzenie => (
            <div key={zdarzenie.id} className="zdarzenie-item">
              <div className="zdarzenie-icon" style={{ backgroundColor: getPriorityColor(zdarzenie.priority) + '20' }}>
                {getZdarzenieIcon(zdarzenie.type)}
              </div>
              
              <div className="zdarzenie-content">
                <div className="zdarzenie-header">
                  <h3 className="zdarzenie-title">{zdarzenie.title}</h3>
                  <div className="zdarzenie-meta">
                    <span className="zdarzenie-type">{getTypeLabel(zdarzenie.type)}</span>
                    <span 
                      className="zdarzenie-priority"
                      style={{ 
                        backgroundColor: getPriorityColor(zdarzenie.priority) + '20', 
                        color: getPriorityColor(zdarzenie.priority) 
                      }}
                    >
                      {getPriorityLabel(zdarzenie.priority)}
                    </span>
                  </div>
                </div>
                
                <p className="zdarzenie-message">{zdarzenie.message}</p>
                
                <div className="zdarzenie-details">
                  {zdarzenie.data?.numer && (
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{zdarzenie.data.numer} - {zdarzenie.data.nazwa}</span>
                    </div>
                  )}
                  {zdarzenie.data?.userName && (
                    <div className="detail-item">
                      <User size={14} />
                      <span>{zdarzenie.data.userName}</span>
                    </div>
                  )}
                  {zdarzenie.data?.daysUntil && (
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Za {zdarzenie.data.daysUntil} dni</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>{formatTime(zdarzenie.czas)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Zdarzenia; 