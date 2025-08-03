import React from 'react';
import { Calendar, Users, User, UserCheck, Package, Truck, Flower, Settings, CalendarDays, MessageSquare, Shield, Bell, Building, DollarSign, Car, Calculator, Clock } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  currentList: string;
  onViewChange: (view: string) => void;
  onListClick: (list: string) => void;
  projektStats: { aktywne: number; w_trakcie: number };
  hasNewProjekty: boolean;
  hasNewMessages?: boolean;
  hasNewNotifications?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  currentList, 
  onViewChange, 
  onListClick,
  projektStats,
  hasNewProjekty,
  hasNewMessages = false,
  hasNewNotifications = false
}) => {
  const handleListClick = (list: string) => {
    onViewChange('lists');
    onListClick(list);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Dashboard</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${['projekty', 'projekt-products', 'projekt-flowers'].includes(currentView) ? 'active' : ''}`}
              onClick={() => onViewChange('projekty')}
            >
              <Calendar className="lucide-icon" />
              Projekty
              <div className="sidebar-badges">
                <span className={`sidebar-badge ${projektStats.aktywne > 0 ? 'sidebar-badge-active' : ''}`}>
                  {projektStats.aktywne}
                </span>
                <span className={`sidebar-badge ${projektStats.w_trakcie > 0 ? 'sidebar-badge-pending' : ''}`}>
                  {projektStats.w_trakcie}
                </span>
              </div>
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => onViewChange('calendar')}
            >
              <CalendarDays className="lucide-icon" />
              Kalendarz
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'zamowienie-kwiaty' ? 'active' : ''}`}
              onClick={() => handleListClick('zamowienie-kwiaty')}
            >
              <Flower className="lucide-icon" />
              Zamówienie kwiaty
            </button>
          </li>
          {/* Przycisk Kalkulacja przeniesiony tutaj */}
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'kalkulacja' ? 'active' : ''}`}
              onClick={() => handleListClick('kalkulacja')}
            >
              <Calculator className="lucide-icon" />
              Kalkulacja
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'rozliczenie-wplat' ? 'active' : ''}`}
              onClick={() => handleListClick('rozliczenie-wplat')}
            >
              <DollarSign className="lucide-icon" />
              Rozliczenie Wpłat
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'chat' ? 'active' : ''} ${hasNewMessages ? 'new-message-indicator' : ''}`}
              onClick={() => onViewChange('chat')}
            >
              <MessageSquare className="lucide-icon" />
              Chat Projektów
              {hasNewMessages && <span className="new-message-dot"></span>}
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'zdarzenia' ? 'active' : ''} ${hasNewNotifications ? 'new-notification-indicator' : ''}`}
              onClick={() => onViewChange('zdarzenia')}
            >
              <Bell className="lucide-icon" />
              Zdarzenia
              {hasNewNotifications && <span className="new-notification-dot"></span>}
            </button>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Magazyn</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'produkty' ? 'active' : ''}`}
              onClick={() => handleListClick('produkty')}
            >
              <Package className="lucide-icon" />
              Produkty
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
                          className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'kategorie-produktow' ? 'active' : ''}`}
            onClick={() => handleListClick('kategorie-produktow')}
            >
              <Package className="lucide-icon" />
              Kategorie produktów
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'kwiaty' ? 'active' : ''}`}
              onClick={() => handleListClick('kwiaty')}
            >
              <Flower className="lucide-icon" />
              Kwiaty
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'dostawcy-kwiatow' ? 'active' : ''}`}
              onClick={() => handleListClick('dostawcy-kwiatow')}
            >
              <UserCheck className="lucide-icon" />
              Dostawcy kwiatów
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'pojemniki' ? 'active' : ''}`}
              onClick={() => handleListClick('pojemniki')}
            >
              <Truck className="lucide-icon" />
              Pojemniki
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'etapy' ? 'active' : ''}`}
              onClick={() => handleListClick('etapy')}
            >
              <Clock className="lucide-icon" />
              Etapy
            </button>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Koszty</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'typy-kosztow' ? 'active' : ''}`}
              onClick={() => handleListClick('typy-kosztow')}
            >
              <DollarSign className="lucide-icon" />
              Typy kosztów
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'samochody' ? 'active' : ''}`}
              onClick={() => handleListClick('samochody')}
            >
              <Car className="lucide-icon" />
              Samochody
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'formy-rozliczen' ? 'active' : ''}`}
              onClick={() => handleListClick('formy-rozliczen')}
            >
              <Calculator className="lucide-icon" />
              Formy rozliczeń
            </button>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Zarządzanie</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'pracownicy' ? 'active' : ''}`}
              onClick={() => handleListClick('pracownicy')}
            >
              <Users className="lucide-icon" />
              Pracownicy
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'kontakty' ? 'active' : ''}`}
              onClick={() => handleListClick('kontakty')}
            >
              <UserCheck className="lucide-icon" />
              Kontakty
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'wypozyczalnie' ? 'active' : ''}`}
              onClick={() => handleListClick('wypozyczalnie')}
            >
              <Building className="lucide-icon" />
              Wypożyczalnie
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'stanowiska' ? 'active' : ''}`}
              onClick={() => handleListClick('stanowiska')}
            >
              <Settings className="lucide-icon" />
              Stanowiska
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'uzytkownicy' ? 'active' : ''}`}
              onClick={() => handleListClick('uzytkownicy')}
            >
              <User className="lucide-icon" />
              Użytkownicy
            </button>
          </li>
          <li className="sidebar-nav-item">
            <button
              className={`sidebar-nav-button ${currentView === 'lists' && currentList === 'grupy-uprawnien' ? 'active' : ''}`}
              onClick={() => handleListClick('grupy-uprawnien')}
            >
              <Shield className="lucide-icon" />
              Grupy uprawnień
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 