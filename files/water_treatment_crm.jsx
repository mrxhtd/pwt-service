import { useState, useEffect } from "react";

const PARAMS = [
  { key: "ph",          label: "pH",              unit: "",       min: 6.5,  max: 8.5  },
  { key: "tds",         label: "TDS",             unit: "ppm",    min: 0,    max: 500  },
  { key: "conductivity",label: "Conductivity",    unit: "µS/cm",  min: 0,    max: 1200 },
  { key: "totalHard",   label: "Total Hardness",  unit: "ppm",    min: 0,    max: 300  },
  { key: "calciumHard", label: "Calcium Hardness",unit: "ppm",    min: 0,    max: 200  },
  { key: "pAlka",       label: "P-Alkalinity",    unit: "ppm",    min: 0,    max: 100  },
  { key: "mAlka",       label: "M-Alkalinity",    unit: "ppm",    min: 80,   max: 300  },
  { key: "ohAlka",      label: "OH-Alkalinity",   unit: "ppm",    min: 0,    max: 50   },
  { key: "chloride",    label: "Chloride",        unit: "ppm",    min: 0,    max: 100  },
  { key: "iron",        label: "Iron",            unit: "ppm",    min: 0,    max: 0.5  },
  { key: "phosphate",   label: "Phosphate",       unit: "ppm",    min: 2,    max: 8    },
  { key: "sulfite",     label: "Sulfite",         unit: "ppm",    min: 0,    max: 20   },
  { key: "tannin",      label: "Tannin",          unit: "ppm",    min: 0,    max: 5    },
  { key: "chz",         label: "CHZ",             unit: "ppm",    min: 8,    max: 20   },
  { key: "deha",        label: "DEHA",            unit: "ppm",    min: 3,    max: 10   },
  { key: "silica",      label: "Silica",          unit: "ppm",    min: 0,    max: 30   },
];

