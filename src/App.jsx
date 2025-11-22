import React, { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Code,
  Play,
  Send,
  Layers,
  Monitor,
  Smartphone,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  ExternalLink,
  Settings,
  X,
  Eye,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Laptop,
  History,
  MessageSquare,
  Database,
  LogOut,
  User,
  Save,
  Clock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Link,
  Key,
  Github,
  PlusCircle,
  Lock,
  Mail,
} from "lucide-react";

/**
 * ------------------------------------------------------------------
 * 🟢 SUPABASE CONFIGURATION (ENTER CREDENTIALS HERE)
 * ------------------------------------------------------------------
 */
const SUPABASE_URL = "https://djssfplgqhrqcwxyilny.supabase.co"; // e.g., https://xyz.supabase.co
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3NmcGxncWhycWN3eHlpbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDE2NTUsImV4cCI6MjA3OTM3NzY1NX0.2E0ZXVkvOKrms3uqbOIxtfzkNGB25dq3lV4mVH18Nx8"; // e.g., eyJhbGciOiJIUzI1...

/**
 * NEXUS CORE v11.0 - AUTHENTICATION LOCKDOWN
 * Features: Mandatory Login, New Chat Workflow, Session Management
 */
const SYSTEM_PROMPT = `
You are "Nexus Core," a Senior Principal Frontend Architect & HCI Expert.
Your goal is to generate the **ABSOLUTE BEST, AWARD-WINNING** website possible.

### ⚙️ PROCESS (INTERNAL THOUGHT CHAIN):
1.  **Phase 1 (Drafting):** Plan the layout. Use a Bento Grid or Asymmetrical Split.
2.  **Phase 2 (HCI Refinement):** Check color contrast, touch targets (44px+), and whitespace.
3.  **Phase 3 (Final Code):** Write the production code.

### 🚀 CRITICAL RULES:
1.  **SCROLLING & SCROLLBARS:** -   Use \`min-h-screen\` on body. NEVER lock overflow.
    -   **CUSTOM SCROLLBAR:** You MUST include CSS to make the scrollbar thin and modern:
        \`::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #52525b; border-radius: 10px; }\`
2.  **ROUTING:** Create a Single Page App (SPA). 
    -   Use \`<nav>\` links (Home, About, Contact) that toggle \`<section>\` visibility via JS.
    -   Make the transition smooth (opacity/transform).
3.  **AESTHETICS & MOBILE:**
    -   **Font:** 'Inter', 'Outfit', or 'Space Grotesk'.
    -   **Mobile:** Use \`px-6\` padding on mobile. ensure font sizes scale down (\`text-4xl md:text-6xl\`).
    -   **Glassmorphism:** \`backdrop-blur-xl bg-white/5 border border-white/10\`.
    -   **Gradients:** Subtle, high-end gradients.
4.  **SINGLE FILE:** Output valid HTML5 + Tailwind + JS in ONE block.

### 📝 OUTPUT FORMAT:
-   Output ONLY the code block: \`\`\`html ... \`\`\`
`;

