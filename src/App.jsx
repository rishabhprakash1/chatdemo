import React, { useState } from 'react';
import WhatsAppSimulation from './components/WhatsAppSimulation';
import CRMDashboard from './components/CRMDashboard';

const CALLERS = ["Amit", "Neha", "Priya", "Rahul", "Vikram"];
const STATUSES = ["New", "In Progress", "Follow up pending", "Closed"];
const NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Diya", "Navya", "Avni", "Mahi", "Rohan", "Siddharth", "Vikash", "Suresh", "Ramesh", "Sunil", "Anil", "Sanjay", "Manoj", "Rajesh", "Pooja", "Sneha", "Kavita", "Geeta", "Seema", "Reena", "Meena", "Asha", "Usha", "Lata", "Ravi", "Kiran", "Vijay", "Ajay", "Raj", "Nitin", "Tarun", "Varun", "Arun", "Karan"];

const DUMMY_LEADS = NAMES.slice(0, 50).map((name, i) => {
  const callerIndex = Math.floor(i / 10);
  const caller = CALLERS[callerIndex];
  
  // Distribute statuses, but ensure we have a good mix. 
  // We'll avoid "New" for these 50 so that each caller definitely has 10 assigned leads!
  const assignedStatuses = ["In Progress", "Follow up pending", "Closed"];
  const statusIndex = i % 3;
  const status = assignedStatuses[statusIndex];
  
  const isPending = status === "Follow up pending";
  const numSuffix = (i * 137).toString().padStart(6, '0');
  
  return {
    id: i + 1,
    name,
    phone: "+91 98" + (100000 + i * 47) + numSuffix.slice(0, 2),
    age: (20 + (i % 15)).toString(),
    qualifications: ["B.Tech", "MBA", "B.Sc", "B.Com", "Diploma"][i % 5],
    location: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"][i % 5],
    experience: (1 + (i % 10)) + " Years",
    status,
    caller,
    followUpDate: isPending ? new Date(Date.now() + (i % 2 === 0 ? 1 : -1) * 86400000).toISOString().split('T')[0] : null,
    comments: "Initial details captured. " + (isPending ? "Waiting for client response." : "")
  };
});

// Let's add 5 "New" unassigned leads so they have something to pull from.
const EXTRA_NEW_LEADS = ["Deepak", "Ritu", "Alok", "Monika", "Prakash"].map((name, j) => ({
    id: 100 + j,
    name,
    phone: "+91 99" + (200000 + j * 93) + "21",
    age: (22 + j).toString(),
    qualifications: ["B.Tech", "B.Sc", "M.Tech", "MBA", "High School"][j],
    location: ["Pune", "Mumbai", "Delhi", "Gurgaon", "Chennai"][j],
    experience: (j + 2) + " Years",
    status: "New",
    caller: "",
    followUpDate: null,
    comments: ""
}));

const ALL_INITIAL_LEADS = [...EXTRA_NEW_LEADS, ...DUMMY_LEADS];

function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [leads, setLeads] = useState(ALL_INITIAL_LEADS);

  const handleLeadComplete = (leadData) => {
    const newLead = {
      id: Date.now(),
      name: leadData.name,
      phone: "+91 9" + Math.floor(100000000 + Math.random() * 900000000), // Generate a random Indian number 
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
