/* Pantalla Factory, parte 2: las pestañas de fabricación. Producción (mrp), Subcontratación (mrp_subcontracting*), Mantenimiento (maintenance, stock_maintenance)
   y Reparaciones (repair, mrp_repair). Se suman al esqueleto de screens5.js con P.fac.tab(); sus datos se arman con P.fac.seeders.
   Cuando una orden consume o fabrica mercadería, mueve el stock de Inventario y deja el movimiento; los gastos de mantenimiento van a Costos → Gastos y las reparaciones facturadas a la cuenta del cliente. */
(function () {
  const P = window.Plexi;
  const F = P.fac;
  const { esc, icon, money, $ } = P;
  const DAY = P.DAY;
  const { sum, pad } = F;
  const HOUR_RATE = 4500; // costo de una hora de mantenimiento
  const hrs = (h) => `${h.toFixed(1).replace('.', ',')} h`;

  /* ---------- cálculos de fabricación ---------- */
  const bomOf = (f, id) => f.boms.find((b) => b.id === id);
  const wcOf = (f, id) => f.wcs.find((w) => w.id === id);
  const needs = (f, bom, qty) => bom.lines.map((l) => ({ p: P.get(l.pid), need: Math.ceil((l.qty * qty) / bom.qty) })).filter((n) => n.p);
  const shortage = (f, bom, qty) => needs(f, bom, qty).filter((n) => n.p.stock < n.need);
  const hoursOf = (f, bom, qty, wc) => (sum(bom.ops.filter((o) => !wc || o.wc === wc), (o) => o.min) / 60) * (qty / bom.qty);
  const laborOf = (f, bom, qty) => sum(bom.ops, (o) => (o.min / 60) * (wcOf(f, o.wc)?.costHour || 0)) * (qty / bom.qty);
  const moCost = (f, mo) => {
    if (mo.costSnap) return mo.costSnap; const bom = bomOf(f, mo.bomId);
    const mat = sum(needs(f, bom, mo.qty), (n) => n.need * n.p.cost); const lab = laborOf(f, bom, mo.qty); const ext = sum(mo.extra || [], (x) => x.amount);
    return { mat, lab, ext, total: mat + lab + ext, unit: (mat + lab + ext) / mo.qty };
  };
  const scCost = (f, sc) => {
    const bom = bomOf(f, sc.bomId); const mat = sum(needs(f, bom, sc.qty), (n) => n.need * n.p.cost); const srv = sc.unitService * sc.qty; const ext = sum(sc.extra || [], (x) => x.amount);
    return { mat, srv, ext, total: mat + srv + ext, unit: (mat + srv + ext) / sc.qty };
  };
  const missingText = (list) => list.map((n) => `${n.p.name} (faltan ${F.q(n.p, n.need - n.p.stock)})`).join(', ');
  const stockIn = (f, p, qty, wh, type, reason) => { F.move(p, qty, type, reason); const c = F.split(f, p); f.loc[p.id] = { w2: c.w2, w3: c.w3 }; if (wh !== 'w1') f.loc[p.id][wh] += qty; };
  const avgCost = (p, before, qty, unit) => { p.cost = Math.round((before * p.cost + qty * unit) / (before + qty)); };

  /* ---------- datos de ejemplo ---------- */
  F.seeders.push((f) => {
    const S = P.S; const id = (n) => F.byName(n)?.id; const now = Date.now();
    f.wcs = [{ id: 'wc1', name: 'Centro de corte', costHour: 3500 }, { id: 'wc2', name: 'Línea de ensamble', costHour: 4200 }, { id: 'wc3', name: 'Centro de acabado', costHour: 3000 }];
    f.shelf = {}; if (id('Producto terminado B')) f.shelf[id('Producto terminado B')] = 365;
    f.boms = []; f.orders = []; f.scs = []; f.equip = []; f.mn = []; f.rp = [];
    const bom = (name, qty, lines, ops, extra = {}) => { const pid = id(name); if (pid) f.boms.push({ id: `b${f.boms.length + 1}`, pid, qty, lines: lines.map(([n, q]) => ({ pid: id(n), qty: q })).filter((l) => l.pid), ops, ...extra }); };
    bom('Producto terminado A', 1, [['Materia prima 1', 2], ['Materia prima 2', 1], ['Insumo 2', 4]], [{ name: 'Corte', wc: 'wc1', min: 20 }, { name: 'Ensamble', wc: 'wc2', min: 30 }]);
    bom('Producto terminado B', 1, [['Semielaborado 1', 1], ['Materia prima 3', 2], ['Materia prima 4', 0.5], ['Insumo 2', 6]], [{ name: 'Ensamble', wc: 'wc2', min: 35 }, { name: 'Acabado', wc: 'wc3', min: 25 }]);
    bom('Producto terminado C', 1, [['Semielaborado 1', 2], ['Materia prima 2', 2], ['Materia prima 4', 1], ['Insumo 1', 1]], [{ name: 'Ensamble', wc: 'wc2', min: 45 }, { name: 'Acabado', wc: 'wc3', min: 40 }], { sub: true });
    bom('Semielaborado 1', 5, [['Materia prima 1', 3], ['Materia prima 3', 4]], [{ name: 'Corte', wc: 'wc1', min: 30 }]);
    const mo = (status, name, qty, ago) => {
      const b = f.boms.find((x) => x.pid === id(name)); if (!b) return;
      const o = { id: `mo${f.orders.length + 1}`, no: F.no(f, 'mo', 'OP'), pid: b.pid, bomId: b.id, qty, status, created: now - ago * DAY, extra: [] };
      if (status === 'done') { o.done = o.created + DAY; o.lotNo = 'L-2610-006'; o.costSnap = moCost(f, o); } if (status === 'progress') o.started = now - DAY / 2; f.orders.push(o);
    };
    mo('done', 'Producto terminado A', 20, 8); mo('progress', 'Producto terminado B', 10, 2); mo('confirmed', 'Semielaborado 1', 10, 1); mo('draft', 'Producto terminado C', 4, 0);
    const talleres = S.suppliers.filter((s) => /Taller Externo/.test(s.name)); const ta = talleres[0] || S.suppliers[0]; const tb = talleres[1] || ta;
    const sc = (status, qty, sup, price, ago, dropship) => { const b = f.boms.find((x) => x.sub); if (!b || !sup) return; f.scs.push({ id: `sc${f.scs.length + 1}`, no: F.no(f, 'sc', 'SC'), pid: b.pid, bomId: b.id, qty, supplierId: sup.id, unitService: price, dropship, status, date: now - ago * DAY, extra: [] }); };
    sc('received', 6, ta, 3500, 12, false); sc('sent', 4, tb, 3800, 3, false); sc('draft', 5, ta, 3500, 0, true);
    const eq = (name, wc, serial, every, lastAgo) => f.equip.push({ id: `eq${f.equip.length + 1}`, name, wc, serial, every, last: now - lastAgo * DAY });
    eq('Máquina de corte', 'wc1', 'MC-0412', 90, 75); eq('Línea de ensamble', 'wc2', 'LE-0188', 60, 70); eq('Compresor de aire', '', 'CA-0931', 120, 30); eq('Autoelevador', '', 'AE-0057', 45, 20);
    const mn = (stage, type, equipIdx, title, dueIn, extra = {}) => { const e = f.equip[equipIdx]; if (e) f.mn.push({ id: `mn${f.mn.length + 1}`, no: F.no(f, 'mn', 'MN'), equipId: e.id, type, title, stage, date: now - DAY, due: P.dayStart() + dueIn * DAY, hours: 0, parts: [], cost: 0, ...extra }); };
    mn('new', 'corrective', 1, 'Ruido en la cinta transportadora', 2); mn('progress', 'preventive', 0, 'Cambio de cuchillas y lubricación', 1); mn('done', 'corrective', 2, 'Pérdida de presión en el compresor', -10, { hours: 3, parts: [{ pid: id('Repuesto 1'), qty: 1 }], cost: 3 * HOUR_RATE + (F.byName('Repuesto 1')?.cost || 0) }); mn('new', 'preventive', 3, 'Revisión de los 45 días', -2);
    const cu = S.customers; const rp = (stage, ci, name, serial, issue, warranty, parts, labor, ago) => { const p = F.byName(name); const c = cu[ci]; if (!p || !c) return; f.rp.push({ id: `rp${f.rp.length + 1}`, no: F.no(f, 'rp', 'RP'), customerId: c.id, customer: c.name, pid: p.id, serial, issue, warranty, stage, date: now - ago * DAY, parts: parts.map(([n, q]) => { const r = F.byName(n); return { pid: r.id, qty: q, price: Math.round(r.cost * 1.5) }; }), labor }); };
    rp('repair', 0, 'Producto terminado B', 'SN-4471', 'No enciende', true, [['Repuesto 1', 1]], 12000, 3); rp('quote', 1, 'Producto terminado C', 'SN-5120', 'Pérdida de presión', false, [['Repuesto 2', 1]], 18000, 0); rp('invoiced', 2, 'Producto terminado A', 'SN-3306', 'Ruido al funcionar', false, [['Repuesto 1', 1]], 9000, 15);
    rp('confirmed', 3, 'Producto terminado A', 'SN-6012', 'Pérdida de aceite', false, [['Repuesto 1', 1]], 8000, 2); rp('done', 4, 'Producto terminado B', 'SN-2208', 'Falla intermitente', false, [['Repuesto 2', 1]], 15000, 5);
  });

  /* ============================================================ PRODUCCIÓN (mrp, mrp_account, mrp_landed_costs, mrp_product_expiry, mrp_delivery) ============================================================ */
  const MO = { draft: '<span class="badge">Borrador</span>', confirmed: '<span class="badge info">Confirmada</span>', progress: '<span class="badge warn">En curso</span>', done: '<span class="badge ok">Hecha</span>', cancel: '<span class="badge bad">Cancelada</span>' };
  const moAct = (ctx, mo, act) => {
    const { f } = ctx; const bom = bomOf(f, mo.bomId); const p = P.get(mo.pid);
    if (act === 'confirm') mo.status = 'confirmed';
    else if (act === 'start') { mo.status = 'progress'; mo.started = Date.now(); }
    else if (act === 'cancel') mo.status = 'cancel';
    else if (act === 'done') {
      const miss = shortage(f, bom, mo.qty); if (miss.length) { P.toast(`No alcanzan los componentes: ${missingText(miss)}.`, 'bad'); return false; }
      const t = moCost(f, mo); const before = p.stock;
      needs(f, bom, mo.qty).forEach((n) => F.move(n.p, -n.need, 'Consumo en producción', mo.no));
      stockIn(f, p, mo.qty, 'w2', 'Producción terminada', mo.no); avgCost(p, before, mo.qty, t.unit);
      const days = f.shelf[p.id]; const lot = { id: P.uid('lt'), no: F.lotNo(f), pid: p.id, qty: mo.qty, wh: 'w2', made: Date.now(), expires: days ? P.dayStart() + days * DAY : null };
      f.lots.push(lot); mo.status = 'done'; mo.done = Date.now(); mo.costSnap = t; mo.lotNo = lot.no;
    } else if (act === 'unbuild') {
      if (p.stock < mo.qty) { P.toast(`Para desarmar hacen falta ${F.q(p, mo.qty)} de «${p.name}» en stock y hay ${F.q(p, p.stock)}.`, 'bad'); return false; }
      F.move(p, -mo.qty, 'Desarmado', mo.no); needs(f, bom, mo.qty).forEach((n) => F.move(n.p, n.need, 'Componentes recuperados', mo.no)); mo.unbuilt = true;
    }
    P.log(`MO_${act.toUpperCase()}`, `Orden ${mo.no} (${p.name}): ${{ confirm: 'confirmada', start: 'iniciada', cancel: 'cancelada', done: 'terminada', unbuild: 'desarmada' }[act]}`, 'Factory');
    P.toast({ confirm: `Orden ${mo.no} confirmada.`, start: `Orden ${mo.no} en curso.`, cancel: `Orden ${mo.no} cancelada.`, done: `Orden ${mo.no} terminada: entraron ${F.q(p, mo.qty)} de «${p.name}» y se descontaron los componentes.`, unbuild: `Orden ${mo.no} desarmada: los componentes volvieron al stock.` }[act]);
    return true;
  };
  const NEXT = { draft: ['confirm', 'Confirmar'], confirmed: ['start', 'Iniciar'], progress: ['done', 'Terminar'] };
  const orderDialog = (ctx, mo) => {
    const { f } = ctx; const bom = bomOf(f, mo.bomId); const p = P.get(mo.pid); const t = moCost(f, mo); const open = ['draft', 'confirmed', 'progress'].includes(mo.status);
    const m = P.modal({ title: `Orden ${mo.no}`, subtitle: `${F.q(p, mo.qty)} de ${p.name}`, size: 'wide', body: `<div class="stack">
      <div class="row wrap">${MO[mo.status]}${mo.unbuilt ? '<span class="badge warn">Desarmada</span>' : ''}<span class="muted small">Creada el ${P.date(mo.created)}${mo.done ? ` · terminada el ${P.date(mo.done)}` : ''}${mo.lotNo ? ` · lote ${esc(mo.lotNo)}` : ''}</span></div>
      <div class="grid g2"><div class="card"><div class="card-h"><div><h3>Componentes</h3><p>Lo que consume la orden.</p></div></div>${P.table([{ h: 'Componente', r: (n) => esc(n.p.name) }, { h: 'Necesita', num: true, r: (n) => F.q(n.p, n.need) }, { h: 'En stock', num: true, r: (n) => (mo.status === 'done' ? '<span class="faint">—</span>' : `<b class="${n.p.stock < n.need ? 'red' : 'green'}">${F.q(n.p, n.p.stock)}</b>`) }], needs(f, bom, mo.qty))}</div>
      <div class="card"><div class="card-h"><div><h3>Operaciones</h3><p>Dónde y cuánto tarda.</p></div></div>${P.table([{ h: 'Operación', r: (o) => esc(o.name) }, { h: 'Centro de trabajo', r: (o) => esc(wcOf(f, o.wc)?.name || '—') }, { h: 'Tiempo', num: true, r: (o) => hrs((o.min / 60) * (mo.qty / bom.qty)) }], bom.ops)}</div></div>
      <div class="card"><div class="card-h"><div><h3>Costo de producción</h3><p>Imputado a la cuenta analítica «Planta de producción».</p></div></div><div class="card-b">
        <div class="kv"><span>Materiales</span><span>${money(t.mat)}</span></div><div class="kv"><span>Mano de obra y máquinas</span><span>${money(t.lab)}</span></div>
        ${(mo.extra || []).map((x) => `<div class="kv"><span>${esc(x.label)}</span><span>${money(x.amount)}</span></div>`).join('')}<div class="kv"><span><b>Total</b></span><span><b>${money(t.total)}</b></span></div><div class="kv"><span>Costo por unidad</span><span><b>${money(t.unit)}</b></span></div></div></div>
      </div><div class="dialog-f"><button class="btn btn-outline" data-close>Cerrar</button>${open ? '<button class="btn btn-outline" data-extra>Agregar costo adicional</button>' : ''}${mo.status === 'done' && !mo.unbuilt ? '<button class="btn btn-outline" data-act="unbuild">Desarmar</button>' : ''}${open ? '<button class="btn btn-ghost" data-act="cancel" style="color:var(--bad)">Cancelar orden</button>' : ''}${NEXT[mo.status] ? `<button class="btn btn-primary" data-act="${NEXT[mo.status][0]}">${NEXT[mo.status][1]}</button>` : ''}</div>` });
    m.on('click', '[data-act]', (e, el) => { if (moAct(ctx, mo, el.dataset.act)) { m.close(); ctx.draw(); } });
    m.on('click', '[data-extra]', () => {
      const x = P.modal({ title: 'Costo adicional', subtitle: `Orden ${mo.no}`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Concepto</label><input class="input" id="xl" placeholder="Ej.: Energía, flete interno"></div><div class="field"><label>Importe</label><input class="input" id="xa" type="number" min="1" value="5000"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Agregar</button></div>` });
      x.on('click', '[data-ok]', () => { const label = x.$('#xl').value.trim(); const amount = Math.round(+x.$('#xa').value || 0); if (!label || amount <= 0) return P.toast('Poné el concepto y un importe mayor a cero.', 'bad'); mo.extra.push({ label, amount }); P.log('MO_EXTRA_COST', `Costo adicional «${label}» en ${mo.no}`, 'Factory'); x.close(); m.close(); P.toast('Costo agregado a la orden.'); ctx.draw(); });
    });
  };
  const newOrderDialog = (ctx) => {
    const { f } = ctx; if (!f.boms.length) return P.toast('Primero cargá una lista de materiales.', 'warn');
    const m = P.modal({ title: 'Nueva orden de producción', subtitle: 'Elegí qué fabricar y cuánto', size: 'wide', body: `<div class="stack"><div class="grid g2"><div class="field"><label>Producto a fabricar</label><select class="input" id="ob">${f.boms.map((b) => `<option value="${b.id}">${esc(P.get(b.pid)?.name)}</option>`).join('')}</select></div><div class="field"><label>Cantidad</label><input class="input" id="oq" type="number" min="1" value="10"></div></div><div id="ov"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Crear orden</button></div>` });
    const draw = () => { const b = bomOf(f, m.$('#ob').value); const q = Math.max(1, Math.round(+m.$('#oq').value || 1)); const t = { mat: sum(needs(f, b, q), (n) => n.need * n.p.cost), lab: laborOf(f, b, q) }; const miss = shortage(f, b, q); m.$('#ov').innerHTML = `${P.table([{ h: 'Componente', r: (n) => esc(n.p.name) }, { h: 'Necesita', num: true, r: (n) => F.q(n.p, n.need) }, { h: 'En stock', num: true, r: (n) => `<b class="${n.p.stock < n.need ? 'red' : 'green'}">${F.q(n.p, n.p.stock)}</b>` }], needs(f, b, q))}<div class="notice ${miss.length ? '' : 'ok'} mt">${miss.length ? `Faltan componentes: ${esc(missingText(miss))}. Se pueden pedir desde Depósitos → Reposición.` : 'Hay stock de todos los componentes.'} Costo estimado: <b>${money(t.mat + t.lab)}</b> (${money((t.mat + t.lab) / q)} por unidad).</div>`; };
    draw(); m.on('input', '#oq', draw); m.on('change', '#ob', draw);
    m.on('click', '[data-ok]', () => { const b = bomOf(f, m.$('#ob').value); const qty = Math.max(1, Math.round(+m.$('#oq').value || 0)); const o = { id: P.uid('mo'), no: F.no(f, 'mo', 'OP'), pid: b.pid, bomId: b.id, qty, status: 'draft', created: Date.now(), extra: [] }; f.orders.unshift(o); P.log('MO_CREATED', `Orden ${o.no}: ${qty} × ${P.get(b.pid).name}`, 'Factory'); m.close(); P.toast(`Orden ${o.no} creada en borrador.`); ctx.sub('prod').view = 'orders'; ctx.draw(); });
  };
  const bomDialog = (ctx) => {
    const { f } = ctx; const prods = F.live();
    const row = (i) => `<div class="grid g2"><select class="input" id="bl${i}"><option value="">— sin componente —</option>${F.opt(prods, '', (p) => p.name)}</select><input class="input" id="bq${i}" type="number" min="0" step="0.5" value="${i === 0 ? 1 : 0}"></div>`;
    const m = P.modal({ title: 'Nueva lista de materiales', subtitle: 'La receta de un producto', size: 'wide', body: `<div class="stack"><div class="grid g2"><div class="field"><label>Producto que se fabrica</label><select class="input" id="bp">${F.opt(prods.filter((p) => ['fin', 'semi'].includes(F.kind(p))), '', (p) => p.name)}</select></div><div class="field"><label>Cantidad que rinde la receta</label><input class="input" id="bn" type="number" min="1" value="1"></div></div><div><label class="lbl">Componentes (producto y cantidad)</label><div class="stack s2">${[0, 1, 2].map(row).join('')}</div></div><div class="grid g3"><div class="field"><label>Operación</label><input class="input" id="bo" value="Ensamble"></div><div class="field"><label>Centro de trabajo</label><select class="input" id="bw">${F.opt(f.wcs, '', (w) => w.name)}</select></div><div class="field"><label>Minutos</label><input class="input" id="bm" type="number" min="1" value="30"></div></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar lista</button></div>` });
    m.on('click', '[data-ok]', () => {
      const pid = m.$('#bp').value; const lines = [0, 1, 2].map((i) => ({ pid: m.$(`#bl${i}`).value, qty: +m.$(`#bq${i}`).value || 0 })).filter((l) => l.pid && l.qty > 0 && l.pid !== pid);
      if (!pid || !lines.length) return P.toast('Elegí el producto y al menos un componente distinto de él.', 'bad'); if (f.boms.some((b) => b.pid === pid)) return P.toast('Ese producto ya tiene una lista de materiales.', 'warn');
      f.boms.push({ id: P.uid('b'), pid, qty: Math.max(1, +m.$('#bn').value || 1), lines, ops: [{ name: m.$('#bo').value.trim() || 'Operación', wc: m.$('#bw').value, min: Math.max(1, +m.$('#bm').value || 1) }] });
      P.log('BOM_CREATED', `Lista de materiales de «${P.get(pid).name}»`, 'Factory'); m.close(); P.toast('Lista de materiales guardada.'); ctx.sub('prod').view = 'boms'; ctx.draw();
    });
  };
  const prod = {
    key: 'prod', label: 'Producción', order: 5, badge: ({ f }) => f.orders.filter((o) => ['draft', 'confirmed', 'progress'].includes(o.status)).length,
    body(b, ctx) {
      const { f } = ctx; const s = ctx.sub('prod', { view: 'orders' }); const open = f.orders.filter((o) => ['draft', 'confirmed', 'progress'].includes(o.status));
      const planned = sum(open, (o) => hoursOf(f, bomOf(f, o.bomId), o.qty)); const made = sum(f.orders.filter((o) => o.status === 'done' && !o.unbuilt && o.done > Date.now() - 30 * DAY), (o) => o.qty);
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('clipboard-list', 'Órdenes abiertas', open.length, `${f.orders.filter((o) => o.status === 'progress').length} en curso`, 'info')}${P.kpi('clock', 'Horas planificadas', hrs(planned), 'en los centros de trabajo', 'gold')}${P.kpi('package', 'Fabricado (30 días)', P.num(made), 'unidades terminadas')}${P.kpi('triangle-alert', 'Con faltantes', open.filter((o) => shortage(f, bomOf(f, o.bomId), o.qty).length).length, 'órdenes sin todos los componentes', 'bad')}</div>
        ${F.chips('data-p-view', [['orders', 'Órdenes de producción', f.orders.length], ['boms', 'Listas de materiales', f.boms.length], ['wc', 'Centros de trabajo', f.wcs.length]], s.view)}<div id="pb"></div>`; const w = $('#pb', b);
      if (s.view === 'orders') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Al terminar una orden se descuentan los componentes y entra el producto, con su lote y su costo real.</span><button class="btn btn-primary" data-p-new>${icon('plus')} Nueva orden</button></div><div class="card">${P.table([{ h: 'Orden', cls: 'nowrap', r: (o) => `<b>${o.no}</b><div class="tiny muted">${P.date(o.created)}</div>` }, { h: 'Producto', r: (o) => { const p = P.get(o.pid); return `${esc(p?.name || '—')} <span class="muted">· ${p ? F.q(p, o.qty) : o.qty}</span>`; } }, { h: 'Estado', r: (o) => `${MO[o.status]}${o.unbuilt ? ' <span class="badge warn">Desarmada</span>' : ''}` }, { h: 'Componentes', r: (o) => (['draft', 'confirmed', 'progress'].includes(o.status) ? (shortage(f, bomOf(f, o.bomId), o.qty).length ? '<span class="badge bad">Faltan</span>' : '<span class="badge ok">Disponibles</span>') : '<span class="faint">—</span>') }, { h: 'Costo por unidad', num: true, r: (o) => money(moCost(f, o).unit) }, { h: '', num: true, cls: 'nowrap', r: (o) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-p-open="${o.id}" title="Ver detalle">${icon('eye')}</button>${NEXT[o.status] ? `<button class="btn btn-primary btn-sm" data-p-act="${NEXT[o.status][0]}:${o.id}">${NEXT[o.status][1]}</button>` : ''}</span>` }], f.orders, { empty: 'Todavía no hay órdenes de producción.' })}</div>`;
      } else if (s.view === 'boms') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">La receta de cada producto: qué componentes lleva y qué operaciones hacen falta. El peso de un kit es la suma de sus componentes.</span><button class="btn btn-primary" data-p-newbom>${icon('plus')} Nueva lista</button></div><div class="card">${P.table([{ h: 'Producto', r: (x) => `<b>${esc(P.get(x.pid)?.name)}</b><div class="tiny muted">receta por ${x.qty}${x.sub ? ' · <span class="badge info">Se puede subcontratar</span>' : ''}</div>` }, { h: 'Componentes', r: (x) => x.lines.map((l) => `${l.qty} × ${esc(P.get(l.pid)?.name || '—')}`).join('<br>') }, { h: 'Operaciones', r: (x) => x.ops.map((o) => `${esc(o.name)} <span class="muted">· ${o.min} min</span>`).join('<br>') }, { h: 'Peso', num: true, r: (x) => `${F.weightOf(f, P.get(x.pid)).toFixed(1).replace('.', ',')} kg` }, { h: 'Costo teórico', num: true, r: (x) => { const c = sum(x.lines, (l) => l.qty * (P.get(l.pid)?.cost || 0)) + laborOf(f, x, x.qty); return `<b>${money(c / x.qty)}</b>`; } }], f.boms)}</div>`;
      } else {
        w.innerHTML = `<div class="grid g3">${f.wcs.map((c) => { const h = sum(open, (o) => hoursOf(f, bomOf(f, o.bomId), o.qty, c.id)); return `<div class="card"><div class="card-b"><div class="row between"><b>${esc(c.name)}</b><button class="btn btn-ghost btn-icon" data-p-wc="${c.id}" title="Editar costo">${icon('pencil')}</button></div><div class="tiny muted">${money(c.costHour)} por hora</div><div class="bar mt ${h / 40 > 0.85 ? 'warn' : ''}"><i style="width:${Math.min(100, (h / 40) * 100)}%"></i></div><div class="tiny muted mt8">${hrs(h)} planificadas de 40 h por semana</div></div></div>`; }).join('')}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-p-view]', (e, el) => { ctx.sub('prod').view = el.dataset.pView; ctx.draw(); });
      P.on(v, 'click', '[data-p-new]', () => newOrderDialog(ctx));
      P.on(v, 'click', '[data-p-newbom]', () => bomDialog(ctx));
      P.on(v, 'click', '[data-p-open]', (e, el) => orderDialog(ctx, f.orders.find((o) => o.id === el.dataset.pOpen)));
      P.on(v, 'click', '[data-p-act]', (e, el) => { const [act, id] = el.dataset.pAct.split(':'); if (moAct(ctx, f.orders.find((o) => o.id === id), act)) ctx.draw(); });
      P.on(v, 'click', '[data-p-wc]', (e, el) => {
        const c = wcOf(f, el.dataset.pWc); const m = P.modal({ title: c.name, subtitle: 'Costo de usar este centro', size: 'narrow', body: `<div class="field"><label>Costo por hora</label><input class="input" id="wh" type="number" min="0" value="${c.costHour}"></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
        m.on('click', '[data-ok]', () => { c.costHour = Math.max(0, Math.round(+m.$('#wh').value || 0)); m.close(); P.toast('Costo por hora actualizado: cambia el costo de las próximas órdenes.'); ctx.draw(); });
      });
    },
  };

  /* ============================================================ SUBCONTRATACIÓN (mrp_subcontracting*, stock_dropshipping) ============================================================ */
  const SC = { draft: '<span class="badge">Borrador</span>', sent: '<span class="badge warn">En el taller</span>', received: '<span class="badge ok">Recibida</span>', cancel: '<span class="badge bad">Cancelada</span>' };
  const scAct = (ctx, sc, act) => {
    const { S, f } = ctx; const bom = bomOf(f, sc.bomId); const p = P.get(sc.pid); const sup = S.suppliers.find((x) => x.id === sc.supplierId);
    if (act === 'send') {
      if (!sc.dropship) { const miss = shortage(f, bom, sc.qty); if (miss.length) { P.toast(`No alcanzan los componentes: ${missingText(miss)}.`, 'bad'); return false; } needs(f, bom, sc.qty).forEach((n) => F.move(n.p, -n.need, 'Envío a subcontratista', sc.no)); }
      sc.status = 'sent';
    } else if (act === 'receive') {
      const t = scCost(f, sc); const before = p.stock; stockIn(f, p, sc.qty, 'w1', 'Recepción de subcontratación', sc.no); avgCost(p, before, sc.qty, t.unit);
      if (sup) { if (sup.balance <= 0) sup.debtSince = Date.now(); sup.balance += sc.unitService * sc.qty; }
      S.orders.unshift({ id: P.uid('o'), number: `OC-${pad(S.orders.length + 1, 4)}`, supplier: sup?.name || '—', date: Date.now(), items: [{ pid: p.id, name: `Servicio de subcontratación — ${p.name}`, qty: sc.qty, cost: sc.unitService }], total: sc.unitService * sc.qty, status: 'received' });
      sc.status = 'received'; sc.costSnap = t; sc.receivedAt = Date.now();
    } else if (act === 'cancel') sc.status = 'cancel';
    P.log(`SC_${act.toUpperCase()}`, `Subcontratación ${sc.no} (${p.name}): ${{ send: 'componentes enviados', receive: 'producto recibido', cancel: 'cancelada' }[act]}`, 'Factory');
    P.toast({ send: sc.dropship ? `${sc.no}: el proveedor entrega los componentes directo al taller.` : `${sc.no}: salieron los componentes hacia ${sup?.name}.`, receive: `${sc.no} recibida: entraron ${F.q(p, sc.qty)} y quedó anotada la deuda con ${sup?.name} (está en Proveedores).`, cancel: `${sc.no} cancelada.` }[act]);
    return true;
  };
  const scNext = { draft: ['send', 'Enviar componentes'], sent: ['receive', 'Recibir producto'] };
  const scDialog = (ctx) => {
    const { S, f } = ctx; const boms = f.boms.filter((x) => x.sub); const shops = S.suppliers.filter((s) => /Taller Externo/.test(s.name)); const list = shops.length ? shops : S.suppliers;
    if (!boms.length) return P.toast('Ninguna lista de materiales se puede subcontratar.', 'warn');
    const m = P.modal({ title: 'Nueva orden de subcontratación', subtitle: 'Un taller externo termina el producto', size: 'wide', body: `<div class="stack"><div class="grid g3"><div class="field"><label>Producto</label><select class="input" id="sp">${boms.map((x) => `<option value="${x.id}">${esc(P.get(x.pid)?.name)}</option>`).join('')}</select></div><div class="field"><label>Cantidad</label><input class="input" id="sq" type="number" min="1" value="6"></div><div class="field"><label>Taller</label><select class="input" id="st">${F.opt(list, '', (x) => x.name)}</select></div></div><div class="field"><label>Precio del servicio por unidad</label><input class="input" id="su" type="number" min="0" value="3500"></div><label class="check"><input type="checkbox" id="sd"><span><b>Los componentes los entrega el proveedor directo al taller</b><div class="tiny muted">Es un envío directo (dropshipping): no salen de tus depósitos.</div></span></label><div id="sv"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Crear orden</button></div>` });
    const build = () => ({ bomId: m.$('#sp').value, qty: Math.max(1, Math.round(+m.$('#sq').value || 1)), unitService: Math.max(0, Math.round(+m.$('#su').value || 0)), extra: [] });
    const draw = () => { const sc = build(); const t = scCost(f, sc); const miss = m.$('#sd').checked ? [] : shortage(f, bomOf(f, sc.bomId), sc.qty); m.$('#sv').innerHTML = `<div class="kv"><span>Componentes que se mandan</span><span>${money(t.mat)}</span></div><div class="kv"><span>Servicio del taller</span><span>${money(t.srv)}</span></div><div class="kv"><span><b>Costo por unidad terminada</b></span><span><b>${money(t.unit)}</b></span></div>${miss.length ? `<div class="notice mt">Faltan componentes: ${esc(missingText(miss))}.</div>` : ''}`; };
    draw(); m.on('input', 'input', draw); m.on('change', 'select', draw); m.on('change', '#sd', draw);
    m.on('click', '[data-ok]', () => { const sc = { ...build(), id: P.uid('sc'), no: F.no(f, 'sc', 'SC'), pid: bomOf(f, m.$('#sp').value).pid, supplierId: m.$('#st').value, dropship: m.$('#sd').checked, status: 'draft', date: Date.now() }; f.scs.unshift(sc); P.log('SC_CREATED', `Subcontratación ${sc.no}`, 'Factory'); m.close(); P.toast(`Orden ${sc.no} creada en borrador.`); ctx.draw(); });
  };
  const sub = {
    key: 'sub', label: 'Subcontratación', order: 6, badge: ({ f }) => f.scs.filter((x) => x.status === 'draft').length,
    body(b, ctx) {
      const { S, f } = ctx; const s = ctx.sub('sub', { view: 'orders' }); const shops = S.suppliers.filter((x) => /Taller Externo/.test(x.name));
      const done = f.scs.filter((x) => x.status === 'received'); const avg = done.length ? sum(done, (x) => x.costSnap?.unit || scCost(f, x).unit) / done.length : 0;
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('truck', 'En el taller', P.num(sum(f.scs.filter((x) => x.status === 'sent'), (x) => x.qty)), 'unidades en proceso', 'info')}${P.kpi('clipboard-list', 'Órdenes abiertas', f.scs.filter((x) => ['draft', 'sent'].includes(x.status)).length, 'borradores y en el taller', 'gold')}${P.kpi('wallet', 'Deuda con talleres', money(sum(shops, (x) => Math.max(0, x.balance))), 'se paga desde Proveedores', 'bad')}${P.kpi('circle-dollar-sign', 'Costo medio', money(avg), 'por unidad recibida')}</div>
        ${F.chips('data-u-view', [['orders', 'Órdenes', f.scs.length], ['shops', 'Talleres']], s.view)}<div id="ub"></div>`; const w = $('#ub', b);
      if (s.view === 'orders') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Mandás los componentes al taller, él termina el producto y lo cobra. Al recibirlo, el costo suma materiales, servicio y costos adicionales.</span><button class="btn btn-primary" data-u-new>${icon('plus')} Nueva orden</button></div><div class="card">${P.table([{ h: 'Orden', cls: 'nowrap', r: (x) => `<b>${x.no}</b><div class="tiny muted">${P.date(x.date)}</div>` }, { h: 'Producto', r: (x) => { const p = P.get(x.pid); return `${esc(p?.name || '—')} <span class="muted">· ${p ? F.q(p, x.qty) : x.qty}</span>`; } }, { h: 'Taller', r: (x) => `${esc(S.suppliers.find((y) => y.id === x.supplierId)?.name || '—')}${x.dropship ? '<div class="tiny"><span class="badge info">Componentes directos del proveedor</span></div>' : ''}` }, { h: 'Estado', r: (x) => SC[x.status] }, { h: 'Costo por unidad', num: true, r: (x) => money(scCost(f, x).unit) }, { h: '', num: true, cls: 'nowrap', r: (x) => `<span class="row end gap4">${['draft', 'sent'].includes(x.status) ? `<button class="btn btn-ghost btn-icon" data-u-extra="${x.id}" title="Agregar costo adicional">${icon('plus')}</button>` : ''}${scNext[x.status] ? `<button class="btn btn-primary btn-sm" data-u-act="${scNext[x.status][0]}:${x.id}">${scNext[x.status][1]}</button>` : ''}${x.status === 'draft' ? `<button class="btn btn-ghost btn-icon" data-u-act="cancel:${x.id}" title="Cancelar" style="color:var(--bad)">${icon('x')}</button>` : ''}</span>` }], f.scs, { empty: 'Todavía no hay órdenes de subcontratación.' })}</div>`;
      } else {
        w.innerHTML = `<div class="card">${P.table([{ h: 'Taller', r: (x) => `<b>${esc(x.name)}</b><div class="tiny muted">${esc(x.contact)} · ${esc(x.phone)}</div>` }, { h: 'Órdenes abiertas', num: true, r: (x) => f.scs.filter((y) => y.supplierId === x.id && ['draft', 'sent'].includes(y.status)).length }, { h: 'Recibidas', num: true, r: (x) => f.scs.filter((y) => y.supplierId === x.id && y.status === 'received').length }, { h: 'Les debés', num: true, r: (x) => (x.balance > 0 ? `<b class="red">${money(x.balance)}</b>` : '<span class="faint">—</span>') }, { h: '', num: true, r: () => `<button class="btn btn-outline btn-sm" data-go="suppliers">Ver en Proveedores</button>` }], shops.length ? shops : S.suppliers.slice(0, 2))}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-u-view]', (e, el) => { ctx.sub('sub').view = el.dataset.uView; ctx.draw(); });
      P.on(v, 'click', '[data-u-new]', () => scDialog(ctx));
      P.on(v, 'click', '[data-u-act]', (e, el) => { const [act, id] = el.dataset.uAct.split(':'); if (scAct(ctx, f.scs.find((x) => x.id === id), act)) ctx.draw(); });
      P.on(v, 'click', '[data-u-extra]', (e, el) => {
        const sc = f.scs.find((x) => x.id === el.dataset.uExtra); const m = P.modal({ title: 'Costo adicional', subtitle: `Orden ${sc.no}`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Concepto</label><input class="input" id="xl" placeholder="Ej.: Flete al taller"></div><div class="field"><label>Importe</label><input class="input" id="xa" type="number" min="1" value="4000"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Agregar</button></div>` });
        m.on('click', '[data-ok]', () => { const label = m.$('#xl').value.trim(); const amount = Math.round(+m.$('#xa').value || 0); if (!label || amount <= 0) return P.toast('Poné el concepto y un importe mayor a cero.', 'bad'); sc.extra.push({ label, amount }); P.log('SC_EXTRA_COST', `Costo adicional «${label}» en ${sc.no}`, 'Factory'); m.close(); P.toast('Costo agregado: sube el costo por unidad.'); ctx.draw(); });
      });
    },
  };

  /* ============================================================ MANTENIMIENTO (maintenance, stock_maintenance) ============================================================ */
  const dueState = (x) => { const d = Math.ceil((x.due - P.dayStart()) / DAY); return d < 0 ? ['bad', `Vencida hace ${-d} d`] : d === 0 ? ['warn', 'Vence hoy'] : ['ok', `Vence en ${d} d`]; };
  const nextDue = (f, e) => { const open = f.mn.find((x) => x.equipId === e.id && x.type === 'preventive' && x.stage !== 'done'); return open ? open.due : P.dayStart(e.last) + e.every * DAY; };
  const mnDone = (ctx, r) => {
    const { S, f } = ctx; const e = f.equip.find((x) => x.id === r.equipId); const parts = F.live().filter((p) => F.kind(p) === 'part');
    const m = P.modal({ title: 'Terminar mantenimiento', subtitle: `${r.no} · ${e.name}`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Horas trabajadas</label><input class="input" id="mh" type="number" min="0" step="0.5" value="2"></div><div><label class="lbl">Repuestos usados (salen del stock)</label><div class="stack s2">${[0, 1].map((i) => `<div class="grid g2"><select class="input" id="mp${i}"><option value="">— ninguno —</option>${F.opt(parts, '', (p) => `${p.name} · hay ${p.stock}`)}</select><input class="input" id="mq${i}" type="number" min="0" value="${i === 0 ? 1 : 0}"></div>`).join('')}</div></div><div class="notice info" id="mv"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Terminar</button></div>` });
    const calc = () => { const used = [0, 1].map((i) => ({ p: P.get(m.$(`#mp${i}`).value), qty: Math.max(0, Math.round(+m.$(`#mq${i}`).value || 0)) })).filter((x) => x.p && x.qty > 0); const h = Math.max(0, +m.$('#mh').value || 0); return { used, h, cost: Math.round(h * HOUR_RATE + sum(used, (x) => x.qty * x.p.cost)) }; };
    const prev = () => { m.$('#mv').innerHTML = `Costo: <b>${money(calc().cost)}</b> (mano de obra a ${money(HOUR_RATE)} por hora más repuestos). Se anota en Costos → Gastos.`; };
    prev(); m.on('input', 'input', prev); m.on('change', 'select', prev);
    m.on('click', '[data-ok]', () => {
      const c = calc(); const bad = c.used.find((x) => x.qty > x.p.stock); if (bad) return P.toast(`Solo hay ${F.q(bad.p, bad.p.stock)} de «${bad.p.name}».`, 'bad');
      c.used.forEach((x) => F.move(x.p, -x.qty, 'Repuesto en mantenimiento', r.no));
      r.stage = 'done'; r.hours = c.h; r.parts = c.used.map((x) => ({ pid: x.p.id, qty: x.qty })); r.cost = c.cost; r.doneAt = Date.now(); e.last = Date.now();
      if (c.cost > 0) S.expenses.unshift({ id: P.uid('e'), category: 'Mantenimiento', area: 'Operación', title: `Mantenimiento — ${e.name}`, amount: c.cost, date: Date.now(), method: 'cash' });
      if (r.type === 'preventive') f.mn.push({ id: P.uid('mn'), no: F.no(f, 'mn', 'MN'), equipId: e.id, type: 'preventive', title: `Preventivo de ${e.name}`, stage: 'new', date: Date.now(), due: P.dayStart() + e.every * DAY, hours: 0, parts: [], cost: 0 });
      P.log('MAINT_DONE', `Mantenimiento ${r.no} de ${e.name} por ${money(c.cost)}`, 'Factory'); m.close(); P.toast(`${r.no} terminado. ${c.cost ? 'El gasto quedó en Costos → Gastos.' : ''}${r.type === 'preventive' ? ' Se programó el próximo preventivo.' : ''}`); ctx.draw();
    });
  };
  const mnNew = (ctx, equipId) => {
    const { f } = ctx;
    const m = P.modal({ title: 'Nueva solicitud de mantenimiento', size: 'narrow', body: `<div class="stack"><div class="field"><label>Equipo</label><select class="input" id="ne">${F.opt(f.equip, equipId, (e) => `${e.name} · ${e.serial}`)}</select></div><div class="grid g2"><div class="field"><label>Tipo</label><select class="input" id="nt"><option value="corrective">Correctivo (algo falló)</option><option value="preventive">Preventivo (programado)</option></select></div><div class="field"><label>Para dentro de (días)</label><input class="input" id="nd" type="number" min="0" value="3"></div></div><div class="field"><label>Qué hay que hacer</label><input class="input" id="nn" placeholder="Ej.: Cambiar correa"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Crear solicitud</button></div>` });
    m.on('click', '[data-ok]', () => { const title = m.$('#nn').value.trim(); if (!title) return P.toast('Contá qué hay que hacer.', 'bad'); const r = { id: P.uid('mn'), no: F.no(f, 'mn', 'MN'), equipId: m.$('#ne').value, type: m.$('#nt').value, title, stage: 'new', date: Date.now(), due: P.dayStart() + Math.max(0, Math.round(+m.$('#nd').value || 0)) * DAY, hours: 0, parts: [], cost: 0 }; f.mn.push(r); P.log('MAINT_CREATED', `Solicitud ${r.no}: ${title}`, 'Factory'); m.close(); P.toast(`Solicitud ${r.no} creada.`); ctx.draw(); });
  };
  const mnt = {
    key: 'mnt', label: 'Mantenimiento', order: 7, badge: ({ f }) => f.mn.filter((x) => x.stage !== 'done' && x.due < P.dayStart()).length,
    body(b, ctx) {
      const { f } = ctx; const open = f.mn.filter((x) => x.stage !== 'done'); const recent = f.mn.filter((x) => x.stage === 'done' && (x.doneAt || x.due) > Date.now() - 30 * DAY);
      const col = (stage, title) => `<div class="kan-col"><h4><span>${title}</span><span>${f.mn.filter((x) => x.stage === stage).length}</span></h4>${f.mn.filter((x) => x.stage === stage).sort((x, y) => x.due - y.due).map((r) => { const e = f.equip.find((y) => y.id === r.equipId); const ds = dueState(r); return `<div class="kan-card ${stage !== 'done' && ds[0] === 'bad' ? 'late' : ''}"><div class="row between"><b>${r.no}</b><span class="badge ${r.type === 'preventive' ? 'info' : 'warn'}">${r.type === 'preventive' ? 'Preventivo' : 'Correctivo'}</span></div><div class="small">${esc(r.title)}</div><div class="tiny muted">${esc(e?.name || '—')}</div>${stage === 'done' ? `<div class="tiny muted">${hrs(r.hours)} · ${money(r.cost)}${r.parts.length ? `<br>Repuestos: ${r.parts.map((x) => `${x.qty} × ${esc(P.get(x.pid)?.name || '—')}`).join(', ')}` : ''}</div>` : `<div class="row between"><span class="badge ${ds[0]}">${ds[1]}</span><button class="btn btn-outline btn-sm" data-m-adv="${r.id}">${stage === 'new' ? 'Empezar' : 'Terminar'}</button></div>`}</div>`; }).join('') || '<div class="tiny faint">Nada por acá.</div>'}</div>`;
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('wrench', 'Solicitudes abiertas', open.length, `${open.filter((x) => x.stage === 'progress').length} en curso`, 'info')}${P.kpi('triangle-alert', 'Vencidas', open.filter((x) => x.due < P.dayStart()).length, 'pasaron su fecha', 'bad')}${P.kpi('clock', 'Horas (30 días)', hrs(sum(recent, (x) => x.hours)), 'de mantenimiento hecho', 'gold')}${P.kpi('wallet', 'Gasto (30 días)', money(sum(recent, (x) => x.cost)), 'mano de obra y repuestos')}</div>
        <div class="row wrap mb"><span class="muted small grow">Al terminar una solicitud se descuentan los repuestos del stock y el costo va a Costos → Gastos. Los preventivos se vuelven a programar solos.</span><button class="btn btn-primary" data-m-new>${icon('plus')} Nueva solicitud</button></div>
        <div class="kan mb">${col('new', 'Nuevas')}${col('progress', 'En curso')}${col('done', 'Hechas')}</div>
        <div class="card"><div class="card-h"><div><h3>Equipos</h3><p>Cuándo toca el próximo mantenimiento preventivo de cada uno.</p></div></div>${P.table([{ h: 'Equipo', r: (e) => `<b>${esc(e.name)}</b><div class="tiny muted">${esc(e.serial)}${e.wc ? ` · ${esc(wcOf(f, e.wc)?.name || '')}` : ''}</div>` }, { h: 'Cada', num: true, r: (e) => `${e.every} días` }, { h: 'Último', cls: 'nowrap', r: (e) => P.date(e.last) }, { h: 'Próximo', cls: 'nowrap', r: (e) => { const d = nextDue(f, e); const ds = dueState({ due: d }); return `${P.date(d)} <span class="badge ${ds[0]}">${ds[1]}</span>`; } }, { h: '', num: true, r: (e) => `<button class="btn btn-outline btn-sm" data-m-new="${e.id}">Solicitar</button>` }], f.equip)}</div>`;
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-m-new]', (e, el) => mnNew(ctx, el.dataset.mNew || ''));
      P.on(v, 'click', '[data-m-adv]', (e, el) => { const r = f.mn.find((x) => x.id === el.dataset.mAdv); if (r.stage === 'new') { r.stage = 'progress'; P.toast(`${r.no} en curso.`); ctx.draw(); } else mnDone(ctx, r); });
    },
  };

  /* ============================================================ REPARACIONES (repair, mrp_repair) ============================================================ */
  const RP = { quote: 'Presupuesto', confirmed: 'Confirmadas', repair: 'En reparación', done: 'Reparadas' };
  const rpTotal = (r) => (r.warranty ? 0 : sum(r.parts, (x) => x.qty * x.price) + r.labor);
  const RPN = { quote: ['confirmed', 'Aprobar'], confirmed: ['repair', 'Empezar'], repair: ['done', 'Terminar'], done: ['invoiced', 'Facturar'] };
  const rpAdv = (ctx, r) => {
    const { f } = ctx; const to = RPN[r.stage][0];
    if (to === 'done') {
      const bad = r.parts.find((x) => P.get(x.pid) && x.qty > P.get(x.pid).stock); if (bad) return P.toast(`No hay stock de «${P.get(bad.pid).name}» para terminar la reparación.`, 'bad');
      r.parts.forEach((x) => { const p = P.get(x.pid); if (p) F.move(p, -x.qty, 'Repuesto en reparación', r.no); });
    }
    if (to === 'invoiced') { const tot = rpTotal(r); const c = P.customer(r.customerId); if (tot > 0 && c) c.ledger.push({ date: Date.now(), type: 'charge', amount: tot, desc: `Reparación ${r.no}` }); r.billed = tot; }
    r.stage = to; P.log('REPAIR_STAGE', `Reparación ${r.no}: ${{ confirmed: 'presupuesto aprobado', repair: 'en reparación', done: 'reparada', invoiced: 'facturada' }[to]}`, 'Factory');
    P.toast(to === 'invoiced' ? (r.billed ? `${r.no} facturada: ${money(r.billed)} a la cuenta de ${r.customer} (se cobra desde Clientes).` : `${r.no} cerrada sin cargo: estaba en garantía.`) : to === 'done' ? `${r.no} reparada: los repuestos salieron del stock.` : `${r.no} avanzó a «${RP[to]}».`); ctx.draw();
  };
  const rpQuote = (r) => {
    const cfg = P.S.settings; const p = P.get(r.pid);
    const m = P.modal({ title: 'Presupuesto de reparación', subtitle: r.no, body: `<div class="ticket print-area"><div class="c"><img class="lg" src="assets/logo-dark.png" alt=""><div class="ttl">${esc(cfg.storeName.toUpperCase())}</div><div class="m">${esc(cfg.address)}</div></div><hr><div class="r"><span>Cliente</span><b>${esc(r.customer)}</b></div><div class="r"><span>Producto</span><span>${esc(p?.name || '—')}</span></div><div class="r"><span>Serie</span><span>${esc(r.serial)}</span></div><div class="r"><span>Problema</span><span>${esc(r.issue)}</span></div><hr>${r.parts.map((x) => `<div class="r"><span>${x.qty} × ${esc(P.get(x.pid)?.name || '—')}</span><span>${money(x.qty * x.price)}</span></div>`).join('')}<div class="r"><span>Mano de obra</span><span>${money(r.labor)}</span></div>${r.warranty ? '<div class="r g"><span>En garantía</span><span>sin cargo</span></div>' : ''}<div class="r big"><span>TOTAL</span><span>${money(rpTotal(r))}</span></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cerrar</button><button class="btn btn-primary" data-print>${icon('printer')} Imprimir</button></div>` });
    m.on('click', '[data-print]', () => window.print());
  };
  const rpNew = (ctx) => {
    const { S, f } = ctx; const parts = F.live().filter((p) => F.kind(p) === 'part'); const prods = F.live().filter((p) => ['fin', 'semi'].includes(F.kind(p)));
    const m = P.modal({ title: 'Nueva reparación', subtitle: 'Un cliente trae un producto con un problema', size: 'wide', body: `<div class="stack"><div class="grid g2"><div class="field"><label>Cliente</label><select class="input" id="rc">${F.opt(S.customers, '', (c) => c.name)}</select></div><div class="field"><label>Producto</label><select class="input" id="rp">${F.opt(prods, '', (p) => p.name)}</select></div></div><div class="grid g2"><div class="field"><label>Número de serie o lote</label><input class="input" id="rs" placeholder="Ej.: SN-4471"></div><div class="field"><label>Problema</label><input class="input" id="ri" placeholder="Ej.: No enciende"></div></div>
      <div><div class="row between"><label class="lbl">Repuestos</label><button class="btn btn-ghost btn-sm" data-sug>Sugerir de la lista de materiales</button></div><div class="stack s2">${[0, 1, 2].map((i) => `<div class="grid g2"><select class="input" id="pp${i}"><option value="">— ninguno —</option>${F.opt(F.live().filter((p) => F.kind(p) !== 'fin'), i === 0 ? parts[0]?.id : '', (p) => p.name)}</select><input class="input" id="pq${i}" type="number" min="0" value="${i === 0 ? 1 : 0}"></div>`).join('')}</div></div>
      <div class="grid g2"><div class="field"><label>Mano de obra</label><input class="input" id="rl" type="number" min="0" value="12000"></div><label class="check" style="align-self:end"><input type="checkbox" id="rw"><span><b>Está en garantía</b><div class="tiny muted">No se le cobra nada al cliente.</div></span></label></div><div class="notice info" id="rv"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Crear presupuesto</button></div>` });
    const parse = () => ({ parts: [0, 1, 2].map((i) => ({ p: P.get(m.$(`#pp${i}`).value), qty: Math.max(0, Math.round(+m.$(`#pq${i}`).value || 0)) })).filter((x) => x.p && x.qty > 0).map((x) => ({ pid: x.p.id, qty: x.qty, price: Math.round(x.p.cost * 1.5) })), labor: Math.max(0, Math.round(+m.$('#rl').value || 0)), warranty: m.$('#rw').checked });
    const prev = () => { const r = parse(); m.$('#rv').innerHTML = `Total del presupuesto: <b>${money(rpTotal(r))}</b>${r.warranty ? ' (en garantía: sin cargo)' : ''}. Los repuestos salen del stock cuando se termina la reparación.`; };
    prev(); m.on('input', 'input', prev); m.on('change', 'select', prev); m.on('change', '#rw', prev);
    m.on('click', '[data-sug]', () => { const bom = f.boms.find((x) => x.pid === m.$('#rp').value); if (!bom) return P.toast('Ese producto no tiene lista de materiales.', 'warn'); bom.lines.slice(0, 3).forEach((l, i) => { m.$(`#pp${i}`).value = l.pid; m.$(`#pq${i}`).value = 1; }); prev(); P.toast('Se cargaron los primeros componentes de la lista de materiales.'); });
    m.on('click', '[data-ok]', () => {
      const p = parse(); const c = P.customer(m.$('#rc').value); if (!m.$('#ri').value.trim()) return P.toast('Contá cuál es el problema.', 'bad');
      const r = { id: P.uid('rp'), no: F.no(f, 'rp', 'RP'), customerId: c.id, customer: c.name, pid: m.$('#rp').value, serial: m.$('#rs').value.trim() || 'Sin serie', issue: m.$('#ri').value.trim(), stage: 'quote', date: Date.now(), ...p };
      f.rp.unshift(r); P.log('REPAIR_CREATED', `Reparación ${r.no} de ${c.name}`, 'Factory'); m.close(); P.toast(`Reparación ${r.no} creada: queda como presupuesto.`); ctx.draw();
    });
  };
  const rep = {
    key: 'rep', label: 'Reparaciones', order: 8, badge: ({ f }) => f.rp.filter((r) => r.stage === 'quote').length,
    body(b, ctx) {
      const { f } = ctx; const s = ctx.sub('rep', { view: 'board' }); const act = f.rp.filter((r) => !['invoiced', 'cancel'].includes(r.stage));
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('wrench', 'En el taller', f.rp.filter((r) => ['confirmed', 'repair'].includes(r.stage)).length, 'aprobadas o en reparación', 'info')}${P.kpi('file-text', 'Presupuestos', f.rp.filter((r) => r.stage === 'quote').length, 'esperando respuesta', 'gold')}${P.kpi('shield-check', 'En garantía', act.filter((r) => r.warranty).length, 'sin cargo para el cliente')}${P.kpi('circle-dollar-sign', 'Para facturar', money(sum(f.rp.filter((r) => r.stage === 'done'), rpTotal)), 'reparaciones terminadas', 'bad')}</div>
        ${F.chips('data-r-view', [['board', 'Tablero', act.length], ['hist', 'Historial', f.rp.length - act.length]], s.view)}<div id="rb"></div>`; const w = $('#rb', b);
      if (s.view === 'board') {
        w.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Presupuesto → reparación → factura. Al terminar salen los repuestos del stock; al facturar se carga a la cuenta del cliente.</span><button class="btn btn-primary" data-r-new>${icon('plus')} Nueva reparación</button></div><div class="kan k4">${Object.entries(RP).map(([stage, title]) => `<div class="kan-col"><h4><span>${title}</span><span>${f.rp.filter((r) => r.stage === stage).length}</span></h4>${f.rp.filter((r) => r.stage === stage).map((r) => `<div class="kan-card"><div class="row between"><b>${r.no}</b>${r.warranty ? '<span class="badge ok">Garantía</span>' : ''}</div><div class="small">${esc(P.get(r.pid)?.name || '—')}</div><div class="tiny muted">${esc(r.customer)} · ${esc(r.serial)}<br>${esc(r.issue)}</div><div class="row between"><b>${money(rpTotal(r))}</b><span class="row gap4"><button class="btn btn-ghost btn-icon" data-r-quote="${r.id}" title="Ver presupuesto">${icon('file-text')}</button><button class="btn btn-primary btn-sm" data-r-adv="${r.id}">${RPN[stage][1]}</button></span></div></div>`).join('') || '<div class="tiny faint">Nada por acá.</div>'}</div>`).join('')}</div>`;
      } else {
        w.innerHTML = `<div class="card">${P.table([{ h: 'N.º', cls: 'nowrap', r: (r) => `<b>${r.no}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (r) => P.date(r.date) }, { h: 'Cliente', r: (r) => esc(r.customer) }, { h: 'Producto', r: (r) => `${esc(P.get(r.pid)?.name || '—')}<div class="tiny muted">${esc(r.serial)} · ${esc(r.issue)}</div>` }, { h: 'Facturado', num: true, r: (r) => (r.warranty ? '<span class="badge ok">Garantía</span>' : money(r.billed ?? rpTotal(r))) }, { h: '', num: true, r: (r) => `<button class="btn btn-ghost btn-icon" data-r-quote="${r.id}" title="Ver">${icon('file-text')}</button>` }], f.rp.filter((r) => ['invoiced', 'cancel'].includes(r.stage)), { empty: 'Todavía no hay reparaciones facturadas.' })}</div>`;
      }
    },
    events(v, ctx) {
      const { f } = ctx;
      P.on(v, 'click', '[data-r-view]', (e, el) => { ctx.sub('rep').view = el.dataset.rView; ctx.draw(); });
      P.on(v, 'click', '[data-r-new]', () => rpNew(ctx));
      P.on(v, 'click', '[data-r-adv]', (e, el) => rpAdv(ctx, f.rp.find((r) => r.id === el.dataset.rAdv)));
      P.on(v, 'click', '[data-r-quote]', (e, el) => rpQuote(f.rp.find((r) => r.id === el.dataset.rQuote)));
    },
  };

  [prod, sub, mnt, rep].forEach(F.tab);
})();
