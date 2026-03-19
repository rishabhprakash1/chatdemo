import React, { useState } from 'react';
import WhatsAppSimulation from './components/WhatsAppSimulation';
import CRMDashboard from './components/CRMDashboard';

const DUMMY_LEADS = [
  { id: 1, name: "Alice Johnson", age: "28", qualifications: "BSc Computer Science", location: "New York", experience: "5 Years", status: "New", caller: "", followUpDate: null, comments: "" },
  { id: 2, name: "Bob Smith", age: "34", qualifications: "MBA", location: "London", experience: "8 Years", status: "Follow up pending", caller: "Mike T.", followUpDate: "2026-03-25", comments: "Interested, needs callback." },
  { id: 3, name: "Charlie Davis", age: "22", qualifications: "High School", location: "Sydney", experience: "1 Year", status: "New", caller: "", followUpDate: null, comments: "" }
];

function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [leads, setLeads] = useState(DUMMY_LEADS);

  const handleLeadComplete = (leadData) => {
    const newLead = {
      id: Date.now(),
      name: leadData.name,
      age: leadData.age,
      qualifications: leadData.qualifications,
      location: leadData.location,
      experience: leadData.experience,
      status: "New",
      caller: "",
      followUpDate: null,
      comments: ""
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLead = (id, updates) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleSimulateTime = () => {
    // Sets all followUpDate for "Follow up pending" leads to yesterday to simulate passing time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    setLeads(prev => prev.map(l => 
      l.status === 'Follow up pending' && l.followUpDate 
      ? { ...l, followUpDate: dateStr } 
      : l
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-semibold text-xl text-slate-800 tracking-tight">
            AgencyPortal
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('simulation')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'simulation' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              WhatsApp Demo
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === 'dashboard' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              CRM Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {activeTab === 'simulation' && (
          <WhatsAppSimulation onLeadComplete={handleLeadComplete} />
        )}
        {activeTab === 'dashboard' && (
          <CRMDashboard 
            leads={leads} 
            onUpdateLead={handleUpdateLead} 
            onSimulateTime={handleSimulateTime}
          />
        )}
      </main>
    </div>
  );
}

export default App;
