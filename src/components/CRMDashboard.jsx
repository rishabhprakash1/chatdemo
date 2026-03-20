import React, { useState } from 'react';

const STATUS_OPTIONS = ["New", "In Progress", "Follow up pending", "Closed"];

function CRMDashboard({ leads, onUpdateLead, onSimulateTime }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  const [currentUserRole, setCurrentUserRole] = useState("caller"); // 'admin' or 'caller'
  const [currentUserName, setCurrentUserName] = useState(""); 

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  
  const [callerName, setCallerName] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [appId, setAppId] = useState("");

  const [callerFilter, setCallerFilter] = useState("All Callers");

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginId.trim() && loginPwd.trim()) {
      if (loginId.trim().toLowerCase() === 'admin') {
        setCurrentUserRole('admin');
      } else {
        setCurrentUserRole('caller');
        setCurrentUserName(loginId.trim());
      }
      setIsAuthenticated(true);
    }
  };

  const handleStatusChange = (lead, newStatus) => {
    const requiresCaller = lead.status === "New" && newStatus !== "New";
    const requiresDate = newStatus === "Follow up pending";
    const requiresAppId = newStatus === "Closed";
    
    if (requiresCaller || requiresDate || requiresAppId) {
      setPendingUpdate({ leadId: lead.id, newStatus, requiresCaller, requiresDate, requiresAppId });
      // Pre-fill if caller role, otherwise use what is there.
      setCallerName(requiresCaller && currentUserRole === 'caller' ? currentUserName : (lead.caller || ""));
      setFollowUpDate(lead.followUpDate || "");
      setAppId(lead.appId || "");
      setModalOpen(true);
    } else {
      // Just update it directly
      onUpdateLead(lead.id, { status: newStatus });
    }
  };

  const confirmModalUpdate = () => {
    if (pendingUpdate.requiresCaller && !callerName.trim()) return;
    if (pendingUpdate.requiresDate && !followUpDate) return;
    if (pendingUpdate.requiresAppId && !appId.trim()) return;

    const updates = { status: pendingUpdate.newStatus };
    if (pendingUpdate.requiresCaller) updates.caller = callerName;
    if (pendingUpdate.requiresDate) updates.followUpDate = followUpDate;
    if (pendingUpdate.requiresAppId) updates.appId = appId.trim();

    onUpdateLead(pendingUpdate.leadId, updates);
    setModalOpen(false);
    setPendingUpdate(null);
  };

  const isPastDue = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const curStr = today.toISOString().split('T')[0];
    return dateStr <= curStr;
  };

  // Visibility logic
  const visibleLeads = leads.filter(l => {
    if (currentUserRole === 'admin') return true;
    // Caller view: can see their own leads, plus any unassigned "New" leads to claim them
    return (!l.caller || l.caller.toLowerCase() === currentUserName.toLowerCase());
  });

  // Filter Logic
  const uniqueCallers = Array.from(new Set(visibleLeads.map(l => l.caller).filter(Boolean)));
  const filteredLeads = visibleLeads.filter(l => {
    if (callerFilter !== "All Callers") {
      return l.caller === callerFilter;
    }
    return true;
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginId("");
    setLoginPwd("");
    setCallerFilter("All Callers");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[70vh] animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">CRM Login</h2>
            <p className="text-slate-500 text-sm">
              Use <strong>admin</strong> to access all leads. Enter a Caller's Name (e.g. <strong>Amit</strong>) to see customized caller views.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Enter ID (e.g., admin, Amit)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={loginPwd}
                onChange={e => setLoginPwd(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Enter Any Password"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition-all shadow-md mt-4"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Active Leads</h1>
            <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${currentUserRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
              {currentUserRole === 'admin' ? 'Admin View' : `${currentUserName}'s View`}
            </span>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600 underline ml-2">Sign Out</button>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Showing {filteredLeads.length} candidates
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {currentUserRole === 'admin' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by Caller</label>
              <select 
                value={callerFilter}
                onChange={(e) => setCallerFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 bg-white shadow-sm"
              >
                <option value="All Callers">All Callers</option>
                {uniqueCallers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <button 
            onClick={onSimulateTime}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm mt-5"
          >
            Simulate Pending Follow Up
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs tracking-wider uppercase">
                <th className="py-4 px-4 font-medium">Name</th>
                <th className="py-4 px-4 font-medium">Phone</th>
                <th className="py-4 px-4 font-medium">Age</th>
                <th className="py-4 px-4 font-medium">Qualifications</th>
                <th className="py-4 px-4 font-medium">Location</th>
                <th className="py-4 px-4 font-medium">Experience</th>
                <th className="py-4 px-4 font-medium">Assigned Caller</th>
                <th className="py-4 px-4 font-medium">Follow Up Date</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium w-full min-w-[200px]">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 px-6 text-center text-slate-400">
                    No leads available matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const pastDue = lead.status === 'Follow up pending' && isPastDue(lead.followUpDate);
                  return (
                    <tr 
                      key={lead.id} 
                      className={`transition-colors ${pastDue ? 'bg-red-50 hover:bg-red-100/80' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-4 px-4 font-medium text-slate-900">{lead.name || '-'}</td>
                      <td className="py-4 px-4 font-medium">{lead.phone || '-'}</td>
                      <td className="py-4 px-4">{lead.age || '-'}</td>
                      <td className="py-4 px-4">{lead.qualifications || '-'}</td>
                      <td className="py-4 px-4">{lead.location || '-'}</td>
                      <td className="py-4 px-4">{lead.experience || '-'}</td>
                      <td className="py-4 px-4">
                        {lead.caller ? (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-xs">
                            {lead.caller}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className={`py-4 px-4 font-medium ${pastDue ? 'text-red-600' : 'text-slate-600'}`}>
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          className={`border rounded-lg text-sm px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-colors ${
                            lead.status === 'New' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : lead.status === 'Closed' 
                              ? 'bg-gray-50 border-gray-200 text-gray-700'
                              : lead.status === 'Follow up pending' && pastDue 
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {lead.appId && (
                           <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-100 px-2 py-1 rounded inline-block">ID: {lead.appId}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 h-full">
                        <textarea 
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-y min-h-[40px] bg-white/50"
                          placeholder="Add comments..."
                          value={lead.comments || ""}
                          onChange={(e) => onUpdateLead(lead.id, { comments: e.target.value })}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Update Lead Status</h3>
            <p className="text-slate-500 text-sm mb-6">
              Please provide the necessary details to move this lead to <strong>{pendingUpdate?.newStatus}</strong>.
            </p>
            
            <div className="space-y-4 mb-6">
              {pendingUpdate?.requiresCaller && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Caller</label>
                  <input 
                    type="text"
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    placeholder="e.g. Amit"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    readOnly={currentUserRole === 'caller'} // Caller can only assign to themselves
                  />
                </div>
              )}

              {pendingUpdate?.requiresDate && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Follow Up Date</label>
                  <input 
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}

              {pendingUpdate?.requiresAppId && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Application ID</label>
                  <input 
                    type="text"
                    value={appId}
                    onChange={e => setAppId(e.target.value)}
                    placeholder="e.g. APP-001"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => { setModalOpen(false); setPendingUpdate(null); }}
                className="px-5 py-2.5 text-sm rounded-full text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModalUpdate}
                disabled={
                  (pendingUpdate?.requiresCaller && !callerName.trim()) || 
                  (pendingUpdate?.requiresDate && !followUpDate) ||
                  (pendingUpdate?.requiresAppId && !appId.trim())
                }
                className="px-6 py-2.5 text-sm bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CRMDashboard;
