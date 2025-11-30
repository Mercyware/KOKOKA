import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { chatbotService } from '@/services/chatbotService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: Array<{ action: string; label: string }>;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggested questions when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const suggestions = await chatbotService.getSuggestedQuestions(5);
      setSuggestedQuestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(conversationId, inputValue);

      if (response.success) {
        setConversationId(response.conversationId);

        const assistantMessage: Message = {
          id: response.message.id,
          role: 'assistant',
          content: response.message.content,
          timestamp: new Date(),
          suggestedActions: response.message.suggestedActions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleRateMessage = async (messageId: string, helpful: boolean) => {
    try {
      await chatbotService.rateMessage(messageId, helpful);
    } catch (error) {
      console.error('Failed to rate message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-slate-200">
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">School Assistant</h3>
            <p className="text-xs text-white/80">Ask me anything!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">Hello! How can I help you today?</p>

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Common questions:</p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleSuggestedQuestion(q.question)}
                    className="w-full text-left p-2 text-sm bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Suggested Actions */}
                {message.role === 'assistant' && message.suggestedActions && message.suggestedActions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        className="block w-full text-left text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Feedback */}
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Was this helpful?</span>
                    <button
                      onClick={() => handleRateMessage(message.id, true)}
                      className="text-slate-400 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRateMessage(message.id, false)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            intent="primary"
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatbotWidget;
