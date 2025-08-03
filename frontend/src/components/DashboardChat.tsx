import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface DashboardChatProps {
  selectedEventId?: number;
  selectedEventName?: string;
}

const DashboardChat: React.FC<DashboardChatProps> = ({ selectedEventId, selectedEventName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allEventChats, setAllEventChats] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Symulowane dane użytkownika (w rzeczywistej aplikacji byłyby z kontekstu/autoryzacji)
  const currentUser = {
    id: 1,
    name: 'Jan Kowalski',
    role: 'Opiekun'
  };

  useEffect(() => {
    loadAllEventChats();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadMessagesForEvent(selectedEventId);
    } else {
      setMessages([]);
    }
    scrollToBottom();
  }, [selectedEventId]);

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

  const loadMessagesForEvent = async (eventId: number) => {
    setIsLoading(true);
    try {
      // Znajdź czat dla konkretnego eventu
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
    if (!newMessage.trim() || !selectedEventId) return;

    const message: Message = {
      id: Date.now(),
      eventId: selectedEventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Symulacja wysyłania do API
    try {
      // await sendMessageToAPI(message);
      console.log('Wiadomość wysłana:', message);
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

  if (!selectedEventId) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-title">Chat Eventów</div>
            <div className="card-subtitle">Wybierz event z kalendarza, aby zobaczyć czat</div>
          </div>
          <div className="card-icon">
            <MessageSquare size={24} />
          </div>
        </div>
        <div className="empty-state">
          <MessageSquare size={48} color="var(--text-muted)" />
          <p>Brak wybranego eventu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div>
          <div className="card-title">Chat - {selectedEventName}</div>
          <div className="card-subtitle">Komunikacja dotycząca eventu</div>
        </div>
        <div className="card-icon">
          <MessageSquare size={24} />
        </div>
      </div>

      <div className="chat-container-dashboard">
        <div className="chat-messages-dashboard">
          {isLoading ? (
            <div className="chat-loading">
              <p>Ładowanie wiadomości...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} color="var(--text-muted)" />
              <p>Brak wiadomości w tym evencie</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.isOwn ? 'own' : 'other'}`}>
                <div className="message-content">
                  <div className="message-header">
                    <div className="message-user">
                      <User size={12} />
                      <span className="user-name">{message.userName}</span>
                      <span className="user-role">({message.userRole})</span>
                    </div>
                    <div className={`message-time ${message.isOwn ? 'own' : ''}`}>
                      <Clock size={12} />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container-dashboard">
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Napisz wiadomość..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedEventId}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!newMessage.trim() || !selectedEventId}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChat; 