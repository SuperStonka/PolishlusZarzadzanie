import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown, Flag, Moon, Grid, Bell, Calendar, MapPin, Clock, MessageSquare, Package, CheckCircle, AlertTriangle, Truck, Wrench, AlertCircle } from 'lucide-react';

interface Props {
  onLogout?: () => void;
  hasNewNotifications?: boolean;
  hasNewStatusUpdates?: boolean;
}

interface NotificationEvent {
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

interface StatusUpdateEvent {
  id: number;
  type: 'packing_in_progress' | 'packing_complete' | 'damaged_products' | 'delivery_ready' | 'installation_started' | 'demounting_issues';
  title: string;
  message: string;
  data?: {
    numer?: string;
    nazwa?: string;
    lokalizacja?: string;
    packedItems?: number;
    totalItems?: number;
    damagedItems?: number;
    stage?: string;
  };
  czas: string;
  priority: 'low' | 'medium' | 'high';
}

const Header: React.FC<Props> = ({ onLogout, hasNewNotifications = false, hasNewStatusUpdates = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStatusUpdatesOpen, setIsStatusUpdatesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const statusUpdatesRef = useRef<HTMLDivElement>(null);
  
  const user = { 
    name: "Jan Kowalski", 
    role: "Administrator",
    avatar: "/images/avatars/avatar_01.png"
  };

  // Zasymulowane powiadomienia dla administratora
  const notifications: NotificationEvent[] = [
    {
      id: 1,
      type: 'new_event',
      title: 'Nowe zlecenie',
      message: 'Dodano nowe zlecenie do systemu',
      data: {
        numer: "WE-2024-003",
        nazwa: "Wesele Anny i Michała",
        data: "2024-12-20",
        lokalizacja: "Hotel Marriott, Warszawa"
      },
      czas: "2 godziny temu",
      priority: 'high'
    },
    {
      id: 2,
      type: 'chat_message',
      title: 'Nowa wiadomość w czacie',
      message: 'Otrzymano nową wiadomość w evencie',
      data: {
        userName: "Anna Nowak",
        eventName: "WE-2024-001 - Wesele"
      },
      czas: "30 minut temu",
      priority: 'medium'
    },
    {
      id: 3,
      type: 'calendar_reminder',
      title: 'Zbliżające się wydarzenie',
      message: 'Przypomnienie o nadchodzącym evencie',
      data: {
        eventName: "UR-2024-002 - Urodziny 8-latka",
        daysUntil: 2
      },
      czas: "1 godzinę temu",
      priority: 'high'
    },
    {
      id: 4,
      type: 'system_alert',
      title: 'Aktualizacja systemu',
      message: 'System został zaktualizowany do najnowszej wersji',
      data: {},
      czas: "3 godziny temu",
      priority: 'low'
    },
    {
      id: 5,
      type: 'new_event',
      title: 'Nowe zlecenie',
      message: 'Dodano nowe zlecenie do systemu',
      data: {
        numer: "KO-2024-005",
        nazwa: "Konferencja Tech Summit",
        data: "2024-12-25",
        lokalizacja: "Centrum Kongresowe ICE, Kraków"
      },
      czas: "1 dzień temu",
      priority: 'medium'
    },
    {
      id: 6,
      type: 'chat_message',
      title: 'Nowa wiadomość w czacie',
      message: 'Otrzymano nową wiadomość w evencie',
      data: {
        userName: "Piotr Kowalczyk",
        eventName: "UR-2024-004 - Urodziny"
      },
      czas: "2 dni temu",
      priority: 'low'
    }
  ];

  // Zasymulowane powiadomienia o statusie zleceń
  const statusUpdates: StatusUpdateEvent[] = [
    {
      id: 1,
      type: 'packing_in_progress',
      title: 'Pakowanie w toku',
      message: 'Zlecenie jest w trakcie pakowania',
      data: {
        numer: "WE-2024-003",
        nazwa: "Wesele Anny i Michała",
        lokalizacja: "Hotel Marriott, Warszawa",
        packedItems: 15,
        totalItems: 25,
        stage: "pakowanie"
      },
      czas: "45 minut temu",
      priority: 'medium'
    },
    {
      id: 2,
      type: 'packing_complete',
      title: 'Pakowanie zakończone',
      message: 'Wszystkie pozycje zostały spakowane',
      data: {
        numer: "UR-2024-002",
        nazwa: "Urodziny 8-latka",
        lokalizacja: "Dom prywatny, Kraków",
        packedItems: 8,
        totalItems: 8,
        stage: "gotowe do dostawy"
      },
      czas: "2 godziny temu",
      priority: 'high'
    },
    {
      id: 3,
      type: 'damaged_products',
      title: 'Produkty uszkodzone',
      message: 'Wykryto uszkodzone produkty podczas demontażu',
      data: {
        numer: "KO-2024-001",
        nazwa: "Konferencja Marketing",
        lokalizacja: "Centrum Kongresowe, Wrocław",
        damagedItems: 3,
        stage: "demontaż"
      },
      czas: "1 godzinę temu",
      priority: 'high'
    },
    {
      id: 4,
      type: 'delivery_ready',
      title: 'Gotowe do dostawy',
      message: 'Zlecenie jest gotowe do transportu',
      data: {
        numer: "WE-2024-006",
        nazwa: "Wesele Karoliny i Piotra",
        lokalizacja: "Restauracja Pod Wawelem, Kraków",
        stage: "dostawa"
      },
      czas: "30 minut temu",
      priority: 'medium'
    },
    {
      id: 5,
      type: 'installation_started',
      title: 'Montaż rozpoczęty',
      message: 'Rozpoczęto montaż na obiekcie',
      data: {
        numer: "UR-2024-004",
        nazwa: "Urodziny 15-latka",
        lokalizacja: "Dom prywatny, Warszawa",
        stage: "montaż"
      },
      czas: "15 minut temu",
      priority: 'medium'
    },
    {
      id: 6,
      type: 'demounting_issues',
      title: 'Problemy z demontażem',
      message: 'Wystąpiły problemy podczas demontażu',
      data: {
        numer: "KO-2024-005",
        nazwa: "Konferencja Tech Summit",
        lokalizacja: "Centrum Kongresowe ICE, Kraków",
        damagedItems: 2,
        stage: "demontaż"
      },
      czas: "10 minut temu",
      priority: 'high'
    }
  ];

  // Zamykanie dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (statusUpdatesRef.current && !statusUpdatesRef.current.contains(event.target as Node)) {
        setIsStatusUpdatesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
    setIsStatusUpdatesOpen(false);
  };

  const handleStatusUpdatesToggle = () => {
    setIsStatusUpdatesOpen(!isStatusUpdatesOpen);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleEventClick = (notification: NotificationEvent) => {
    console.log('Przejdź do powiadomienia:', notification.title);
    setIsNotificationsOpen(false);
    // TODO: Implementacja przejścia do szczegółów powiadomienia
  };

  const handleStatusUpdateClick = (statusUpdate: StatusUpdateEvent) => {
    console.log('Przejdź do statusu zlecenia:', statusUpdate.title);
    setIsStatusUpdatesOpen(false);
    // TODO: Implementacja przejścia do szczegółów zlecenia
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_event':
        return <Calendar size={16} />;
      case 'chat_message':
        return <MessageSquare size={16} />;
      case 'calendar_reminder':
        return <Clock size={16} />;
      case 'system_alert':
        return <Settings size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getStatusUpdateIcon = (type: string) => {
    switch (type) {
      case 'packing_in_progress':
        return <Package size={16} />;
      case 'packing_complete':
        return <CheckCircle size={16} />;
      case 'damaged_products':
        return <AlertTriangle size={16} />;
      case 'delivery_ready':
        return <Truck size={16} />;
      case 'installation_started':
        return <Wrench size={16} />;
      case 'demounting_issues':
        return <AlertCircle size={16} />;
      default:
        return <Flag size={16} />;
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

  const handleOptionClick = (option: string) => {
    setIsDropdownOpen(false);
    
    switch (option) {
      case 'moje-dane':
        // TODO: Implementacja przejścia do moich danych
        console.log('Przejdź do moich danych');
        break;
      case 'ustawienia':
        // TODO: Implementacja przejścia do ustawień
        console.log('Przejdź do ustawień');
        break;
      case 'wyloguj':
        onLogout?.();
        break;
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <img src="/images/logo.png" alt="Polishlus logo" className="app-logo" />
      </div>
      
      <div className="header-right">
        <div className="status-updates-dropdown" ref={statusUpdatesRef}>
          <button className="header-icon-button" onClick={handleStatusUpdatesToggle}>
            <Flag size={20} className={hasNewStatusUpdates ? 'new-status-indicator' : ''} />
            <span className="status-updates-badge">{statusUpdates.length}</span>
          </button>
          
          {isStatusUpdatesOpen && (
            <div className="status-updates-menu">
              <div className="status-updates-header">
                <h3>Status zleceń</h3>
                <span className="status-updates-count">{statusUpdates.length} aktualizacji</span>
              </div>
              <div className="status-updates-list">
                {statusUpdates.map(statusUpdate => (
                  <div 
                    key={statusUpdate.id} 
                    className="status-update-item"
                    onClick={() => handleStatusUpdateClick(statusUpdate)}
                  >
                    <div className="status-update-icon" style={{ backgroundColor: getPriorityColor(statusUpdate.priority) + '20' }}>
                      {getStatusUpdateIcon(statusUpdate.type)}
                    </div>
                    <div className="status-update-content">
                      <div className="status-update-title">
                        <strong>{statusUpdate.title}</strong>
                        <span className="status-update-status" style={{ backgroundColor: getPriorityColor(statusUpdate.priority) + '20', color: getPriorityColor(statusUpdate.priority) }}>
                          {statusUpdate.priority === 'high' ? 'Wysokie' : statusUpdate.priority === 'medium' ? 'Średnie' : 'Niskie'}
                        </span>
                      </div>
                      <div className="status-update-name">{statusUpdate.message}</div>
                      <div className="status-update-details">
                        {statusUpdate.data?.numer && (
                          <div className="status-update-location">
                            <MapPin size={12} />
                            <span>{statusUpdate.data.numer} - {statusUpdate.data.nazwa}</span>
                          </div>
                        )}
                        {statusUpdate.data?.packedItems && statusUpdate.data?.totalItems && (
                          <div className="status-update-progress">
                            <Package size={12} />
                            <span>{statusUpdate.data.packedItems}/{statusUpdate.data.totalItems} spakowane</span>
                          </div>
                        )}
                        {statusUpdate.data?.damagedItems && (
                          <div className="status-update-damage">
                            <AlertTriangle size={12} />
                            <span>{statusUpdate.data.damagedItems} uszkodzone</span>
                          </div>
                        )}
                        {statusUpdate.data?.stage && (
                          <div className="status-update-stage">
                            <Flag size={12} />
                            <span>{statusUpdate.data.stage}</span>
                          </div>
                        )}
                        <div className="status-update-time">
                          <Clock size={12} />
                          <span>{statusUpdate.czas}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="status-updates-footer">
                <button className="view-all-btn">Zobacz wszystkie statusy</button>
              </div>
            </div>
          )}
        </div>
        <button className="header-icon-button">
          <Moon size={20} />
        </button>
        <button className="header-icon-button">
          <Grid size={20} />
        </button>
        <div className="notifications-dropdown" ref={notificationsRef}>
          <button className="header-icon-button" onClick={handleNotificationsToggle}>
            <Bell size={20} className={hasNewNotifications ? 'new-notification-indicator' : ''} />
            <span className="notification-badge">{notifications.length}</span>
          </button>
          
          {isNotificationsOpen && (
            <div className="notifications-menu">
              <div className="notifications-header">
                <h3>Powiadomienia</h3>
                <span className="notifications-count">{notifications.length} nowych</span>
              </div>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className="notification-item"
                    onClick={() => handleEventClick(notification)}
                  >
                    <div className="notification-icon" style={{ backgroundColor: getPriorityColor(notification.priority) + '20' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        <strong>{notification.title}</strong>
                        <span className="notification-status" style={{ backgroundColor: getPriorityColor(notification.priority) + '20', color: getPriorityColor(notification.priority) }}>
                          {notification.priority === 'high' ? 'Wysokie' : notification.priority === 'medium' ? 'Średnie' : 'Niskie'}
                        </span>
                      </div>
                      <div className="notification-name">{notification.message}</div>
                      <div className="notification-details">
                        {notification.data?.numer && (
                          <div className="notification-location">
                            <MapPin size={12} />
                            <span>{notification.data.numer} - {notification.data.nazwa}</span>
                          </div>
                        )}
                        {notification.data?.userName && (
                          <div className="notification-location">
                            <MessageSquare size={12} />
                            <span>{notification.data.userName}</span>
                          </div>
                        )}
                        {notification.data?.daysUntil && (
                          <div className="notification-location">
                            <Calendar size={12} />
                            <span>Za {notification.data.daysUntil} dni</span>
                          </div>
                        )}
                        <div className="notification-time">
                          <Clock size={12} />
                          <span>{notification.czas}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notifications-footer">
                <button className="view-all-btn">Zobacz wszystkie</button>
              </div>
            </div>
          )}
        </div>
        <div className="user-dropdown" ref={dropdownRef}>
          <button className="user-dropdown-toggle" onClick={handleDropdownToggle}>
        <div className="user-info">
          <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" />
                ) : (
            <span>{user.name.charAt(0)}</span>
                )}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
            <ChevronDown 
              size={16} 
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            />
          </button>
          
          {isDropdownOpen && (
            <div className="user-dropdown-menu">
              <button 
                className="dropdown-option"
                onClick={() => handleOptionClick('moje-dane')}
              >
                <User size={16} />
                <span>Moje dane</span>
              </button>
              <button 
                className="dropdown-option"
                onClick={() => handleOptionClick('ustawienia')}
              >
                <Settings size={16} />
                <span>Ustawienia</span>
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-option logout-option"
                onClick={() => handleOptionClick('wyloguj')}
              >
                <LogOut size={16} />
          <span>Wyloguj</span>
        </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 