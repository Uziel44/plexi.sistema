/* Smart Farm Manager — demostración interactiva.
   Todo ocurre en el navegador con datos de ejemplo: nada se guarda ni sale de la página. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const on = (root, ev, sel, fn) => root.addEventListener(ev, (e) => { const el = e.target.closest(sel); if (el && root.contains(el)) fn(e, el); });
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  /* ---------- íconos (lucide, licencia ISC: los mismos que usa el programa real) ---------- */
  const ICONS = {
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    grid: '<path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    wheat: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
    paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>', down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    dash: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    up2: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>', down2: '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
    dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    pie: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    bars: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- formatos ---------- */
  const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }); const nf1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const money = (n) => `${n < 0 ? '-' : ''}$${nf0.format(Math.abs(Math.round(n || 0)))}`;
  const mshort = (n) => `${n < 0 ? '-' : ''}$${short(Math.abs(n))}`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const ha = (n) => `${nf1.format(n || 0)} ha`; const kg = (n) => `${nf1.format(n || 0)} kg`;
  const short = (n) => { const a = Math.abs(n); const s = a >= 1e6 ? `${+(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${+(a / 1e3).toFixed(1)}k` : String(+a.toFixed(1)); return n < 0 ? `-${s}` : s; };
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const iso = (off = 0) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setTime(d.getTime() + off * DAY); return isoOf(d); };
  const addDays = (s, n) => { const d = new Date(`${s}T12:00:00`); d.setDate(d.getDate() + n); return isoOf(d); };
  const daysFrom = (s) => { const t = new Date(); t.setHours(12, 0, 0, 0); return Math.round((new Date(`${s}T12:00:00`) - t) / DAY); };
  const shortDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
  const monthKey = (s) => s.slice(0, 7);
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthLabel = (k) => `${MONTHS[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}`;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  /* ---------- etiquetas de los valores guardados ---------- */
  const LBL = {
    role: { admin: 'Administrador', worker: 'Trabajador' }, status: { active: 'Activo', maintenance: 'En mantenimiento', retired: 'Retirado' },
    type: { income: 'Ingreso', expense: 'Gasto' }, method: { cash: 'Efectivo', bank_transfer: 'Transferencia', card: 'Tarjeta', check: 'Cheque' }, pay: { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' },
  };
  const opts = (m) => Object.entries(m).map(([value, label]) => ({ value, label }));
  const LOCATIONS = ['Pergamino', 'Rafaela', 'Tandil', 'Villa María', 'Marcos Juárez', 'Venado Tuerto'].map((v) => ({ value: v, label: v }));
  const SOILS = ['Arenoso', 'Arcilloso', 'Limoso', 'Turboso', 'Calcáreo', 'Franco'].map((v) => ({ value: v, label: v }));

  /* ---------- datos de ejemplo (siempre los mismos) ---------- */
  function seedData() {
    let s = 20241; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const pick = (a) => a[Math.floor(rnd() * a.length)]; const int = (a, b) => Math.round(a + rnd() * (b - a)); const flt = (a, b) => +(a + rnd() * (b - a)).toFixed(1);
    const wpick = (pairs) => { let r = rnd() * pairs.reduce((a, p) => a + p[1], 0); for (const [v, w] of pairs) { r -= w; if (r <= 0) return v; } return pairs[0][0]; };
    let n = 0; const id = (p) => `${p}${++n}`;
    const D = { farmers: [], fields: [], crops: [], animals: [], equipment: [], transactions: [] };
    const NAMES = ['Martín Gómez', 'Lucía Fernández', 'Rodrigo Paz', 'Camila Romero', 'Tomás Acosta', 'Valentina Ruiz', 'Joaquín Herrera', 'Sofía Medina', 'Facundo Ibarra', 'Agustina Peralta'];
    const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '.');
    NAMES.forEach((name, i) => D.farmers.push({ _id: id('f'), name, email: `${slug(name)}@agro.example`, role: i === 0 ? 'admin' : pick(['admin', 'worker', 'worker']) }));
    const FNAMES = ['Lote Norte', 'Lote Sur', 'Loma Alta', 'Costa del Río', 'Pampa Central', 'Monte Verde', 'Cañada Seca', 'El Ombú', 'La Esperanza', 'Los Álamos'];
    const CROPS = [['Trigo', 'Cereal'], ['Maíz', 'Cereal'], ['Cebada', 'Cereal'], ['Soja', 'Oleaginosa'], ['Girasol', 'Oleaginosa'], ['Papa', 'Hortaliza'], ['Tomate', 'Hortaliza'], ['Zanahoria', 'Hortaliza'], ['Alfalfa', 'Forraje'], ['Lenteja', 'Legumbre']];
    D.farmers.forEach((f) => { for (let i = 0; i < 3; i++) D.fields.push({ _id: id('l'), name: `${pick(FNAMES)} - ${int(1, 99)}`, area: flt(2, 48), location: pick(LOCATIONS).value, soil_type: pick(SOILS).value, farmer_id: f._id }); });
    D.fields.forEach((f) => { for (let i = 0; i < 2; i++) { const [name, type] = pick(CROPS); const p = -int(0, 180); D.crops.push({ _id: id('c'), name, type, planting_date: iso(p), harvest_date: iso(p + int(60, 150)), field_id: f._id }); } });
    const SPECIES = [['Vacuno', 'VAC', 300, 650], ['Ovino', 'OVI', 40, 90], ['Caprino', 'CAP', 35, 80], ['Porcino', 'POR', 80, 250], ['Aves', 'AVE', 2, 5], ['Equino', 'EQU', 380, 550]];
    D.farmers.forEach((f) => { for (let i = 0; i < 8; i++) { const [species, pre, a, b] = wpick([[SPECIES[0], 4], [SPECIES[1], 3], [SPECIES[2], 1], [SPECIES[3], 2], [SPECIES[4], 2], [SPECIES[5], 1]]); D.animals.push({ _id: id('a'), tag: `${pre}-${int(1000, 9999)}`, species, birth_date: iso(-int(120, 2500)), weight: species === 'Aves' ? flt(a, b) : int(a, b), health_status: wpick([['Sano', 5], ['Excelente', 3], ['En recuperación', 1.5], ['Enfermo', 1]]), farmer_id: f._id }); } });
    const EQ = [['Tractor', ['John Deere 6130', 'Case IH Puma 150', 'New Holland T7']], ['Cosechadora', ['Claas Lexion 570', 'John Deere S690']], ['Sembradora', ['Crucianelli Pionera', 'Agrometal TX']], ['Pulverizadora', ['Pla Magnum', 'Metalfor Space']], ['Arado', ['Baldan Cincel', 'Fabimag 5 rejas']], ['Sistema de riego', ['Valley pivote 400 m', 'Lindsay Zimmatic']], ['Acoplado', ['Metalfor Tolva', 'Ombú 12 t']]];
    D.farmers.forEach((f) => { for (let i = 0; i < 4; i++) { const [type, models] = pick(EQ); D.equipment.push({ _id: id('e'), name: pick(models), type, status: wpick([['active', 6], ['maintenance', 2], ['retired', 1]]), purchase_date: iso(-int(200, 3500)), last_service_date: iso(-int(10, 400)), farmer_id: f._id }); } });
    const INC = ['Venta de cultivos', 'Venta de ganado', 'Subsidios', 'Otros ingresos']; const EXP = ['Semillas', 'Fertilizantes', 'Equipos', 'Mano de obra', 'Servicios', 'Mantenimiento', 'Combustible', 'Otros gastos'];
    const VENDORS = ['Agroservicios del Sur', 'Semillería La Pampa', 'Cooperativa Rural', 'Surtidor Ruta 8', 'Veterinaria Central', 'Acopio San Martín', 'Frigorífico Regional'];
    D.farmers.forEach((f) => { const eqs = D.equipment.filter((e) => e.farmer_id === f._id); for (let i = 0; i < 15; i++) { const income = rnd() < 0.4; const category = pick(income ? INC : EXP); const linked = !income && ['Mantenimiento', 'Combustible', 'Equipos'].includes(category) && rnd() < 0.7; D.transactions.push({ _id: id('t'), type: income ? 'income' : 'expense', category, amount: income ? int(5, 250) * 1000 : int(8, 900) * 100, date: iso(-int(0, 180)), description: income ? `Cobro: ${category.toLowerCase()}` : `Pago: ${category.toLowerCase()}`, payment_method: pick(['cash', 'bank_transfer', 'bank_transfer', 'card', 'check']), payment_status: wpick([['paid', 7], ['pending', 2], ['overdue', 1]]), farmer_id: f._id, equipment_id: linked ? pick(eqs)._id : '', invoice_number: `FAC-${int(10000, 99999)}`, vendor_name: pick(VENDORS) }); } });
    return D;
  }
  let D = seedData();
  const byId = (arr, id) => arr.find((x) => x._id === id);
  const fName = (id) => byId(D.farmers, id)?.name || '—'; const lName = (id) => byId(D.fields, id)?.name || '—'; const eName = (id) => byId(D.equipment, id)?.name || '—';
  const cropState = (c) => (new Date(`${c.harvest_date}T12:00:00`) > new Date() ? 'Activo' : 'Cosechado');

  /* ---------- gráficos en SVG (con los colores del tema) ---------- */
  const nodata = '<div class="nodata">Sin datos para mostrar</div>';
  const cut = (t, n = 13) => (String(t).length > n ? `${String(t).slice(0, n - 1)}…` : String(t));
  function niceScale(max, ticks = 5) { if (max <= 0) return { step: 1 }; const raw = max / ticks; const mag = 10 ** Math.floor(Math.log10(raw)); const nrm = raw / mag; return { step: (nrm <= 1 ? 1 : nrm <= 2 ? 2 : nrm <= 5 ? 5 : 10) * mag }; }
  function barChart({ labels, series, fmt = short, height = 280, rotate = false, w = 520 }) {
    if (!labels.length) return nodata;
    const W = w, H = height, m = { l: 54, r: 12, t: 12, b: rotate ? 70 : 38 }; const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = Math.max(0, ...series.flatMap((x) => x.values)); const { step } = niceScale(max); const top = Math.max(step, Math.ceil(max / step) * step);
    const y = (v) => m.t + ih - (v / top) * ih; const gw = iw / labels.length; const bw = Math.min(44, (gw * 0.72) / series.length);
    let g = ''; for (let v = 0; v <= top + 1e-9; v += step) g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
    let b = ''; labels.forEach((lab, gi) => { const x0 = m.l + gi * gw + (gw - bw * series.length) / 2; series.forEach((sr, si) => { const v = sr.values[gi]; b += `<rect x="${x0 + si * bw}" y="${y(v)}" width="${bw - 2}" height="${Math.max(0, m.t + ih - y(v))}" rx="3" fill="${sr.color}" data-tip="${esc(`${lab} · ${sr.name}: ${fmt(v)}`)}"/>`; });
      const cx = m.l + gi * gw + gw / 2; b += rotate ? `<text transform="translate(${cx},${H - m.b + 14}) rotate(-35)" text-anchor="end">${esc(cut(lab))}</text>` : `<text x="${cx}" y="${H - m.b + 16}" text-anchor="middle">${esc(cut(lab, 11))}</text>`; });
    const lg = series.length > 1 ? `<div class="legend">${series.map((x) => `<span><i style="background:${x.color}"></i>${esc(x.name)}</span>`).join('')}</div>` : '';
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}${b}</svg>${lg}</div>`;
  }
  function donut(items, fmt = (v) => nf0.format(v)) {
    const data = items.filter((i) => i.value > 0); const total = data.reduce((a, i) => a + i.value, 0); if (!total) return nodata;
    const cx = 100, cy = 100, R = 92, r = 54; let a0 = -Math.PI / 2; const P = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const arcs = data.map((it, i) => { const color = COLORS[i % COLORS.length]; const ang = (it.value / total) * Math.PI * 2; const tip = esc(`${it.label}: ${fmt(it.value)} (${Math.round((it.value / total) * 100)}%)`);
      if (data.length === 1) return `<path d="M${cx},${cy - R} A${R},${R} 0 1 1 ${cx - 0.01},${cy - R} L${cx - 0.01},${cy - r} A${r},${r} 0 1 0 ${cx},${cy - r} Z" fill="${color}" data-tip="${tip}"/>`;
      const pa = Math.min(0.03, ang / 4); const s1 = a0 + pa, e1 = a0 + ang - pa; a0 += ang; const lg = e1 - s1 > Math.PI ? 1 : 0; const [x1, y1] = P(R, s1), [x2, y2] = P(R, e1), [x3, y3] = P(r, e1), [x4, y4] = P(r, s1);
      return `<path d="M${x1},${y1} A${R},${R} 0 ${lg} 1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${lg} 0 ${x4},${y4} Z" fill="${color}" data-tip="${tip}"/>`; }).join('');
    return `<div class="donut chart"><svg viewBox="0 0 200 200" role="img">${arcs}<text class="center" x="100" y="104">${esc(fmt(total))}</text><text class="centersub" x="100" y="120">total</text></svg><div class="dotlist">${data.map((it, i) => `<div><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(it.label)}<b>${fmt(it.value)}</b></div>`).join('')}</div></div>`;
  }
  function lineChart({ labels, series, fmt = short, height = 300, w = 720 }) {
    if (!labels.length) return nodata;
    const W = w, H = height, m = { l: 58, r: 16, t: 14, b: 36 }; const iw = W - m.l - m.r, ih = H - m.t - m.b; const all = series.flatMap((x) => x.values);
    const mn = Math.min(0, ...all), mx = Math.max(0, ...all); const { step } = niceScale(mx - mn); const lo = Math.floor(mn / step) * step, hi = Math.max(lo + step, Math.ceil(mx / step) * step);
    const y = (v) => m.t + ih - ((v - lo) / (hi - lo)) * ih; const x = (i) => m.l + (labels.length === 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
    let g = ''; for (let v = lo; v <= hi + 1e-9; v += step) g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
    const smooth = (p) => p.map((q, i) => { if (!i) return `M${q[0]},${q[1]}`; const p0 = p[i - 2] || p[i - 1], p1 = p[i - 1], p3 = p[i + 1] || q; return `C${p1[0] + (q[0] - p0[0]) / 6},${p1[1] + (q[1] - p0[1]) / 6} ${q[0] - (p3[0] - p1[0]) / 6},${q[1] - (p3[1] - p1[1]) / 6} ${q[0]},${q[1]}`; }).join('');
    const lines = series.map((sr) => { const pts = sr.values.map((v, i) => [x(i), y(v)]); return `<path d="${smooth(pts)}" fill="none" stroke="${sr.color}" stroke-width="2.5"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${sr.color}" stroke="var(--card)" stroke-width="2" data-tip="${esc(`${labels[i]} · ${sr.name}: ${fmt(sr.values[i])}`)}"/>`).join('')}`; }).join('');
    const xl = labels.map((l, i) => `<text x="${x(i)}" y="${H - m.b + 18}" text-anchor="middle">${esc(l)}</text>`).join('');
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}${y(0) !== y(lo) ? `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}"/>` : ''}${lines}${xl}</svg><div class="legend">${series.map((sr) => `<span><i style="background:${sr.color}"></i>${esc(sr.name)}</span>`).join('')}</div></div>`;
  }
  const hbars = (items, fmt = (v) => nf0.format(v), color = COLORS[0]) => { if (!items.length) return nodata; const mx = Math.max(...items.map((i) => i.value)) || 1; return `<div class="hbars">${items.map((it) => `<div class="hbar"><span class="clip" title="${esc(it.label)}">${esc(it.label)}</span><div class="track"><i style="width:${(it.value / mx) * 100}%;background:${color}" data-tip="${esc(`${it.label}: ${fmt(it.value)}`)}"></i></div><b>${fmt(it.value)}</b></div>`).join('')}</div>`; };
  const countBy = (rows, f) => { const m = new Map(); rows.forEach((r) => { const k = f(r); m.set(k, (m.get(k) || 0) + 1); }); return [...m].map(([label, value]) => ({ label, value })); };
  const sumBy = (rows, f, v) => { const m = new Map(); rows.forEach((r) => { const k = f(r); m.set(k, (m.get(k) || 0) + v(r)); }); return [...m].map(([label, value]) => ({ label, value })); };
  const desc = (arr, n = 10) => [...arr].sort((a, b) => b.value - a.value).slice(0, n);
  const last6 = () => Array.from({ length: 6 }, (_, k) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - k)); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; });

  /* tooltip único para todos los gráficos */
  const tip = el('div', 'tip'); tip.hidden = true; document.body.appendChild(tip);
  document.addEventListener('mouseover', (e) => { const t = e.target.closest('[data-tip]'); if (t) { tip.textContent = t.dataset.tip; tip.hidden = false; } });
  document.addEventListener('mousemove', (e) => { if (!tip.hidden) { tip.style.left = `${Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8)}px`; tip.style.top = `${e.clientY + 16}px`; } });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tip]')) tip.hidden = true; });

  /* ---------- avisos, diálogos y panel lateral ---------- */
  function toast(msg, kind = 'ok') {
    let box = $('.toasts'); if (!box) { box = el('div', 'toasts'); document.body.appendChild(box); }
    const t = el('div', `toast ${kind}`, `${ic(kind === 'ok' ? 'ok' : kind === 'bad' ? 'warn' : 'info')}<div>${esc(msg)}</div>`); box.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const all = $$('.overlay'); all.at(-1)?._esc?.(); } });
  function confirmBox({ title, text, confirm = 'Aceptar', danger = false, onOk }) {
    const ov = el('div', 'overlay top'); ov.innerHTML = `<div class="dialog" role="alertdialog"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="acts"><button class="btn btn-outline" data-no>Cancelar</button><button class="btn ${danger ? 'btn-danger' : ''}" data-ok>${esc(confirm)}</button></div></div>`;
    const close = () => ov.remove(); ov._esc = close; document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-no]')) close(); if (e.target.closest('[data-ok]')) { close(); onOk(); } });
  }
  const todayIso = () => iso(0);
  function fieldHtml(f, v) {
    const id = `f-${f.k}`; const val = v ?? f.def ?? ''; const req = f.req ? '<span class="req"> *</span>' : '';
    let input;
    if (f.type === 'select') input = `<select class="select" id="${id}" name="${f.k}">${f.empty ? '<option value="">— Ninguno —</option>' : '<option value="" disabled' + (val === '' ? ' selected' : '') + '>Seleccionar…</option>'}${f.options().map((o) => `<option value="${esc(o.value)}"${String(o.value) === String(val) ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    else input = `<input class="input" id="${id}" name="${f.k}" type="${f.type || 'text'}" value="${esc(val)}" ${f.type === 'number' ? 'step="any" min="0"' : ''} ${f.list ? `list="${id}-list"` : ''} autocomplete="off">${f.list ? `<datalist id="${id}-list">${f.list.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}`;
    return `<div class="field"><label for="${id}">${esc(f.label)}${req}</label>${input}<div class="err" id="${id}-err"></div></div>`;
  }
  function openDrawer({ title, fields, values = {}, submit = 'Guardar', onSubmit }) {
    const ov = el('div', 'overlay side');
    ov.innerHTML = `<aside class="drawer"><button class="icon-btn close" data-x aria-label="Cerrar">${ic('x')}</button><header><h3>${esc(title)}</h3></header><form id="drawer-form" novalidate><div class="body">${fields.map((f) => fieldHtml(f, values[f.k])).join('')}</div><footer><button type="submit" class="btn" id="drawer-ok" disabled>${esc(submit)}</button><button type="button" class="btn btn-outline" data-x>Cancelar</button></footer></form></aside>`;
    document.body.appendChild(ov); const form = $('#drawer-form', ov); const ok = $('#drawer-ok', ov); const touched = new Set(); let dirty = false;
    const read = () => { const o = {}; fields.forEach((f) => { const v = form.elements[f.k].value; o[f.k] = f.type === 'number' ? (v === '' ? NaN : Number(v)) : v; }); return o; };
    const check = (f, v) => { if (f.req && (v === '' || Number.isNaN(v))) return 'Este campo es obligatorio.'; if (f.type === 'number' && v !== '' && !Number.isNaN(v) && v <= 0 && f.req) return 'Tiene que ser mayor que 0.'; if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Ingresá un email válido.'; return ''; };
    const validate = () => { const vals = read(); let valid = true; fields.forEach((f) => { const msg = check(f, vals[f.k]); if (msg) valid = false; const show = touched.has(f.k) ? msg : ''; $(`#f-${f.k}-err`, ov).textContent = show; form.elements[f.k].classList.toggle('bad', !!show); }); ok.disabled = !valid; };
    form.addEventListener('input', (e) => { dirty = true; touched.add(e.target.name); validate(); }); form.addEventListener('change', (e) => { dirty = true; touched.add(e.target.name); validate(); });
    form.addEventListener('focusout', (e) => { if (e.target.name) { touched.add(e.target.name); validate(); } });
    const close = () => ov.remove(); const tryClose = () => (dirty ? confirmBox({ title: 'Cancelar formulario', text: '¿Seguro que querés cancelar? Se van a perder todos los cambios.', onOk: close }) : close());
    ov._esc = tryClose; ov.addEventListener('mousedown', (e) => { if (e.target === ov) tryClose(); }); ov.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) tryClose(); });
    form.addEventListener('submit', (e) => { e.preventDefault(); validate(); if (ok.disabled) return; onSubmit(read()); close(); });
    validate(); const first = form.elements[fields[0].k]; if (first) first.focus({ preventScroll: true });
  }

  /* =================================================================================================
     Entidades: columnas de la tabla y campos del formulario (las 6 pantallas de administración).
     ================================================================================================= */
  const chip = (t, tone) => `<span class="chip ${tone}">${esc(t)}</span>`;
  const farmerOpts = () => D.farmers.map((f) => ({ value: f._id, label: f.name }));
  const fieldOpts = () => D.fields.map((f) => ({ value: f._id, label: f.name }));
  const equipOpts = () => D.equipment.map((e) => ({ value: e._id, label: e.name }));
  const dash = (v) => v || '—';
  const HEALTH_TONE = { Excelente: 'blue', Sano: 'green', 'En recuperación': 'amber', Enfermo: 'red' };
  const EQ_TONE = { active: 'green', maintenance: 'amber', retired: 'gray' }; const PAY_TONE = { paid: 'green', pending: 'amber', overdue: 'red' };
  const CROP_TYPES = ['Cereal', 'Oleaginosa', 'Hortaliza', 'Forraje', 'Legumbre']; const SPECIES = ['Vacuno', 'Ovino', 'Caprino', 'Porcino', 'Aves', 'Equino'];
  const EQ_TYPES = ['Tractor', 'Cosechadora', 'Sembradora', 'Pulverizadora', 'Arado', 'Sistema de riego', 'Acoplado'];
  const CATS = ['Venta de cultivos', 'Venta de ganado', 'Subsidios', 'Otros ingresos', 'Semillas', 'Fertilizantes', 'Equipos', 'Mano de obra', 'Servicios', 'Mantenimiento', 'Combustible', 'Otros gastos'];

  const ENT = {
    farmers: { nav: 'Agricultores', icon: 'users', title: 'Gestión de agricultores', table: 'Agricultores', singular: 'agricultor', add: 'Agregar agricultor', analytics: false,
      desc: 'Consultá, administrá y organizá a todos los agricultores registrados en tu red. Seguí su actividad y mantené los registros al día.', label: (r) => r.name,
      cols: [{ h: 'Nombre', t: (r) => r.name }, { h: 'Email', t: (r) => r.email }, { h: 'Rol', t: (r) => LBL.role[r.role], html: (r) => chip(LBL.role[r.role], r.role === 'admin' ? 'purple' : 'gray') }],
      form: (edit) => [{ k: 'name', label: 'Nombre', req: true }, { k: 'email', label: 'Email', type: 'email', req: true }, ...(edit ? [] : [{ k: 'password', label: 'Contraseña', type: 'password', req: true }]), { k: 'role', label: 'Rol', type: 'select', options: () => opts(LBL.role), req: true, def: 'worker' }] },
    fields: { nav: 'Campos', icon: 'grid', title: 'Gestión de campos', table: 'Campos', singular: 'campo', add: 'Agregar campo', analytics: true,
      desc: 'Controlá y administrá los campos de tu granja. Seguí el rendimiento de los cultivos, analizá el crecimiento y optimizá las operaciones para mejorar la producción.', label: (r) => r.name,
      cols: [{ h: 'Nombre', t: (r) => r.name }, { h: 'Superficie (ha)', t: (r) => nf1.format(r.area), s: (r) => r.area }, { h: 'Ubicación', t: (r) => r.location }, { h: 'Tipo de suelo', t: (r) => r.soil_type }, { h: 'Agricultor', t: (r) => fName(r.farmer_id) }],
      form: () => [{ k: 'name', label: 'Nombre', req: true }, { k: 'area', label: 'Superficie (en hectáreas)', type: 'number', req: true }, { k: 'location', label: 'Ubicación', type: 'select', options: () => LOCATIONS, req: true }, { k: 'soil_type', label: 'Tipo de suelo', type: 'select', options: () => SOILS, req: true }, { k: 'farmer_id', label: 'Agricultor', type: 'select', options: farmerOpts, req: true }] },
    crops: { nav: 'Cultivos', icon: 'wheat', title: 'Gestión de cultivos', table: 'Cultivos', singular: 'cultivo', add: 'Agregar cultivo', analytics: true,
      desc: 'Administrá tu inventario de cultivos y seguí los ciclos de producción. Controlá las fechas de siembra, las etapas de crecimiento y los plazos de cosecha para mejorar el rendimiento.', label: (r) => r.name,
      cols: [{ h: 'Nombre del cultivo', t: (r) => r.name }, { h: 'Tipo', t: (r) => r.type }, { h: 'Fecha de siembra', t: (r) => r.planting_date }, { h: 'Fecha de cosecha', t: (r) => dash(r.harvest_date) }, { h: 'Campo', t: (r) => lName(r.field_id) }],
      form: () => [{ k: 'name', label: 'Nombre', req: true }, { k: 'type', label: 'Tipo', req: true, list: CROP_TYPES }, { k: 'planting_date', label: 'Fecha de siembra', type: 'date', req: true, def: todayIso() }, { k: 'harvest_date', label: 'Fecha de cosecha', type: 'date', def: addDays(todayIso(), 90) }, { k: 'field_id', label: 'Campo', type: 'select', options: fieldOpts, req: true }] },
    animals: { nav: 'Animales', icon: 'paw', title: 'Gestión de animales', table: 'Animales', singular: 'animal', add: 'Agregar animal', analytics: true,
      desc: 'Administrá tu ganado con eficiencia: seguí las especies, el estado de salud, los planes de alimentación y la producción para tener un manejo óptimo de la granja.', label: (r) => r.tag,
      cols: [{ h: 'Caravana', t: (r) => r.tag }, { h: 'Especie', t: (r) => r.species }, { h: 'Nacimiento', t: (r) => r.birth_date }, { h: 'Peso (kg)', t: (r) => nf1.format(r.weight), s: (r) => r.weight }, { h: 'Estado de salud', t: (r) => r.health_status, html: (r) => chip(r.health_status, HEALTH_TONE[r.health_status] || 'gray') }, { h: 'Agricultor', t: (r) => fName(r.farmer_id) }],
      form: () => [{ k: 'tag', label: 'Nombre o caravana', req: true }, { k: 'species', label: 'Especie', req: true, list: SPECIES }, { k: 'birth_date', label: 'Fecha de nacimiento', type: 'date', req: true, def: todayIso() }, { k: 'weight', label: 'Peso (en kg)', type: 'number', req: true }, { k: 'health_status', label: 'Estado de salud', req: true, list: ['Excelente', 'Sano', 'En recuperación', 'Enfermo'] }, { k: 'farmer_id', label: 'Agricultor', type: 'select', options: farmerOpts, req: true }] },
    equipment: { nav: 'Equipos', icon: 'wrench', title: 'Gestión de equipos', table: 'Equipos', singular: 'equipo', add: 'Agregar equipo', analytics: true,
      desc: 'Administrá la maquinaria de tu granja: seguí los tipos de equipo, el estado operativo, los mantenimientos programados y el historial de uso para cuidar su rendimiento y su vida útil.', label: (r) => r.name,
      cols: [{ h: 'Nombre', t: (r) => r.name }, { h: 'Tipo', t: (r) => r.type }, { h: 'Estado', t: (r) => LBL.status[r.status], html: (r) => chip(LBL.status[r.status], EQ_TONE[r.status]) }, { h: 'Fecha de compra', t: (r) => dash(r.purchase_date) }, { h: 'Último servicio', t: (r) => dash(r.last_service_date) }, { h: 'Agricultor', t: (r) => fName(r.farmer_id) }],
      form: () => [{ k: 'name', label: 'Nombre', req: true }, { k: 'type', label: 'Tipo', req: true, list: EQ_TYPES }, { k: 'status', label: 'Estado', type: 'select', options: () => opts(LBL.status), req: true, def: 'active' }, { k: 'purchase_date', label: 'Fecha de compra', type: 'date', req: true, def: todayIso() }, { k: 'last_service_date', label: 'Fecha del último servicio', type: 'date' }, { k: 'farmer_id', label: 'Agricultor', type: 'select', options: farmerOpts, req: true }] },
    transactions: { nav: 'Transacciones', icon: 'swap', title: 'Gestión de transacciones', table: 'Transacciones', singular: 'transacción', add: 'Agregar transacción', analytics: true,
      desc: 'Administrá las transacciones de tu granja: seguí ventas, compras y registros financieros para llevar una contabilidad precisa y planificar mejor tus operaciones agrícolas.', label: (r) => `${LBL.type[r.type].toLowerCase()} de ${money(r.amount)}`,
      cols: [{ h: 'Tipo', t: (r) => LBL.type[r.type], html: (r) => chip(LBL.type[r.type], r.type === 'income' ? 'green' : 'red') }, { h: 'Categoría', t: (r) => r.category }, { h: 'Monto', t: (r) => money(r.amount), s: (r) => r.amount }, { h: 'Fecha', t: (r) => r.date }, { h: 'Descripción', t: (r) => dash(r.description) }, { h: 'Método de pago', t: (r) => LBL.method[r.payment_method] }, { h: 'Estado de pago', t: (r) => LBL.pay[r.payment_status], html: (r) => chip(LBL.pay[r.payment_status], PAY_TONE[r.payment_status]) }, { h: 'Agricultor', t: (r) => fName(r.farmer_id) }, { h: 'Equipo', t: (r) => (r.equipment_id ? eName(r.equipment_id) : '—') }, { h: 'Nº de factura', t: (r) => dash(r.invoice_number) }, { h: 'Proveedor', t: (r) => dash(r.vendor_name) }],
      form: () => [{ k: 'type', label: 'Tipo', type: 'select', options: () => opts(LBL.type), req: true, def: 'income' }, { k: 'category', label: 'Categoría', req: true, list: CATS }, { k: 'amount', label: 'Monto', type: 'number', req: true }, { k: 'date', label: 'Fecha', type: 'date', req: true, def: todayIso() }, { k: 'description', label: 'Descripción' }, { k: 'payment_method', label: 'Método de pago', type: 'select', options: () => opts(LBL.method), req: true, def: 'cash' }, { k: 'payment_status', label: 'Estado de pago', type: 'select', options: () => opts(LBL.pay), req: true, def: 'paid' }, { k: 'farmer_id', label: 'Agricultor', type: 'select', options: farmerOpts, req: true }, { k: 'equipment_id', label: 'Equipo', type: 'select', options: equipOpts, empty: true }, { k: 'invoice_number', label: 'Número de factura' }, { k: 'vendor_name', label: 'Proveedor' }] },
  };
  const PREFIX = { farmers: 'f', fields: 'l', crops: 'c', animals: 'a', equipment: 'e', transactions: 't' }; let uidN = 1000; const uid = (key) => `${PREFIX[key]}${++uidN}`;

  /* ---------- tabla genérica: búsqueda, orden, paginación, menú de acciones ---------- */
  const TS = {}; // estado de cada tabla: texto buscado, orden y página
  let rowMenu = null; const closeMenu = () => { rowMenu?.remove(); rowMenu = null; };
  function renderEntity(view, key) {
    const E = ENT[key]; const st = TS[key] || (TS[key] = { q: '', sort: null, page: 0, size: 10 });
    view.innerHTML = `<div class="page"><div class="card pagehead"><div class="grow" style="min-width:240px"><h2>${ic(E.icon)}${esc(E.title)}</h2><p>${esc(E.desc)}</p></div><div class="acts">${E.analytics ? `<button class="btn btn-outline" data-an>${ic('bars')} Ver análisis</button>` : ''}<button class="btn btn-outline" data-add>${ic('plus')} ${esc(E.add)}</button></div></div>
      <section class="card tablecard"><div class="tc-head"><h2>${esc(E.table)}</h2><input class="input" id="tsearch" type="search" placeholder="Buscar" value="${esc(st.q)}" autocomplete="off" aria-label="Buscar en ${esc(E.table)}"></div><div id="tbody"></div></section></div>`;
    const draw = () => {
      let rows = [...D[key]]; const q = st.q.trim().toLowerCase();
      if (q) rows = rows.filter((r) => E.cols.some((c) => String(c.t(r)).toLowerCase().includes(q)));
      if (st.sort) { const c = E.cols[st.sort.i]; const sv = c.s || c.t; rows.sort((a, b) => { const x = sv(a), y = sv(b); const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es'); return st.sort.dir === 'asc' ? d : -d; }); }
      const paged = D[key].length > 10; const pages = Math.max(1, Math.ceil(rows.length / st.size)); st.page = Math.min(st.page, pages - 1);
      const slice = paged ? rows.slice(st.page * st.size, st.page * st.size + st.size) : rows;
      const head = E.cols.map((c, i) => { const on_ = st.sort && st.sort.i === i; return `<th><button data-sort="${i}">${esc(c.h)}${on_ ? ic(st.sort.dir === 'asc' ? 'up' : 'down') : ''}</button></th>`; }).join('');
      const body = slice.map((r) => `<tr>${E.cols.map((c) => `<td>${c.html ? c.html(r) : esc(c.t(r))}</td>`).join('')}<td class="act"><button class="icon-btn" data-menu="${r._id}" aria-label="Acciones">${ic('dots')}</button></td></tr>`).join('');
      $('#tbody', view).innerHTML = `<div class="table-wrap"><table><thead><tr>${head}<th class="act"></th></tr></thead><tbody>${body || `<tr><td colspan="${E.cols.length + 1}" class="empty">No hay resultados.</td></tr>`}</tbody></table></div>${paged ? `<div class="pager"><div class="row wrap">Página ${st.page + 1} de ${pages}<select class="select" id="psize" aria-label="Filas por página">${[5, 10, 20, 50, 100].map((n) => `<option value="${n}"${n === st.size ? ' selected' : ''}>${n} / página</option>`).join('')}</select></div><div class="row"><button class="btn btn-outline btn-sm" data-pg="-1" ${st.page === 0 ? 'disabled' : ''} aria-label="Anterior">${ic('left')}</button><button class="btn btn-outline btn-sm" data-pg="1" ${st.page >= pages - 1 ? 'disabled' : ''} aria-label="Siguiente">${ic('right')}</button></div></div>` : ''}`;
    };
    draw();
    on(view, 'input', '#tsearch', (e, t) => { st.q = t.value; st.page = 0; draw(); });
    on(view, 'click', '[data-sort]', (e, b) => { const i = +b.dataset.sort; st.sort = !st.sort || st.sort.i !== i ? { i, dir: 'asc' } : st.sort.dir === 'asc' ? { i, dir: 'desc' } : null; draw(); });
    on(view, 'click', '[data-pg]', (e, b) => { st.page += +b.dataset.pg; draw(); });
    on(view, 'change', '#psize', (e, s) => { st.size = +s.value; st.page = 0; draw(); });
    on(view, 'click', '[data-add]', () => openDrawer({ title: `Agregar ${E.singular}`, fields: E.form(false), submit: 'Guardar', onSubmit: (v) => { delete v.password; D[key].unshift({ _id: uid(key), ...v }); toast(`${cap(E.singular)} agregado correctamente.`); draw(); } }));
    on(view, 'click', '[data-an]', () => openAnalytics(key));
    on(view, 'click', '[data-menu]', (e, b) => {
      e.stopPropagation(); const had = rowMenu && rowMenu._for === b; closeMenu(); if (had) return; const r = byId(D[key], b.dataset.menu); const box = b.getBoundingClientRect();
      rowMenu = el('div', 'menu', '<button data-edit>Editar</button><button class="del" data-del>Eliminar</button>'); rowMenu._for = b; document.body.appendChild(rowMenu);
      rowMenu.style.top = `${Math.min(box.bottom + 4, innerHeight - 100)}px`; rowMenu.style.left = `${Math.max(8, box.right - rowMenu.offsetWidth)}px`;
      rowMenu.addEventListener('click', (ev) => {
        const edit = ev.target.closest('[data-edit]'), del = ev.target.closest('[data-del]'); if (!edit && !del) return; closeMenu();
        if (edit) openDrawer({ title: `Editar ${E.singular}`, fields: E.form(true), values: r, submit: 'Guardar', onSubmit: (v) => { Object.assign(r, v); toast(`${cap(E.singular)} actualizado correctamente.`); draw(); } });
        else confirmBox({ title: 'Eliminar', text: `¿Seguro que querés eliminar ${E.label(r)}? Esta acción no se puede deshacer.`, confirm: 'Eliminar', danger: true, onOk: () => { D[key] = D[key].filter((x) => x !== r); toast(`${cap(E.singular)} eliminado correctamente.`); draw(); } });
      });
    });
  }
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  document.addEventListener('click', (e) => { if (rowMenu && !e.target.closest('.menu') && !e.target.closest('[data-menu]')) closeMenu(); });
  window.addEventListener('scroll', closeMenu, true);

  /* =================================================================================================
     Panel
     ================================================================================================= */
  const neo = 'card neo';
  const stat = (c, icon, label, value, sub = '', tint = false) => `<div class="${neo} stat" style="--c:var(--${c})"><span class="ico">${ic(icon)}</span><p class="lbl">${esc(label)}</p><p class="val${tint ? ' tint' : ''}">${value}</p>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>`;
  const chartCard = (tone, icon, title, html) => `<div class="${neo} chartcard"><h3><span class="tone-${tone}">${ic(icon)}</span>${esc(title)}</h3>${html}</div>`;
  function renderDashboard(view) {
    const { fields, crops, animals, equipment, transactions } = D; const now = new Date();
    const totalArea = fields.reduce((a, f) => a + f.area, 0); const active = crops.filter((c) => cropState(c) === 'Activo').length;
    const healthy = animals.filter((a) => a.health_status === 'Sano' || a.health_status === 'Excelente').length; const eqActive = equipment.filter((e) => e.status === 'active').length;
    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0); const expense = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0); const net = income - expense;
    const pending = transactions.filter((t) => t.payment_status === 'pending').length;
    const months = last6(); const flow = months.map((m) => { const rs = transactions.filter((t) => monthKey(t.date) === m); const i = rs.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0); const x = rs.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0); return { i, x, n: i - x }; });
    const recentTx = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const harvests = crops.filter((c) => c.harvest_date && daysFrom(c.harvest_date) >= 0 && daysFrom(c.harvest_date) <= 30).sort((a, b) => a.harvest_date.localeCompare(b.harvest_date)).slice(0, 5);
    const planted = [...crops].sort((a, b) => b.planting_date.localeCompare(a.planting_date)).slice(0, 5);
    const none = (t) => `<p class="muted" style="text-align:center;padding:32px 0">${t}</p>`;
    view.innerHTML = `<div class="page"><div class="card pagehead"><div class="grow"><h2>${ic('dash')}Panel de la granja</h2><p>Un resumen en tiempo real de tu operación: campos, cultivos, ganado, equipos y resultados financieros de un vistazo.</p></div></div>
      <div class="grid g4 section" style="margin-bottom:16px">${stat('blue', 'grid', 'Campos totales', fields.length, `${nf1.format(totalArea)} ha de superficie`)}${stat('green', 'sprout', 'Cultivos totales', crops.length, `${active} cultivos activos`)}${stat('purple', 'paw', 'Animales totales', animals.length, `${healthy} en buen estado`)}${stat('orange', 'wrench', 'Equipos', equipment.length, `${eqActive} activos`)}</div>
      <div class="grid g4 section">${stat('emerald', 'up2', 'Ingresos totales', money(income), '', true)}${stat('red', 'down2', 'Gastos totales', money(expense), '', true)}${stat(net >= 0 ? 'cyan' : 'amber', 'dollar', 'Flujo de caja neto', money(net), '', true)}${stat('yellow', 'activity', 'Pagos pendientes', pending, '', true)}</div>
      <div class="grid g2 section">${chartCard('blue', 'pin', 'Superficie por ubicación', barChart({ labels: desc(sumBy(fields, (f) => f.location, (f) => f.area), 8).map((x) => x.label), series: [{ name: 'Superficie (ha)', color: COLORS[0], values: desc(sumBy(fields, (f) => f.location, (f) => f.area), 8).map((x) => +x.value.toFixed(1)) }], fmt: (v) => `${short(v)} ha`, rotate: true }))}
        ${chartCard('green', 'leaf', 'Distribución de cultivos por tipo', donut(desc(countBy(crops, (c) => c.type))))}</div>
      <div class="section">${chartCard('purple', 'up2', 'Tendencia financiera (últimos 6 meses)', lineChart({ labels: months.map(monthLabel), series: [{ name: 'Ingresos', color: COLORS[0], values: flow.map((f) => f.i) }, { name: 'Gastos', color: COLORS[3], values: flow.map((f) => f.x) }, { name: 'Neto', color: COLORS[1], values: flow.map((f) => f.n) }], fmt: mshort }))}</div>
      <div class="grid g3 section">${chartCard('purple', 'pie', 'Animales por especie', donut(desc(countBy(animals, (a) => a.species))))}
        ${chartCard('orange', 'bars', 'Equipos por estado', barChart({ labels: Object.values(LBL.status), series: [{ name: 'Equipos', color: COLORS[2], values: Object.keys(LBL.status).map((k) => equipment.filter((e) => e.status === k).length) }], height: 240, w: 340 }))}
        ${chartCard('green', 'activity', 'Cronograma de cultivos', barChart({ labels: ['Activos', 'Cosechados'], series: [{ name: 'Cultivos', color: COLORS[1], values: [active, crops.length - active] }], height: 240, w: 340 }))}</div>
      <div class="grid g3"><div class="${neo} chartcard"><h3><span class="tone-blue">${ic('dollar')}</span>Transacciones recientes</h3><div class="activity">${recentTx.map((t) => `<div class="arow" style="--c:var(--${t.type === 'income' ? 'green' : 'red'})"><div class="l"><span class="tone-${t.type === 'income' ? 'green' : 'red'}">${ic(t.type === 'income' ? 'up2' : 'down2')}</span><div><p>${esc(t.category)}</p><small>${shortDate(t.date)}</small></div></div><div class="r"><p class="tone-${t.type === 'income' ? 'green' : 'red'}">${t.type === 'income' ? '+' : '-'}${money(t.amount)}</p><small>${esc(LBL.pay[t.payment_status])}</small></div></div>`).join('') || none('Sin transacciones recientes')}</div></div>
        <div class="${neo} chartcard"><h3><span class="tone-green">${ic('calendar')}</span>Próximas cosechas</h3><div class="activity">${harvests.map((c) => `<div class="arow" style="--c:var(--green)"><div class="l"><span class="tone-green">${ic('sprout')}</span><div><p>${esc(c.name)}</p><small>${esc(c.type)}</small></div></div><div class="r"><p class="tone-green">${shortDate(c.harvest_date)}</p><small>en ${plural(daysFrom(c.harvest_date), 'día', 'días')}</small></div></div>`).join('') || none('No hay cosechas próximas')}</div></div>
        <div class="${neo} chartcard"><h3><span class="tone-purple">${ic('sprout')}</span>Sembrados recientemente</h3><div class="activity">${planted.map((c) => `<div class="arow" style="--c:var(--purple)"><div class="l"><span class="tone-purple">${ic('sprout')}</span><div><p>${esc(c.name)}</p><small>${esc(c.type)}</small></div></div><div class="r"><p class="tone-purple">${shortDate(c.planting_date)}</p><small>hace ${plural(-daysFrom(c.planting_date), 'día', 'días')}</small></div></div>`).join('') || none('Sin siembras recientes')}</div></div></div></div>`;
  }

  /* =================================================================================================
     Análisis: ventana con filtros, indicadores y gráficos de cada entidad
     ================================================================================================= */
  const avg = (rows, f) => (rows.length ? rows.reduce((a, r) => a + f(r), 0) / rows.length : 0);
  const sum = (rows, f) => rows.reduce((a, r) => a + f(r), 0);
  const cf = (c) => byId(D.fields, c.field_id) || { location: '—', soil_type: '—', area: 0 };
  const ageYears = (e) => (new Date() - new Date(`${e.purchase_date}T12:00:00`)) / (365.25 * DAY);
  const AN = {
    fields: { title: 'Análisis de campos', rows: () => D.fields,
      filters: [{ k: 'loc', label: 'Ubicación', all: 'Todas las ubicaciones', get: (r) => r.location }, { k: 'soil', label: 'Tipo de suelo', all: 'Todos los tipos', get: (r) => r.soil_type }, { k: 'farmer', label: 'Agricultor', all: 'Todos los agricultores', get: (r) => fName(r.farmer_id) }],
      kpis: (rs) => [['blue', 'Campos totales', nf0.format(rs.length)], ['green', 'Superficie total', ha(sum(rs, (r) => r.area))], ['purple', 'Superficie promedio', ha(avg(rs, (r) => r.area))]],
      charts: (rs) => [['pin', 'Principales agricultores por superficie', hbars(desc(sumBy(rs, (r) => fName(r.farmer_id), (r) => r.area)), ha)], ['users', 'Principales agricultores por cantidad de campos', hbars(desc(countBy(rs, (r) => fName(r.farmer_id))), (v) => nf0.format(v), COLORS[1])], ['pie', 'Superficie por ubicación', donut(desc(sumBy(rs, (r) => r.location, (r) => r.area)), ha)], ['grid', 'Campos por tipo de suelo', donut(desc(countBy(rs, (r) => r.soil_type)))]] },
    crops: { title: 'Análisis de cultivos', rows: () => D.crops,
      filters: [{ k: 'type', label: 'Tipo de cultivo', all: 'Todos los tipos', get: (r) => r.type }, { k: 'loc', label: 'Ubicación', all: 'Todas las ubicaciones', get: (r) => cf(r).location }, { k: 'soil', label: 'Tipo de suelo', all: 'Todos los tipos', get: (r) => cf(r).soil_type }, { k: 'st', label: 'Estado', all: 'Todos los estados', get: (r) => cropState(r) }],
      kpis: (rs) => [['blue', 'Cultivos totales', nf0.format(rs.length)], ['green', 'Superficie asociada', ha(sum(rs, (r) => cf(r).area))], ['purple', 'Superficie promedio', ha(avg(rs, (r) => cf(r).area))]],
      charts: (rs) => { const ms = last6(); return [['leaf', 'Cultivos por tipo', donut(desc(countBy(rs, (r) => r.type)))], ['pin', 'Superficie por ubicación', barChart({ labels: desc(sumBy(rs, (r) => cf(r).location, (r) => cf(r).area), 8).map((x) => x.label), series: [{ name: 'Superficie (ha)', color: COLORS[0], values: desc(sumBy(rs, (r) => cf(r).location, (r) => cf(r).area), 8).map((x) => +x.value.toFixed(1)) }], fmt: (v) => `${short(v)} ha`, rotate: true })], ['calendar', 'Cronograma de siembra', lineChart({ labels: ms.map(monthLabel), series: [{ name: 'Siembras', color: COLORS[1], values: ms.map((m) => rs.filter((r) => monthKey(r.planting_date) === m).length) }], fmt: (v) => nf0.format(v), height: 260, w: 520 })], ['activity', 'Cultivos por estado', donut(countBy(rs, cropState))]]; } },
    animals: { title: 'Análisis de animales', rows: () => D.animals,
      filters: [{ k: 'sp', label: 'Especie', all: 'Todas las especies', get: (r) => r.species }, { k: 'h', label: 'Estado de salud', all: 'Todos los estados', get: (r) => r.health_status }, { k: 'farmer', label: 'Agricultor', all: 'Todos los agricultores', get: (r) => fName(r.farmer_id) }],
      kpis: (rs) => { const ok = rs.filter((r) => r.health_status === 'Sano' || r.health_status === 'Excelente').length; return [['blue', 'Animales totales', nf0.format(rs.length)], ['green', 'En buen estado', nf0.format(ok), rs.length ? `${Math.round((ok / rs.length) * 100)}% del total` : ''], ['purple', 'Peso promedio', kg(avg(rs, (r) => r.weight))], ['orange', 'Peso total', `${nf1.format(sum(rs, (r) => r.weight) / 1000)} t`]]; },
      charts: (rs) => [['pie', 'Distribución por especie', donut(desc(countBy(rs, (r) => r.species)))], ['activity', 'Estado de salud', donut(desc(countBy(rs, (r) => r.health_status)))], ['users', 'Principales agricultores por cantidad de animales', hbars(desc(countBy(rs, (r) => fName(r.farmer_id))), (v) => nf0.format(v), COLORS[4])], ['bars', 'Peso promedio por especie', (() => { const g = [...new Set(rs.map((r) => r.species))].map((s) => ({ label: s, value: avg(rs.filter((r) => r.species === s), (r) => r.weight) })); return barChart({ labels: g.map((x) => x.label), series: [{ name: 'Peso promedio (kg)', color: COLORS[4], values: g.map((x) => +x.value.toFixed(1)) }], fmt: (v) => `${short(v)} kg`, height: 240 }); })()]] },
    equipment: { title: 'Análisis de equipos', rows: () => D.equipment,
      filters: [{ k: 'type', label: 'Tipo', all: 'Todos los tipos', get: (r) => r.type }, { k: 'st', label: 'Estado', all: 'Todos los estados', get: (r) => LBL.status[r.status] }, { k: 'farmer', label: 'Agricultor', all: 'Todos los agricultores', get: (r) => fName(r.farmer_id) }],
      kpis: (rs) => { const a = rs.filter((r) => r.status === 'active').length; return [['blue', 'Equipos totales', nf0.format(rs.length)], ['green', 'Equipos activos', nf0.format(a), rs.length ? `${Math.round((a / rs.length) * 100)}% del total` : ''], ['amber', 'En mantenimiento', nf0.format(rs.filter((r) => r.status === 'maintenance').length)], ['purple', 'Antigüedad promedio', `${nf1.format(avg(rs, ageYears))} años`]]; },
      charts: (rs) => [['wrench', 'Equipos por tipo', donut(desc(countBy(rs, (r) => r.type)))], ['activity', 'Equipos por estado', donut(countBy(rs, (r) => LBL.status[r.status]))], ['users', 'Equipos por agricultor (los 10 principales)', hbars(desc(countBy(rs, (r) => fName(r.farmer_id))), (v) => nf0.format(v), COLORS[2])], ['calendar', 'Antigüedad promedio por tipo', (() => { const g = [...new Set(rs.map((r) => r.type))].map((t) => ({ label: t, value: avg(rs.filter((r) => r.type === t), ageYears) })); return barChart({ labels: g.map((x) => x.label), series: [{ name: 'Años', color: COLORS[5], values: g.map((x) => +x.value.toFixed(1)) }], fmt: (v) => `${short(v)} a.`, height: 240, rotate: true }); })()]] },
    transactions: { title: 'Análisis de transacciones', rows: () => D.transactions,
      filters: [{ k: 'type', label: 'Tipo', all: 'Todos los tipos', get: (r) => LBL.type[r.type] }, { k: 'cat', label: 'Categoría', all: 'Todas las categorías', get: (r) => r.category }, { k: 'm', label: 'Método de pago', all: 'Todos los métodos', get: (r) => LBL.method[r.payment_method] }, { k: 'p', label: 'Estado de pago', all: 'Todos los estados', get: (r) => LBL.pay[r.payment_status] }, { k: 'farmer', label: 'Agricultor', all: 'Todos los agricultores', get: (r) => fName(r.farmer_id) }],
      kpis: (rs) => { const i = sum(rs.filter((r) => r.type === 'income'), (r) => r.amount); const x = sum(rs.filter((r) => r.type === 'expense'), (r) => r.amount); return [['emerald', 'Ingresos totales', money(i), `${rs.filter((r) => r.type === 'income').length} transacciones`], ['red', 'Gastos totales', money(x), `${rs.filter((r) => r.type === 'expense').length} transacciones`], ['cyan', 'Resultado neto', money(i - x)], ['purple', 'Transacción promedio', money(avg(rs, (r) => r.amount))]]; },
      charts: (rs) => { const ms = last6(); const cats = desc(sumBy(rs, (r) => r.category, (r) => r.amount)).map((x) => x.label); const tot = (c, t) => sum(rs.filter((r) => r.category === c && r.type === t), (r) => r.amount);
        return [['up2', 'Tendencia mensual', lineChart({ labels: ms.map(monthLabel), series: [{ name: 'Ingresos', color: COLORS[0], values: ms.map((m) => sum(rs.filter((r) => monthKey(r.date) === m && r.type === 'income'), (r) => r.amount)) }, { name: 'Gastos', color: COLORS[3], values: ms.map((m) => sum(rs.filter((r) => monthKey(r.date) === m && r.type === 'expense'), (r) => r.amount)) }], fmt: mshort, height: 260, w: 520 })],
          ['bars', 'Ingresos y gastos por categoría (las 10 principales)', barChart({ labels: cats, series: [{ name: 'Ingresos', color: COLORS[0], values: cats.map((c) => tot(c, 'income')) }, { name: 'Gastos', color: COLORS[3], values: cats.map((c) => tot(c, 'expense')) }], fmt: mshort, rotate: true, height: 300 })],
          ['users', 'Principales agricultores por volumen (los 10 principales)', hbars(desc(sumBy(rs, (r) => fName(r.farmer_id), (r) => r.amount)), money, COLORS[4])], ['dollar', 'Métodos de pago', donut(desc(countBy(rs, (r) => LBL.method[r.payment_method]))) ], ['activity', 'Estado de pago', donut(desc(countBy(rs, (r) => LBL.pay[r.payment_status])))]]; } },
  };
  function openAnalytics(key) {
    const A = AN[key]; const all = A.rows(); const sel = {}; const ov = el('div', 'overlay');
    ov.innerHTML = `<div class="card analytics" role="dialog" aria-label="${esc(A.title)}"><div class="ah"><h2>${ic('bars')}${esc(A.title)}</h2><button class="icon-btn" data-x aria-label="Cerrar">${ic('x')}</button></div><div class="ab"><div class="filters">${A.filters.map((f) => `<div class="flt"><label for="an-${f.k}">${esc(f.label)}:</label><select class="select" id="an-${f.k}" data-f="${f.k}"><option value="all">${esc(f.all)}</option>${[...new Set(all.map(f.get))].sort((a, b) => String(a).localeCompare(String(b), 'es')).map((v) => `<option>${esc(v)}</option>`).join('')}</select></div>`).join('')}</div><div id="an-body" class="stack"></div></div></div>`;
    document.body.appendChild(ov); const close = () => ov.remove(); ov._esc = close; ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); }); ov.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
    const draw = () => { const rs = all.filter((r) => A.filters.every((f) => !sel[f.k] || sel[f.k] === 'all' || String(f.get(r)) === sel[f.k]));
      $('#an-body', ov).innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${A.kpis(rs).map(([c, l, v, s]) => `<div class="kpi" style="--c:var(--${c})"><p>${esc(l)}</p><b>${esc(v)}</b>${s ? `<small>${esc(s)}</small>` : ''}</div>`).join('')}</div><div class="grid g2">${A.charts(rs).map(([i, t, h]) => `<div class="card acard"><h3>${ic(i)}${esc(t)}</h3>${h}</div>`).join('')}</div>`; };
    on(ov, 'change', '[data-f]', (e, s) => { sel[s.dataset.f] = s.value; draw(); }); draw();
  }

  /* =================================================================================================
     Estructura de la aplicación y navegación
     ================================================================================================= */
  const NAV = [['', 'Inicio', 'house', 'Panel'], ...Object.entries(ENT).map(([k, e]) => [k, e.nav, e.icon, e.title])];
  const app = $('#app'); let current = '';
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  const setHash = (h) => { try { history.replaceState(null, '', `#/${h}`); } catch (e) { /* el hash no se puede cambiar dentro de algunos visores */ } };
  function build() {
    app.innerHTML = `<div class="demobar"><span>Demostración interactiva de <b>Smart Farm Manager</b> · los datos son de ejemplo y no se guardan</span><button data-reset>Reiniciar datos</button></div>
      <header class="topbar"><div class="brand"><button class="icon-btn menu-btn" data-navtoggle aria-label="Abrir el menú">${ic('menu')}</button><img src="assets/logo.png" alt="" width="36" height="36"><h1 id="ttl">Panel</h1></div><div class="row"><span class="date">${isoOf(new Date())}</span><button class="icon-btn" data-theme aria-label="Cambiar el tema" id="themebtn">${ic(isDark() ? 'sun' : 'moon')}</button></div></header>
      <div class="layout"><aside class="sidebar" id="side"><nav class="nav" id="nav">${NAV.map(([k, label, icon]) => `<a data-go="${k}" href="#/${k}">${ic(icon)}<span>${esc(label)}</span></a>`).join('')}</nav><div class="userbox"><span class="avatar">U</span><div class="grow"><b>Usuario demo</b><span class="small">usuario@ejemplo.com</span></div></div></aside><main class="main" id="view"></main></div>`;
  }
  function go(name) {
    const route = NAV.find((n) => n[0] === name) || NAV[0]; current = route[0]; setHash(current); document.body.classList.remove('nav-open'); closeMenu();
    $$('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.go === current)); $('#ttl').textContent = route[3];
    const view = $('#view'); const fresh = view.cloneNode(false); view.replaceWith(fresh); // quita los eventos de la pantalla anterior
    if (current === '') renderDashboard(fresh); else renderEntity(fresh, current); window.scrollTo(0, 0);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.dataset.go); return; }
    if (e.target.closest('[data-navtoggle]')) { document.body.classList.toggle('nav-open'); return; }
    if (document.body.classList.contains('nav-open') && !e.target.closest('.sidebar')) document.body.classList.remove('nav-open');
    if (e.target.closest('[data-theme]')) { document.documentElement.dataset.theme = isDark() ? 'light' : 'dark'; $('#themebtn').innerHTML = ic(isDark() ? 'sun' : 'moon'); return; }
    if (e.target.closest('[data-reset]')) { D = seedData(); Object.keys(TS).forEach((k) => delete TS[k]); $$('.overlay').forEach((o) => o.remove()); go(current); toast('Se restauraron los datos de ejemplo.', 'info'); }
  });

  build();
  let start = ''; try { start = location.hash.replace(/^#\/?/, ''); } catch (e) { start = ''; }
  go(start);
})();
