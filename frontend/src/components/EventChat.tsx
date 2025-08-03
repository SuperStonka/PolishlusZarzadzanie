import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  projektId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface EventChatProps {
  eventId: number;
  eventName: string;
  onClose: () => void;
}

const EventChat: React.FC<EventChatProps> = ({ eventId, eventName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Symulowane dane użytkownika (w rzeczywistej aplikacji byłyby z kontekstu/autoryzacji)
  const currentUser = {
    id: 1,
    name: 'Jan Kowalski',
    role: 'Opiekun'
  };

  useEffect(() => {
    loadMessages();
    scrollToBottom();
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // Pobieranie danych z pliku projektChat.json
      const response = await fetch('/data/projektChat.json');
      if (!response.ok) {
        throw new Error('Nie udało się załadować danych czatu');
      }
      
      const eventChats = await response.json();
      
      // Znajdź czat dla konkretnego projektu
      const eventChat = eventChats.find((chat: any) => chat.projektId === eventId);
      
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
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      projektId: eventId,
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
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Wczoraj';
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <MessageSquare size={20} />
            <div>
              <div className="chat-title">Czat - {eventName}</div>
              <div className="chat-subtitle">Event #{eventId}</div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {isLoading ? (
            <div className="chat-loading">Ładowanie wiadomości...</div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.isOwn ? 'own' : 'other'}`}
                >
                  <div className="message-content">
                    {!message.isOwn && (
                      <div className="message-header">
                        <div className="message-user">
                          <User size={14} />
                          <span className="user-name">{message.userName}</span>
                          <span className="user-role">({message.userRole})</span>
                        </div>
                        <div className="message-time">
                          <Clock size={12} />
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    )}
                    <div className="message-text">{message.content}</div>
                    {message.isOwn && (
                      <div className="message-time own">
                        <Clock size={12} />
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Napisz wiadomość..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventChat; 