import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, Bot, User, Trash2, Pin, Star, Plus, Search, Copy, Check, ThumbsUp, ThumbsDown,
  Sparkles, CornerDownLeft, Loader2, BarChart2, MessageSquare, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  module?: string;
  isPinned: boolean;
  isFavorite: boolean;
  updatedAt: string;
}

const AIChat: React.FC = () => {
  const location = useLocation();
  const state = location.state as { initialPrompt?: string } | null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversations
  const loadConversations = async (selectFirstId?: boolean) => {
    try {
      const res = await axios.get('/api/ai/conversations');
      const data = res.data?.data || [];
      setConversations(data);
      
      if (selectFirstId && data.length > 0 && !activeConvoId) {
        setActiveConvoId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvoId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/ai/conversations/${activeConvoId}`);
        setMessages(res.data?.data?.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };

    fetchMessages();
  }, [activeConvoId]);

  // Handle passed initial prompts
  useEffect(() => {
    if (state?.initialPrompt) {
      const runPassedPrompt = async () => {
        try {
          const title = state.initialPrompt!.length > 25 
            ? `${state.initialPrompt!.slice(0, 25)}...` 
            : state.initialPrompt!;
          
          const convoRes = await axios.post('/api/ai/conversations', { title });
          const newConvo = convoRes.data?.data;
          
          if (newConvo) {
            setConversations(prev => [newConvo, ...prev]);
            setActiveConvoId(newConvo.id);
            setIsTyping(true);
            const queryRes = await axios.post('/api/ai/query', { 
              query: state.initialPrompt, 
              conversationId: newConvo.id 
            });
            
            const answer = queryRes.data?.data?.text;
            if (answer) {
              setMessages([
                { id: '1', role: 'user', content: state.initialPrompt!, createdAt: new Date().toISOString() },
                { id: '2', role: 'assistant', content: answer, createdAt: new Date().toISOString() }
              ]);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsTyping(false);
        }
      };
      runPassedPrompt();
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle creating a new chat thread
  const handleStartNewChat = async () => {
    try {
      const res = await axios.post('/api/ai/conversations', { 
        title: 'New Copilot Thread',
        module: 'GENERAL'
      });
      const newConvo = res.data?.data;
      if (newConvo) {
        setConversations(prev => [newConvo, ...prev]);
        setActiveConvoId(newConvo.id);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to start chat', err);
    }
  };

  // Delete chat thread
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/ai/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConvoId === id) {
        setActiveConvoId(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  // Pin chat thread
  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(`/api/ai/conversations/${id}/pin`);
      const updated = res.data?.data;
      if (updated) {
        setConversations(prev => 
          prev.map(c => c.id === id ? { ...c, isPinned: updated.isPinned } : c)
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Favorite chat thread
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(`/api/ai/conversations/${id}/favorite`);
      const updated = res.data?.data;
      if (updated) {
        setConversations(prev => 
          prev.map(c => c.id === id ? { ...c, isFavorite: updated.isFavorite } : c)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit User Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userPrompt = inputPrompt;
    setInputPrompt('');

    let currentConvoId = activeConvoId;
    
    try {
      // 1. Create a thread on the fly if none is selected
      if (!currentConvoId) {
        const title = userPrompt.length > 25 ? `${userPrompt.slice(0, 25)}...` : userPrompt;
        const convoRes = await axios.post('/api/ai/conversations', { title });
        const newConvo = convoRes.data?.data;
        if (newConvo) {
          currentConvoId = newConvo.id;
          setActiveConvoId(newConvo.id);
          setConversations(prev => [newConvo, ...prev]);
        }
      }

      // 2. Append temporary User bubble to UI
      const userMsgTemp: Message = {
        id: Math.random().toString(),
        role: 'user',
        content: userPrompt,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsgTemp]);
      setIsTyping(true);

      // 3. Post prompt to the backend
      const res = await axios.post('/api/ai/query', {
        query: userPrompt,
        conversationId: currentConvoId
      });

      const response = res.data?.data;
      if (response) {
        const assistantMsg: Message = {
          id: response.messageId || Math.random().toString(),
          role: 'assistant',
          content: response.text,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        
        // Refresh conversations to update timestamps / titles
        loadConversations(false);
      }
    } catch (err) {
      console.error('Failed to submit message', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Like/Dislike feedback
  const handleFeedback = async (messageId: string, feedback: 'LIKE' | 'DISLIKE') => {
    if (!activeConvoId) return;
    try {
      await axios.post(`/api/ai/conversations/${activeConvoId}/messages/${messageId}/feedback`, {
        feedback
      });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  // Copy response to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Custom regex markdown formatter
  const parseMarkdown = (markdown: string) => {
    let html = markdown
      // Escape HTML tags to prevent XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-slate-800 mt-4 mb-2">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-[10px] font-bold text-slate-700 mt-3 mb-1.5">$1</h4>')
      .replace(/^## (.*$)/gim, '<h2 class="text-sm font-extrabold text-slate-800 mt-5 mb-2.5 border-b border-slate-100 pb-1">$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Inline Code
      .replace(/`(.*?)`/gim, '<code class="bg-[#F1F5F9] text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-mono">$1</code>')
      // Fenced code block placeholders
      .replace(/```(sql|json|javascript)?([\s\S]*?)```/gim, (_, lang, code) => {
        return `<pre class="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] font-mono text-slate-700 my-4 overflow-x-auto whitespace-pre leading-relaxed"><span class="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">${lang || 'code'}</span>${code.trim()}</pre>`;
      });

    // Parse Markdown tables manually
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let processedLines = [];

    for (const line of lines) {
      const isTableRow = line.startsWith('|') && line.endsWith('|');
      
      if (isTableRow) {
        if (line.includes('---') || line.includes(':---')) {
          continue;
        }

        const cols = line.split('|').slice(1, -1).map(c => c.trim());
        
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-4 border border-slate-200 rounded-xl"><table class="min-w-full divide-y divide-slate-200 text-left text-xs bg-slate-50/50">';
          tableHtml += '<thead class="bg-slate-50"><tr>';
          cols.forEach(col => {
            tableHtml += `<th class="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-200">${col}</th>`;
          });
          tableHtml += '</tr></thead><tbody class="divide-y divide-slate-100">';
        } else {
          tableHtml += '<tr class="hover:bg-slate-50/50">';
          cols.forEach(col => {
            tableHtml += `<td class="px-4 py-2 text-slate-600">${col}</td>`;
          });
          tableHtml += '</tr>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          processedLines.push(tableHtml);
          tableHtml = '';
        }
        processedLines.push(line);
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>';
      processedLines.push(tableHtml);
    }

    // Convert bullet lists
    let parsedHtml = processedLines.join('\n');
    parsedHtml = parsedHtml.replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc text-slate-600 mb-1">$1</li>');
    parsedHtml = parsedHtml.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-slate-600 mb-1">$1</li>');

    return parsedHtml;
  };

  // Render recharts chart components inside bubbles
  const renderRechartsChart = (config: any, index: number) => {
    const data = config.data || [];
    const colors = config.colors || ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];
    const xKey = config.xKey || 'name';
    const yKeys = config.yKeys || ['value'];

    return (
      <div key={`chart-${index}`} className="my-5 p-5 bg-white border border-[#E2E8F0] rounded-2xl max-w-lg shadow-sm">
        <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4 text-primary" />
          <span>Interactive AI Analysis Widget</span>
        </h4>
        <div className="h-52 w-full text-[9px] font-sans">
          <ResponsiveContainer width="100%" height="100%">
            {config.type === 'bar' ? (
              <BarChart data={data}>
                <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 12, fontSize: '10px' }} />
                <Legend iconSize={6} />
                {yKeys.map((key: string, kIdx: number) => (
                  <Bar key={key} dataKey={key} fill={colors[kIdx % colors.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            ) : config.type === 'line' ? (
              <LineChart data={data}>
                <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 12, fontSize: '10px' }} />
                <Legend iconSize={6} />
                {yKeys.map((key: string, kIdx: number) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={colors[kIdx % colors.length]} strokeWidth={2} activeDot={{ r: 4 }} />
                ))}
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey={yKeys[0] || 'value'}
                >
                  {data.map((entry: any, entryIdx: number) => (
                    <Cell key={`cell-${entryIdx}`} fill={colors[entryIdx % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 12, fontSize: '10px' }} />
                <Legend iconSize={6} layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Helper to split text by recharts fences and render accordingly
  const renderMessageContent = (content: string) => {
    const parts = content.split(/```recharts([\s\S]*?)```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        try {
          const chartConfig = JSON.parse(part.trim());
          return renderRechartsChart(chartConfig, index);
        } catch (err) {
          return (
            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-500 my-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to render analytical widget</span>
            </div>
          );
        }
      } else {
        const html = parseMarkdown(part);
        return <div key={index} className="space-y-2 leading-relaxed text-slate-600 text-xs" dangerouslySetInnerHTML={{ __html: html }} />;
      }
    });
  };

  // Filter conversations based on search query
  const filteredConvos = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8.5rem)] bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      
      {/* 1. Left Sidebar: Conversations Threads */}
      <aside className="w-64 border-r border-[#E2E8F0] bg-slate-50/50 flex flex-col shrink-0">
        
        {/* Sidebar Header Options */}
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col gap-3">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat Thread</span>
          </button>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-450" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* History Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-slate-350" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Loading history...</span>
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 font-medium">
              No conversations found.
            </div>
          ) : (
            filteredConvos.map((convo) => (
              <div
                key={convo.id}
                onClick={() => setActiveConvoId(convo.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-all text-xs border ${
                  activeConvoId === convo.id 
                    ? 'bg-blue-50/50 border-blue-100 text-primary font-semibold' 
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${activeConvoId === convo.id ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="truncate leading-tight">{convo.title}</span>
                </div>

                {/* Hover Action Controls */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleTogglePin(convo.id, e)}
                    title={convo.isPinned ? 'Unpin' : 'Pin'}
                    className={`p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-700 ${convo.isPinned ? 'text-primary bg-white shadow-sm border border-slate-100' : ''}`}
                  >
                    <Pin className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(convo.id, e)}
                    title={convo.isFavorite ? 'Unfavorite' : 'Favorite'}
                    className={`p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-700 ${convo.isFavorite ? 'text-amber-500 bg-white shadow-sm border border-slate-100' : ''}`}
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(convo.id, e)}
                    title="Delete"
                    className="p-1 hover:bg-red-50 rounded-lg text-slate-450 hover:text-red-650"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 2. Center Panel: Active Chat Feed */}
      <main className="flex-1 flex flex-col bg-[#F8FAFC]">
        
        {/* Chat Thread Header */}
        <header className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-550/10 text-primary border border-blue-500/20 flex items-center justify-center font-bold text-sm">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 leading-none">
                {activeConvoId 
                  ? conversations.find(c => c.id === activeConvoId)?.title || 'Copilot Chat' 
                  : 'AI Copilot Assistant'}
              </h2>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mt-1">
                Multi-Tenant Isolation Secure Sandbox
              </span>
            </div>
          </div>

          {activeConvoId && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleTogglePin(activeConvoId, e)}
                className={`p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 ${
                  conversations.find(c => c.id === activeConvoId)?.isPinned ? 'text-primary bg-blue-50 border-blue-100 font-bold' : ''
                }`}
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => handleToggleFavorite(activeConvoId, e)}
                className={`p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 ${
                  conversations.find(c => c.id === activeConvoId)?.isFavorite ? 'text-amber-500 bg-amber-50 border-amber-100 font-bold' : ''
                }`}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </header>

        {/* Message Roster Screen */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && !isTyping ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                <Bot className="h-10 w-10 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">How can I assist you with your ERP modules today?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ask details about leaves, overdue invoices, cash flow statistics, or draft email requests to vendor supply groups.
                </p>
              </div>
              
              {/* Suggestions Chips */}
              <div className="w-full pt-4 border-t border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-3">Suggested Prompt Starters</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'How many employees are on leave today?',
                    'Show overdue invoices.',
                    'Current cash balance.',
                    'Pending purchase orders.'
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInputPrompt(s)}
                      className="w-full text-left px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold transition-all duration-150 active:scale-[0.99] hover:border-slate-350"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 text-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  {/* Text bubble body */}
                  <div className={`max-w-2xl px-5 py-4 rounded-2xl relative group border transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md'
                      : 'bg-white border-[#E2E8F0] text-slate-700 shadow-sm'
                  }`}>
                    {/* Rendered content */}
                    {msg.role === 'user' ? (
                      <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {renderMessageContent(msg.content)}
                      </div>
                    )}

                    {/* Copy & Feedback controls for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div className="absolute right-4 -bottom-3.5 bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 text-slate-400 hover:text-slate-650 rounded"
                          title="Copy reply"
                        >
                          {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'LIKE')}
                          className={`p-1 rounded ${msg.feedback === 'LIKE' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-650'}`}
                          title="Thumbs Up"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'DISLIKE')}
                          className={`p-1 rounded ${msg.feedback === 'DISLIKE' ? 'text-red-500' : 'text-slate-400 hover:text-slate-655'}`}
                          title="Thumbs Down"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-655 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Loader Indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 text-primary flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-[#E2E8F0] px-5 py-4 rounded-2xl text-slate-400 text-xs flex items-center gap-2.5 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    <span>Analyzing database nodes & generating query response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Form */}
        <footer className="p-4 border-t border-[#E2E8F0] bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner transition-all duration-200">
              <input
                type="text"
                placeholder="Ask Amdox ERP Copilot... (e.g. 'Show overdue invoices')"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-medium"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-200/50 text-[9px] text-slate-500 rounded font-mono border border-slate-350">
                  <CornerDownLeft className="h-2.5 w-2.5" /> Enter
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isTyping || !inputPrompt.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-md disabled:shadow-none transition-all duration-200 shrink-0 active:scale-[0.96]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
};

export default AIChat;
export { AIChat };
