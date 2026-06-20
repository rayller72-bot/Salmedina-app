import { useState, useEffect, useCallback } from "react";

// ─── STORAGE HELPERS ───────────────────────────────────────────────
const KEYS = {
  obreros: "constructora:obreros",
  proyectos: "constructora:proyectos",
  asistencia: "constructora:asistencia",
  pagos: "constructora:pagos",
  materiales: "constructora:materiales",
};

function load(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── SEED DATA ─────────────────────────────────────────────────────
const SEED = {
  obreros: [
    { id: 1, nombre: "Carlos Pérez", rol: "Albañil", telefono: "0991234567", salarioDia: 45, activo: true },
    { id: 2, nombre: "José Ramírez", rol: "Electricista", telefono: "0997654321", salarioDia: 55, activo: true },
    { id: 3, nombre: "Miguel Torres", rol: "Plomero", telefono: "0994561230", salarioDia: 50, activo: true },
  ],
  proyectos: [
    { id: 1, nombre: "Edificio Central", cliente: "Inmobiliaria Sur", estado: "En progreso", presupuesto: 150000, fechaInicio: "2026-01-15", fechaFin: "2026-08-30" },
    { id: 2, nombre: "Casa Residencial", cliente: "Familia López", estado: "En progreso", presupuesto: 45000, fechaInicio: "2026-03-01", fechaFin: "2026-07-15" },
  ],
  asistencia: [],
  pagos: [],
  materiales: [
    { id: 1, nombre: "Cemento (saco 50kg)", cantidad: 120, unidad: "sacos", precioUnit: 8.5, proyectoId: 1 },
    { id: 2, nombre: "Varilla 12mm", cantidad: 200, unidad: "unidades", precioUnit: 4.2, proyectoId: 1 },
    { id: 3, nombre: "Arena (m³)", cantidad: 15, unidad: "m³", precioUnit: 18, proyectoId: 2 },
  ],
};

// ─── ICONS ─────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    workers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    project: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    attendance: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg>,
    payment: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
    materials: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    helmet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12v1h20v-1c0-5.5-4.5-10-10-10z"/><path d="M2 13h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z"/></svg>,
  };
  return icons[name] || null;
};

