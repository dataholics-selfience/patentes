import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface PatentChatAgentProps {
  patentHistory: any;
  isOpen: boolean;
  onClose: () => void;
  environment?: 'production' | 'test';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PatentChatAgent = ({ patentHistory, isOpen, onClose, environment = 'production' }: PatentChatAgentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generateSessionId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);

      sendInitialMessage(newSessionId);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendInitialMessage = async (sid: string) => {
    const initialMessage = 'Quais são as patentes críticas desta análise?';

    setMessages([{
      role: 'user',
      content: initialMessage,
      timestamp: new Date()
    }]);

    await sendMessageToAgent(initialMessage, sid);
  };

  const sendMessageToAgent = async (message: string, sid: string) => {
    setIsLoading(true);

    try {
      const webhookUrl = environment === 'production'
        ? 'https://primary-production-2e3b.up.railway.app/webhook/chat-patentes'
        : 'https://primary-production-2e3b.up.railway.app/webhook-test/chat-patentes';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          histórico: patentHistory,
          session_id: sid,
          mensagem: message
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      const data = await response.json();

      let assistantMessage = '';
      if (data && data[0]?.output) {
        assistantMessage = data[0].output;
      } else if (typeof data === 'string') {
        assistantMessage = data;
      } else {
        assistantMessage = 'Desculpe, não consegui processar sua solicitação.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      }]);

      if (auth.currentUser) {
        await addDoc(collection(db, 'chat-history'), {
          userId: auth.currentUser.uid,
          sessionId: sid,
          userMessage: message,
          assistantMessage,
          timestamp: new Date().toISOString(),
          patentHistorySnapshot: patentHistory
        });
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    }]);

    setInputMessage('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await sendMessageToAgent(trimmedMessage, sessionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-4 bottom-4 w-96 h-[600px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-white" />
          <h3 className="font-semibold text-white">Agente de Patentes</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold mr-2">
                    AI
                  </div>
                  <span className="text-xs font-medium text-gray-400">Agente</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs text-gray-400 mt-1 block">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-800">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-sm text-gray-400">Analisando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Faça uma pergunta sobre as patentes..."
            className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-colors ${
              inputMessage.trim() && !isLoading
                ? 'text-blue-500 hover:bg-gray-700'
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatentChatAgent;
