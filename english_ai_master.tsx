import React, { useState, useEffect, useRef } from 'react';

// Main App Component with Glassmorphism UI & Precise Voice Recognition
export default function App() {
  const [currentTab, setcurrentTab] = useState('chat');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('gemini_custom_api_key') || '');
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const saveApiKey = (key) => {
    setCustomApiKey(key);
    if (key.trim()) {
      localStorage.setItem('gemini_custom_api_key', key.trim());
      showToast("API Key saved successfully!");
    } else {
      localStorage.removeItem('gemini_custom_api_key');
      showToast("API Key removed. Using default.");
    }
    setApiKeyModalOpen(false);
  };

  const callGeminiAPI = async (payload) => {
    const key = customApiKey || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`;
    
    let retries = 5;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 429 && i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-2.5 rounded-2xl shadow-lg flex items-center justify-center text-xl">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                English AI Master
              </h1>
              <p className="text-[11px] sm:text-xs text-indigo-300">ভয়েস ইনপুট ও পারফেক্ট বাংলা/ইংলিশ রিকগনিশন সহ</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden sm:inline-block bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm">
              Gemini 3 Flash
            </span>
            <button 
              onClick={() => setApiKeyModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-sm backdrop-blur-md"
            >
              <i className="fa-solid fa-key text-indigo-400"></i> API Key
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Fully Responsive Scrollable) */}
      <nav className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-[57px] sm:top-[65px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto space-x-2 py-2.5 scrollbar-none">
          {[
            { id: 'chat', label: 'AI Chat / চ্যাট', icon: 'fa-comments' },
            { id: 'vision', label: 'Vision / ছবি স্ক্যান', icon: 'fa-camera' },
            { id: 'grammar', label: 'Grammar / গ্রামার চেক', icon: 'fa-spell-check' },
            { id: 'translate', label: 'Translation / অনুবাদ', icon: 'fa-language' },
            { id: 'vocab', label: 'Vocab / শব্দভাণ্ডার', icon: 'fa-book-open' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setcurrentTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap backdrop-blur-md shrink-0 ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full flex flex-col">
        {currentTab === 'chat' && <ChatModule callGeminiAPI={callGeminiAPI} showToast={showToast} />}
        {currentTab === 'vision' && <VisionModule callGeminiAPI={callGeminiAPI} showToast={showToast} />}
        {currentTab === 'grammar' && <GrammarModule callGeminiAPI={callGeminiAPI} showToast={showToast} />}
        {currentTab === 'translate' && <TranslateModule callGeminiAPI={callGeminiAPI} showToast={showToast} />}
        {currentTab === 'vocab' && <VocabModule callGeminiAPI={callGeminiAPI} showToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/5 border-t border-white/10 py-4 mt-auto text-center text-xs text-slate-400 px-4">
        English AI Master &copy; 2026 | Powered by Google Gemini & Glassmorphism UI
      </footer>

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <ApiKeyModal 
          currentKey={customApiKey} 
          onSave={saveApiKey} 
          onClose={() => setApiKeyModalOpen(false)} 
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 backdrop-blur-xl bg-slate-900/95 border ${toast.isError ? 'border-rose-500/50 text-rose-200' : 'border-emerald-500/50 text-emerald-200'} px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm z-50 flex items-center gap-3 animate-bounce`}>
          <i className={`fa-solid ${toast.isError ? 'fa-triangle-exclamation text-rose-400' : 'fa-circle-check text-emerald-400'} text-lg`}></i>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}

// ==========================================
// PRECISE VOICE RECOGNITION HOOK & CONTROLS
// ==========================================

function useVoiceInput(targetSetter, currentMicLang) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  const toggleListen = (showToast) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech Recognition is not supported in your browser. Please use Chrome.", true);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimText('');
      return;
    }

    const recognition = new SpeechRecognition();
    const langMode = currentMicLang || 'auto';

    if (langMode === 'bn-BD') {
      recognition.lang = 'bn-BD';
    } else if (langMode === 'en-US') {
      recognition.lang = 'en-US';
    } else {
      recognition.lang = 'bn-BD'; // Default base for multi/auto
    }

    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText(langMode === 'bn-BD' ? 'শুনছি (বাংলা)...' : langMode === 'en-US' ? 'Listening (English)...' : 'Listening...');
      showToast(`Listening in [${langMode === 'bn-BD' ? 'বাংলা' : langMode === 'en-US' ? 'English' : 'Auto'}] mode...`);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
      }

      if (final) {
        targetSetter(prev => prev ? prev.trim() + ' ' + final.trim() : final.trim());
        setInterimText('');
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setInterimText('');
      showToast("Voice recognition error: " + event.error, true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setInterimText('');
    }
  };

  return { isListening, interimText, toggleListen };
}