// ─── BADGE ─────────────────────────────────────────────────────────
const Badge = ({ label, color }) => {
  const colors = {
    green: { bg: "#d1fae5", text: "#065f46" },
    yellow: { bg: "#fef3c7", text: "#92400e" },
    red: { bg: "#fee2e2", text: "#991b1b" },
    blue: { bg: "#dbeafe", text: "#1e40af" },
    gray: { bg: "#f3f4f6", text: "#374151" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
};

// ─── MODAL ─────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 4 }}><Icon name="x" /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ─── FORM FIELD ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", ...props.style }} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }}>
    {children}
  </select>
);

// ─── STAT CARD ─────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      <Icon name={icon} size={22} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// MÓDULO: OBREROS
// ══════════════════════════════════════════════════════════════════
function ModObreros({ obreros, setObreros }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", rol: "", telefono: "", salarioDia: "" });

  const roles = ["Albañil", "Electricista", "Plomero", "Carpintero", "Pintor", "Operador de maquinaria", "Auxiliar", "Maestro de obra"];

  const agregar = () => {
    if (!form.nombre || !form.rol) return;
    const nuevo = { id: Date.now(), ...form, salarioDia: parseFloat(form.salarioDia) || 0, activo: true };
    const lista = [...obreros, nuevo];
    setObreros(lista);
    save(KEYS.obreros, lista);
    setModal(false);
    setForm({ nombre: "", rol: "", telefono: "", salarioDia: "" });
  };

  const toggleActivo = (id) => {
    const lista = obreros.map(o => o.id === id ? { ...o, activo: !o.activo } : o);
    setObreros(lista);
    save(KEYS.obreros, lista);
  };

  const eliminar = (id) => {
    const lista = obreros.filter(o => o.id !== id);
    setObreros(lista);
    save(KEYS.obreros, lista);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>Obreros</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{obreros.length} registrados · {obreros.filter(o => o.activo).length} activos</p>
        </div>
        <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f97316", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Agregar obrero
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {obreros.map(o => (
          <div key={o.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", opacity: o.activo ? 1 : 0.6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fed7aa", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              {o.nombre.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{o.nombre}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{o.rol} · ${o.salarioDia}/día · {o.telefono}</div>
            </div>
            <Badge label={o.activo ? "Activo" : "Inactivo"} color={o.activo ? "green" : "gray"} />
            <button onClick={() => toggleActivo(o.id)} title={o.activo ? "Desactivar" : "Activar"} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#666" }}>
              {o.activo ? <Icon name="x" size={14} /> : <Icon name="check" size={14} />}
            </button>
            <button onClick={() => eliminar(o.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        {obreros.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>No hay obreros registrados</div>}
      </div>

      {modal && (
        <Modal title="Agregar obrero" onClose={() => setModal(false)}>
          <Field label="Nombre completo"><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" /></Field>
          <Field label="Rol / Especialidad">
            <Select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="">Seleccionar...</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="099XXXXXXX" /></Field>
          <Field label="Salario por día ($)"><Input type="number" value={form.salarioDia} onChange={e => setForm({ ...form, salarioDia: e.target.value })} placeholder="45" /></Field>
          <button onClick={agregar} style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15, marginTop: 8 }}>Guardar obrero</button>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MÓDULO: PROYECTOS
// ══════════════════════════════════════════════════════════════════
function ModProyectos({ proyectos, setProyectos }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", cliente: "", estado: "Planificación", presupuesto: "", fechaInicio: "", fechaFin: "" });

  const estados = ["Planificación", "En progreso", "Pausado", "Finalizado"];
  const colorEstado = { "Planificación": "blue", "En progreso": "yellow", "Pausado": "gray", "Finalizado": "green" };

  const agregar = () => {
    if (!form.nombre) return;
    const nuevo = { id: Date.now(), ...form, presupuesto: parseFloat(form.presupuesto) || 0 };
    const lista = [...proyectos, nuevo];
    setProyectos(lista);
    save(KEYS.proyectos, lista);
    setModal(false);
    setForm({ nombre: "", cliente: "", estado: "Planificación", presupuesto: "", fechaInicio: "", fechaFin: "" });
  };

  const cambiarEstado = (id, estado) => {
    const lista = proyectos.map(p => p.id === id ? { ...p, estado } : p);
    setProyectos(lista);
    save(KEYS.proyectos, lista);
  };

  const eliminar = (id) => {
    const lista = proyectos.filter(p => p.id !== id);
    setProyectos(lista);
    save(KEYS.proyectos, lista);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Proyectos</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{proyectos.filter(p => p.estado === "En progreso").length} en progreso</p>
        </div>
        <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f97316", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Nuevo proyecto
        </button>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {proyectos.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>{p.nombre}</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Cliente: {p.cliente}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={p.estado} color={colorEstado[p.estado]} />
                <button onClick={() => eliminar(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Icon name="trash" size={15} /></button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#555", marginBottom: 14 }}>
              <span>💰 Presupuesto: <strong>${p.presupuesto?.toLocaleString()}</strong></span>
              <span>📅 {p.fechaInicio} → {p.fechaFin}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {estados.map(e => (
                <button key={e} onClick={() => cambiarEstado(p.id, e)} style={{ padding: "5px 12px", border: "1.5px solid", borderColor: p.estado === e ? "#f97316" : "#e5e7eb", background: p.estado === e ? "#fff7ed" : "transparent", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: p.estado === e ? "#f97316" : "#888" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        ))}
        {proyectos.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>No hay proyectos</div>}
      </div>

      {modal && (
        <Modal title="Nuevo proyecto" onClose={() => setModal(false)}>
          <Field label="Nombre del proyecto"><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Edificio Norte" /></Field>
          <Field label="Cliente"><Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nombre del cliente" /></Field>
          <Field label="Presupuesto ($)"><Input type="number" value={form.presupuesto} onChange={e => setForm({ ...form, presupuesto: e.target.value })} placeholder="50000" /></Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              {estados.map(e => <option key={e}>{e}</option>)}
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Fecha inicio"><Input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} /></Field>
            <Field label="Fecha fin"><Input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} /></Field>
          </div>
          <button onClick={agregar} style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15, marginTop: 8 }}>Guardar proyecto</button>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MÓDULO: ASISTENCIA
// ══════════════════════════════════════════════════════════════════
function ModAsistencia({ obreros, asistencia, setAsistencia, proyectos }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoy);
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || "");

  const registroHoy = asistencia.filter(a => a.fecha === fecha && String(a.proyectoId) === String(proyectoId));

  const toggle = (obrero) => {
    const existe = registroHoy.find(a => a.obreroId === obrero.id);
    let nueva;
    if (existe) {
      nueva = asistencia.filter(a => !(a.fecha === fecha && a.obreroId === obrero.id && String(a.proyectoId) === String(proyectoId)));
    } else {
      nueva = [...asistencia, { id: Date.now(), fecha, obreroId: obrero.id, proyectoId, estado: "Presente" }];
    }
    setAsistencia(nueva);
    save(KEYS.asistencia, nueva);
  };

  const presentes = registroHoy.length;
  const activos = obreros.filter(o => o.activo);

  // Resumen últimos 7 días
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Asistencia</h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>Registro diario de presencia</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Field label="Fecha">
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </Field>
        <Field label="Proyecto">
          <Select value={proyectoId} onChange={e => setProyectoId(e.target.value)}>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </Field>
      </div>

      <div style={{ background: "#fff7ed", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", gap: 24, fontSize: 14 }}>
        <span>✅ Presentes hoy: <strong>{presentes}</strong></span>
        <span>👷 Total activos: <strong>{activos.length}</strong></span>
        <span>❌ Ausentes: <strong>{activos.length - presentes}</strong></span>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {activos.map(o => {
          const presente = registroHoy.some(a => a.obreroId === o.id);
          return (
            <div key={o.id} onClick={() => toggle(o)} style={{ background: presente ? "#f0fdf4" : "#fff", border: `2px solid ${presente ? "#22c55e" : "#e5e7eb"}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: presente ? "#bbf7d0" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: presente ? "#16a34a" : "#666", fontSize: 15 }}>
                {o.nombre.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>{o.nombre}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{o.rol}</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: presente ? "#22c55e" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: presente ? "#fff" : "#bbb" }}>
                {presente ? <Icon name="check" size={14} /> : <Icon name="x" size={14} />}
              </div>
            </div>
          );
        })}
        {activos.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "#bbb", fontSize: 14 }}>No hay obreros activos</div>}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>Últimos 7 días</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {ultimos7.map(d => {
          const cnt = asistencia.filter(a => a.fecha === d).length;
          return (
            <div key={d} style={{ textAlign: "center" }}>
              <div style={{ background: cnt > 0 ? "#fed7aa" : "#f3f4f6", borderRadius: 10, padding: "10px 4px", marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: cnt > 0 ? "#ea580c" : "#ccc" }}>{cnt}</div>
              </div>
              <div style={{ fontSize: 10, color: "#888" }}>{d.slice(8)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MÓDULO: PAGOS / NÓMINA
// ══════════════════════════════════════════════════════════════════
function ModPagos({ obreros, asistencia, pagos, setPagos, proyectos }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ obreroId: "", desde: "", hasta: "", extra: 0, descuento: 0, nota: "" });

  const calcular = () => {
    if (!form.obreroId || !form.desde || !form.hasta) return 0;
    const obrero = obreros.find(o => o.id === Number(form.obreroId));
    if (!obrero) return 0;
    const diasTrabajados = asistencia.filter(a =>
      a.obreroId === obrero.id && a.fecha >= form.desde && a.fecha <= form.hasta
    ).length;
    return diasTrabajados * obrero.salarioDia + Number(form.extra || 0) - Number(form.descuento || 0);
  };

  const registrar = () => {
    const obrero = obreros.find(o => o.id === Number(form.obreroId));
    if (!obrero) return;
    const diasTrabajados = asistencia.filter(a =>
      a.obreroId === obrero.id && a.fecha >= form.desde && a.fecha <= form.hasta
    ).length;
    const total = calcular();
    const nuevo = {
      id: Date.now(),
      obreroId: Number(form.obreroId),
      obreroNombre: obrero.nombre,
      desde: form.desde,
      hasta: form.hasta,
      diasTrabajados,
      salarioDia: obrero.salarioDia,
      extra: Number(form.extra) || 0,
      descuento: Number(form.descuento) || 0,
      total,
      nota: form.nota,
      fecha: new Date().toISOString().slice(0, 10),
    };
    const lista = [nuevo, ...pagos];
    setPagos(lista);
    save(KEYS.pagos, lista);
    setModal(false);
    setForm({ obreroId: "", desde: "", hasta: "", extra: 0, descuento: 0, nota: "" });
  };

  const eliminar = (id) => {
    const lista = pagos.filter(p => p.id !== id);
    setPagos(lista);
    save(KEYS.pagos, lista);
  };

  const totalPagado = pagos.reduce((s, p) => s + p.total, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Pagos y Nómina</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>Total pagado: <strong style={{ color: "#16a34a" }}>${totalPagado.toFixed(2)}</strong></p>
        </div>
        <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f97316", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Registrar pago
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {pagos.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{p.obreroNombre}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Período: {p.desde} → {p.hasta}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{p.diasTrabajados} días × ${p.salarioDia} {p.extra > 0 ? `+ $${p.extra} extra` : ""} {p.descuento > 0 ? `− $${p.descuento} desc.` : ""}</div>
                {p.nota && <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", marginTop: 2 }}>{p.nota}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>${p.total.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#bbb" }}>Pagado {p.fecha}</div>
                <button onClick={() => eliminar(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", marginTop: 4 }}><Icon name="trash" size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {pagos.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>No hay pagos registrados</div>}
      </div>

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(false)}>
          <Field label="Obrero">
            <Select value={form.obreroId} onChange={e => setForm({ ...form, obreroId: e.target.value })}>
              <option value="">Seleccionar obrero...</option>
              {obreros.filter(o => o.activo).map(o => <option key={o.id} value={o.id}>{o.nombre} (${o.salarioDia}/día)</option>)}
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Desde"><Input type="date" value={form.desde} onChange={e => setForm({ ...form, desde: e.target.value })} /></Field>
            <Field label="Hasta"><Input type="date" value={form.hasta} onChange={e => setForm({ ...form, hasta: e.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Extra ($)"><Input type="number" value={form.extra} onChange={e => setForm({ ...form, extra: e.target.value })} placeholder="0" /></Field>
            <Field label="Descuento ($)"><Input type="number" value={form.descuento} onChange={e => setForm({ ...form, descuento: e.target.value })} placeholder="0" /></Field>
          </div>
          <Field label="Nota (opcional)"><Input value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} placeholder="Pago quincenal, etc." /></Field>
          {form.obreroId && form.desde && form.hasta && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#666" }}>Total a pagar</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>${calcular().toFixed(2)}</div>
            </div>
          )}
          <button onClick={registrar} style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Confirmar pago</button>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MÓDULO: MATERIALES
// ══════════════════════════════════════════════════════════════════
function ModMateriales({ materiales, setMateriales, proyectos }) {
  const [modal, setModal] = useState(false);
  const [filtroProyecto, setFiltroProyecto] = useState("todos");
  const [form, setForm] = useState({ nombre: "", cantidad: "", unidad: "unidades", precioUnit: "", proyectoId: proyectos[0]?.id || "" });

  const agregar = () => {
    if (!form.nombre || !form.cantidad) return;
    const nuevo = { id: Date.now(), ...form, cantidad: parseFloat(form.cantidad), precioUnit: parseFloat(form.precioUnit) || 0, proyectoId: Number(form.proyectoId) };
    const lista = [...materiales, nuevo];
    setMateriales(lista);
    save(KEYS.materiales, lista);
    setModal(false);
    setForm({ nombre: "", cantidad: "", unidad: "unidades", precioUnit: "", proyectoId: proyectos[0]?.id || "" });
  };

  const eliminar = (id) => {
    const lista = materiales.filter(m => m.id !== id);
    setMateriales(lista);
    save(KEYS.materiales, lista);
  };

  const filtrados = filtroProyecto === "todos" ? materiales : materiales.filter(m => String(m.proyectoId) === filtroProyecto);
  const totalCosto = filtrados.reduce((s, m) => s + m.cantidad * m.precioUnit, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Materiales</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>Costo total: <strong style={{ color: "#7c3aed" }}>${totalCosto.toFixed(2)}</strong></p>
        </div>
        <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f97316", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Agregar material
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFiltroProyecto("todos")} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid", borderColor: filtroProyecto === "todos" ? "#f97316" : "#e5e7eb", background: filtroProyecto === "todos" ? "#fff7ed" : "transparent", color: filtroProyecto === "todos" ? "#f97316" : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Todos
        </button>
        {proyectos.map(p => (
          <button key={p.id} onClick={() => setFiltroProyecto(String(p.id))} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid", borderColor: filtroProyecto === String(p.id) ? "#f97316" : "#e5e7eb", background: filtroProyecto === String(p.id) ? "#fff7ed" : "transparent", color: filtroProyecto === String(p.id) ? "#f97316" : "#888", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {p.nombre}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtrados.map(m => {
          const proyecto = proyectos.find(p => p.id === m.proyectoId);
          return (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", flexShrink: 0 }}>
                <Icon name="materials" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{m.nombre}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{m.cantidad} {m.unidad} · ${m.precioUnit}/u · <span style={{ color: "#7c3aed", fontWeight: 600 }}>${(m.cantidad * m.precioUnit).toFixed(2)} total</span></div>
                {proyecto && <div style={{ fontSize: 11, color: "#aaa" }}>📍 {proyecto.nombre}</div>}
              </div>
              <button onClick={() => eliminar(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Icon name="trash" size={15} /></button>
            </div>
          );
        })}
        {filtrados.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>Sin materiales registrados</div>}
      </div>

      {modal && (
        <Modal title="Agregar material" onClose={() => setModal(false)}>
          <Field label="Nombre del material"><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Cemento, varilla, arena..." /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Cantidad"><Input type="number" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} placeholder="100" /></Field>
            <Field label="Unidad">
              <Select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                {["unidades", "sacos", "m²", "m³", "kg", "toneladas", "litros", "rollos", "tablas"].map(u => <option key={u}>{u}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Precio por unidad ($)"><Input type="number" value={form.precioUnit} onChange={e => setForm({ ...form, precioUnit: e.target.value })} placeholder="8.50" /></Field>
          <Field label="Proyecto">
            <Select value={form.proyectoId} onChange={e => setForm({ ...form, proyectoId: e.target.value })}>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </Field>
          <button onClick={agregar} style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15, marginTop: 8 }}>Guardar material</button>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════
function Dashboard({ obreros, proyectos, asistencia, pagos, materiales }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const presentesHoy = asistencia.filter(a => a.fecha === hoy).length;
  const totalPagado = pagos.reduce((s, p) => s + p.total, 0);
  const costMat = materiales.reduce((s, m) => s + m.cantidad * m.precioUnit, 0);

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f55 100%)", borderRadius: 16, padding: "20px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: 60, width: 60, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 3, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: "0.04em" }}>SALMEDINA</div>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em" }}>CONSTRUCCIONES SRL</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>📅 {hoy}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <StatCard label="Obreros activos" value={obreros.filter(o => o.activo).length} icon="workers" color="#f97316" />
        <StatCard label="Proyectos activos" value={proyectos.filter(p => p.estado === "En progreso").length} icon="project" color="#3b82f6" />
        <StatCard label="Presentes hoy" value={presentesHoy} icon="attendance" color="#22c55e" />
        <StatCard label="Total pagado" value={`$${totalPagado.toLocaleString()}`} icon="payment" color="#8b5cf6" />
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#333" }}>Proyectos activos</h3>
        {proyectos.filter(p => p.estado === "En progreso").map(p => {
          const costMateriales = materiales.filter(m => m.proyectoId === p.id).reduce((s, m) => s + m.cantidad * m.precioUnit, 0);
          const costNomina = pagos.filter(pg => {}).reduce((s) => s, 0);
          const pct = Math.min(100, Math.round((costMateriales / p.presupuesto) * 100));
          return (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{p.nombre}</span>
                <span style={{ color: "#888" }}>${costMateriales.toFixed(0)} / ${p.presupuesto?.toLocaleString()}</span>
              </div>
              <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8 }}>
                <div style={{ background: pct > 80 ? "#ef4444" : "#f97316", borderRadius: 99, height: 8, width: `${pct}%`, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{pct}% del presupuesto en materiales</div>
            </div>
          );
        })}
        {proyectos.filter(p => p.estado === "En progreso").length === 0 && (
          <div style={{ color: "#bbb", fontSize: 13 }}>Sin proyectos en progreso</div>
        )}
      </div>

      <div style={{ background: "#fff7ed", borderRadius: 14, padding: "16px 20px", border: "1.5px solid #fed7aa" }}>
        <div style={{ fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>📦 Costo total materiales</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#c2410c" }}>${costMat.toFixed(2)}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// USUARIOS (puedes cambiar estas credenciales)
// ══════════════════════════════════════════════════════════════════
const USUARIOS = [
  { usuario: "admin",    clave: "salmedina2024", rol: "Administrador", nombre: "Administrador" },
  { usuario: "gerente",  clave: "obras2024",     rol: "Gerente",       nombre: "Gerente de Obras" },
  { usuario: "obrero1",  clave: "obrero123",     rol: "Supervisor",    nombre: "Supervisor" },
];

// ══════════════════════════════════════════════════════════════════
// PANTALLA DE LOGIN
// ══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = () => {
    if (!usuario || !clave) { setError("Completa todos los campos"); return; }
    setCargando(true);
    setError("");
    setTimeout(() => {
      const user = USUARIOS.find(u => u.usuario === usuario.toLowerCase().trim() && u.clave === clave);
      if (user) {
        onLogin(user);
      } else {
        setError("Usuario o contraseña incorrectos");
        setCargando(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #1a2f55 60%, #0f2040 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: 100, width: 100, objectFit: "contain", borderRadius: 20, background: "#fff", padding: 6, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", marginBottom: 16 }} />
        <div style={{ fontWeight: 900, fontSize: 24, color: "#fff", letterSpacing: "0.06em" }}>SALMEDINA</div>
        <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.14em" }}>CONSTRUCCIONES SRL</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, letterSpacing: "0.06em" }}>OBRAS QUE PERDURAN EN EL TIEMPO</div>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#111" }}>Iniciar sesión</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#888" }}>Ingresa tus credenciales para continuar</p>

        <Field label="Usuario">
          <Input
            value={usuario}
            onChange={e => { setUsuario(e.target.value); setError(""); }}
            placeholder="Tu nombre de usuario"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </Field>

        <Field label="Contraseña">
          <div style={{ position: "relative" }}>
            <Input
              type={verClave ? "text" : "password"}
              value={clave}
              onChange={e => { setClave(e.target.value); setError(""); }}
              placeholder="Tu contraseña"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ paddingRight: 44 }}
            />
            <button onClick={() => setVerClave(!verClave)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 14 }}>
              {verClave ? "🙈" : "👁️"}
            </button>
          </div>
        </Field>

        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={cargando}
          style={{ width: "100%", background: cargando ? "#94a3b8" : "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 800, cursor: cargando ? "not-allowed" : "pointer", fontSize: 16, marginTop: 8, letterSpacing: "0.02em" }}
        >
          {cargando ? "Verificando..." : "Entrar →"}
        </button>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: "#334155", textAlign: "center" }}>
        Sistema de Gestión © Salmedina Construcciones SRL
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PANEL DE USUARIOS (solo admin)
// ══════════════════════════════════════════════════════════════════
function PanelUsuarios({ usuarioActual, onCerrar }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Usuarios del sistema</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>Credenciales de acceso</p>
        </div>
        <button onClick={onCerrar} style={{ background: "#f3f4f6", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Volver</button>
      </div>

      <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#92400e" }}>
        💡 Para cambiar usuarios y contraseñas, edita el archivo <strong>src/App.jsx</strong> en la sección <strong>USUARIOS</strong> al inicio del código.
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {USUARIOS.map((u, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: u.rol === "Administrador" ? "#fef3c7" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {u.rol === "Administrador" ? "👑" : u.rol === "Gerente" ? "👷" : "🔧"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{u.nombre}</div>
                <div style={{ fontSize: 13, color: "#888" }}>Rol: {u.rol}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, background: "#f8fafc", borderRadius: 10, padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 2 }}>USUARIO</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1628", fontFamily: "monospace" }}>{u.usuario}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600, marginBottom: 2 }}>CONTRASEÑA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1628", fontFamily: "monospace" }}>{u.clave}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [obreros, setObreros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  useEffect(() => {
    // Verificar sesión guardada
    try {
      const sesion = sessionStorage.getItem("salmedina:sesion");
      if (sesion) setUsuarioActual(JSON.parse(sesion));
    } catch {}

    (async () => {
      const [o, pr, a, pg, m] = await Promise.all([
        load(KEYS.obreros), load(KEYS.proyectos), load(KEYS.asistencia), load(KEYS.pagos), load(KEYS.materiales)
      ]);
      setObreros(o || SEED.obreros);
      setProyectos(pr || SEED.proyectos);
      setAsistencia(a || SEED.asistencia);
      setPagos(pg || SEED.pagos);
      setMateriales(m || SEED.materiales);
      if (!o) save(KEYS.obreros, SEED.obreros);
      if (!pr) save(KEYS.proyectos, SEED.proyectos);
      if (!m) save(KEYS.materiales, SEED.materiales);
      setCargado(true);
    })();
  }, []);

  const handleLogin = (user) => {
    setUsuarioActual(user);
    try { sessionStorage.setItem("salmedina:sesion", JSON.stringify(user)); } catch {}
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    setMostrarUsuarios(false);
    try { sessionStorage.removeItem("salmedina:sesion"); } catch {}
  };

  if (!cargado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a1628 0%, #1a2f55 100%)" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: 90, width: 90, objectFit: "contain", borderRadius: 16, background: "#fff", padding: 6, marginBottom: 16 }} />
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "0.06em" }}>SALMEDINA</div>
        <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>CONSTRUCCIONES SRL</div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Cargando sistema...</div>
      </div>
    </div>
  );

  if (!usuarioActual) return <LoginScreen onLogin={handleLogin} />;

  const navItems = [
    { id: "dashboard", icon: "helmet", label: "Inicio" },
    { id: "obreros", icon: "workers", label: "Obreros" },
    { id: "proyectos", icon: "project", label: "Obras" },
    { id: "asistencia", icon: "attendance", label: "Asistencia" },
    { id: "pagos", icon: "payment", label: "Pagos" },
    { id: "materiales", icon: "materials", label: "Materiales" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2f55 100%)", color: "#fff", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.jpg" alt="Salmedina Logo" style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 2 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1, letterSpacing: "0.04em", color: "#fff" }}>SALMEDINA</div>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.12em" }}>CONSTRUCCIONES SRL</div>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.06em", marginTop: 1 }}>OBRAS QUE PERDURAN EN EL TIEMPO</div>
          </div>
        </div>
        {/* Usuario + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", cursor: usuarioActual.rol === "Administrador" ? "pointer" : "default" }} onClick={() => usuarioActual.rol === "Administrador" && setMostrarUsuarios(true)}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{usuarioActual.nombre}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{usuarioActual.rol}{usuarioActual.rol === "Administrador" ? " · 👑" : ""}</div>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600 }}>
            Salir
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 100px" }}>
        {mostrarUsuarios && usuarioActual.rol === "Administrador"
          ? <PanelUsuarios usuarioActual={usuarioActual} onCerrar={() => setMostrarUsuarios(false)} />
          : <>
            {tab === "dashboard" && <Dashboard obreros={obreros} proyectos={proyectos} asistencia={asistencia} pagos={pagos} materiales={materiales} />}
            {tab === "obreros" && <ModObreros obreros={obreros} setObreros={setObreros} />}
            {tab === "proyectos" && <ModProyectos proyectos={proyectos} setProyectos={setProyectos} />}
            {tab === "asistencia" && <ModAsistencia obreros={obreros} asistencia={asistencia} setAsistencia={setAsistencia} proyectos={proyectos} />}
            {tab === "pagos" && <ModPagos obreros={obreros} asistencia={asistencia} pagos={pagos} setPagos={setPagos} proyectos={proyectos} />}
            {tab === "materiales" && <ModMateriales materiales={materiales} setMateriales={setMateriales} proyectos={proyectos} />}
          </>
        }
      </div>

      {/* Bottom Nav */}
      {!mostrarUsuarios && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 50 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", color: tab === n.id ? "#f97316" : "#bbb", gap: 3 }}>
              <Icon name={n.icon} size={20} />
              <span style={{ fontSize: 10, fontWeight: tab === n.id ? 700 : 500, letterSpacing: "0.02em" }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
