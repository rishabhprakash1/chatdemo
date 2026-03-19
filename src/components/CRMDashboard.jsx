import React, { useState } from 'react';

const STATUS_OPTIONS = ["New", "In Progress", "Follow up", "Closed"];

function CRMDashboard({ leads, onUpdateStatus }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [callerName, setCallerName] = useState("");

  const handleStatusChange = (leadId, currentStatus, newStatus) => {
    // If transitioning FROM "New" to something else, prompt for Caller
    if (currentStatus === "New" && newStatus !== "New") {
      setPendingUpdate({ leadId, newStatus });
      setModalOpen(true);
      setCallerName("");
    } else {
      // Just update it directly
      onUpdateStatus(leadId, newStatus);
    }
  };

  const confirmCaller = () => {
    if (!callerName.trim()) return;
    onUpdateStatus(pendingUpdate.leadId, pendingUpdate.newStatus, callerName);
    setModalOpen(false);
    setPendingUpdate(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Active Leads</h1>
        <div className="text-sm font-medium text-slate-500">
          Showing {leads.length} candidates
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                <th className="py-4 px-6 font-medium">Name</th>
                <th className="py-4 px-6 font-medium">Age</th>
                <th className="py-4 px-6 font-medium">Qualifications</th>
                <th className="py-4 px-6 font-medium">Location</th>
                <th className="py-4 px-6 font-medium">Experience</th>
                <th className="py-4 px-6 font-medium">Assigned Caller</th>
                <th className="py-4 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 px-6 text-center text-slate-400">
                    No leads available yet.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{lead.name || '-'}</td>
                    <td className="py-4 px-6">{lead.age || '-'}</td>
                    <td className="py-4 px-6">{lead.qualifications || '-'}</td>
                    <td className="py-4 px-6">{lead.location || '-'}</td>
                    <td className="py-4 px-6">{lead.experience || '-'}</td>
                    <td className="py-4 px-6">
                      {lead.caller ? (
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-xs">
                          {lead.caller}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, lead.status, e.target.value)}
                        className={`border rounded-lg text-sm px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-colors ${
                          lead.status === 'New' 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : lead.status === 'Closed' 
                            ? 'bg-gray-50 border-gray-200 text-gray-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Assign a Caller</h3>
            <p className="text-slate-500 text-sm mb-6">
              To proceed with this lead, please assign a caller responsible for the follow-up.
            </p>
            <input 
              type="text"
              autoFocus
              value={callerName}
              onChange={e => setCallerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-6 transition-all"
            />
            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCaller}
                disabled={!callerName.trim()}
                className="px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
              >
                Assign Caller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CRMDashboard;
