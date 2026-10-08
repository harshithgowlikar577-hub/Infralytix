import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Sparkles, User, Lightbulb, ArrowRight, MessageSquare, Crown,
  Building2, AlertOctagon, TrendingUp, Target, BarChart3, ShieldCheck,
  CheckCircle2, ExternalLink, ArrowLeftRight, Database, Zap
} from 'lucide-react';
import { copilotAPI } from '../lib/api';
import { useProjects } from '../hooks/useAPI';

interface Citation {
  project_id: string;
  project_name: string;
  cost_cr?: number;
  delay_days?: number;
  risk?: string;
}

interface SuggestedAction {
  label: string;
  link?: string;
  prompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  citations?: Citation[];
  suggestedActions?: SuggestedAction[];
  isMinisterial?: boolean;
}

const STRATEGIC_CHIPS = [
  {
    icon: TrendingUp,
    label: 'Why is Rajasthan risk increasing?',
    prompt: 'Why is Rajasthan risk increasing?',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20',
  },
  {
    icon: AlertOctagon,
    label: 'Top 10 projects needing intervention',
    prompt: 'Show top 10 projects needing intervention',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
  },
  {
    icon: Target,
    label: 'Projects threatening 2030 targets',
    prompt: 'What projects threaten 2030 targets?',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
  },
  {
    icon: ArrowLeftRight,
    label: 'Compare PRJ0671 and PRJ0573',
    prompt: 'Compare PRJ0671 and PRJ0573',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20',
  },
  {
    icon: Building2,
    label: 'National Infrastructure Health',
    prompt: 'What is the overall infrastructure health?',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
  },
  {
    icon: Sparkles,
    label: 'Summarize PRJ0671 Dossier',
    prompt: 'Summarize PRJ0671',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
];

export default function Copilot() {
  const navigate = useNavigate();
  const { data: projectsData } = useProjects({ limit: 12 });
  const sampleProjects = projectsData?.projects || projectsData?.items || [];

  const [input, setInput] = useState('');
  const [selectedP1, setSelectedP1] = useState('');
  const [selectedP2, setSelectedP2] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `### 🇮🇳 Welcome to INFRALYTIX AI Governance Copilot
**National Decision Support System for MoSPI, PM GatiShakti & Union Line Ministries**

I am your **Offline Deterministic Local RAG Copilot**, directly interfaced with the live national database of **1,981 central infrastructure projects**.

#### What you can query:
- **Project Investigations**: *"Summarize PRJ0671"* or *"Why is PRJ0671 delayed?"*
- **Cross-Asset Comparisons**: *"Compare PRJ0671 and PRJ0573"*
- **State Bottlenecks**: *"Why is Rajasthan risk increasing?"* or *"Analyze Gujarat corridors"*
- **Cabinet Action Priorities**: *"Show top 10 projects needing intervention"*
- **GatiShakti 2030 Milestones**: *"What projects threaten 2030 targets?"*

Click any strategic prompt chip below or type your inquiry in natural language.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'PORTFOLIO_OVERVIEW',
      suggestedActions: [
        { label: 'Executive Dashboard', link: '/dashboard' },
        { label: 'Risk Monitor', link: '/radar' },
        { label: 'Early Warning Queues', link: '/early-warnings' },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await copilotAPI.query({ query });
      const data = response.data;

      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: data.answer || 'No telemetry retrieved.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        citations: data.citations || [],
        suggestedActions: data.suggested_actions || [],
        isMinisterial: true,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot query error:', err);
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: `### ⚠️ Copilot Query Notice
Unable to retrieve telemetry response from the local RAG engine. Please ensure the backend server is running and retry your inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Retry Query', prompt: query },
          { label: 'Open Early Warnings', link: '/early-warnings' },
        ],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickCompare = () => {
    if (selectedP1 && selectedP2) {
      handleSend(`Compare ${selectedP1} and ${selectedP2}`);
    }
  };

  // Helper to render markdown-like content cleanly
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-slate-700/50 flex items-center gap-2">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} className="text-xs font-bold text-amber-300 uppercase tracking-wider pt-2">
                {line.replace('#### ', '')}
              </h4>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-amber-500 pl-3 py-1 my-2 bg-amber-500/10 rounded-r text-amber-200 font-medium">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-400 mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(line.replace('- ', '')) }} />
              </div>
            );
          }
          if (line.startsWith('|')) {
            // Table row
            return (
              <div key={idx} className="font-mono text-[11px] overflow-x-auto py-0.5 text-slate-300">
                {line}
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
          );
        })}
      </div>
    );
  };

  const formatBold = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-[#050f21] border border-[#1b3459] text-amber-300 font-mono text-[11px]">$1</code>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-h-[920px] space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#14233D] shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            <span>MoSPI &amp; PM GatiShakti</span>
            <span>/</span>
            <span className="text-slate-200">Decision Support Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-blue-400" />
            <span>AI Governance Copilot</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Offline Local RAG • 0% Hallucination</span>
            </span>
          </h1>
        </div>

        {/* Quick Project Compare Drawer */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#081325] border border-[#182C4C] self-start md:self-auto text-xs">
          <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Compare:</span>
          </span>
          <select
            value={selectedP1}
            onChange={e => setSelectedP1(e.target.value)}
            className="bg-[#050e1c] border border-[#1b3459] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Asset 1</option>
            {sampleProjects.map((p: any) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_id} - {p.project_name?.slice(0, 20)}...
              </option>
            ))}
          </select>
          <span className="text-slate-500 font-bold">vs</span>
          <select
            value={selectedP2}
            onChange={e => setSelectedP2(e.target.value)}
            className="bg-[#050e1c] border border-[#1b3459] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Asset 2</option>
            {sampleProjects.map((p: any) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_id} - {p.project_name?.slice(0, 20)}...
              </option>
            ))}
          </select>
          <button
            onClick={handleQuickCompare}
            disabled={!selectedP1 || !selectedP2 || isTyping}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Strategic Prompt Chips Strip */}
      <div className="glass-card p-3 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Ministerial Strategic Inquiries — One-Click Grounded Intelligence</span>
          </div>
          <span className="text-[10px] text-slate-500">1,981 projects indexed</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STRATEGIC_CHIPS.map((chip, i) => {
            const Icon = chip.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(chip.prompt)}
                disabled={isTyping}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${chip.bgColor}`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${chip.color}`} />
                <span className={`text-[11px] font-semibold truncate ${chip.color}`}>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-5 space-y-3.5 shadow-xl ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                  : 'glass-card border border-[#1b3459] bg-[#071326]/90 text-slate-200'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Ministerial Intelligence Brief • Grounded Telemetry</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300 font-mono">
                    {m.intent || 'RAG_SYNTHESIS'}
                  </span>
                </div>
              )}

              {/* Message Content */}
              {m.sender === 'user' ? (
                <div className="text-sm font-medium">{m.content}</div>
              ) : (
                renderMessageContent(m.content)
              )}

              {/* Citations Badges */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-3 border-t border-[#1b3459] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ground Truth Citations ({m.citations.length} Verified Records in SQLite)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.citations.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/projects/${c.project_id}`)}
                        className="p-2.5 rounded-lg bg-[#040d1c] border border-[#142642] hover:border-blue-500/50 flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-[#071730]"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#081930] text-blue-300 border border-blue-500/20">
                              {c.project_id}
                            </span>
                            <span className="text-xs font-bold text-white truncate">{c.project_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {c.cost_cr && `₹${c.cost_cr.toFixed(1)} Cr`} • {c.delay_days}d delay • {c.risk} Risk
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="pt-3 border-t border-slate-700/50 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    Suggested Directives &amp; Views
                  </span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {m.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (action.link) navigate(action.link);
                          else if (action.prompt) handleSend(action.prompt);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#050e1c] hover:bg-[#0c2242] border border-[#1b3459] hover:border-blue-500/40 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] ${m.sender === 'user' ? 'text-blue-200/60' : 'text-slate-500'}`}>
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card border border-[#1b3459] bg-[#071326]/90 px-5 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
              <span className="text-xs text-slate-400 ml-2">Grounding query across 1,981 database records in SQLite...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 border-t border-[#14233D] shrink-0"
      >
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-500">
            <MessageSquare className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Copilot: 'Why is Rajasthan risk increasing?' or 'Compare PRJ0671 and PRJ0573'..."
            className="w-full pl-11 pr-14 py-3 text-xs sm:text-sm bg-[#050e1c] border border-[#1b3459] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Powered by Offline Deterministic Local RAG • Zero Hallucination • Grounded on 1,981 National Projects
        </p>
      </form>
    </div>
  );
}
