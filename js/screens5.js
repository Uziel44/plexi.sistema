/* Pantalla: Factory (solo en el rubro Fábrica). Junta en una sola pantalla, con ocho pestañas, los 23 módulos de Odoo 20.0 de Inventario, fabricación y mantenimiento.
   Este archivo tiene el esqueleto (P.fac), los datos base y las cuatro pestañas de inventario: Depósitos, Valuación y costos, Códigos de barras y Envíos.
   Las pestañas de fabricación (Producción, Subcontratación, Mantenimiento y Reparaciones) están en screens6.js y se suman con P.fac.tab().
   No duplica datos: parte de los productos, el stock, los movimientos, los proveedores y los gastos que ya existen, y cuando mueve stock deja el movimiento en Inventario. */
(function () {
  const P = window.Plexi;
  const { esc, icon, money, $ } = P;
  P.screens = P.screens || {};
  const DAY = P.DAY;
  const pad = (n, len) => String(n).padStart(len, '0');
  const sum = (list, fn) => list.reduce((a, x) => a + fn(x), 0);
  const F = (P.fac = { tabs: [], seeders: [], post: [], pad, sum });

  /* ---------- ayudas compartidas con screens6.js ---------- */
  const UNIT = { Unidad: 'u.', Kg: 'kg', Metro: 'm', Litro: 'L', Caja: 'cajas' };
  const UNIT_KG = { Unidad: 0.5, Kg: 1, Metro: 0.4, Litro: 1, Caja: 6 };
  F.KIND = { fin: 'Producto terminado', semi: 'Semielaborado', raw: 'Materia prima', sup: 'Insumo', part: 'Repuesto' };
  F.kind = (p) => ({ 'Productos terminados': 'fin', Semielaborados: 'semi', 'Materias primas': 'raw', Insumos: 'sup', Repuestos: 'part' }[p.category] || 'fin');
  F.q = (p, n) => `${P.num(n)} ${UNIT[p.size] || 'u.'}`;
  F.byName = (name) => P.S.products.find((p) => p.name === name);
  F.live = () => P.S.products.filter((p) => !p.archived);
  F.no = (f, key, prefix) => `${prefix}-${pad(++f.seq[key], 4)}`;
  F.opt = (list, sel, label) => list.map((x) => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  F.chips = (attr, views, cur) => `<div class="row wrap mb">${views.map(([k, l, n]) => `<button class="chip ${k === cur ? 'on' : ''}" ${attr}="${k}">${esc(l)}${n ? ` · ${n}` : ''}</button>`).join('')}</div>`;
  F.move = (p, delta, type, reason) => { p.stock += delta; P.S.movements.unshift({ date: Date.now(), pid: p.id, name: p.name, type, qty: delta, reason, by: P.S.user.name }); };
  F.tab = (def) => F.tabs.push(def);

  F.WH = [['w1', 'Depósito central'], ['w2', 'Planta de producción'], ['w3', 'Salón de ventas']];
  F.whName = (id) => F.WH.find((w) => w[0] === id)?.[1] || id;
  /* el stock total de cada producto es el de Inventario; Planta y Salón guardan su parte y el Depósito central es el resto */
  F.split = (f, p) => { const a = f.loc[p.id] || {}; const w3 = Math.min(a.w3 || 0, p.stock); const w2 = Math.min(a.w2 || 0, p.stock - w3); return { w1: p.stock - w2 - w3, w2, w3 }; };
  F.shift = (f, p, from, to, qty) => {
    const cur = F.split(f, p); if (qty <= 0 || qty > cur[from]) return false;
    const a = (f.loc[p.id] = { w2: cur.w2, w3: cur.w3 }); if (from !== 'w1') a[from] -= qty; if (to !== 'w1') a[to] += qty; return true;
  };
  F.lotNo = (f) => `L-${new Date().toISOString().slice(2, 7).replace('-', '')}-${pad(++f.seq.lot, 3)}`;
  F.lotState = (l) => {
    if (!l.expires) return ['ok', 'Sin vencimiento']; const d = Math.ceil((l.expires - P.dayStart()) / DAY);
    return d < 0 ? ['bad', `Vencido hace ${-d} d`] : d <= 30 ? ['warn', `Vence en ${d} d`] : ['ok', `Vence en ${d} d`];
  };
  F.weightOf = (f, p, depth = 0) => {
    const bom = depth < 3 && (f.boms || []).find((b) => b.pid === p.id);
    if (bom) return sum(bom.lines, (l) => (P.get(l.pid) ? l.qty * F.weightOf(f, P.get(l.pid), depth + 1) : 0)) / (bom.qty || 1);
    return UNIT_KG[p.size] ?? 0.5;
  };
  F.shipKg = (f, s) => sum(s.items, (l) => (P.get(l.pid) ? F.weightOf(f, P.get(l.pid)) : 1) * l.qty);
  F.shipCost = (f, s) => { const c = f.carriers.find((x) => x.id === s.carrierId); return c ? Math.round(c.base + c.perKg * F.shipKg(f, s)) : 0; };

  /* ---------- código de barras EAN-13 y lectura de códigos GS1 ---------- */
  const EL = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const EG = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  const EP = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  const hash = (s) => [...String(s)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const check = (d12) => (10 - ([...d12].reduce((a, ch, i) => a + +ch * (i % 2 ? 3 : 1), 0) % 10)) % 10;
  F.ean = (digits12) => digits12 + check(digits12);
  F.gtin = (p) => F.ean(`779${pad(hash(p.sku) % 1e9, 9)}`);
  F.barcode = (code, w = 170) => {
    const flip = (b) => [...b].map((c) => (c === '1' ? '0' : '1')).join(''); const par = EP[+code[0]]; let bits = '101';
    for (let i = 1; i <= 6; i++) bits += par[i - 1] === 'L' ? EL[+code[i]] : EG[+code[i]];
    bits += '01010'; for (let i = 7; i <= 12; i++) bits += flip(EL[+code[i]]); bits += '101';
    let bars = ''; for (let i = 0; i < bits.length;) { if (bits[i] === '1') { let j = i; while (bits[j] === '1') j++; bars += `<rect x="${i + 9}" y="0" width="${j - i}" height="52"/>`; i = j; } else i++; }
    const tx = (x, t, len) => `<text x="${x}" y="63" ${len ? `textLength="${len}" lengthAdjust="spacing"` : ''}>${t}</text>`;
    return `<svg class="bc" viewBox="0 0 113 66" width="${w}" role="img" aria-label="Código de barras ${code}" style="fill:#12271d;font-family:ui-monospace,monospace;font-size:9px">${bars}${tx(1, code[0])}${tx(13, code.slice(1, 7), 38)}${tx(60, code.slice(7), 38)}</svg>`;
  };
  F.GS1 = { '01': 'GTIN del producto', '10': 'Lote', '17': 'Vencimiento (AAMMDD)', '21': 'Número de serie', '30': 'Cantidad' };
  F.parseGs1 = (txt) => {
    const t = String(txt || '').trim(); const out = {}; const re = /\((\d{2,4})\)([^(]+)/g; let m;
    while ((m = re.exec(t))) out[m[1]] = m[2].trim();
    if (!Object.keys(out).length && /^\d{8,14}$/.test(t)) out['01'] = t.padStart(14, '0');
    return out;
  };
  F.gs1Text = (p, lot) => `(01)0${F.gtin(p)}${lot ? `(10)${lot.no}${lot.expires ? `(17)${new Date(lot.expires).toISOString().slice(2, 10).replace(/-/g, '')}` : ''}` : ''}`;

  /* ---------- SMS simulado ---------- */
  F.smsDialog = (phone, text) => P.modal({ title: 'SMS enviado', subtitle: 'Así lo recibe el cliente', size: 'narrow', body: `<div class="phone"><div class="bar-t"><span class="avatar" style="width:28px;height:28px">${icon('user')}</span><div><b style="font-size:13px">${esc(phone)}</b><div style="font-size:10px;opacity:.8">mensaje de texto</div></div></div><div class="chat"><div class="bubble" style="margin-left:0;background:#fff;border-radius:10px 10px 10px 2px">${esc(text)}<div class="tm">${P.time(Date.now())}</div></div></div></div><p class="hint center">Simulación: en el programa real el aviso sale solo cuando se confirma la entrega.</p>` });

  /* ---------- datos propios de Factory (se arman la primera vez que se entra y se reinician con la demo) ---------- */
  F.ensure = () => {
    const S = P.S;
    if (S.fac) return S.fac;
    const f = (S.fac = { seq: { tr: 0, lot: 0, ld: 0, ship: 0, mo: 0, sc: 0, mn: 0, rp: 0 }, loc: {}, max: {}, costing: {}, transfers: [], lots: [], reval: [], landed: [], smsOn: true,
      carriers: [{ id: 'cr1', name: 'Retiro en planta', base: 0, perKg: 0, active: true }, { id: 'cr2', name: 'Reparto propio (flota)', base: 1500, perKg: 40, active: true, fleet: true }, { id: 'cr3', name: 'Transporte tercerizado', base: 4200, perKg: 95, active: true }, { id: 'cr4', name: 'Correo', base: 2800, perKg: 150, active: false }],
      vehicles: [{ id: 'v1', name: 'Camioneta utilitaria', plate: 'AB 123 CD', cap: 650 }, { id: 'v2', name: 'Camión liviano', plate: 'AC 456 EF', cap: 3500 }], ships: [] });
    F.live().forEach((p) => { const k = F.kind(p); f.loc[p.id] = { w2: Math.floor(p.stock * (k === 'raw' || k === 'sup' || k === 'semi' ? 0.3 : 0.1)), w3: k === 'fin' ? Math.floor(p.stock * 0.3) : 0 }; });
    const lot = (no, name, qty, wh, madeAgo, expDays) => { const p = F.byName(name); if (p) f.lots.push({ id: `lt${f.lots.length + 1}`, no: no || F.lotNo(f), pid: p.id, qty, wh, made: Date.now() - madeAgo * DAY, expires: expDays == null ? null : P.dayStart() + expDays * DAY }); };
    lot('L-2609-014', 'Materia prima 4', 30, 'w1', 40, 9); lot('L-2610-002', 'Materia prima 4', 30, 'w2', 12, 140); lot('L-2605-031', 'Insumo 1', 12, 'w1', 150, 20); lot('L-2604-008', 'Insumo 1', 4, 'w1', 200, -5);
    lot('L-2609-021', 'Producto terminado B', 12, 'w3', 40, 325); lot('L-2610-006', 'Producto terminado A', 48, 'w1', 25, null); f.seq.lot = 40;
    const tr = (status, from, to, name, qty, ago) => { const p = F.byName(name); if (!p) return; const t = { id: `tr${f.transfers.length + 1}`, no: F.no(f, 'tr', 'TR'), date: Date.now() - ago * DAY, from, to, pid: p.id, qty, status }; if (status === 'done') F.shift(f, p, from, to, qty); f.transfers.push(t); };
    tr('done', 'w1', 'w2', 'Materia prima 1', 80, 6); tr('done', 'w2', 'w3', 'Producto terminado A', 10, 3); tr('draft', 'w1', 'w2', 'Materia prima 2', 40, 0);
    f.landed.push({ id: 'ld1', no: 'CD-0001', date: Date.now() - 20 * DAY, method: 'value', costs: [{ label: 'Flete', amount: 45000 }, { label: 'Derechos de aduana', amount: 30000 }], lines: [{ pid: F.byName('Materia prima 1')?.id, name: 'Materia prima 1', qty: 200, alloc: 41000 }, { pid: F.byName('Materia prima 2')?.id, name: 'Materia prima 2', qty: 100, alloc: 34000 }], total: 75000 }); f.seq.ld = 1;
    F.seeders.forEach((fn) => fn(f)); F.post.forEach((fn) => fn(f));
    return f;
  };
  F.post.push((f) => {
    const recent = P.S.sales.filter((x) => x.status === 'completed' && x.customerId).slice(0, 5);
    [['delivered', 'cr2', 'v1', 6], ['delivered', 'cr3', '', 4], ['transit', 'cr2', 'v1', 1], ['ready', 'cr2', '', 0], ['ready', 'cr3', '', 0]].forEach(([status, carrierId, vehicleId, ago], i) => {
      const sale = recent[i]; if (!sale) return; const c = P.customer(sale.customerId);
      const s = { id: `sh${f.ships.length + 1}`, no: F.no(f, 'ship', 'ENV'), date: Date.now() - ago * DAY, saleId: sale.id, saleNo: sale.no, customer: c.name, phone: c.phone, items: sale.items.map((l) => ({ pid: l.pid, name: l.name, qty: l.qty })), carrierId, vehicleId, status, source: i === 4 ? 'drop' : 'wh', supplier: i === 4 ? (P.S.suppliers.find((x) => x.id === P.get(sale.items[0].pid)?.supplierId)?.name || '') : '' };
      s.cost = F.shipCost(f, s); f.ships.push(s);
    });
  });

  /* ============================================================ DEPÓSITOS (stock, mrp_product_expiry) ============================================================ */
  const lowList = (S) => S.products.filter((p) => !p.archived && p.stock <= p.min);
  const applyTransfer = (f, t) => {
    const p = P.get(t.pid);
    if (!F.shift(f, p, t.from, t.to, t.qty)) { P.toast(`En ${F.whName(t.from)} solo hay ${F.q(p, F.split(f, p)[t.from])} de «${p.name}».`, 'bad'); return false; }
    t.status = 'done'; t.date = Date.now(); P.log('TRANSFER_DONE', `Transferencia ${t.no}: ${F.q(p, t.qty)} de «${p.name}» de ${F.whName(t.from)} a ${F.whName(t.to)}`, 'Factory'); return true;
  };
  const transferDialog = (ctx, pre = {}) => {
    const { S, f } = ctx; const prods = F.live();
    const m = P.modal({ title: 'Nueva transferencia', subtitle: 'Mueve mercadería entre depósitos', size: 'narrow', body: `<div class="stack"><div class="grid g2"><div class="field"><label>Desde</label><select class="input" id="tf">${F.WH.map(([id, n]) => `<option value="${id}" ${pre.from === id ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div class="field"><label>Hacia</label><select class="input" id="tt">${F.WH.map(([id, n]) => `<option value="${id}" ${(pre.to || 'w2') === id ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
      <div class="field"><label>Producto</label><select class="input" id="tp">${F.opt(prods, pre.pid, (p) => p.name)}</select></div><div class="field"><label>Cantidad</label><input class="input" id="tq" type="number" min="1" value="${pre.qty || 10}"><div class="hint" id="th"></div></div></div>
      <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-outline" data-draft>Guardar borrador</button><button class="btn btn-primary" data-now>${icon('check')} Transferir ahora</button></div>` });
    const hint = () => { const p = P.get(m.$('#tp').value); m.$('#th').textContent = `Disponible en ${F.whName(m.$('#tf').value)}: ${F.q(p, F.split(f, p)[m.$('#tf').value])}`; };
    hint(); m.on('change', '#tf', hint); m.on('change', '#tp', hint);
    const make = (now) => {
      const from = m.$('#tf').value; const to = m.$('#tt').value; const p = P.get(m.$('#tp').value); const qty = Math.round(+m.$('#tq').value || 0);
      if (from === to) return P.toast('Elegí dos depósitos distintos.', 'bad'); if (qty <= 0) return P.toast('Poné una cantidad mayor a cero.', 'bad');
      const t = { id: P.uid('tr'), no: F.no(f, 'tr', 'TR'), date: Date.now(), from, to, pid: p.id, qty, status: 'draft' };
      if (now && !applyTransfer(f, t)) { f.seq.tr -= 1; return; }
      f.transfers.push(t); m.close(); P.toast(now ? `Transferencia ${t.no} hecha: la mercadería ya está en ${F.whName(to)}.` : `Borrador ${t.no} guardado: queda pendiente de validar.`); ctx.sub('wh').view = 'tr'; ctx.draw();
    };
    m.on('click', '[data-now]', () => make(true)); m.on('click', '[data-draft]', () => make(false));
  };
  const lotDialog = (ctx) => {
    const { f } = ctx;
    const m = P.modal({ title: 'Ingresar un lote', subtitle: 'Entra mercadería con su número de lote y su vencimiento', size: 'narrow', body: `<div class="stack"><div class="field"><label>Producto</label><select class="input" id="lp">${F.opt(F.live().filter((p) => F.kind(p) !== 'part'), '', (p) => p.name)}</select></div><div class="grid g2"><div class="field"><label>Cantidad</label><input class="input" id="lq" type="number" min="1" value="20"></div><div class="field"><label>Depósito</label><select class="input" id="lw">${F.WH.map(([id, n]) => `<option value="${id}">${n}</option>`).join('')}</select></div></div><div class="field"><label>Vencimiento (opcional)</label><input class="input" id="le" type="date"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Ingresar lote</button></div>` });
    m.on('click', '[data-ok]', () => {
      const p = P.get(m.$('#lp').value); const qty = Math.round(+m.$('#lq').value || 0); const wh = m.$('#lw').value; const e = m.$('#le').value;
      if (qty <= 0) return P.toast('Poné una cantidad mayor a cero.', 'bad');
      const l = { id: P.uid('lt'), no: F.lotNo(f), pid: p.id, qty, wh, made: Date.now(), expires: e ? new Date(`${e}T00:00:00`).getTime() : null };
      f.lots.push(l); F.move(p, qty, 'Entrada con lote', l.no); if (wh !== 'w1') { const c = F.split(f, p); f.loc[p.id] = { w2: c.w2, w3: c.w3 }; f.loc[p.id][wh] += qty; }
      P.log('LOT_RECEIVED', `Lote ${l.no}: ${F.q(p, qty)} de «${p.name}»`, 'Factory'); m.close(); P.toast(`Lote ${l.no} ingresado: el stock de «${p.name}» subió ${F.q(p, qty)}.`); ctx.draw();
    });
  };
  const ruleDialog = (ctx, p) => {
    const { f } = ctx; const max = f.max[p.id] ?? p.min * 3;
    const m = P.modal({ title: 'Regla de reposición', subtitle: p.name, size: 'narrow', body: `<div class="stack"><div class="field"><label>Mínimo (cuando baja de acá, se pide)</label><input class="input" id="rmin" type="number" min="0" value="${p.min}"></div><div class="field"><label>Máximo (hasta acá se repone)</label><input class="input" id="rmax" type="number" min="1" value="${max}"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar regla</button></div>` });
    m.on('click', '[data-ok]', () => { const mn = Math.max(0, Math.round(+m.$('#rmin').value || 0)); const mx = Math.round(+m.$('#rmax').value || 0); if (mx <= mn) return P.toast('El máximo tiene que ser mayor al mínimo.', 'bad'); p.min = mn; f.max[p.id] = mx; P.log('REORDER_RULE', `Regla de «${p.name}»: mín. ${mn}, máx. ${mx}`, 'Factory'); m.close(); P.toast('Regla guardada.'); ctx.draw(); });
  };
  const wh = {
    key: 'wh', label: 'Depósitos', order: 1, badge: ({ f }) => f.transfers.filter((t) => t.status === 'draft').length,
    body(b, ctx) {
      const { S, f } = ctx; const s = ctx.sub('wh', { view: 'stock', q: '', kind: 'all' });
      const soon = f.lots.filter((l) => F.lotState(l)[0] !== 'ok').length;
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('warehouse', 'Depósitos', F.WH.length, 'central, planta y salón')}${P.kpi('arrow-left-right', 'Transferencias pendientes', f.transfers.filter((t) => t.status === 'draft').length, 'borradores sin validar', 'info')}${P.kpi('clock', 'Lotes por vencer', soon, 'vencidos o a menos de 30 días', 'gold')}${P.kpi('triangle-alert', 'Para reponer', lowList(S).length, 'en el mínimo o por debajo', 'bad')}</div>
        ${F.chips('data-w-view', [['stock', 'Existencias'], ['tr', 'Transferencias', f.transfers.length], ['lots', 'Lotes y vencimientos', f.lots.length], ['repo', 'Reposición', lowList(S).length]], s.view)}<div id="wb"></div>`;
      const w = $('#wb', b);
      if (s.view === 'stock') {
        w.innerHTML = `<div class="row wrap mb"><div class="search" style="width:260px">${icon('search')}<input class="input" id="wq" placeholder="Producto o SKU…" value="${esc(s.q)}"></div><select class="input" id="wk" style="width:200px"><option value="all">Todos los tipos</option>${Object.entries(F.KIND).map(([k, l]) => `<option value="${k}" ${s.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select><div class="grow"></div><button class="btn btn-primary" data-w-newtr>${icon('plus')} Nueva transferencia</button></div><div class="card" id="wt"></div><p class="hint">El total es el stock de Inventario. Las transferencias cambian dónde está la mercadería, no cuánta hay.</p>`;
        ctx.t.wh = () => {
          const t = s.q.toLowerCase(); const list = F.live().filter((p) => (s.kind === 'all' || F.kind(p) === s.kind) && (!t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)));
          $('#wt', w).innerHTML = P.table([{ h: 'Producto', r: (p) => `<div class="semibold">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}</div>` }, { h: 'Tipo', r: (p) => `<span class="badge">${F.KIND[F.kind(p)]}</span>` }, ...F.WH.map(([id, n]) => ({ h: n, num: true, r: (p) => F.q(p, F.split(f, p)[id]) })), { h: 'Total', num: true, r: (p) => `<b class="${p.stock === 0 ? 'red' : ''}">${F.q(p, p.stock)}</b>` }, { h: '', num: true, r: (p) => `<button class="btn btn-outline btn-sm" data-w-mv="${p.id}">Transferir</button>` }], list, { empty: 'No hay productos con esos filtros.' });
        };
        ctx.t.wh();
      } else if (s.view === 'tr') {
        const ST = { draft: '<span class="badge warn">Borrador</span>', done: '<span class="badge ok">Hecha</span>', cancel: '<span class="badge bad">Cancelada</span>' };
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Cada transferencia mueve un producto de un depósito a otro. El stock total no cambia.</span><button class="btn btn-primary" data-w-newtr>${icon('plus')} Nueva transferencia</button></div><div class="card">${P.table([{ h: 'N.º', cls: 'nowrap', r: (t) => `<b>${t.no}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (t) => P.date(t.date) }, { h: 'Producto', r: (t) => { const p = P.get(t.pid); return `${esc(p?.name || '—')} <span class="muted">· ${p ? F.q(p, t.qty) : t.qty}</span>`; } }, { h: 'Desde → hacia', r: (t) => `${F.whName(t.from)} → ${F.whName(t.to)}` }, { h: 'Estado', r: (t) => ST[t.status] }, { h: '', num: true, cls: 'nowrap', r: (t) => (t.status === 'draft' ? `<span class="row end gap4"><button class="btn btn-primary btn-sm" data-w-ok="${t.id}">Validar</button><button class="btn btn-ghost btn-icon" data-w-no="${t.id}" title="Cancelar" style="color:var(--bad)">${icon('x')}</button></span>` : '') }], f.transfers.slice().reverse(), { empty: 'Todavía no hay transferencias.' })}</div>`;
      } else if (s.view === 'lots') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Cada lote guarda cuánto entró, dónde está y cuándo vence. Lo vencido se da de baja y sale del stock.</span><button class="btn btn-primary" data-w-newlot>${icon('plus')} Ingresar lote</button></div><div class="card">${P.table([{ h: 'Lote', cls: 'nowrap', r: (l) => `<b>${esc(l.no)}</b>` }, { h: 'Producto', r: (l) => esc(P.get(l.pid)?.name || '—') }, { h: 'Depósito', r: (l) => F.whName(l.wh) }, { h: 'Cantidad', num: true, r: (l) => { const p = P.get(l.pid); return p ? F.q(p, l.qty) : l.qty; } }, { h: 'Ingreso', cls: 'nowrap', r: (l) => P.date(l.made) }, { h: 'Vencimiento', cls: 'nowrap', r: (l) => `${l.expires ? `${P.date(l.expires)} ` : ''}<span class="badge ${F.lotState(l)[0]}">${F.lotState(l)[1]}</span>` }, { h: '', num: true, r: (l) => `<button class="btn btn-ghost btn-sm" data-w-baja="${l.id}" style="color:var(--bad)">Dar de baja</button>` }], f.lots.slice().sort((x, y) => (x.expires || 9e15) - (y.expires || 9e15)), { empty: 'No hay lotes cargados.' })}</div>`;
      } else {
        const list = lowList(S).sort((x, y) => x.stock / (x.min || 1) - y.stock / (y.min || 1));
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Los productos en el mínimo o por debajo se piden hasta el máximo. Las órdenes de compra se crean en Proveedores.</span><button class="btn btn-primary" data-w-po ${list.length ? '' : 'disabled'}>${icon('truck')} Crear órdenes de compra</button></div><div class="card">${P.table([{ h: 'Producto', r: (p) => `<div class="semibold">${esc(p.name)}</div><div class="tiny muted">${esc(S.suppliers.find((x) => x.id === p.supplierId)?.name || 'Sin proveedor')}</div>` }, { h: 'Stock', num: true, r: (p) => `<b class="${p.stock === 0 ? 'red' : 'orange'}">${F.q(p, p.stock)}</b>` }, { h: 'Mínimo / máximo', num: true, r: (p) => `${P.num(p.min)} / ${P.num(f.max[p.id] ?? p.min * 3)}` }, { h: 'A pedir', num: true, r: (p) => `<b>${F.q(p, Math.max(0, (f.max[p.id] ?? p.min * 3) - p.stock))}</b>` }, { h: 'Costo estimado', num: true, r: (p) => money(Math.max(0, (f.max[p.id] ?? p.min * 3) - p.stock) * p.cost) }, { h: '', num: true, r: (p) => `<button class="btn btn-ghost btn-icon" data-w-rule="${p.id}" title="Editar regla">${icon('pencil')}</button>` }], list, { empty: 'Todo está por encima del mínimo.' })}</div>`;
      }
    },
    events(v, ctx) {
      const { S, f } = ctx; const s = () => ctx.sub('wh');
      P.on(v, 'click', '[data-w-view]', (e, el) => { s().view = el.dataset.wView; ctx.draw(); });
      P.on(v, 'input', '#wq', (e, el) => { s().q = el.value; ctx.t.wh(); });
      P.on(v, 'change', '#wk', (e, el) => { s().kind = el.value; ctx.t.wh(); });
      P.on(v, 'click', '[data-w-newtr]', () => transferDialog(ctx));
      P.on(v, 'click', '[data-w-mv]', (e, el) => transferDialog(ctx, { pid: el.dataset.wMv, from: 'w1', to: 'w2' }));
      P.on(v, 'click', '[data-w-ok]', (e, el) => { const t = f.transfers.find((x) => x.id === el.dataset.wOk); if (applyTransfer(f, t)) { P.toast(`Transferencia ${t.no} validada.`); ctx.draw(); } });
      P.on(v, 'click', '[data-w-no]', (e, el) => { const t = f.transfers.find((x) => x.id === el.dataset.wNo); t.status = 'cancel'; P.toast(`Transferencia ${t.no} cancelada.`); ctx.draw(); });
      P.on(v, 'click', '[data-w-newlot]', () => lotDialog(ctx));
      P.on(v, 'click', '[data-w-baja]', (e, el) => {
        const l = f.lots.find((x) => x.id === el.dataset.wBaja); const p = P.get(l.pid); const qty = Math.min(l.qty, p.stock);
        P.confirm('¿Dar de baja el lote?', `Se descuentan ${F.q(p, qty)} de «${p.name}» del stock (lote ${l.no}).`, 'Dar de baja', () => { F.move(p, -qty, 'Baja de lote', l.no); f.lots = f.lots.filter((x) => x !== l); P.log('LOT_WRITTEN_OFF', `Lote ${l.no} dado de baja (${F.q(p, qty)} de «${p.name}»)`, 'Factory'); P.toast('Lote dado de baja: salió del stock y quedó en Movimientos.'); ctx.draw(); });
      });
      P.on(v, 'click', '[data-w-rule]', (e, el) => ruleDialog(ctx, P.get(el.dataset.wRule)));
      P.on(v, 'click', '[data-w-po]', () => {
        const bySup = {}; lowList(S).forEach((p) => { const sup = S.suppliers.find((x) => x.id === p.supplierId); const qty = Math.max(0, (f.max[p.id] ?? p.min * 3) - p.stock); if (sup && qty > 0) (bySup[sup.id] ||= { sup, items: [] }).items.push({ pid: p.id, name: p.name, qty, cost: p.cost }); });
        const orders = Object.values(bySup); if (!orders.length) return P.toast('Los productos que faltan no tienen proveedor asignado.', 'warn');
        orders.forEach(({ sup, items }) => S.orders.unshift({ id: P.uid('o'), number: `OC-${pad(S.orders.length + 1, 4)}`, supplier: sup.name, date: Date.now(), items, total: sum(items, (i) => i.qty * i.cost), status: 'pending' }));
        P.log('PURCHASE_ORDER_CREATED', `${orders.length} órdenes de compra desde Reposición`, 'Factory'); P.toast(`Se crearon ${orders.length} órdenes de compra: están en Proveedores, pendientes de recibir.`);
      });
    },
  };

  /* ============================================================ VALUACIÓN Y COSTOS (stock_account, stock_landed_costs) ============================================================ */
  const METHODS = ['Costo estándar', 'Costo promedio', 'Primero en entrar, primero en salir'];
  const revalDialog = (ctx, p) => {
    const { f } = ctx;
    const m = P.modal({ title: 'Revalorizar', subtitle: `${p.name} · hoy ${money(p.cost)} por unidad`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Nuevo costo por unidad</label><input class="input" id="rc" type="number" min="0" value="${p.cost}"></div><div class="notice info" id="rp"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Aplicar</button></div>` });
    const prev = () => { const c = Math.round(+m.$('#rc').value || 0); const d = (c - p.cost) * p.stock; m.$('#rp').innerHTML = `Con ${F.q(p, p.stock)} en stock, el valor ${d >= 0 ? 'sube' : 'baja'} <b>${money(Math.abs(d))}</b>.`; };
    prev(); m.on('input', '#rc', prev);
    m.on('click', '[data-ok]', () => { const c = Math.round(+m.$('#rc').value); if (!(c >= 0)) return P.toast('Poné un costo válido.', 'bad'); f.reval.unshift({ date: Date.now(), pid: p.id, name: p.name, from: p.cost, to: c, delta: (c - p.cost) * p.stock }); P.log('REVALUATION', `«${p.name}» revalorizado de ${money(p.cost)} a ${money(c)}`, 'Factory'); p.cost = c; m.close(); P.toast('Costo actualizado: cambió el valor del stock.'); ctx.draw(); });
  };
  const landedDialog = (ctx) => {
    const { f } = ctx; const ORDER = ['raw', 'sup', 'semi', 'part']; const prods = F.live().filter((p) => F.kind(p) !== 'fin').sort((a, b) => ORDER.indexOf(F.kind(a)) - ORDER.indexOf(F.kind(b)));
    const lineRow = (i) => `<div class="grid g2"><select class="input" id="lp${i}"><option value="">— sin producto —</option>${F.opt(prods, i === 0 ? prods[0]?.id : '', (p) => p.name)}</select><input class="input" id="lq${i}" type="number" min="0" value="${i === 0 ? 100 : 0}"></div>`;
    const m = P.modal({ title: 'Nuevo costo de importación', subtitle: 'Reparte fletes y aduana entre la mercadería recibida', size: 'wide', body: `<div class="stack"><div><label class="lbl">Mercadería recibida (producto y cantidad)</label><div class="stack s2">${[0, 1, 2].map(lineRow).join('')}</div></div>
      <div class="grid g3"><div class="field"><label>Flete</label><input class="input" id="c0" type="number" min="0" value="45000"></div><div class="field"><label>Derechos de aduana</label><input class="input" id="c1" type="number" min="0" value="30000"></div><div class="field"><label>Seguro y otros</label><input class="input" id="c2" type="number" min="0" value="0"></div></div>
      <div class="field"><label>Cómo se reparte</label><select class="input" id="lm"><option value="value">Por valor de la mercadería</option><option value="qty">Por cantidad</option><option value="equal">En partes iguales</option></select></div><div id="lprev"></div></div>
      <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Aplicar al costo</button></div>` });
    const calc = () => {
      const lines = [0, 1, 2].map((i) => ({ p: P.get(m.$(`#lp${i}`).value), qty: Math.max(0, +m.$(`#lq${i}`).value || 0) })).filter((x) => x.p && x.qty > 0); const costs = [['Flete', 'c0'], ['Derechos de aduana', 'c1'], ['Seguro y otros', 'c2']].map(([label, id]) => ({ label, amount: Math.max(0, Math.round(+m.$(`#${id}`).value || 0)) })).filter((c) => c.amount > 0);
      const total = sum(costs, (c) => c.amount); const meth = m.$('#lm').value; const w = (x) => (meth === 'value' ? x.qty * x.p.cost : meth === 'qty' ? x.qty : 1); const tw = sum(lines, w) || 1;
      lines.forEach((x) => { x.alloc = Math.round((total * w(x)) / tw); }); return { lines, costs, total, meth };
    };
    const draw = () => { const c = calc(); m.$('#lprev').innerHTML = c.lines.length ? P.table([{ h: 'Producto', r: (x) => esc(x.p.name) }, { h: 'Recibido', num: true, r: (x) => F.q(x.p, x.qty) }, { h: 'Parte del costo', num: true, r: (x) => money(x.alloc) }, { h: 'Costo por unidad', num: true, r: (x) => `${money(x.p.cost)} → <b>${money(x.p.cost + Math.round(x.alloc / Math.max(x.p.stock, x.qty)))}</b>` }], c.lines) : '<div class="notice">Elegí al menos un producto con cantidad.</div>'; };
    draw(); m.on('input', 'input', draw); m.on('change', 'select', draw);
    m.on('click', '[data-ok]', () => {
      const c = calc(); if (!c.lines.length || !c.total) return P.toast('Elegí mercadería y poné al menos un costo.', 'bad');
      c.lines.forEach((x) => { x.p.cost += Math.round(x.alloc / Math.max(x.p.stock, x.qty)); });
      const rec = { id: P.uid('ld'), no: F.no(f, 'ld', 'CD'), date: Date.now(), method: c.meth, costs: c.costs, lines: c.lines.map((x) => ({ pid: x.p.id, name: x.p.name, qty: x.qty, alloc: x.alloc })), total: c.total };
      f.landed.unshift(rec); P.log('LANDED_COST', `Costo de importación ${rec.no} por ${money(c.total)}`, 'Factory'); m.close(); P.toast(`${rec.no} aplicado: subió el costo de ${c.lines.length} producto${c.lines.length > 1 ? 's' : ''}.`); ctx.sub('val').view = 'landed'; ctx.draw();
    });
  };
  const val = {
    key: 'val', label: 'Valuación y costos', order: 2,
    body(b, ctx) {
      const { f } = ctx; const s = ctx.sub('val', { view: 'val' }); const all = F.live(); const vc = (p) => p.stock * p.cost;
      const fin = all.filter((p) => F.kind(p) === 'fin');
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('circle-dollar-sign', 'Valor del stock', money(sum(all, vc)), 'a costo, todo el inventario')}${P.kpi('tag', 'A precio de venta', money(sum(all, (p) => p.stock * (p.discount || p.price))), 'si se vendiera todo', 'info')}${P.kpi('trending-up', 'Margen potencial', money(sum(fin, (p) => p.stock * ((p.discount || p.price) - p.cost))), 'solo productos terminados', 'gold')}${P.kpi('package-x', 'Sin stock', all.filter((p) => p.stock === 0).length, 'productos en cero', 'bad')}</div>
        ${F.chips('data-v-view', [['val', 'Valuación del stock'], ['landed', 'Costos de importación', f.landed.length]], s.view)}<div id="vb"></div>`;
      const w = $('#vb', b);
      if (s.view === 'val') {
        const kinds = Object.entries(F.KIND).map(([k, l]) => ({ label: l, value: sum(all.filter((p) => F.kind(p) === k), vc) }));
        w.innerHTML = `<div class="grid g2 mb"><div class="card"><div class="card-h"><div><h3>Valor por tipo de producto</h3><p>Stock por costo unitario.</p></div></div><div class="card-b">${P.hbars(kinds)}</div></div><div class="card"><div class="card-h"><div><h3>Revalorizaciones recientes</h3><p>Cambios de costo hechos desde acá.</p></div></div>${P.table([{ h: 'Fecha', cls: 'nowrap', r: (r) => P.date(r.date) }, { h: 'Producto', r: (r) => esc(r.name) }, { h: 'Costo', num: true, r: (r) => `${money(r.from)} → <b>${money(r.to)}</b>` }, { h: 'Efecto', num: true, r: (r) => `<b class="${r.delta < 0 ? 'red' : 'green'}">${money(r.delta)}</b>` }], f.reval.slice(0, 5), { empty: 'Todavía no revalorizaste nada.' })}</div></div>
          <div class="card">${P.table([{ h: 'Producto', r: (p) => `<div class="semibold">${esc(p.name)}</div><div class="tiny muted">${F.KIND[F.kind(p)]}</div>` }, { h: 'Stock', num: true, r: (p) => F.q(p, p.stock) }, { h: 'Costo por unidad', num: true, r: (p) => money(p.cost) }, { h: 'Método de costeo', r: (p) => `<select class="input sm" style="min-width:210px" data-v-meth="${p.id}">${METHODS.map((x) => `<option ${(f.costing[p.id] || METHODS[1]) === x ? 'selected' : ''}>${x}</option>`).join('')}</select>` }, { h: 'Valor', num: true, r: (p) => `<b>${money(vc(p))}</b>` }, { h: '', num: true, r: (p) => `<button class="btn btn-outline btn-sm" data-v-rev="${p.id}">Revalorizar</button>` }], all.slice().sort((x, y) => vc(y) - vc(x)))}</div>`;
      } else {
        const MT = { value: 'Por valor', qty: 'Por cantidad', equal: 'En partes iguales' };
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Fletes, aduana y seguros se reparten entre lo que llegó y suben el costo de cada producto.</span><button class="btn btn-primary" data-v-newld>${icon('plus')} Nuevo costo de importación</button></div><div class="card">${P.table([{ h: 'N.º', cls: 'nowrap', r: (x) => `<b>${x.no}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (x) => P.date(x.date) }, { h: 'Mercadería', r: (x) => x.lines.map((l) => `${esc(l.name)} <span class="muted">· ${money(l.alloc)}</span>`).join('<br>') }, { h: 'Costos', r: (x) => x.costs.map((c) => `${esc(c.label)} ${money(c.amount)}`).join('<br>') }, { h: 'Reparto', r: (x) => MT[x.method] }, { h: 'Total', num: true, r: (x) => `<b>${money(x.total)}</b>` }, { h: 'Estado', r: () => '<span class="badge ok">Aplicado</span>' }], f.landed, { empty: 'Todavía no hay costos de importación.' })}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-v-view]', (e, el) => { ctx.sub('val').view = el.dataset.vView; ctx.draw(); });
      P.on(v, 'change', '[data-v-meth]', (e, el) => { f.costing[el.dataset.vMeth] = el.value; P.toast('Método de costeo guardado.'); });
      P.on(v, 'click', '[data-v-rev]', (e, el) => revalDialog(ctx, P.get(el.dataset.vRev)));
      P.on(v, 'click', '[data-v-newld]', () => landedDialog(ctx));
    },
  };

  /* ============================================================ CÓDIGOS DE BARRAS (barcodes, barcodes_gs1_nomenclature) ============================================================ */
  const scanResult = (ctx, txt) => {
    const { f } = ctx; const g = F.parseGs1(txt); const keys = Object.keys(g);
    if (!keys.length) return '<div class="notice bad">No se pudo leer el código. Probá con un EAN-13 o con un código GS1 como <b>(01)07791234567890(10)L-2610-001</b>.</div>';
    const gt = g['01']; const p = gt ? F.live().find((x) => F.gtin(x) === (gt.length === 14 ? gt.slice(1) : gt)) : null;
    const lot = p && g['10'] ? f.lots.find((l) => l.no === g['10'] && l.pid === p.id) : null;
    const exp = g['17'] && /^\d{6}$/.test(g['17']) ? `${g['17'].slice(4)}/${g['17'].slice(2, 4)}/20${g['17'].slice(0, 2)}` : '';
    return `<div class="card"><div class="card-h"><div><h3>Qué dice el código</h3><p>Cada dato lleva un identificador de aplicación (AI) del estándar GS1.</p></div></div>${P.table([{ h: 'AI', r: (k) => `<span class="kbd">${k}</span>` }, { h: 'Dato', r: (k) => F.GS1[k] || 'Otro dato' }, { h: 'Valor', r: (k) => `<span class="mono">${esc(k === '17' && exp ? `${g[k]} (${exp})` : g[k])}</span>` }], keys)}</div>
      ${p ? `<div class="notice ok mt"><b>${esc(p.name)}</b> · ${esc(p.sku)} · hay ${F.q(p, p.stock)} en stock${lot ? ` · lote ${esc(lot.no)}: ${F.q(p, lot.qty)} en ${F.whName(lot.wh)}, ${F.lotState(lot)[1].toLowerCase()}` : g['10'] ? ' · ese lote no está cargado' : ''}.</div>` : gt ? '<div class="notice bad mt">Ese GTIN no corresponde a ningún producto.</div>' : ''}`;
  };
  const bar = {
    key: 'bar', label: 'Códigos de barras', order: 3,
    body(b, ctx) {
      const { f } = ctx; const s = ctx.sub('bar', { view: 'codes', q: '', scan: '' });
      b.innerHTML = `${F.chips('data-b-view', [['codes', 'Códigos de productos'], ['scan', 'Escáner'], ['rules', 'Nomenclatura']], s.view)}<div id="bb"></div>`; const w = $('#bb', b);
      if (s.view === 'codes') {
        w.innerHTML = `<div class="row wrap mb"><div class="search" style="width:260px">${icon('search')}<input class="input" id="bq" placeholder="Producto o SKU…" value="${esc(s.q)}"></div><div class="grow"></div><button class="btn btn-outline" data-b-labels>${icon('printer')} Imprimir etiquetas</button></div><div class="card" id="bt"></div><p class="hint">Son códigos EAN-13 de ejemplo, calculados con su dígito verificador a partir del SKU.</p>`;
        ctx.t.bar = () => { const t = s.q.toLowerCase(); ctx.list = F.live().filter((p) => !t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)); $('#bt', w).innerHTML = P.table([{ h: 'Producto', r: (p) => `<div class="semibold">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}</div>` }, { h: 'Código de barras', r: (p) => F.barcode(F.gtin(p), 150) }, { h: 'EAN-13', r: (p) => `<span class="mono">${F.gtin(p)}</span>` }, { h: '', num: true, r: (p) => `<button class="btn btn-ghost btn-icon" data-b-one="${p.id}" title="Ver etiqueta">${icon('eye')}</button>` }], ctx.list.slice(0, 12), { empty: 'No hay productos con esa búsqueda.' }); };
        ctx.t.bar();
      } else if (s.view === 'scan') {
        w.innerHTML = `<div class="card mb"><div class="card-b stack"><div class="field"><label>Código leído</label><input class="input mono" id="bs" placeholder="7791234567890   o   (01)07791234567890(10)L-2610-001(17)271231" value="${esc(s.scan)}"></div><div class="row wrap"><button class="btn btn-primary" data-b-read>${icon('scan-line')} Leer código</button><button class="btn btn-outline" data-b-rand="p">Escanear un producto</button><button class="btn btn-outline" data-b-rand="l">Escanear un lote (GS1)</button></div></div></div><div id="bres">${s.scan ? scanResult(ctx, s.scan) : '<div class="notice info">Escribí un código, o usá los botones para simular un escaneo. Plexi detecta si es un EAN-13 común o un código GS1 con lote y vencimiento.</div>'}</div>`;
      } else {
        const R = [['EAN-13', '13 dígitos', 'Producto', 'El código común del envase. Plexi lo busca entre los productos.'], ['GS1 · 01', '14 dígitos', 'GTIN del producto', 'Identifica el producto; si es un EAN-13 va con un cero adelante.'], ['GS1 · 10', 'hasta 20 caracteres', 'Lote', 'Número de lote de la partida.'], ['GS1 · 17', '6 dígitos (AAMMDD)', 'Vencimiento', 'Fecha en que vence la partida.'], ['GS1 · 21', 'hasta 20 caracteres', 'Número de serie', 'Identifica una unidad individual.'], ['GS1 · 30', 'hasta 8 dígitos', 'Cantidad', 'Cantidad de unidades del bulto.']];
        w.innerHTML = `<div class="card"><div class="card-h"><div><h3>Reglas de lectura</h3><p>Así interpreta Plexi lo que lee el escáner.</p></div></div>${P.table([{ h: 'Código', r: (r) => `<b>${r[0]}</b>` }, { h: 'Formato', r: (r) => r[1] }, { h: 'Significa', r: (r) => r[2] }, { h: 'Detalle', r: (r) => `<span class="muted">${r[3]}</span>` }], R)}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx; const s = () => ctx.sub('bar');
      const labels = (list, title) => { const m = P.modal({ title, subtitle: `${list.length} etiquetas`, size: 'xwide', body: `<div class="grid g3 print-area">${list.map((p) => `<div class="type-card center">${F.barcode(F.gtin(p), 180)}<div class="small semibold mt8">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)} · ${money(p.discount || p.price)}</div></div>`).join('')}</div><div class="dialog-f"><button class="btn btn-primary" data-print>${icon('printer')} Imprimir</button></div>` }); m.on('click', '[data-print]', () => window.print()); };
      P.on(v, 'click', '[data-b-view]', (e, el) => { s().view = el.dataset.bView; ctx.draw(); });
      P.on(v, 'input', '#bq', (e, el) => { s().q = el.value; ctx.t.bar(); });
      P.on(v, 'click', '[data-b-one]', (e, el) => labels([P.get(el.dataset.bOne)], 'Etiqueta con código de barras'));
      P.on(v, 'click', '[data-b-labels]', () => labels((ctx.list || []).slice(0, 12), 'Etiquetas con código de barras'));
      P.on(v, 'click', '[data-b-read]', () => { s().scan = $('#bs', v).value; ctx.draw(); });
      P.on(v, 'click', '[data-b-rand]', (e, el) => {
        if (el.dataset.bRand === 'p') { const l = F.live(); const p = l[Math.floor(Math.random() * l.length)]; s().scan = F.gtin(p); } else { const l = f.lots.filter((x) => P.get(x.pid)); const lot = l[Math.floor(Math.random() * l.length)]; s().scan = F.gs1Text(P.get(lot.pid), lot); }
        ctx.draw();
      });
    },
  };

  /* ============================================================ ENVÍOS (stock_delivery, stock_dropshipping, stock_fleet, stock_sms, mrp_delivery) ============================================================ */
  const carrierOf = (f, id) => f.carriers.find((c) => c.id === id);
  const loadOf = (f, vid) => sum(f.ships.filter((x) => x.vehicleId === vid && x.status === 'transit'), (x) => F.shipKg(f, x));
  const SHIP = { ready: '<span class="badge warn">Para despachar</span>', transit: '<span class="badge info">En camino</span>', delivered: '<span class="badge ok">Entregado</span>' };
  const shipDialog = (ctx) => {
    const { S, f } = ctx; const sales = S.sales.filter((x) => x.status === 'completed' && x.customerId && !f.ships.some((y) => y.saleId === x.id)).slice(0, 25);
    if (!sales.length) return P.toast('No hay ventas con cliente para enviar.', 'warn');
    const m = P.modal({ title: 'Nuevo envío', subtitle: 'Prepara la entrega de una venta', size: 'narrow', body: `<div class="stack"><div class="field"><label>Venta</label><select class="input" id="ss">${sales.map((x) => `<option value="${x.id}">${esc(x.no)} · ${esc(x.customerName)} · ${money(x.total)}</option>`).join('')}</select></div><div class="field"><label>Transportista</label><select class="input" id="sc">${F.opt(f.carriers.filter((c) => c.active), '', (c) => c.name)}</select></div><label class="check"><input type="checkbox" id="sd"><span><b>Envío directo desde el proveedor</b><div class="tiny muted">El proveedor le entrega al cliente: la mercadería no pasa por tus depósitos.</div></span></label><div class="notice info" id="sp"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Crear envío</button></div>` });
    const build = () => { const sale = S.sales.find((x) => x.id === m.$('#ss').value); const c = P.customer(sale.customerId); return { id: P.uid('sh'), no: '', date: Date.now(), saleId: sale.id, saleNo: sale.no, customer: c.name, phone: c.phone, items: sale.items.map((l) => ({ pid: l.pid, name: l.name, qty: l.qty })), carrierId: m.$('#sc').value, vehicleId: '', status: 'ready', source: m.$('#sd').checked ? 'drop' : 'wh', supplier: m.$('#sd').checked ? (S.suppliers.find((x) => x.id === P.get(sale.items[0].pid)?.supplierId)?.name || '') : '' }; };
    const prev = () => { const s = build(); m.$('#sp').innerHTML = `Peso: <b>${F.shipKg(f, s).toFixed(1).replace('.', ',')} kg</b> · costo del envío: <b>${money(F.shipCost(f, s))}</b>`; };
    prev(); m.on('change', 'select', prev); m.on('change', '#sd', prev);
    m.on('click', '[data-ok]', () => { const s = build(); s.no = F.no(f, 'ship', 'ENV'); s.cost = F.shipCost(f, s); f.ships.unshift(s); P.log('SHIPMENT_CREATED', `Envío ${s.no} de ${s.saleNo}`, 'Factory'); m.close(); P.toast(`Envío ${s.no} creado.`); ctx.draw(); });
  };
  const dispatch = (ctx, sh) => {
    const { f } = ctx; const car = carrierOf(f, sh.carrierId); const kg = F.shipKg(f, sh);
    const done = (vid) => { sh.vehicleId = vid || ''; sh.status = 'transit'; sh.date = Date.now(); P.log('SHIPMENT_DISPATCHED', `Envío ${sh.no} despachado con ${car?.name || 'transportista'}`, 'Factory'); P.toast(`Envío ${sh.no} en camino.`); ctx.draw(); };
    if (!car?.fleet) return done('');
    const m = P.modal({ title: 'Despachar con la flota', subtitle: `${sh.no} · ${kg.toFixed(1).replace('.', ',')} kg`, size: 'narrow', body: `<div class="field"><label>Vehículo</label><select class="input" id="sv">${f.vehicles.map((x) => `<option value="${x.id}">${esc(x.name)} · ${esc(x.plate)} · lleva ${P.num(loadOf(f, x.id))} de ${P.num(x.cap)} kg</option>`).join('')}</select></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Despachar</button></div>` });
    m.on('click', '[data-ok]', () => { const x = f.vehicles.find((y) => y.id === m.$('#sv').value); if (loadOf(f, x.id) + kg > x.cap) return P.toast(`${x.name} no tiene lugar: la carga pasa los ${P.num(x.cap)} kg.`, 'bad'); m.close(); done(x.id); });
  };
  const ship = {
    key: 'ship', label: 'Envíos', order: 4, badge: ({ f }) => f.ships.filter((x) => x.status === 'ready').length,
    body(b, ctx) {
      const { f } = ctx; const s = ctx.sub('ship', { view: 'ships' });
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('package', 'Para despachar', f.ships.filter((x) => x.status === 'ready').length, 'preparados en el depósito', 'gold')}${P.kpi('truck', 'En camino', f.ships.filter((x) => x.status === 'transit').length, 'con transportista o flota', 'info')}${P.kpi('circle-check', 'Entregados', f.ships.filter((x) => x.status === 'delivered').length, 'en los últimos días')}${P.kpi('circle-dollar-sign', 'Costo de envíos', money(sum(f.ships, (x) => x.cost || 0)), 'suma de los envíos cargados', 'bad')}</div>
        ${F.chips('data-s-view', [['ships', 'Envíos', f.ships.length], ['carriers', 'Transportistas'], ['fleet', 'Flota']], s.view)}<div id="sb"></div>`; const w = $('#sb', b);
      if (s.view === 'ships') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Al entregar, el cliente recibe un aviso por SMS (se activa en Transportistas).</span><button class="btn btn-primary" data-s-new>${icon('plus')} Nuevo envío</button></div><div class="card">${P.table([{ h: 'Envío', cls: 'nowrap', r: (x) => `<b>${x.no}</b><div class="tiny muted">${esc(x.saleNo)}</div>` }, { h: 'Cliente', r: (x) => `${esc(x.customer)}${x.source === 'drop' ? `<div class="tiny"><span class="badge info">Directo del proveedor</span> <span class="muted">${esc(x.supplier)}</span></div>` : ''}` }, { h: 'Peso', num: true, r: (x) => `${F.shipKg(f, x).toFixed(1).replace('.', ',')} kg` }, { h: 'Transportista', r: (x) => `${esc(carrierOf(f, x.carrierId)?.name || '—')}${x.vehicleId ? `<div class="tiny muted">${esc(f.vehicles.find((y) => y.id === x.vehicleId)?.name || '')}</div>` : ''}` }, { h: 'Costo', num: true, r: (x) => money(x.cost || 0) }, { h: 'Estado', r: (x) => SHIP[x.status] }, { h: '', num: true, cls: 'nowrap', r: (x) => (x.status === 'ready' ? `<button class="btn btn-primary btn-sm" data-s-go="${x.id}">Despachar</button>` : x.status === 'transit' ? `<button class="btn btn-outline btn-sm" data-s-done="${x.id}">Marcar entregado</button>` : '') }], f.ships, { empty: 'Todavía no hay envíos.' })}</div>`;
      } else if (s.view === 'carriers') {
        w.innerHTML = `<div class="row wrap mb"><label class="check grow"><input type="checkbox" data-s-sms ${f.smsOn ? 'checked' : ''}><span><b>Avisar al cliente por SMS cuando se entrega</b><div class="tiny muted">Es el módulo de mensajes de texto de Inventario.</div></span></label><button class="btn btn-primary" data-s-newcr>${icon('plus')} Nuevo transportista</button></div><div class="card">${P.table([{ h: 'Activo', r: (c) => `<input type="checkbox" data-s-act="${c.id}" ${c.active ? 'checked' : ''} style="accent-color:var(--brand)">` }, { h: 'Transportista', r: (c) => `<b>${esc(c.name)}</b>${c.fleet ? ' <span class="badge info">Flota propia</span>' : ''}` }, { h: 'Costo base', num: true, r: (c) => money(c.base) }, { h: 'Por kilo', num: true, r: (c) => money(c.perKg) }], f.carriers)}</div>`;
      } else {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">La carga que lleva cada vehículo es la suma del peso de sus envíos en camino.</span><button class="btn btn-primary" data-s-newv>${icon('plus')} Nuevo vehículo</button></div><div class="grid g2">${f.vehicles.map((x) => { const ld = loadOf(f, x.id); return `<div class="card"><div class="card-b"><div class="row between"><div><b>${esc(x.name)}</b><div class="tiny muted">${esc(x.plate)}</div></div>${ld ? '<span class="badge info">En ruta</span>' : '<span class="badge ok">Disponible</span>'}</div><div class="bar mt ${ld / x.cap > 0.85 ? 'warn' : ''}"><i style="width:${Math.min(100, (ld / x.cap) * 100)}%"></i></div><div class="tiny muted mt8">Carga: ${P.num(ld)} de ${P.num(x.cap)} kg</div></div></div>`; }).join('')}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-s-view]', (e, el) => { ctx.sub('ship').view = el.dataset.sView; ctx.draw(); });
      P.on(v, 'click', '[data-s-new]', () => shipDialog(ctx));
      P.on(v, 'click', '[data-s-go]', (e, el) => dispatch(ctx, f.ships.find((x) => x.id === el.dataset.sGo)));
      P.on(v, 'click', '[data-s-done]', (e, el) => {
        const sh = f.ships.find((x) => x.id === el.dataset.sDone); sh.status = 'delivered'; sh.date = Date.now(); P.log('SHIPMENT_DELIVERED', `Envío ${sh.no} entregado a ${sh.customer}`, 'Factory'); P.toast(`Envío ${sh.no} entregado.`); ctx.draw();
        if (f.smsOn && sh.phone) F.smsDialog(`+54 9 ${sh.phone.replace(/\D/g, '')}`, `${P.S.settings.storeName}: tu pedido ${sh.saleNo} fue entregado. ¡Gracias por tu compra!`);
      });
      P.on(v, 'change', '[data-s-sms]', (e, el) => { f.smsOn = el.checked; P.toast(el.checked ? 'Los clientes recibirán un SMS al recibir su pedido.' : 'Se desactivó el aviso por SMS.'); });
      P.on(v, 'change', '[data-s-act]', (e, el) => { f.carriers.find((c) => c.id === el.dataset.sAct).active = el.checked; ctx.draw(); });
      P.on(v, 'click', '[data-s-newcr]', () => {
        const m = P.modal({ title: 'Nuevo transportista', size: 'narrow', body: `<div class="stack"><div class="field"><label>Nombre</label><input class="input" id="cn" placeholder="Ej.: Expreso del Sur"></div><div class="grid g2"><div class="field"><label>Costo base</label><input class="input" id="cb" type="number" min="0" value="2000"></div><div class="field"><label>Por kilo</label><input class="input" id="ck" type="number" min="0" value="80"></div></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
        m.on('click', '[data-ok]', () => { const name = m.$('#cn').value.trim(); if (!name) return P.toast('Ponele un nombre al transportista.', 'bad'); f.carriers.push({ id: P.uid('cr'), name, base: Math.round(+m.$('#cb').value || 0), perKg: Math.round(+m.$('#ck').value || 0), active: true }); m.close(); P.toast('Transportista guardado.'); ctx.draw(); });
      });
      P.on(v, 'click', '[data-s-newv]', () => {
        const m = P.modal({ title: 'Nuevo vehículo', size: 'narrow', body: `<div class="stack"><div class="field"><label>Nombre</label><input class="input" id="vn" placeholder="Ej.: Furgón"></div><div class="grid g2"><div class="field"><label>Patente</label><input class="input" id="vp" placeholder="AA 000 BB"></div><div class="field"><label>Capacidad (kg)</label><input class="input" id="vc" type="number" min="1" value="1000"></div></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
        m.on('click', '[data-ok]', () => { const name = m.$('#vn').value.trim(); const cap = Math.round(+m.$('#vc').value || 0); if (!name || cap <= 0) return P.toast('Poné el nombre y la capacidad.', 'bad'); f.vehicles.push({ id: P.uid('v'), name, plate: m.$('#vp').value.trim() || 'Sin patente', cap }); m.close(); P.toast('Vehículo guardado.'); ctx.draw(); });
      });
    },
  };

  [wh, val, bar, ship].forEach(F.tab);

  /* ============================================================ PANTALLA ============================================================ */
  P.screens.factory = {
    render(v) {
      const S = P.S; const f = F.ensure(); const st = { tab: 'wh' };
      const ctx = { S, f, v, st, t: {}, sub: (k, d) => (st[k] ||= d), draw: () => draw() };
      const tabs = () => F.tabs.slice().sort((a, b) => a.order - b.order);
      const draw = () => {
        v.innerHTML = `<div class="page">${P.page('Factory', 'Depósitos, costos, códigos de barras, envíos, producción, subcontratación, mantenimiento y reparaciones, a partir de lo que ya cargás en Plexi.', 'factory')}<div class="mb">${P.tabs(tabs().map((t) => [t.key, t.label, t.badge ? t.badge(ctx) : '']), st.tab)}</div><div id="body"></div></div>`;
        $('.tabs', v).classList.add('wrap');
        tabs().find((t) => t.key === st.tab).body($('#body', v), ctx);
      };
      draw();
      P.on(v, 'click', '[data-tab]', (e, el) => { st.tab = el.dataset.tab; draw(); window.scrollTo(0, 0); });
      P.on(v, 'click', '[data-go]', (e, el) => P.nav(el.dataset.go));
      tabs().forEach((t) => t.events && t.events(v, ctx));
    },
  };
})();
