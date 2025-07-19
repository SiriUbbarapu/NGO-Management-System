import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Users,
  Heart,
  BookOpen,
  HelpCircle
} from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm the Kalam Foundation Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { id: 'programs', text: 'Our Programs', icon: BookOpen },
    { id: 'volunteer', text: 'How to Volunteer', icon: Users },
    { id: 'events', text: 'Upcoming Events', icon: Calendar },
    { id: 'contact', text: 'Contact Us', icon: Phone }
  ];

  const botResponses = {
    programs: {
      text: "We offer three main programs:\n\n📚 **Education Support**: Quality education programs for children from underprivileged families, including tutoring and academic support.\n\n💝 **Women Empowerment**: Skill development programs including tailoring, computer skills, and entrepreneurship training.\n\n👨‍👩‍👧‍👦 **Family Support**: Comprehensive family support including healthcare assistance and community development.",
      quickReplies: ['volunteer', 'contact', 'events']
    },
    volunteer: {
      text: "Thank you for your interest in volunteering! 🙏\n\nWe welcome volunteers with various skills:\n• Teaching and tutoring\n• IT and computer skills\n• Healthcare support\n• Administrative assistance\n\nYou can fill out the volunteer form on this page or contact us directly. We provide training and flexible scheduling!",
      quickReplies: ['contact', 'programs', 'events']
    },
    events: {
      text: "📅 **Upcoming Events:**\n\n🎓 **Annual Education Fair**\nMarch 15, 2024\nMehdipatnam Community Hall, Hyderabad\n\n👩‍💼 **Women's Skill Development Workshop**\nMarch 22, 2024\nSantosh Nagar Training Center, Hyderabad\n\nJoin us to make a difference in the community!",
      quickReplies: ['volunteer', 'contact', 'programs']
    },
    contact: {
      text: "📞 **Contact Information:**\n\n📧 Email: info@kalamsfoundation.org\n📱 Phone: +91 (040) 1234-5678\n📍 Location: Hyderabad, Telangana\n\nOur team is available Monday-Friday, 9 AM - 6 PM. We'd love to hear from you!",
      quickReplies: ['programs', 'volunteer', 'events']
    },
    default: {
      text: "I'd be happy to help! I can provide information about our programs, volunteering opportunities, upcoming events, or contact details. You can also use the quick action buttons below or contact us directly for more specific questions.",
      quickReplies: ['programs', 'volunteer', 'events', 'contact']
    }
  };

  const getKeywords = (text) => {
    const keywords = {
      programs: ['program', 'education', 'women', 'family', 'support', 'empowerment', 'what do you do'],
      volunteer: ['volunteer', 'help', 'join', 'get involved', 'participate', 'contribute'],
      events: ['event', 'workshop', 'fair', 'upcoming', 'when', 'where', 'meeting'],
      contact: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'call', 'write']
    };

    const lowerText = text.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word))) {
        return category;
      }
    }
    return 'default';
  };

  const handleSendMessage = (text = inputText, isQuickAction = false) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const responseKey = isQuickAction ? text : getKeywords(text);
      const response = botResponses[responseKey] || botResponses.default;
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: response.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (actionId) => {
    handleSendMessage(actionId, true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageText = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 max-w-[calc(100vw-2rem)] h-96 max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-neumorphic-lg border border-gray-200 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-kalam-orange to-kalam-blue text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Kalam Foundation Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-kalam-orange text-white'
                      : 'bg-gray-100 text-gray-800 shadow-neumorphic-sm'
                  }`}
                >
                  <div className="text-sm">{formatMessageText(message.text)}</div>
                  {message.quickReplies && (
                    <div className="mt-2 space-y-1">
                      {message.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickAction(reply)}
                          className="block w-full text-left text-xs bg-white text-kalam-blue px-2 py-1 rounded border border-kalam-blue hover:bg-kalam-blue hover:text-white transition-colors"
                        >
                          {quickActions.find(action => action.id === reply)?.text || reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg shadow-neumorphic-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex items-center space-x-1 text-xs bg-gray-50 hover:bg-kalam-orange hover:text-white text-gray-700 px-2 py-2 rounded-lg transition-colors shadow-neumorphic-sm"
                  >
                    <action.icon className="h-3 w-3" />
                    <span>{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kalam-orange focus:border-transparent text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="bg-kalam-orange hover:bg-red-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-neumorphic-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? 'bg-gray-100 text-gray-600'
            : 'bg-gradient-to-r from-kalam-orange to-kalam-blue text-white animate-pulse'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />}
      </button>
    </div>
  );
};

export default Chatbot;
