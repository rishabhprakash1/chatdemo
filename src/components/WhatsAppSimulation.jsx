import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, CheckCircle2, User, Phone } from 'lucide-react';

const QUESTIONS = [
  { key: 'name', text: "Hi, Sure! Please answer a few questions so we can help you better. What is your name?" },
  { key: 'age', text: "Got it. May I know your age?" },
  { key: 'qualifications', text: "Thanks. What are your highest qualifications?" },
  { key: 'location', text: "Where are you currently located?" },
  { key: 'experience', text: "Almost done. How many years of experience do you have?" }
];

const FOLLOW_UP_MESSAGES = [
  "Hi, we are waiting for your response. Please respond so we can process your profile further.",
  "Just checking in, let us know if you need help with the questions!",
  "Hi! Still there? We're ready to help you as soon as you reply."
];

function WhatsAppSimulation({ onLeadComplete }) {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [leadData, setLeadData] = useState({});
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const startSimulation = () => {
    setChatStarted(true);
    setMessages([]);
    setLeadData({});
    setCurrentQuestionIndex(0);
    setFollowUpCount(0);
    
    // Initial lead ping
    addMessage('user', "Can you tell me more about your service?");
    
    // Bot immediate response
    setTimeout(() => {
      addMessage('bot', QUESTIONS[0].text);
      setIsWaitingForUser(true);
    }, 800);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (!isWaitingForUser) return; // Prevent extra inputs if done
    
    const userAns = inputText.trim();
    addMessage('user', userAns);
    setInputText("");
    
    const currQ = QUESTIONS[currentQuestionIndex];
    setLeadData(prev => ({ ...prev, [currQ.key]: userAns }));
    
    setIsWaitingForUser(false);
    
    const nextIndex = currentQuestionIndex + 1;
    setTimeout(() => {
      if (nextIndex < QUESTIONS.length) {
        setCurrentQuestionIndex(nextIndex);
        addMessage('bot', QUESTIONS[nextIndex].text);
        setIsWaitingForUser(true);
        setFollowUpCount(0); // reset follow ups for new question
      } else {
        addMessage('bot', "Thank you! Our team will review your profile and get back to you shortly.");
        // Notify parent 
        onLeadComplete({
          ...leadData,
          [currQ.key]: userAns 
        });
      }
    }, 1000);
  };

  const triggerFollowUp = () => {
    if (isWaitingForUser) {
      const msg = FOLLOW_UP_MESSAGES[followUpCount % FOLLOW_UP_MESSAGES.length];
      addMessage('bot', msg);
      setFollowUpCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center relative min-h-[85vh]">
      {!chatStarted ? (
        <div className="flex flex-col items-center justify-center mt-32 space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex justify-center items-center mb-4">
            <Phone size={36} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Lead Capture Demo</h2>
          <p className="text-slate-500 text-center max-w-sm mb-6">
            Simulate a WhatsApp conversation flow collecting candidate data automatically.
          </p>
          <button 
            onClick={startSimulation}
            className="flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-600 hover:shadow-lg transition-all"
          >
            Simulate Inbound Lead <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto border border-gray-200 rounded-3xl overflow-hidden shadow-2xl h-[700px] flex flex-col bg-[#efeae2] relative animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* WhatsApp Header */}
          <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3 shadow-md z-10 shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              <User size={24} className="text-slate-400" />
            </div>
            <div>
              <div className="font-semibold leading-tight">Employment Agency</div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover', opacity: 0.9 }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm relative ${
                    m.sender === 'user' 
                    ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1">
                    {m.time} {m.sender === 'user' && <CheckCircle2 size={12} className="text-blue-400" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 shrink-0">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              className="flex-1 rounded-full px-4 py-3 border-none outline-none text-slate-800 shadow-sm disabled:opacity-50"
              disabled={!isWaitingForUser}
            />
            <button 
              onClick={handleSend}
              disabled={!isWaitingForUser || !inputText.trim()}
              className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
          
        </div>
      )}

      {/* Floating 60-m Follow-up Button */}
      {chatStarted && isWaitingForUser && (
        <div className="fixed bottom-8 right-8 animate-in fade-in slide-in-from-right-8 z-50">
          <button 
            onClick={triggerFollowUp}
            className="flex items-center gap-2 bg-white border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 hover:shadow-lg transition-all shadow-md"
          >
            Simulate 60m Follow-up <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default WhatsAppSimulation;