// Universal Text-to-Speech Play/Stop Button
function AudioSpeechButton({ textToRead, showToast }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast("Text-to-speech is not supported in your browser.", true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      showToast("Speech stopped.");
      return;
    }

    if (!textToRead || !textToRead.trim()) {
      showToast("No text available to read.", true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const hasBengali = /[\u0980-\u09FF]/.test(textToRead);
    utterance.lang = hasBengali ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      showToast("Playing speech audio...");
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      showToast("Speech playback error.", true);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={toggleSpeech}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 backdrop-blur-md shadow-sm shrink-0 ${
        isPlaying 
          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/60 animate-pulse' 
          : 'bg-white/10 hover:bg-white/20 text-indigo-200 border border-white/20'
      }`}
    >
      <i className={`fa-solid ${isPlaying ? 'fa-volume-xmark text-rose-400' : 'fa-volume-high text-indigo-300'}`}></i>
      <span>{isPlaying ? 'Stop (থামান)' : 'Listen (শুনুন)'}</span>
    </button>
  );
}


// ==========================================
// 1. CHAT ASSISTANT MODULE
// ==========================================
function ChatModule({ callGeminiAPI, showToast }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm your English AI Master. Ask me anything in English or Bengali. আপনি বাংলায় কথা বললে আমি বাংলায় উত্তর দেব এবং ইংরেজিতে বললে ইংরেজিতে! বলূন, আপনাকে কীভাবে সাহায্য করতে পারি?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [micLang, setMicLang] = useState('bn-BD'); // 'bn-BD', 'en-US', or 'auto'
  const chatEndRef = useRef(null);

  const { isListening, interimText, toggleListen } = useVoiceInput(setInputVal, micLang);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, interimText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userText = inputVal.trim();
    setInputVal('');
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const systemPrompt = "You are 'English AI Master', an expert, friendly, and encouraging English AI Tutor. Match the user's language: if the user speaks or writes in Bengali (or mixed Bengali-English), reply naturally in Bengali with accurate Bengali script and English examples. If the user speaks English, reply in English. Help them learn English fluently.";

      const payload = {
        contents: historyPayload,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const res = await callGeminiAPI(payload);
      const reply = res.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request.";
      setMessages([...newMessages, { role: 'model', text: reply }]);
    } catch (err) {
      showToast(err.message, true);
      setMessages([...newMessages, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-[74vh]">
      {/* Chat Header */}
      <div className="bg-white/5 px-4 sm:px-6 py-3 border-b border-white/10 flex flex-wrap justify-between items-center gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
          <span className="font-semibold text-xs sm:text-sm text-slate-200">AI English Tutor (Online)</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setMessages([{ role: 'model', text: "Chat cleared. How can I help you today?" }])}
            className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10"
          >
            <i className="fa-solid fa-trash-can"></i> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 sm:gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 shadow-md ${
              m.role === 'user' ? 'bg-gradient-to-tr from-slate-700 to-slate-800 text-white' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
            }`}>
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className={`max-w-[88%] sm:max-w-[75%] space-y-2`}>
              <div className={`p-3.5 sm:p-4 rounded-2xl shadow-lg border text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
                m.role === 'user' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-white/20' 
                  : 'bg-white/10 text-slate-100 border-white/10'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {m.role === 'model' && (
                <div className="flex justify-start px-1">
                  <AudioSpeechButton textToRead={m.text} showToast={showToast} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isListening && interimText && (
          <div className="flex items-start gap-2.5 flex-row-reverse animate-pulse">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">Mic</div>
            <div className="max-w-[85%] p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs sm:text-sm italic">
              {interimText}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">AI</div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input & Precise Mic Language Mode Bar */}
      <div className="p-3 sm:p-4 backdrop-blur-md bg-white/5 border-t border-white/10 space-y-2">
        {/* Dedicated Mic Language Selector Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <i className="fa-solid fa-microphone-lines text-indigo-400"></i> Voice Input Mode:
          </span>
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMicLang('bn-BD')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${micLang === 'bn-BD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              🇧🇩 বাংলা
            </button>
            <button
              type="button"
              onClick={() => setMicLang('en-US')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${micLang === 'en-US' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              🇺🇸 English
            </button>
            <button
              type="button"
              onClick={() => setMicLang('auto')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${micLang === 'auto' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              🌐 Auto
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <button 
            type="button" 
            onClick={() => toggleListen(showToast)}
            className={`p-3 rounded-2xl transition text-sm flex items-center justify-center shrink-0 border backdrop-blur-md shadow-md ${
              isListening ? 'bg-rose-500/40 text-rose-200 border-rose-500/60 animate-pulse ring-4 ring-rose-500/20' : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
            }`}
            title="Click to Speak"
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
          </button>
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={micLang === 'bn-BD' ? "বাংলায় বলুন বা লিখুন (যেমন: কেমন আছো তুমি)..." : micLang === 'en-US' ? "Speak or type in English (e.g. Hi, how are you?)..." : "Type or speak your message..."} 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 sm:px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md transition"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 sm:px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0 disabled:opacity-50"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}


// ==========================================
// 2. VISION & PHOTO SOLVER MODULE
// ==========================================
function VisionModule({ callGeminiAPI, showToast }) {
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [prompt, setPrompt] = useState('Analyze this English text/exercise. Provide full explanation, corrections, and Bengali translation.');
  const [micLang, setMicLang] = useState('bn-BD');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');

  const { isListening, interimText, toggleListen } = useVoiceInput(setPrompt, micLang);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviewUrl(event.target.result);
      setImageBase64(event.target.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const solveImage = async () => {
    if (!imageBase64) {
      showToast("Please upload an image first!", true);
      return;
    }
    setLoading(true);
    setSolution('');

    try {
      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageMime,
                data: imageBase64
              }
            }
          ]
        }],
        systemInstruction: {
          parts: [{ text: "You are an expert English tutor and document analyst. Analyze the uploaded image. Provide clear, structured solutions, grammar explanations, correct sentences, and Bengali translation/notes." }]
        }
      };

      const res = await callGeminiAPI(payload);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate analysis.";
      setSolution(text);
      showToast("Image analyzed successfully!");
    } catch (err) {
      showToast(err.message, true);
      setSolution(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Image & Document Solver (ছবির সমাধান)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">Upload a photo of a textbook page, exercise, or handwritten note for instant AI tutoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="border-2 border-dashed border-white/20 hover:border-indigo-500 rounded-3xl p-6 text-center cursor-pointer bg-white/5 transition flex flex-col items-center justify-center relative min-h-[220px]">
          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          {imagePreviewUrl ? (
            <div className="flex flex-col items-center">
              <img src={imagePreviewUrl} alt="Preview" className="max-h-48 rounded-2xl shadow-md border border-white/20 object-contain mb-2" />
              <p className="text-xs text-indigo-300 font-medium">Click or drop another image to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl mb-3 border border-indigo-500/30 shadow-inner">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className="text-sm font-semibold text-white">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP</p>
            </div>
          )}
        </div>

        {/* Prompt & Controls */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Voice Prompt Mode</label>
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
                <button type="button" onClick={() => setMicLang('bn-BD')} className={`px-2 py-0.5 rounded-lg ${micLang === 'bn-BD' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇧🇩 বাংলা</button>
                <button type="button" onClick={() => setMicLang('en-US')} className={`px-2 py-0.5 rounded-lg ${micLang === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇺🇸 EN</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => toggleListen(showToast)}
                className={`p-3 rounded-2xl transition text-sm border backdrop-blur-md shrink-0 ${isListening ? 'bg-rose-500/40 text-rose-200 border-rose-500/60 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'}`}
              >
                <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
              </button>
              <textarea 
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md"
              ></textarea>
            </div>
            {isListening && interimText && (
              <p className="text-xs text-rose-300 italic animate-pulse">Live: {interimText}</p>
            )}
          </div>

          <button 
            onClick={solveImage}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-2xl font-medium text-xs sm:text-sm transition shadow-lg shadow-indigo-500/30 border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            <span>Solve & Analyze Image</span>
          </button>
        </div>
      </div>

      {solution && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-square-poll-vertical"></i> AI Solution & Explanation:
            </h3>
            <AudioSpeechButton textToRead={solution} showToast={showToast} />
          </div>
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/10">
            {solution}
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 3. GRAMMAR CHECKER MODULE
// ==========================================
function GrammarModule({ callGeminiAPI, showToast }) {
  const [input, setInput] = useState('');
  const [micLang, setMicLang] = useState('en-US');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { isListening, interimText, toggleListen } = useVoiceInput(setInput, micLang);

  const checkGrammar = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const prompt = `Check and correct the following text for any grammatical errors. Provide the response strictly in JSON format with two keys: "corrected" (the fully corrected sentence) and "explanation" (detailed explanation of mistakes and rules in Bengali and English). Text: "${input}"`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              corrected: { type: "STRING" },
              explanation: { type: "STRING" }
            },
            propertyOrdering: ["corrected", "explanation"]
          }
        },
        systemInstruction: { parts: [{ text: "You are an expert English grammar specialist. Provide accurate corrections and clear explanations." }] }
      };

      const res = await callGeminiAPI(payload);
      const parsed = JSON.parse(res.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      setResult(parsed);
      showToast("Grammar checked successfully!");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Grammar Checker & Fixer (গ্রামার চেক ও সমাধান)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">Check sentences or paragraphs for errors and get detailed bilingual explanations.</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Enter Text</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
              <button type="button" onClick={() => setMicLang('en-US')} className={`px-2 py-0.5 rounded-lg ${micLang === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇺🇸 English</button>
              <button type="button" onClick={() => setMicLang('bn-BD')} className={`px-2 py-0.5 rounded-lg ${micLang === 'bn-BD' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇧🇩 বাংলা</button>
            </div>
            <button 
              type="button" 
              onClick={() => toggleListen(showToast)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border backdrop-blur-md ${isListening ? 'bg-rose-500/40 text-rose-200 border-rose-500/60 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'}`}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i> Voice
            </button>
          </div>
        </div>
        <textarea 
          rows="4" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., He go to school everyday and played football..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md"
        ></textarea>

        {isListening && interimText && (
          <p className="text-xs text-rose-300 italic animate-pulse">Live: {interimText}</p>
        )}

        <button 
          onClick={checkGrammar}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-2xl font-medium text-xs sm:text-sm transition shadow-lg shadow-indigo-500/30 border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-spell-check"></i>}
          <span>Check & Correct Grammar</span>
        </button>
      </div>

      {result && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check"></i> Corrected Version:
            </h4>
            <AudioSpeechButton textToRead={`Corrected sentence: ${result.corrected}. Explanation: ${result.explanation}`} showToast={showToast} />
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 text-xs sm:text-sm font-medium text-emerald-200">
            {result.corrected}
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
              <i className="fa-solid fa-circle-info"></i> Detailed Explanation (বাংলায় ব্যাখ্যা):
            </h4>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/10">
              {result.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 4. TRANSLATION MODULE
// ==========================================
function TranslateModule({ callGeminiAPI, showToast }) {
  const [direction, setDirection] = useState('en-to-bn'); // 'en-to-bn' or 'bn-to-en'
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('Translation will appear here...');
  const [micLang, setMicLang] = useState('bn-BD');
  const [loading, setLoading] = useState(false);

  const { isListening, interimText, toggleListen } = useVoiceInput(setInput, micLang);

  const swap = () => {
    setDirection(prev => prev === 'en-to-bn' ? 'bn-to-en' : 'en-to-bn');
    setInput(output !== 'Translation will appear here...' ? output : '');
    setOutput(input);
    setMicLang(direction === 'en-to-bn' ? 'en-US' : 'bn-BD');
  };

  const translateText = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setOutput('Translating...');

    try {
      const isEngToBn = direction === 'en-to-bn';
      const prompt = isEngToBn 
        ? `Translate the following English text to natural Bengali. Provide only the clean translation or brief contextual notes if helpful. Text: "${input}"`
        : `Translate the following Bengali text to natural, fluent English. Provide only the clean translation. Text: "${input}"`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "You are a professional translator between English and Bengali." }] }
      };

      const res = await callGeminiAPI(payload);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed.";
      setOutput(text);
      showToast("Translated successfully!");
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (output === 'Translation will appear here...') return;
    navigator.clipboard.writeText(output);
    showToast("Copied to clipboard!");
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Smart Translation (দ্বিমুখী অনুবাদ)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">Translate seamlessly between English and Bengali with voice and speech support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {direction === 'en-to-bn' ? 'English (Source)' : 'Bengali (Source)'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
                <button type="button" onClick={() => setMicLang('bn-BD')} className={`px-2 py-0.5 rounded-lg ${micLang === 'bn-BD' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇧🇩 BN</button>
                <button type="button" onClick={() => setMicLang('en-US')} className={`px-2 py-0.5 rounded-lg ${micLang === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇺🇸 EN</button>
              </div>
              <button 
                type="button" 
                onClick={() => toggleListen(showToast)}
                className={`p-1.5 rounded-xl text-xs transition border ${isListening ? 'bg-rose-500/40 text-rose-200 border-rose-500/60 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'}`}
              >
                <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
              </button>
              <button 
                onClick={swap} 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 p-1.5 rounded-xl text-xs transition" 
                title="Swap Languages"
              >
                <i className="fa-solid fa-right-left"></i>
              </button>
            </div>
          </div>
          <textarea 
            rows="5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'en-to-bn' ? "Type or speak English text here..." : "এখানে বাংলায় লিখুন বা বলুন..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md flex-1"
          ></textarea>
          {isListening && interimText && (
            <p className="text-xs text-rose-300 italic animate-pulse">Live: {interimText}</p>
          )}
        </div>

        {/* Target Box */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {direction === 'en-to-bn' ? 'Bengali (Translation)' : 'English (Translation)'}
            </label>
            <div className="flex gap-2">
              <AudioSpeechButton textToRead={output} showToast={showToast} />
              <button 
                onClick={copyText} 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 px-2.5 py-1 rounded-xl text-xs transition" 
                title="Copy"
              >
                <i className="fa-solid fa-copy"></i>
              </button>
            </div>
          </div>
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 flex-1 overflow-y-auto min-h-[140px] backdrop-blur-md whitespace-pre-wrap">
            {output}
          </div>
        </div>
      </div>

      <button 
        onClick={translateText}
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-2xl font-medium text-xs sm:text-sm transition shadow-lg shadow-indigo-500/30 border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-language"></i>}
        <span>Translate Now</span>
      </button>
    </div>
  );
}


// ==========================================
// 5. VOCABULARY & IDIOMS MODULE
// ==========================================
function VocabModule({ callGeminiAPI, showToast }) {
  const [query, setQuery] = useState('');
  const [micLang, setMicLang] = useState('en-US');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const { isListening, interimText, toggleListen } = useVoiceInput(setQuery, micLang);

  const fetchVocab = async (termToSearch) => {
    const term = termToSearch || query;
    if (!term.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const prompt = `Provide detailed vocabulary or idiom breakdown for "${term}". Include: 
      1. Word/Idiom & Pronunciation/Part of speech
      2. Meaning in English and Bengali (বাংলা অর্থ)
      3. Synonyms & Antonyms (if applicable)
      4. 2 Example Sentences with Bengali translation.
      Format clearly.`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "You are an expert English lexicographer and tutor." }] }
      };

      const res = await callGeminiAPI(payload);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "No information found.";
      setResult(text);
      showToast(`Loaded details for "${term}"`);
    } catch (err) {
      showToast(err.message, true);
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Vocabulary & Idioms Helper (শব্দ ও প্রবাদ-প্রবচন)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">Explore advanced words, idioms, meanings, and examples with voice playback.</p>
      </div>

      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 text-xs shrink-0">
          <button type="button" onClick={() => setMicLang('en-US')} className={`px-2.5 py-2 rounded-xl ${micLang === 'en-US' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇺🇸 EN</button>
          <button type="button" onClick={() => setMicLang('bn-BD')} className={`px-2.5 py-2 rounded-xl ${micLang === 'bn-BD' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>🇧🇩 BN</button>
        </div>
        <button 
          type="button" 
          onClick={() => toggleListen(showToast)}
          className={`p-3 rounded-2xl transition text-sm border backdrop-blur-md ${isListening ? 'bg-rose-500/40 text-rose-200 border-rose-500/60 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'}`}
        >
          <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
        </button>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchVocab()}
          placeholder="Enter word or idiom (e.g. 'Bite the bullet')..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md w-full"
        />
        <button 
          onClick={() => fetchVocab()}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 sm:px-6 py-3 rounded-2xl font-medium text-xs sm:text-sm transition shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0 disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>} Explore
        </button>
      </div>

      {isListening && interimText && (
        <p className="text-xs text-rose-300 italic animate-pulse">Live: {interimText}</p>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular searches / জনপ্রিয় শব্দ:</p>
        <div className="flex flex-wrap gap-2">
          {['Bite the bullet', 'Eloquent', 'Piece of cake', 'Diligent', 'Spill the beans'].map(word => (
            <button 
              key={word}
              onClick={() => { setQuery(word); fetchVocab(word); }}
              className="bg-white/5 hover:bg-white/15 text-slate-200 text-xs px-3.5 py-2 rounded-xl transition border border-white/10 backdrop-blur-md shadow-sm"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-end">
            <AudioSpeechButton textToRead={result} showToast={showToast} />
          </div>
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/10">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// API KEY MODAL
// ==========================================
function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [val, setVal] = useState(currentKey);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base sm:text-lg">Configure Gemini API Key</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <p className="text-xs text-slate-300">The app uses a built-in default key if left blank. However, you can enter your custom Google Gemini API key here.</p>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">API Key</label>
          <input 
            type="password" 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Enter API Key..." 
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl text-xs sm:text-sm font-medium transition backdrop-blur-md">Cancel</button>
          <button onClick={() => onSave(val)} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs sm:text-sm font-medium transition shadow-lg shadow-indigo-500/30">Save Key</button>
        </div>
      </div>
    </div>
  );
}