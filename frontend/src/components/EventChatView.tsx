import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Clock, ChevronDown, Search, Users, Image, X } from 'lucide-react';

interface Message {
  id: number;
  projektId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  images?: string[];
}

interface Event {
  id: number;
  numer: string;
  nazwa: string;
  data: string;
  lokalizacja: string;
  status: string;
}

interface User {
  login: string;
  imie: string;
  nazwisko: string;
  rola: number;
  mail: string;
  avatar?: string;
}

interface UserRole {
  id: number;
  nazwa: string;
}

interface EventChatViewProps {
  onBack?: () => void;
}

const EventChatView: React.FC<EventChatViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allEventChats, setAllEventChats] = useState<any[]>([]);
  const [projekty, setProjekty] = useState<Event[]>([]);
  const [selectedProjekt, setSelectedProjekt] = useState<Event | null>(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGeneralMessage, setIsGeneralMessage] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Symulowane dane użytkownika (w rzeczywistej aplikacji byłyby z kontekstu/autoryzacji)
  const currentUser = {
    id: 1,
    name: 'Jan Kowalski',
    role: 'Administrator'
  };

  useEffect(() => {
    loadAllEventChats();
    loadProjekty();
    loadUsers();
    loadUserRoles();
  }, []);

  useEffect(() => {
    if (selectedProjekt) {
      loadMessagesForEvent(selectedProjekt.id);
    } else {
      setMessages([]);
    }
    scrollToBottom();
  }, [selectedProjekt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAllEventChats = async () => {
    try {
      const response = await fetch('/data/projektChat.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować danych czatu');
      }
      
      const eventChats = await response.json();
      setAllEventChats(eventChats);
    } catch (error) {
      console.error('Błąd ładowania czatów:', error);
      setAllEventChats([]);
    }
  };

  const loadProjekty = async () => {
    try {
      const response = await fetch('/data/projekty.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować projektów');
      }
      
      const projektyData = await response.json();
      setProjekty(projektyData);
    } catch (error) {
      console.error('Błąd ładowania projektów:', error);
      setProjekty([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/data/uzytkownicy.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować użytkowników');
      }
      
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Błąd ładowania użytkowników:', error);
      setUsers([]);
    }
  };

  const loadUserRoles = async () => {
    try {
      const response = await fetch('/data/grupyUprawnien.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować ról użytkowników');
      }
      
      const rolesData = await response.json();
      setUserRoles(rolesData);
    } catch (error) {
      console.error('Błąd ładowania ról użytkowników:', error);
      setUserRoles([]);
    }
  };

  const loadMessagesForEvent = async (eventId: number) => {
    setIsLoading(true);
    try {
      // Znajdź czat dla konkretnego projektu
      const eventChat = allEventChats.find((chat: any) => chat.projektId === eventId);
      
      if (eventChat) {
        // Ustaw flagę isOwn na podstawie userId (zakładamy, że currentUser.id = 1)
        const messagesWithOwnFlag = eventChat.messages.map((message: Message) => ({
          ...message,
          isOwn: message.userId === currentUser.id
        }));
        
        setMessages(messagesWithOwnFlag);
      } else {
        // Jeśli nie znaleziono czatu dla tego eventu, ustaw pustą listę
        setMessages([]);
      }
    } catch (error) {
      console.error('Błąd ładowania wiadomości:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedImages.length === 0) || !selectedProjekt) return;

    // Konwersja zdjęć na base64 (w rzeczywistej aplikacji byłyby wysyłane do serwera)
    const imageUrls = await Promise.all(
      selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    const message: Message = {
      id: Date.now(),
      projektId: selectedProjekt.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isOwn: true,
      images: imageUrls
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedImages([]);
    setImagePreviewUrls([]);

    // Symulacja wysyłania do API
    try {
      // await sendMessageToAPI(message);
      if (isGeneralMessage) {
        console.log('Ogólna wiadomość wysłana do wszystkich w evencie:', selectedProjekt.numer, message);
      } else if (selectedUser) {
        console.log('Wiadomość prywatna wysłana do:', selectedUser.imie + ' ' + selectedUser.nazwisko, message);
      } else {
        console.log('Ogólna wiadomość wysłana do eventu:', selectedProjekt.numer, message);
      }
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...imageFiles]);
      
      // Tworzenie URL-i do podglądu
      imageFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setImagePreviewUrls(prev => [...prev, url]);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Zwolnienie URL-i
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const openImageSelector = () => {
    fileInputRef.current?.click();
  };

  const handleUserSelect = (user: User | null) => {
    if (user === null) {
      // Kliknięcie na "Wszyscy"
      setIsGeneralMessage(true);
      setSelectedUser(null);
    } else if (selectedUser?.login === user.login) {
      // Ponowne kliknięcie na tego samego użytkownika - przełącz na ogólną wiadomość
      setIsGeneralMessage(true);
      setSelectedUser(null);
    } else {
      // Kliknięcie na innego użytkownika
      setIsGeneralMessage(false);
      setSelectedUser(user);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredProjekty = projekty.filter(projekt =>
    projekt.numer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projekt.nazwa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projekt.lokalizacja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.imie.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.nazwisko.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.login.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const getUserRoleName = (roleId: number) => {
    const role = userRoles.find(r => r.id === roleId);
    return role ? role.nazwa : 'Nieznana rola';
  };

  return (
    <div className="chat-layout">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div>
            <div className="chat-header-title">Chat Projektów</div>
            <div className="chat-header-subtitle">Komunikacja dotycząca zleceń</div>
          </div>
          <div className="d-flex align-center gap-2">
            <div className="chat-header-icon">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        {/* Event Selection */}
        <div className="event-selection-container">
          <div className="event-selector-container">
            <button
              className="event-selector-btn"
              onClick={() => setShowEventDropdown(!showEventDropdown)}
            >
              <div className="event-selector-content">
                {selectedProjekt ? (
                  <>
                    <div className="event-selector-main">
                      <strong>{selectedProjekt.numer}</strong>
                      <span className="event-selector-name">{selectedProjekt.nazwa}</span>
                    </div>
                    <div className="event-selector-details">
                      {selectedProjekt.lokalizacja} • {selectedProjekt.data}
                    </div>
                  </>
                ) : (
                  <span>Wybierz projekt...</span>
                )}
              </div>
              <ChevronDown size={16} />
            </button>

            {showEventDropdown && (
              <div className="event-dropdown">
                <div className="event-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Szukaj zlecenia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="event-search-input"
                  />
                </div>
                <div className="event-list">
                  {filteredProjekty.length === 0 ? (
                    <div className="no-events">Brak zleceń</div>
                  ) : (
                    filteredProjekty.map(projekt => (
                      <div
                        key={projekt.id}
                        className={`event-item ${selectedProjekt?.id === projekt.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedProjekt(projekt);
                          setShowEventDropdown(false);
                          setSearchTerm('');
                        }}
                      >
                        <div className="event-item-main">
                          <strong>{projekt.numer}</strong>
                          <span className="event-item-name">{projekt.nazwa}</span>
                        </div>
                        <div className="event-item-details">
                          {projekt.lokalizacja} • {projekt.data}
                        </div>
                        <div className={`event-item-status status-${projekt.status}`}>
                          {projekt.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="chat-main-layout">
                {/* Users List */}
        <div className="users-sidebar">
          <div className="users-header">
            <MessageSquare size={20} />
            <span>Do kogo chcesz napisać?</span>
          </div>
          
          <div className="user-search-container">
            <div className="user-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Szukaj użytkownika..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="user-search-input"
              />
            </div>
          </div>

          <div className="users-list">
            {/* Pozycja "Wszyscy" */}
            <div
              className={`user-list-item ${isGeneralMessage ? 'selected' : ''}`}
              onClick={() => handleUserSelect(null)}
            >
              <div className="user-avatar">
                <Users size={20} />
              </div>
              <div className="user-info">
                <div className="user-name">Wszyscy</div>
                <div className="user-role">Ogólna wiadomość</div>
              </div>
            </div>
            
            {filteredUsers.map(user => (
              <div
                key={user.login}
                className={`user-list-item ${selectedUser?.login === user.login ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="user-avatar-image" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.imie} {user.nazwisko}</div>
                  <div className="user-role">{getUserRoleName(user.rola)}</div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="no-users">Brak użytkowników</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedProjekt ? (
            <>
              <div className="chat-header-small">
                <div className="chat-title">Chat - {selectedProjekt.numer}</div>
                <div className="chat-subtitle">{selectedProjekt.nazwa}</div>
              </div>

              <div className="chat-messages-compact">
                {isLoading ? (
                  <div className="chat-loading">
                    <p>Ładowanie wiadomości...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={32} color="var(--text-muted)" />
                    <p>Brak wiadomości w tym zleceniu</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`chat-message-compact ${message.isOwn ? 'own' : 'other'}`}>
                                              <div className="message-content-compact">
                          <div className="message-header-compact">
                            <span className="user-name-compact">{message.userName}</span>
                            <span className="message-time-compact">{formatTime(message.timestamp)} • {formatDate(message.timestamp)}</span>
                          </div>
                          {message.content && <div className="message-text-compact">{message.content}</div>}
                          {message.images && message.images.length > 0 && (
                            <div className="message-images-compact">
                              {message.images.map((imageUrl, index) => (
                                <div key={index} className="message-image-compact">
                                  <img src={imageUrl} alt={`Zdjęcie ${index + 1}`} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container-compact">
                {/* Podgląd wybranych zdjęć */}
                {imagePreviewUrls.length > 0 && (
                  <div className="image-preview-container">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={url} alt={`Podgląd ${index + 1}`} />
                        <button
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="chat-input-wrapper-compact">
                  <button
                    className="chat-attach-btn-compact"
                    onClick={openImageSelector}
                    disabled={!selectedProjekt}
                    title="Dodaj zdjęcie"
                  >
                    <Image size={16} />
                  </button>
                  <input
                    type="text"
                    className="chat-input-compact"
                    placeholder={isGeneralMessage ? "Napisz ogólną wiadomość do wszystkich..." : (selectedUser ? `Napisz wiadomość do ${selectedUser.imie} ${selectedUser.nazwisko}...` : "Wybierz użytkownika lub kliknij 'Wszyscy'...")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!selectedProjekt}
                  />
                  <button
                    className="chat-send-btn-compact"
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && selectedImages.length === 0) || !selectedProjekt}
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Ukryty input do wybierania plików */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <MessageSquare size={48} color="var(--text-muted)" />
              <p>Wybierz zlecenie, aby zobaczyć chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventChatView; 