const STATUS_COLORS = {
  Active:      { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Follow-up": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Inactive:    { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

const SEED_CLIENTS = [
  { id: "CLT-001", name: "Al-Nour Factory",  contact: "Ahmed Hassan",  phone: "010-1234-5678", systemType: "Cooling Tower", gallons: 50000, status: "Active",     lastVisit: "2026-04-15", nextVisit: "2026-05-20" },
  { id: "CLT-002", name: "Blue Sky Hotels",  contact: "Sara Mahmoud",  phone: "012-9876-5432", systemType: "Boiler System", gallons: 15000, status: "Active",     lastVisit: "2026-04-28", nextVisit: "2026-05-30" },
  { id: "CLT-003", name: "Delta Steel",      contact: "Karim Fathy",   phone: "011-5555-0000", systemType: "Closed Loop",   gallons: 80000, status: "Follow-up",  lastVisit: "2026-03-10", nextVisit: "2026-05-18" },
  { id: "CLT-004", name: "Oasis Resort",     contact: "Nadia Aly",     phone: "010-2222-3333", systemType: "Swimming Pool", gallons: 12000, status: "Active",     lastVisit: "2026-05-01", nextVisit: "2026-06-01" },
  { id: "CLT-005", name: "Cairo Pharma",     contact: "Dr. Youssef",   phone: "010-8888-7777", systemType: "RO System",     gallons: 8000,  status: "Inactive",   lastVisit: "2026-02-20", nextVisit: "2026-05-25" },
];

const SEED_SURVEYS = [
  { id: "SRV-001", clientId: "CLT-001", date: "2026-04-15", gallons: 50000, ph: 7.2, tds: 320, conductivity: 680, totalHard: 250, calciumHard: 95,  pAlka: 45,  mAlka: 180, ohAlka: 0,  chloride: 85, iron: 0.3, phosphate: 3.5, sulfite: 12, tannin: 0.2, chz: 12, deha: 5, silica: 18, notes: "Slight pH drift." },
  { id: "SRV-002", clientId: "CLT-002", date: "2026-04-28", gallons: 15000, ph: 7.8, tds: 210, conductivity: 450, totalHard: 180, calciumHard: 70,  pAlka: 30,  mAlka: 120, ohAlka: 0,  chloride: 60, iron: 0.1, phosphate: 2.1, sulfite: 8,  tannin: 0.1, chz: 8,  deha: 3, silica: 12, notes: "Within range." },
  { id: "SRV-003", clientId: "CLT-003", date: "2026-03-10", gallons: 80000, ph: 6.9, tds: 410, conductivity: 890, totalHard: 310, calciumHard: 120, pAlka: 55,  mAlka: 220, ohAlka: 0,  chloride: 110,iron: 0.5, phosphate: 5.0, sulfite: 15, tannin: 0.4, chz: 15, deha: 7, silica: 25, notes: "High hardness. Dosing increased." },
];

function getStatus(val, min, max) {
  if (val === "" || val === null || val === undefined) return "empty";
  const n = parseFloat(val);
  if (isNaN(n)) return "empty";
  if (n < min || n > max) return "out";
  return "ok";
}

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Active"];
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function Input({ label, value, onChange, type = "text", style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#1e293b", outline: "none", background: "#fff", ...style }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: "#fff" }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── TABS ────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [surveys, setSurveys] = useState(SEED_SURVEYS);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyClient, setSurveyClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const newClient = () => ({ id: `CLT-${String(clients.length + 1).padStart(3,"0")}`, name: "", contact: "", phone: "", systemType: "Cooling Tower", gallons: "", status: "Active", lastVisit: "", nextVisit: "" });
  const newSurvey = (clientId) => {
    const base = { id: `SRV-${String(surveys.length + 1).padStart(3,"0")}`, clientId, date: new Date().toISOString().slice(0,10), gallons: "", notes: "" };
    PARAMS.forEach(p => base[p.key] = "");
    return base;
  };

  const [clientForm, setClientForm] = useState(newClient());
  const [surveyForm, setSurveyForm] = useState(newSurvey(""));

  const saveClient = () => {
    if (!clientForm.name) return;
    setClients(c => [...c, clientForm]);
    setClientForm(newClient());
    setShowClientForm(false);
  };

  const saveSurvey = () => {
    if (!surveyForm.clientId) return;
    setSurveys(s => [...s, surveyForm]);
    // update lastVisit on client
    setClients(cs => cs.map(c => c.id === surveyForm.clientId ? { ...c, lastVisit: surveyForm.date } : c));
    setSurveyForm(newSurvey(""));
    setShowSurveyForm(false);
  };

  const openSurveyFor = (client) => {
    setSurveyForm(newSurvey(client.id));
    setSurveyClient(client);
    setShowSurveyForm(true);
    setTab("surveys");
  };

  const filteredClients = filterStatus === "All" ? clients : clients.filter(c => c.status === filterStatus);
  const statCounts = { Total: clients.length, Active: clients.filter(c=>c.status==="Active").length, "Follow-up": clients.filter(c=>c.status==="Follow-up").length, Inactive: clients.filter(c=>c.status==="Inactive").length };

  const NAV = [
    { key: "clients",   label: "🏢 Clients",   badge: clients.length },
    { key: "surveys",   label: "🧪 Surveys",   badge: surveys.length },
    { key: "dashboard", label: "📊 Dashboard", badge: null },
  ];

  const accent = "#0ea5e9";

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f0f4f8", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>💧</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>AquaTrack CRM</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)}
              style={{ background: tab === n.key ? accent : "transparent", color: tab === n.key ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {n.label}
              {n.badge !== null && <span style={{ background: tab===n.key?"rgba(255,255,255,0.25)":"#1e293b", color: tab===n.key?"#fff":"#94a3b8", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{n.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── CLIENTS TAB ─────────────────────────────────────── */}
        {tab === "clients" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Client Registry</h2>
              <button onClick={() => setShowClientForm(true)}
                style={{ background: accent, color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                + Add Client
              </button>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["All","Active","Follow-up","Inactive"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ background: filterStatus===s ? accent : "#fff", color: filterStatus===s?"#fff":"#64748b", border: `1.5px solid ${filterStatus===s?accent:"#e2e8f0"}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {s} {s!=="All" && `(${statCounts[s]})`}
                </button>
              ))}
            </div>

            {/* Add Client Form */}
            {showClientForm && (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>New Client</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                  <Input label="Company Name" value={clientForm.name} onChange={v => setClientForm(f => ({...f,name:v}))} />
                  <Input label="Contact Person" value={clientForm.contact} onChange={v => setClientForm(f => ({...f,contact:v}))} />
                  <Input label="Phone" value={clientForm.phone} onChange={v => setClientForm(f => ({...f,phone:v}))} />
                  <Select label="System Type" value={clientForm.systemType} onChange={v => setClientForm(f => ({...f,systemType:v}))} options={["Cooling Tower","Boiler System","Closed Loop","Swimming Pool","RO System","Other"]} />
                  <Input label="Total Gallons" type="number" value={clientForm.gallons} onChange={v => setClientForm(f => ({...f,gallons:v}))} />
                  <Select label="Status" value={clientForm.status} onChange={v => setClientForm(f => ({...f,status:v}))} options={["Active","Follow-up","Inactive"]} />
                  <Input label="Next Follow-up" type="date" value={clientForm.nextVisit} onChange={v => setClientForm(f => ({...f,nextVisit:v}))} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={saveClient} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>Save</button>
                  <button onClick={() => setShowClientForm(false)} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Client Cards */}
            <div style={{ display: "grid", gap: 12 }}>
              {filteredClients.map(c => {
                const clientSurveys = surveys.filter(s => s.clientId === c.id);
                return (
                  <div key={c.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏭</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                        <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{c.contact} · {c.phone}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SYSTEM</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.systemType}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>GALLONS</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{Number(c.gallons).toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SURVEYS</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{clientSurveys.length}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>NEXT VISIT</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: accent }}>{c.nextVisit || "—"}</div>
                      </div>
                      <Badge status={c.status} />
                      <button onClick={() => openSurveyFor(c)}
                        style={{ background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "6px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        + Survey
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SURVEYS TAB ─────────────────────────────────────── */}
        {tab === "surveys" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Survey Log</h2>
              <button onClick={() => { setSurveyForm(newSurvey(clients[0]?.id || "")); setSurveyClient(null); setShowSurveyForm(true); }}
                style={{ background: accent, color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                + New Survey
              </button>
            </div>

            {/* Survey Form */}
            {showSurveyForm && (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>
                  New Survey {surveyClient ? `— ${surveyClient.name}` : ""}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
                  <Select label="Client" value={surveyForm.clientId} onChange={v => setSurveyForm(f => ({...f,clientId:v}))}
                    options={clients.map(c => c.id)} />
                  <Input label="Date" type="date" value={surveyForm.date} onChange={v => setSurveyForm(f => ({...f,date:v}))} />
                  <Input label="Gallons on Stock" type="number" value={surveyForm.gallons} onChange={v => setSurveyForm(f => ({...f,gallons:v}))} />
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Water Quality Parameters</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                    {PARAMS.map(p => {
                      const val = surveyForm[p.key];
                      const st = getStatus(val, p.min, p.max);
                      const borderColor = st === "out" ? "#ef4444" : st === "ok" ? "#10b981" : "#e2e8f0";
                      return (
                        <div key={p.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>
                            {p.label} {p.unit && <span style={{ color: "#94a3b8" }}>({p.unit})</span>}
                          </label>
                          <input type="number" value={val} onChange={e => setSurveyForm(f => ({...f,[p.key]:e.target.value}))}
                            placeholder={`${p.min}–${p.max}`}
                            style={{ border: `1.5px solid ${borderColor}`, borderRadius: 7, padding: "6px 8px", fontSize: 13, color: "#1e293b", outline: "none", background: st==="out"?"#fef2f2":st==="ok"?"#f0fdf4":"#fff" }} />
                          {st === "out" && <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 600 }}>Out of range</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Input label="Notes" value={surveyForm.notes} onChange={v => setSurveyForm(f => ({...f,notes:v}))} />
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={saveSurvey} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>Save Survey</button>
                  <button onClick={() => setShowSurveyForm(false)} style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Surveys list */}
            <div style={{ display: "grid", gap: 12 }}>
              {[...surveys].reverse().map(s => {
                const client = clients.find(c => c.id === s.clientId);
                const outOfRange = PARAMS.filter(p => getStatus(s[p.key], p.min, p.max) === "out");
                return (
                  <div key={s.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{s.id}</span>
                        <span style={{ margin: "0 8px", color: "#e2e8f0" }}>|</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{client?.name || s.clientId}</span>
                        <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>{s.date}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {s.gallons && <span style={{ fontSize: 12, color: "#64748b" }}>🪣 {Number(s.gallons).toLocaleString()} gal</span>}
                        {outOfRange.length > 0
                          ? <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>⚠ {outOfRange.length} out of range</span>
                          : <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✓ All OK</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {PARAMS.map(p => {
                        const val = s[p.key];
                        if (val === "" || val === null || val === undefined) return null;
                        const st = getStatus(val, p.min, p.max);
                        return (
                          <div key={p.key} style={{ background: st==="out"?"#fef2f2":st==="ok"?"#f0fdf4":"#f8fafc", border: `1px solid ${st==="out"?"#fecaca":st==="ok"?"#bbf7d0":"#e2e8f0"}`, borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{p.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: st==="out"?"#dc2626":st==="ok"?"#16a34a":"#1e293b" }}>{val}{p.unit && <span style={{ fontSize: 9, color: "#94a3b8" }}> {p.unit}</span>}</div>
                          </div>
                        );
                      })}
                    </div>
                    {s.notes && <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>📝 {s.notes}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ───────────────────────────────────── */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>Dashboard</h2>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Clients",      val: clients.length,                                       icon: "🏢", color: "#0ea5e9" },
                { label: "Active Sites",        val: clients.filter(c=>c.status==="Active").length,        icon: "✅", color: "#10b981" },
                { label: "Follow-up Required",  val: clients.filter(c=>c.status==="Follow-up").length,     icon: "⚠️", color: "#f59e0b" },
                { label: "Total Surveys",       val: surveys.length,                                       icon: "🧪", color: "#8b5cf6" },
                { label: "Total Gallons",       val: clients.reduce((a,c)=>a+Number(c.gallons||0),0).toLocaleString(), icon: "💧", color: "#06b6d4" },
              ].map(k => (
                <div key={k.label} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Upcoming follow-ups */}
            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📅 Upcoming Follow-ups</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {[...clients].sort((a,b)=>a.nextVisit>b.nextVisit?1:-1).filter(c=>c.nextVisit).map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                      <Badge status={c.status} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: accent }}>{c.nextVisit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Out of range alerts */}
            {(() => {
              const alerts = [];
              surveys.forEach(s => {
                const client = clients.find(c => c.id === s.clientId);
                PARAMS.forEach(p => {
                  if (getStatus(s[p.key], p.min, p.max) === "out") {
                    alerts.push({ site: client?.name || s.clientId, date: s.date, param: p.label, val: s[p.key], unit: p.unit, min: p.min, max: p.max });
                  }
                });
              });
              if (!alerts.length) return null;
              return (
                <div style={{ background: "#fff", border: "1.5px solid #fecaca", borderRadius: 14, padding: 20 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#dc2626" }}>⚠️ Out of Range Alerts</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {alerts.map((a,i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fef2f2", borderRadius: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{a.site}</span>
                          <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>{a.date}</span>
                        </div>
                        <div style={{ fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: "#dc2626" }}>{a.param}:</span>
                          <span style={{ marginLeft: 4, fontWeight: 700 }}>{a.val} {a.unit}</span>
                          <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 6 }}>(range: {a.min}–{a.max})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