const NexusArchitect = () => {
  // --- STATE MANAGEMENT ---
  const [userPrompt, setUserPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "nexus",
      content:
        "Nexus Core v11.0 Online.\nSecure Environment Initialized.\n\nDescribe your new project.",
    },
  ]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [historyItems, setHistoryItems] = useState([]);

  // Supabase State
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("idle");
  const [generationLog, setGenerationLog] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [codeToType, setCodeToType] = useState("");

  // UI States
  const [viewMode, setViewMode] = useState("desktop");
  const [activeTab, setActiveTab] = useState("preview");
  const [sidebarView, setSidebarView] = useState("chat");
  const [showCopied, setShowCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const chatContainerRef = useRef(null);
  const codeContainerRef = useRef(null);

  // Environment API Key (Fallback)
  const envApiKey = "";

  // --- INITIALIZATION ---
  useEffect(() => {
    const checkDevice = () => setIsMobileDevice(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener("resize", checkDevice);

    // Initialize Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const client = createClient(SUPABASE_URL, SUPABASE_KEY);
        setSupabaseClient(client);
        setDbConnected(true);

        // Check Session
        client.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setAuthLoading(false);
          if (session) fetchHistory(client, session.user.id);
        });

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setAuthLoading(false);
          if (session) fetchHistory(client, session.user.id);
          else setHistoryItems([]);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Supabase Init Error:", error);
        setDbConnected(false);
        setAuthLoading(false);
      }
    } else {
      setAuthLoading(false);
    }

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // --- AUTHENTICATION ---
  const handleOAuthLogin = async (provider) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.href,
      },
    });
    if (error) console.error("Login error:", error);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setSession(null);
    setHistoryItems([]);
    // Also reset workspace
    handleNewChat();
  };

  // --- CORE WORKFLOW ---
  const handleNewChat = () => {
    setMessages([
      {
        role: "nexus",
        content:
          "Nexus Core Ready.\nWorkspace Reset.\n\nStarting new project context...",
      },
    ]);
    setGeneratedCode("");
    setUserPrompt("");
    setActiveTab("preview");
    setGenerationPhase("idle");
    setCodeToType("");
    setTypingIndex(0);
    setSidebarView("chat");
  };

  // --- HISTORY MANAGEMENT ---
  const fetchHistory = async (client, userId) => {
    if (!client) return;
    const { data, error } = await client
      .from("nexus_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setHistoryItems(data);
  };

  const saveToHistory = async (prompt, code) => {
    if (!supabaseClient || !session) return;
    try {
      await supabaseClient.from("nexus_history").insert([
        {
          prompt: prompt,
          code: code,
          user_id: session.user.id,
        },
      ]);
      fetchHistory(supabaseClient, session.user.id);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    if (!supabaseClient) return;
    try {
      await supabaseClient.from("nexus_history").delete().eq("id", id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // --- AUTO SCROLLING ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, generationLog]);

  useEffect(() => {
    if (activeTab === "code" && codeContainerRef.current) {
      codeContainerRef.current.scrollTop =
        codeContainerRef.current.scrollHeight;
    }
  }, [generatedCode]);

  // --- TYPING ENGINE ---
  useEffect(() => {
    if (generationPhase === "typing" && codeToType) {
      if (typingIndex < codeToType.length) {
        const timeout = setTimeout(() => {
          const chunkSize = 30;
          setGeneratedCode(
            (prev) =>
              prev + codeToType.slice(typingIndex, typingIndex + chunkSize)
          );
          setTypingIndex((prev) => prev + chunkSize);
        }, 5);
        return () => clearTimeout(timeout);
      } else {
        setGenerationPhase("complete");
        setActiveTab("preview");
        setMessages((prev) => [
          ...prev,
          {
            role: "nexus",
            content: `✅ **DEPLOYMENT SUCCESSFUL**\n\n> Visuals rendered. Project saved to Cloud.`,
          },
        ]);
        if (dbConnected)
          saveToHistory(userPrompt || "Generated Project", codeToType);
      }
    }
  }, [generationPhase, typingIndex, codeToType]);

  // --- GENERATION LOGIC ---
  const extractCode = (text) => {
    const markdownMatch = text.match(/```(html|xml)?\s*([\s\S]*?)```/i);
    if (markdownMatch && markdownMatch[2].includes("<!DOCTYPE html>"))
      return markdownMatch[2].trim();
    const docTypeIndex = text.indexOf("<!DOCTYPE html>");
    if (docTypeIndex !== -1)
      return text.substring(docTypeIndex).replace(/```/g, "").trim();
    return null;
  };

  const generateWebsite = async () => {
    if (!userPrompt.trim()) return;

    const newMessage = { role: "user", content: userPrompt };
    setMessages((prev) => [...prev, newMessage]);
    const currentPrompt = userPrompt;
    setUserPrompt("");
    setIsGenerating(true);
    setGenerationPhase("analyzing");
    setGenerationLog([
      "Initializing Visual Core...",
      "Checking Auth State...",
      "Analyzing Requirements...",
    ]);
    setSidebarView("chat");

    setActiveTab("code");
    setGeneratedCode("");
    setCodeToType("");
    setTypingIndex(0);

    const activeApiKey = customKey.trim() || envApiKey;

    try {
      setTimeout(() => {
        setGenerationPhase("drafting");
        setGenerationLog((prev) => [
          ...prev,
          "Phase 1: Structuring Layout & Typography...",
        ]);
      }, 1500);

      setTimeout(() => {
        setGenerationPhase("refining");
        setGenerationLog((prev) => [
          ...prev,
          "Phase 2: Refining HCI & Mobile Responsiveness...",
        ]);
      }, 3000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: SYSTEM_PROMPT },
                  ...messages
                    .filter((m) => m.role !== "system")
                    .map((m) => ({
                      text: `${m.role === "user" ? "User" : "Nexus Core"}: ${
                        m.content
                      }`,
                    })),
                  {
                    text: `User Request: ${currentPrompt}\n\nNexus Core (Generate Optimized HTML):`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.75, maxOutputTokens: 8192 },
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const aiResponseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const extractedCode = extractCode(aiResponseText);

      if (extractedCode) {
        setGenerationLog((prev) => [
          ...prev,
          "Phase 3: Finalizing & Saving to Cloud...",
        ]);
        setCodeToType(extractedCode);
        setGenerationPhase("typing");
      } else {
        throw new Error("Failed to generate valid HTML architecture.");
      }
    } catch (error) {
      setGenerationPhase("idle");
      setMessages((prev) => [
        ...prev,
        { role: "nexus", content: `⚠️ ERROR: ${error.message}` },
      ]);
      setActiveTab("preview");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UTILITIES ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleOpenNewWindow = () => {
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const safeSrcDoc = generatedCode.replace(
    "</head>",
    `<style>
      html, body { overflow-y: auto !important; min-height: 100vh !important; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #52525b; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #71717a; }
    </style></head>`
  );

  // ---------------------------------------------------------------------------
  // RENDER LOGIC - GUARDRAILS & AUTH
  // ---------------------------------------------------------------------------

  // 1. MOBILE GUARD
  if (isMobileDevice) {
    return (
      <div className="h-screen w-full bg-[#09090b] text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8 animate-pulse">
          <Laptop size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-4 tracking-tight">
          Desktop Environment Required
        </h1>
        <p className="text-slate-400 max-w-md leading-relaxed">
          Nexus Architect v11.0 requires a desktop environment.
        </p>
      </div>
    );
  }

  // 2. CONFIG GUARD
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return (
      <div className="h-screen w-full bg-[#09090b] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#121215] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            Configuration Missing
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            You must configure the <strong>SUPABASE_URL</strong> and{" "}
            <strong>SUPABASE_KEY</strong> constants in the source code to run
            Nexus Architect.
          </p>
          <div className="bg-black/30 p-4 rounded-lg border border-white/5 text-left mb-6">
            <p className="text-[10px] text-slate-500 font-mono mb-1">
              // Edit these lines in NexusArchitect.jsx
            </p>
            <p className="text-xs text-indigo-300 font-mono">
              const SUPABASE_URL = "..."
            </p>
            <p className="text-xs text-indigo-300 font-mono">
              const SUPABASE_KEY = "..."
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. LOADING GUARD (Prevents crash while checking session)
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#09090b] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw size={32} className="text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 font-mono">
            Initializing Nexus Core...
          </p>
        </div>
      </div>
    );
  }

  // 4. AUTH GUARD (LOGIN SCREEN)
  if (!session) {
    return (
      <div className="h-screen w-full bg-[#09090b] flex items-center justify-center relative overflow-hidden font-sans">
        {/* Background Ambience */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-[#121215] border border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              <Cpu size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Welcome to Nexus
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to access your workspace and history.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleOAuthLogin("github")}
              className="w-full py-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-all border border-white/10"
            >
              <Github size={18} /> Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuthLogin("google")}
              className="w-full py-3 bg-white hover:bg-slate-200 text-black font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Mail size={18} className="text-black" /> Continue with Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={12} /> Secure Environment
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. MAIN APP (Authenticated)
  return (
    <div className="h-screen w-full bg-[#09090b] text-slate-200 flex font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>

      {/* SIDEBAR */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-72"
        } bg-[#0c0c0e] border-r border-white/5 flex flex-col transition-all duration-300 z-30`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Cpu size={18} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 animate-in fade-in">
              <h1 className="font-bold text-sm tracking-wide text-white leading-none">
                NEXUS
              </h1>
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider">
                ARCHITECT v11
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-6 px-3 space-y-2">
          {/* NEW PROJECT BUTTON */}
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all mb-4 ${
              sidebarCollapsed
                ? "justify-center"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            }`}
          >
            <PlusCircle size={18} />
            {!sidebarCollapsed && <span>New Project</span>}
          </button>

          <div className="h-px bg-white/5 my-2"></div>

          <button
            onClick={() => setSidebarView("chat")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              sidebarView === "chat"
                ? "bg-white/5 text-white shadow-sm border border-white/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare size={18} />
            {!sidebarCollapsed && <span>Workspace</span>}
          </button>
          <button
            onClick={() => setSidebarView("history")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              sidebarView === "history"
                ? "bg-white/5 text-white shadow-sm border border-white/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <History size={18} />
            {!sidebarCollapsed && <span>History</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0c]">
          <div
            className={`flex items-center gap-3 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            {session.user.user_metadata.avatar_url ? (
              <img
                src={session.user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-black">
                {session.user.email[0].toUpperCase()}
              </div>
            )}

            {!sidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-white font-medium truncate">
                  {session.user.email.split("@")[0]}
                </p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                  Online
                </p>
              </div>
            )}

            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-4 w-full flex items-center justify-center py-2 text-slate-600 hover:text-slate-400"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden bg-[#09090b]">
        {/* MIDDLE PANEL */}
        <div className="w-[400px] xl:w-[480px] flex flex-col border-r border-white/5 bg-[#09090b] relative">
          {/* CHAT VIEW */}
          {sidebarView === "chat" && (
            <>
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-5 space-y-6"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    } animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                        msg.role === "user"
                          ? "bg-slate-800 border border-white/5"
                          : "bg-indigo-600 shadow-lg shadow-indigo-500/20"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={14} className="text-slate-300" />
                      ) : (
                        <Layers size={16} className="text-white" />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-sm shadow-sm max-w-[85%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-slate-800 text-white rounded-tr-none border border-white/5"
                          : "bg-[#121215] text-slate-300 rounded-tl-none border border-white/5"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={`mb-1 last:mb-0 ${
                            line.includes("✅")
                              ? "text-emerald-400 font-bold"
                              : ""
                          } ${
                            line.startsWith(">")
                              ? "text-indigo-300 italic text-xs pl-3 border-l-2 border-indigo-500/30 my-2"
                              : ""
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="bg-[#0f0f12] border border-indigo-500/20 rounded-lg p-3 space-y-2 mt-4 animate-in fade-in mx-2 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
                      <Activity
                        size={14}
                        className="text-indigo-400 animate-pulse"
                      />
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        Architect Core
                      </span>
                    </div>
                    {generationLog.map((log, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[11px] font-mono text-slate-400"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            i === generationLog.length - 1
                              ? "bg-indigo-500 animate-pulse"
                              : "bg-emerald-500"
                          }`}
                        ></div>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 bg-[#09090b] border-t border-white/5">
                <div className="relative bg-[#121215] rounded-xl border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner group">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Describe your next masterpiece..."
                    className="w-full bg-transparent text-slate-200 p-4 pr-12 h-36 text-sm resize-none focus:outline-none font-mono placeholder:text-slate-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        generateWebsite();
                      }
                    }}
                  />
                  <button
                    onClick={generateWebsite}
                    disabled={isGenerating || !userPrompt.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {isGenerating ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* HISTORY VIEW */}
          {sidebarView === "history" && (
            <div className="flex-1 flex flex-col h-full bg-[#09090b]">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database size={14} className="text-indigo-400" /> Project
                  History
                </h2>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                  {historyItems.length} Projects
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {historyItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2 opacity-50">
                    <Clock size={24} />
                    <p className="text-xs">No history recorded yet.</p>
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setGeneratedCode(item.code);
                        setActiveTab("preview");
                      }}
                      className="group p-4 rounded-xl bg-[#121215] border border-white/5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-900/20 cursor-pointer transition-all relative"
                    >
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 mb-3 pr-6 leading-relaxed">
                        {item.prompt || "Untitled Project"}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                          Restore <ChevronRight size={10} />
                        </span>
                      </div>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: PREVIEW & EDITOR */}
        <div className="flex-1 flex flex-col bg-[#09090b] relative border-l border-white/5">
          {/* Toolbar */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e]">
            <div className="flex bg-[#18181b] rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("preview")}
                disabled={generationPhase === "typing"}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Eye size={14} /> Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Code size={14} /> Source
              </button>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === "preview" && (
                <>
                  <div className="flex bg-[#18181b] rounded-lg p-1 border border-white/5">
                    <button
                      onClick={() => setViewMode("mobile")}
                      className={`p-1.5 rounded ${
                        viewMode === "mobile"
                          ? "text-indigo-400 bg-white/10"
                          : "text-slate-500"
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("desktop")}
                      className={`p-1.5 rounded ${
                        viewMode === "desktop"
                          ? "text-indigo-400 bg-white/10"
                          : "text-slate-500"
                      }`}
                      title="Desktop View"
                    >
                      <Monitor size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleOpenNewWindow}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded"
                    title="Open New Tab"
                  >
                    <ExternalLink size={16} />
                  </button>
                </>
              )}
              {activeTab === "code" && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] text-xs text-slate-300 border border-white/5 hover:border-white/20"
                >
                  {showCopied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}{" "}
                  {showCopied ? "Copied" : "Copy"}
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-all ${
                  showSettings
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "hover:bg-white/5 text-slate-400"
                }`}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* API KEY Settings Modal */}
          {showSettings && (
            <div className="absolute top-16 right-4 w-80 bg-[#121215] border border-white/10 rounded-xl shadow-2xl z-50 p-5 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal size={14} className="text-indigo-400" /> System
                  Config
                </h3>
                <button onClick={() => setShowSettings(false)}>
                  <X size={14} className="text-slate-500 hover:text-white" />
                </button>
              </div>

              {/* API Key Config */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gemini API (Optional)
                </h4>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Use custom API key if quota exceeded..."
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-4">
                <strong>Note:</strong> Supabase credentials must be set in the
                code constants to enable History/Auth.
              </p>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative bg-[#050505] flex items-center justify-center overflow-hidden">
            {activeTab === "preview" ? (
              <div
                className={`transition-all duration-500 relative z-10 shadow-2xl ${
                  viewMode === "mobile"
                    ? "w-[375px] h-[750px] rounded-[40px] border-[12px] border-[#1a1a1a] bg-black overflow-hidden"
                    : "w-full h-full"
                }`}
              >
                {generatedCode ? (
                  <iframe
                    srcDoc={safeSrcDoc}
                    title="Preview"
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                      <ShieldCheck size={48} className="opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-400">
                        Awaiting Generation
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Enter a prompt to begin architecture.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                ref={codeContainerRef}
                className="w-full h-full overflow-auto bg-[#0a0a0a] p-0 relative"
              >
                {generationPhase !== "complete" &&
                  generatedCode.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono gap-4">
                      <RefreshCw
                        size={32}
                        className="animate-spin text-indigo-500"
                      />
                      <div className="text-xs bg-white/5 px-3 py-1 rounded border border-white/5 text-indigo-300">
                        Processing Architecture...
                      </div>
                    </div>
                  )}
                <pre className="font-mono text-xs text-blue-300 leading-relaxed whitespace-pre-wrap p-6">
                  {generatedCode}
                  {generationPhase === "typing" && (
                    <span className="w-2 h-4 bg-indigo-500 inline-block ml-1 animate-pulse" />
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusArchitect;
