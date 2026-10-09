/* Núcleo de la demostración: ayudas de pantalla, ventanas, avisos, gráficos, recibo y envío del recibo. */
(function () {
  const P = window.Plexi;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  P.$ = $; P.$$ = $$;

  P.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esc = P.esc;
  P.icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${window.ICONS[name] || ''}</svg>`;
  const icon = P.icon;

  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  P.num = (n) => nf.format(Math.round(n || 0));
  P.money = (n) => `${n < 0 ? '-' : ''}$ ${nf.format(Math.abs(Math.round(n || 0)))}`;
  const dfmt = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const tfmt = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  P.date = (t) => dfmt.format(new Date(t));
  P.time = (t) => tfmt.format(new Date(t));
  P.dateTime = (t) => `${P.date(t)} ${P.time(t)}`;
  P.dayStart = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  P.isToday = (t) => P.dayStart(t) === P.dayStart();
  P.DAY = 86400000;
  P.WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  P.PAY = { cash: 'Efectivo', debit: 'Tarjeta de débito', credit: 'Tarjeta de crédito', transfer: 'Transferencia', mp: 'Mercado Pago', account: 'Cuenta corriente' };
  P.PAY_ICON = { cash: 'banknote', debit: 'credit-card', credit: 'credit-card', transfer: 'arrow-left-right', mp: 'smartphone', account: 'hand-coins' };
  P.uid = (p = 'x') => `${p}${++P.S.seq}`;
  P.initials = (name) => String(name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  /* ---------- estado ---------- */
  P.get = (id) => P.S.products.find((p) => p.id === id);
  P.customer = (id) => P.S.customers.find((c) => c.id === id);
  P.balance = (c) => c.ledger.reduce((s, e) => s + (e.type === 'payment' ? -e.amount : e.amount), 0);
  P.overdueSince = (c) => { const b = P.balance(c); if (b <= 0) return 0; let owed = b; const charges = c.ledger.filter((e) => e.type !== 'payment').sort((a, b2) => b2.date - a.date); for (const ch of charges) { owed -= ch.amount; if (owed <= 0) return ch.date; } return charges.at(-1)?.date || 0; };
  P.isOverdue = (c) => { const s = P.overdueSince(c); return P.balance(c) > 0 && s && Date.now() - s > P.S.settings.overdueDays * P.DAY; };
  P.fields = () => P.TYPES[P.S.type].fields;
  P.hasRole = (...roles) => roles.includes(P.S.user?.role);
  P.log = (action, text, module) => { P.S.logs.unshift({ action, text, module, user: P.S.user?.name || 'Sistema', date: Date.now() }); if (P.refreshBell) P.refreshBell(); };
  P.lowStock = () => P.S.products.filter((p) => !p.archived && p.stock <= p.min);
  P.notify = (title, message) => { P.S.notifications.unshift({ title, message, date: Date.now() }); };

  /* ---------- eventos con delegación ---------- */
  P.on = (root, event, selector, fn) => root.addEventListener(event, (e) => { const el = e.target.closest(selector); if (el && root.contains(el)) fn(e, el); });

  /* ---------- avisos ---------- */
  P.toast = (msg, kind = 'ok') => {
    let box = $('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = `toast ${kind === 'ok' ? '' : kind}`;
    t.innerHTML = `${icon(kind === 'ok' ? 'circle-check' : kind === 'bad' ? 'triangle-alert' : 'info')}<div>${esc(msg)}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3800);
  };

  /* ---------- ventanas ---------- */
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const all = $$('.overlay'); if (all.length) all.at(-1)._close(); } });
  P.modal = (o) => {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="dialog ${o.size || ''}" role="dialog" aria-label="${esc(o.title)}"><div class="dialog-h"><div><h2>${esc(o.title)}</h2>${o.subtitle ? `<p>${esc(o.subtitle)}</p>` : ''}</div><button class="btn btn-ghost btn-icon" data-close aria-label="Cerrar">${icon('x')}</button></div><div class="dialog-b">${o.body || ''}</div></div>`;
    document.body.appendChild(ov);
    const m = { el: ov, body: $('.dialog-b', ov), $: (s) => $(s, ov), $$: (s) => $$(s, ov), on: (ev, sel, fn) => P.on(ov, ev, sel, fn), close() { ov.remove(); o.onClose && o.onClose(); }, set(html) { m.body.innerHTML = html; } };
    ov._close = m.close;
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) m.close(); });
    P.on(ov, 'click', '[data-close]', () => m.close());
    return m;
  };
  P.confirm = (title, message, label, fn, danger = true) => {
    const m = P.modal({ title, size: 'narrow', body: `<p class="muted">${esc(message)}</p><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(label)}</button></div>` });
    m.on('click', '[data-ok]', () => { m.close(); fn(); });
  };

  /* ---------- tabla con paginación simple ---------- */
  P.table = (cols, rows, o = {}) => {
    if (!rows.length) return `<div class="empty">${esc(o.empty || 'No hay nada para mostrar.')}</div>`;
    return `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th class="${c.num ? 'num' : ''} ${c.cls || ''}">${esc(c.h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${o.click ? 'click' : ''}" ${o.click ? `data-row="${i}"` : ''}>${cols.map((c) => `<td class="${c.num ? 'num' : ''} ${c.cls || ''}">${c.r(r, i)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };
  P.pager = (page, total, size) => { const pages = Math.max(1, Math.ceil(total / size)); return `<div class="pager"><span>${total} resultados · página ${page} de ${pages}</span><span class="row"><button class="btn btn-outline btn-sm" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Anterior</button><button class="btn btn-outline btn-sm" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>Siguiente</button></span></div>`; };
  P.tabs = (list, on) => `<div class="tabs" role="tablist">${list.map(([k, l, n]) => `<button class="tab ${k === on ? 'on' : ''}" role="tab" data-tab="${k}">${esc(l)}${n ? `<span class="dot">${n}</span>` : ''}</button>`).join('')}</div>`;
  P.statusBadge = (s) => ({ completed: '<span class="badge ok">Completada</span>', refunded: '<span class="badge bad">Reembolsada</span>', partial: '<span class="badge warn">Reembolso parcial</span>' }[s] || `<span class="badge">${esc(s)}</span>`);
  P.page = (title, sub, ico, actions = '') => `<div class="page-h"><div><h1>${icon(ico)} ${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div><div class="row wrap">${actions}</div></div>`;
  P.kpi = (ico, label, value, sub = '', tone = '') => `<div class="kpi"><div class="ic ${tone}">${icon(ico)}</div><div class="grow"><div class="l">${esc(label)}</div><div class="v">${value}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div></div>`;
  P.csv = (rows, name) => {
    const text = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ---------- gráficos SVG sin librerías ---------- */
  const niceMax = (v) => { if (v <= 0) return 1; const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
  const short = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.0', '')} M` : v >= 1e3 ? `${Math.round(v / 1e3)} mil` : String(Math.round(v)));
  P.barChart = (items, o = {}) => {
    const W = o.w || 720, H = o.h || 200, L = 46, B = 24, T = 8, R = 8;
    const max = niceMax(Math.max(...items.map((i) => i.value), 1));
    const bw = (W - L - R) / items.length;
    const y = (v) => T + (H - T - B) * (1 - v / max);
    const grid = [0, 1, 2, 3, 4].map((k) => { const v = (max / 4) * k; return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e4d9bd" stroke-dasharray="3 3"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`; }).join('');
    const step = Math.ceil(items.length / 12);
    const bars = items.map((it, i) => `<rect x="${L + i * bw + bw * 0.15}" y="${y(it.value)}" width="${bw * 0.7}" height="${Math.max(0, H - B - y(it.value))}" rx="4" fill="${o.color || '#1f4a38'}"><title>${esc(it.label)}: ${P.money(it.value)}</title></rect>${i % step === 0 ? `<text x="${L + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(it.label)}</text>` : ''}`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${grid}${bars}</svg>`;
  };
  P.lineChart = (items, o = {}) => {
    const W = o.w || 720, H = o.h || 200, L = 46, B = 24, T = 8, R = 10;
    const max = niceMax(Math.max(...items.map((i) => i.value), 1));
    const x = (i) => L + ((W - L - R) * i) / Math.max(1, items.length - 1);
    const y = (v) => T + (H - T - B) * (1 - v / max);
    const pts = items.map((it, i) => `${x(i)},${y(it.value)}`).join(' ');
    const grid = [0, 1, 2, 3, 4].map((k) => { const v = (max / 4) * k; return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e4d9bd" stroke-dasharray="3 3"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`; }).join('');
    const step = Math.ceil(items.length / 10);
    const labels = items.map((it, i) => (i % step === 0 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(it.label)}</text>` : '')).join('');
    const dots = items.map((it, i) => `<circle cx="${x(i)}" cy="${y(it.value)}" r="3.5" fill="#d4a24c"><title>${esc(it.label)}: ${P.money(it.value)}</title></circle>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${grid}<polygon points="${L},${H - B} ${pts} ${x(items.length - 1)},${H - B}" fill="rgba(31,74,56,.10)"/><polyline points="${pts}" fill="none" stroke="#1f4a38" stroke-width="2.5" stroke-linejoin="round"/>${dots}${labels}</svg>`;
  };
  const PALETTE = ['#1f4a38', '#d4a24c', '#3f7ca8', '#c4572f', '#8f6aa8', '#7a7f87'];
  P.donut = (items) => {
    const total = items.reduce((s, i) => s + i.value, 0) || 1; let a0 = -Math.PI / 2; const R = 70, r = 44, c = 90;
    const arcs = items.map((it, i) => {
      const a1 = a0 + (it.value / total) * Math.PI * 2 - 0.0001; const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (rad, a) => `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`;
      const d = `M${p(R, a0)} A${R},${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 ${large} 0 ${p(r, a0)} Z`; a0 = a1 + 0.0001;
      return `<path d="${d}" fill="${PALETTE[i % PALETTE.length]}"><title>${esc(it.label)}: ${P.money(it.value)}</title></path>`;
    }).join('');
    return `<div class="row gap16 wrap"><svg viewBox="0 0 180 180" width="170" height="170" role="img">${arcs}<text x="90" y="86" text-anchor="middle" style="font-size:10px">Total</text><text x="90" y="102" text-anchor="middle" style="font-size:12px;font-weight:600;fill:#12271d">${short(total)}</text></svg><div class="legend stack s2" style="flex-direction:column">${items.map((it, i) => `<span><i style="background:${PALETTE[i % PALETTE.length]}"></i>${esc(it.label)} · ${Math.round((it.value / total) * 100)} %</span>`).join('')}</div></div>`;
  };
  P.hbars = (items, fmt = P.money) => { const max = Math.max(...items.map((i) => i.value), 1); return items.map((it) => `<div class="list-row"><div class="grow"><div class="row between small"><span class="clip">${esc(it.label)}</span><b>${fmt(it.value)}</b></div><div class="bar mt8"><i style="width:${(it.value / max) * 100}%"></i></div></div></div>`).join(''); };

  /* ---------- QR de ejemplo (dibujo, no es un QR real) ---------- */
  P.qr = (text, size = 168) => {
    let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const n = 25; let cells = '';
    const finder = (x0, y0) => `<rect x="${x0}" y="${y0}" width="7" height="7" fill="#12271d"/><rect x="${x0 + 1}" y="${y0 + 1}" width="5" height="5" fill="#fff"/><rect x="${x0 + 2}" y="${y0 + 2}" width="3" height="3" fill="#12271d"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#12271d"/>`;
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Código QR de ejemplo"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/>${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
  };

  /* ---------- recibo ---------- */
  P.receiptHtml = (s) => {
    const st = P.S.settings;
    const onAcc = s.payments.filter((p) => p.method === 'account').reduce((a, p) => a + p.amount, 0);
    return `<div class="ticket print-area"><div class="c"><img class="lg" src="assets/logo-dark.png" alt=""><div class="ttl">${esc(st.storeName.toUpperCase())}</div>${st.tagline ? `<div class="m">${esc(st.tagline)}</div>` : ''}<div class="m">${esc(st.address)}</div><div class="m">${esc(st.phone)}</div></div><hr>
      <div class="r"><span>Factura</span><b>${esc(s.no)}</b></div><div class="r"><span>Fecha</span><span>${P.date(s.date)}</span></div><div class="r"><span>Hora</span><span>${P.time(s.date)}</span></div><div class="r"><span>Cajero</span><span>${esc(s.cashier)}</span></div><div class="r"><span>Cliente</span><span>${esc(s.customerName)}</span></div><hr>
      ${s.items.map((l) => `<div><b>${esc(l.name)}${l.size ? ` (${esc(l.size)})` : ''}</b></div><div class="r m"><span>${l.qty} × ${P.money(l.price)}</span><span>${P.money(l.price * l.qty)}</span></div>`).join('')}<hr>
      <div class="r"><span>Subtotal</span><span>${P.money(s.subtotal)}</span></div>
      ${s.discount ? `<div class="r g"><span>Descuento${s.couponCode ? ` (${esc(s.couponCode)})` : ''}</span><span>-${P.money(s.discount)}</span></div>` : ''}
      ${s.pointsDiscount ? `<div class="r g"><span>Puntos canjeados (${s.pointsRedeemed})</span><span>-${P.money(s.pointsDiscount)}</span></div>` : ''}
      <div class="r"><span>Impuesto (${s.taxRate}%)</span><span>${P.money(s.tax)}</span></div><div class="r big"><span>TOTAL</span><span>${P.money(s.total)}</span></div>
      <div class="r m"><span>Pago</span><span>${s.payments.map((p) => P.PAY[p.method]).join(' + ')}</span></div>
      ${s.change > 0 ? `<div class="r"><span>Vuelto</span><span>${P.money(s.change)}</span></div>` : ''}
      ${onAcc ? `<div class="r"><b>A cuenta corriente</b><b>${P.money(onAcc)}</b></div>` : ''}
      ${s.payments.filter((p) => p.ref).map((p) => `<div class="r m"><span>Operación de ${P.PAY[p.method]}</span><span>${esc(p.ref)}</span></div>`).join('')}
      ${s.pointsEarned ? `<div class="r m"><span>Puntos ganados</span><span>+${s.pointsEarned}</span></div>` : ''}
      <div class="c" style="margin-top:10px">${P.qr(s.no, 78)}<div><b>${esc(st.receiptFooter)}</b></div><div class="m" style="font-size:10px">${esc(st.returnPolicy)}</div></div></div>`;
  };
  P.receiptText = (s, bold = true) => {
    const st = P.S.settings; const b = (t) => (bold ? `*${t}*` : t);
    const L = [b(st.storeName), `Recibo ${s.no}`, P.dateTime(s.date)];
    if (s.customerId) L.push(`Cliente: ${s.customerName}`);
    L.push('', ...s.items.map((l) => `• ${l.qty} × ${l.name}${l.size ? ` (${l.size})` : ''} — ${P.money(l.price * l.qty)}`), '', `Subtotal: ${P.money(s.subtotal)}`);
    if (s.discount) L.push(`Descuento${s.couponCode ? ` (${s.couponCode})` : ''}: -${P.money(s.discount)}`);
    if (s.pointsDiscount) L.push(`Puntos canjeados (${s.pointsRedeemed}): -${P.money(s.pointsDiscount)}`);
    L.push(`Impuesto (${s.taxRate}%): ${P.money(s.tax)}`, b(`TOTAL: ${P.money(s.total)}`), `Pago: ${s.payments.map((p) => `${P.PAY[p.method]} ${P.money(p.amount)}`).join(' + ')}`);
    const acc = s.payments.filter((p) => p.method === 'account').reduce((a, p) => a + p.amount, 0);
    if (acc) L.push(`Quedó en tu cuenta corriente: ${P.money(acc)}`);
    if (s.pointsEarned) L.push(`Puntos ganados: ${s.pointsEarned}`);
    L.push('', st.receiptFooter);
    return L.join('\n');
  };
  P.receiptDialog = (s) => {
    const m = P.modal({ title: 'Recibo', subtitle: s.no, body: `${P.receiptHtml(s)}<div class="dialog-f"><button class="btn btn-outline" data-send>${icon('send')} Enviar recibo</button><button class="btn btn-outline" data-pdf>${icon('download')} PDF</button><button class="btn btn-primary" data-print>${icon('printer')} Imprimir recibo</button></div>` });
    m.on('click', '[data-send]', () => P.sendReceiptDialog(s));
    m.on('click', '[data-pdf]', () => { P.toast('En el programa real se descarga el recibo en PDF (formato ticket de 80 mm).', 'info'); });
    m.on('click', '[data-print]', () => window.print());
    return m;
  };

  /* ---------- “WhatsApp” y “correo” simulados ---------- */
  P.waDialog = (phone, text, title = 'WhatsApp') => {
    const num = String(phone || '').replace(/\D/g, '');
    P.modal({ title, subtitle: 'Así se ve: en el programa real se abre WhatsApp con el mensaje ya escrito', size: 'narrow', body: `<div class="phone"><div class="bar-t"><span class="avatar" style="width:28px;height:28px">${icon('user')}</span><div><b style="font-size:13px">+${esc(num || '54 9 11 …')}</b><div style="font-size:10px;opacity:.8">en línea</div></div></div><div class="chat"><div class="bubble">${esc(text)}<div class="tm">${P.time(Date.now())} ✓✓</div></div></div></div><p class="hint center">Vos solo le das «enviar»: Plexi deja el número y el texto listos.</p>` });
  };
  P.mailDialog = (to, subject, text, withPdf) => {
    P.modal({ title: 'Correo enviado', subtitle: 'Vista de lo que recibe el cliente', size: 'wide', body: `<div class="mail"><div class="hd"><b>De:</b> ${esc(P.S.settings.storeName)} &lt;${esc(P.S.settings.mailFrom || 'tienda@ejemplo.com')}&gt;<br><b>Para:</b> ${esc(to)}<br><b>Asunto:</b> ${esc(subject)}${withPdf ? `<br><b>Adjunto:</b> ${icon('file-text')} recibo.pdf` : ''}</div><div class="bd"><div class="center"><img src="assets/logo-dark.png" alt="" style="height:46px"></div><pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.55">${esc(text)}</pre></div></div>` });
  };
  P.sendReceiptDialog = (s) => {
    const c = s.customerId ? P.customer(s.customerId) : null;
    const cfg = P.S.settings;
    const m = P.modal({ title: 'Enviar recibo', subtitle: s.no, body: `<div class="stack s3">
      <section class="stack"><h3 class="row" style="font-size:14px">${icon('message-circle')} Por WhatsApp</h3><div class="field"><label>Teléfono del cliente</label><input class="input" id="wa-phone" value="${esc(c?.phone || '')}" placeholder="11 5555 1234" inputmode="tel"></div><p class="hint" style="margin:0">Con código de área y sin el 15. Se abre WhatsApp con el recibo escrito y vos le das enviar.</p><div class="row end wrap"><button class="btn btn-outline" data-copy>${icon('copy')} Copiar mensaje</button><button class="btn btn-primary" data-wa>${icon('message-circle')} Abrir WhatsApp</button></div></section>
      <section class="stack" style="border-top:1px solid var(--line);padding-top:16px"><h3 class="row" style="font-size:14px">${icon('mail')} Por correo</h3><div class="field"><label>Correo del cliente</label><input class="input" id="mail-to" type="email" value="${esc(c?.email || '')}" placeholder="cliente@ejemplo.com"></div>
      ${cfg.mailConnected ? `<label class="row small"><input type="checkbox" id="mail-pdf" checked style="accent-color:var(--brand)"> Adjuntar el recibo en PDF</label><p class="hint" style="margin:0">Plexi lo manda desde <b>${esc(cfg.mailFrom)}</b> con el recibo escrito en el mensaje.</p><div class="row end"><button class="btn btn-primary" data-mail>${icon('send')} Enviar por correo</button></div>`
        : `<div class="notice">Plexi todavía no tiene una cuenta de correo para mandar solo. Se carga en <b>Configuración → Correo</b> (probalo en la demo con el administrador). Mientras tanto se abre el mensaje en tu programa de correo.</div><div class="row end"><button class="btn btn-outline" data-mailto>${icon('mail')} Abrir en mi programa de correo</button></div>`}</section></div>` });
    const text = P.receiptText(s);
    m.on('click', '[data-copy]', async () => { try { await navigator.clipboard.writeText(text); P.toast('Mensaje copiado.'); } catch { P.toast('No se pudo copiar en esta demo.', 'warn'); } });
    m.on('click', '[data-wa]', () => { const ph = m.$('#wa-phone').value; if (ph.replace(/\D/g, '').length < 8) return P.toast('El teléfono parece incompleto: escribilo con el código de área.', 'bad'); m.close(); P.waDialog(`54 9 ${ph.replace(/\D/g, '').replace(/^0+/, '')}`, text, 'Recibo por WhatsApp'); P.log('RECEIPT_SHARED', `Recibo ${s.no} enviado por WhatsApp`, 'Ventas'); });
    const okMail = () => /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(m.$('#mail-to').value.trim());
    m.on('click', '[data-mail]', () => { if (!okMail()) return P.toast('Escribí una sola dirección, por ejemplo cliente@ejemplo.com.', 'bad'); const to = m.$('#mail-to').value.trim(); const pdf = m.$('#mail-pdf').checked; m.close(); P.toast(`Recibo enviado a ${to}.`); P.mailDialog(to, `Tu recibo ${s.no} de ${cfg.storeName}`, P.receiptText(s, false), pdf); P.log('RECEIPT_EMAILED', `Recibo ${s.no} enviado a ${to}`, 'Ventas'); });
    m.on('click', '[data-mailto]', () => { if (!okMail()) return P.toast('Escribí una dirección de correo válida.', 'bad'); P.toast('En el programa real se abre tu programa de correo con el mensaje ya escrito.', 'info'); });
  };

  /* ---------- venta: cálculo común ---------- */
  P.coupon = (code, subtotal, customer, cartCats) => {
    const d = P.S.discounts.find((x) => x.code === String(code || '').trim().toUpperCase());
    if (!d) return { error: 'Ese cupón no existe.' };
    if (!d.active) return { error: 'Ese cupón está inactivo.' };
    if (subtotal < d.min) return { error: `Este cupón pide una compra mínima de ${P.money(d.min)}.` };
    if (d.scope === 'members' && !(customer && customer.member)) return { error: 'Este cupón es solo para clientes con membresía: elegí un cliente.' };
    if (d.scope === 'category' && !cartCats.includes(d.category)) return { error: `Este cupón aplica a la categoría ${d.category}.` };
    const amount = d.type === 'flat' ? Math.min(d.value, subtotal) : Math.round((subtotal * d.value) / 100);
    return { d, amount };
  };
})();
