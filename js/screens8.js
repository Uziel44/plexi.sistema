/* Pantalla Costos, parte 2: Costo de productos (la escalera de costos de cada producto), Impuestos (presupuesto de impuestos y cargas) y Presupuestos (por área).
   Se suman al esqueleto de screens7.js con P.cst.tab(). Todo se calcula con C.calc() (los costos de los últimos 30 días); la única cosa que se guarda en los productos es su costo
   (p.cost) y, si se pide, su precio, para que Productos, Inventario y el punto de venta vean lo mismo. */
(function () {
  const P = window.Plexi;
  const C = P.cst;
  const { esc, icon, money, $ } = P;
  const sum = C.sum;
  const SIZE = 12;

  /* ============================================================ COSTO DE PRODUCTOS ============================================================ */
  /* la escalera de un producto: costo → flete → costo de reposición → + variables, fijos e impuestos repartidos como % del precio → costo total */
  const ladder = (k, c, p, pr) => {
    const price = p.discount || p.price; const cost = C.derive(pr, c.regime); const flete = (cost * pr.freight) / 100; const repos = cost + flete;
    const varU = price * k.varPct; const fixU = price * k.fixPct; const taxU = price * k.taxPct; const total = repos + varU + fixU + taxU;
    const denom = 1 - k.varPct - k.fixPct - k.taxPct; const target = c.target / 100;
    return { price, cost, flete, repos, varU, fixU, taxU, total, margin: price ? (price - total) / price : 0, min: denom > 0.05 ? repos / denom : null, sug: denom - target > 0.05 ? repos / (denom - target) : null };
  };
  const marginCell = (c, l) => `<b class="${l.margin < 0 ? 'red' : l.margin * 100 < c.target ? 'orange' : 'green'}">${C.pct(l.margin * 100)}</b>`;
  const prodDialog = (ctx, p) => {
    const { c } = ctx; const k = C.calc(); const pr0 = c.prod[p.id]; const mono = c.regime === 'mono';
    const m = P.modal({ title: p.name, subtitle: 'Costo del producto, capa por capa', size: 'wide', body: `<div class="grid g2"><div class="stack">
      <div class="field"><label>Costo del proveedor (precio de lista)</label><input class="input" id="cp" type="number" min="0" value="${pr0.price}"></div>
      <label class="check"><input type="checkbox" id="ci" ${pr0.withIva ? 'checked' : ''}><span><b>El precio ya incluye IVA</b><div class="tiny muted">Si viene con IVA, se lo saca para llegar al neto.</div></span></label>
      <div class="grid g2"><div class="field"><label>IVA de este producto</label><select class="input" id="cv">${[21, 10.5, 0].map((x) => `<option value="${x}" ${x === pr0.iva ? 'selected' : ''}>${C.pct(x)}</option>`).join('')}</select></div><div class="field"><label>Flete y otros (% del costo)</label><input class="input" id="cf" type="number" min="0" step="0.1" value="${pr0.freight}"></div></div>
      <div class="notice info">${mono ? 'Sos monotributista: el IVA de la compra no se recupera, así que forma parte del costo.' : 'Sos responsable inscripto: el IVA de la compra es crédito fiscal, así que no forma parte del costo.'} El margen objetivo (${C.pct(c.target, 0)}) se cambia en la lista.</div></div><div id="lv"></div></div>
      <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-outline" data-save>Guardar costo</button><button class="btn btn-primary" data-apply>${icon('check')} Guardar y poner el precio sugerido</button></div>` });
    const read = () => ({ price: Math.max(0, +m.$('#cp').value || 0), withIva: m.$('#ci').checked, iva: +m.$('#cv').value, freight: Math.max(0, +m.$('#cf').value || 0) });
    const draw = () => {
      const pr = read(); const l = ladder(k, c, p, pr); const n = pr.withIva ? pr.price / (1 + pr.iva / 100) : pr.price; const kv = (a, b, s = '') => `<div class="kv"><span>${a}</span><span>${s ? `<b>${b}</b>` : b}</span></div>`;
      m.$('#lv').innerHTML = `<div class="card"><div class="card-b">${kv('Precio del proveedor', `${money(pr.price)} <span class="muted">${pr.withIva ? 'con IVA' : 'sin IVA'}</span>`)}${kv('Costo sin IVA', money(n))}${kv(`IVA (${C.pct(pr.iva)})`, mono ? `+ ${money((n * pr.iva) / 100)} <span class="muted">no se recupera</span>` : '<span class="muted">se recupera, no suma</span>')}${kv('Costo', money(l.cost), 1)}${kv(`Flete y otros (${C.pct(pr.freight)})`, `+ ${money(l.flete)}`)}${kv('Costo de reposición', money(l.repos), 1)}${kv(`Costos variables (${C.pct(k.varPct * 100)} del precio)`, `+ ${money(l.varU)}`)}${kv(`Costos fijos (${C.pct(k.fixPct * 100)} del precio)`, `+ ${money(l.fixU)}`)}${kv(`Impuestos sobre ventas (${C.pct(k.taxPct * 100)})`, `+ ${money(l.taxU)}`)}${kv('Costo total', money(l.total), 1)}${kv('Precio de venta actual', money(l.price))}${kv('Margen real', marginCell(c, l))}${kv('Precio mínimo (no perder)', l.min ? money(l.min) : '—')}${kv(`Precio sugerido (margen ${C.pct(c.target, 0)})`, l.sug ? money(l.sug) : '—', 1)}</div></div>`;
    };
    draw(); m.on('input', 'input', draw); m.on('change', 'select', draw); m.on('change', '#ci', draw);
    const save = (applyPrice) => {
      const pr = read(); if (!(pr.price > 0)) return P.toast('Poné el costo del proveedor.', 'bad');
      Object.assign(c.prod[p.id], { price: pr.price, withIva: pr.withIva, iva: pr.iva, freight: pr.freight }); p.cost = C.derive(c.prod[p.id], c.regime); c.prod[p.id].cost = p.cost;
      P.log('PRODUCT_COST', `Costo de «${p.name}»: ${money(p.cost)}`, 'Costos');
      if (applyPrice) { const l = ladder(C.calc(), c, p, c.prod[p.id]); if (!l.sug) return P.toast('Con estos costos no hay un precio que dé ese margen.', 'bad'); p.price = Math.max(1, Math.round(l.sug / 10) * 10); if (p.discount && p.discount >= p.price) p.discount = null; P.log('PRODUCT_PRICE', `Precio de «${p.name}»: ${money(p.price)}`, 'Costos'); }
      m.close(); P.toast(applyPrice ? `Costo y precio actualizados: «${p.name}» ahora se vende a ${money(p.price)}.` : 'Costo guardado.'); ctx.draw();
    };
    m.on('click', '[data-save]', () => save(false)); m.on('click', '[data-apply]', () => save(true));
  };
  const productos = {
    key: 'pro', label: 'Costo de productos', order: 5,
    body(b, ctx) {
      const { S, c } = ctx; const k = C.calc(); const s = ctx.sub('pro', { q: '', order: 'worst', page: 1 });
      const all = S.products.filter((p) => !p.archived).map((p) => ({ p, pr: c.prod[p.id], l: ladder(k, c, p, c.prod[p.id]) }));
      const avg = sum(all, (r) => r.l.price) ? sum(all, (r) => r.l.price - r.l.total) / sum(all, (r) => r.l.price) : 0;
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('trending-up', 'Margen medio', `<span class="${avg < 0 ? 'red' : ''}">${C.pct(avg * 100)}</span>`, 'después de todos los costos', 'gold')}${P.kpi('triangle-alert', 'Bajo el costo', all.filter((r) => r.l.margin < 0).length, 'productos que pierden plata', 'bad')}${P.kpi('landmark', 'Fijos repartidos', C.pct(k.fixPct * 100), 'de cada precio de venta', 'info')}${P.kpi('percent', 'Variables e impuestos', C.pct((k.varPct + k.taxPct) * 100), 'de cada precio de venta')}</div>
        <div class="row wrap mb"><div class="search" style="width:240px">${icon('search')}<input class="input" id="pq" placeholder="Producto o SKU…" value="${esc(s.q)}"></div><select class="input" id="po" style="width:200px"><option value="worst" ${s.order === 'worst' ? 'selected' : ''}>Peor margen primero</option><option value="best" ${s.order === 'best' ? 'selected' : ''}>Mejor margen primero</option><option value="name" ${s.order === 'name' ? 'selected' : ''}>Nombre A–Z</option></select><div class="row"><label class="small muted" for="pt">Margen objetivo</label><input class="input sm" id="pt" type="number" min="1" max="90" style="width:70px" value="${c.target}"><span class="small muted">%</span></div></div>
        <div class="card" id="pt-tbl"></div><p class="hint">Los costos variables, fijos e impuestos se reparten como un % de cada precio, con las ventas de los últimos 30 días. El precio sugerido es el que deja el margen objetivo después de todos los costos.</p>`;
      ctx.t.pro = () => {
        const t = s.q.toLowerCase(); const ORD = { worst: (x, y) => x.l.margin - y.l.margin, best: (x, y) => y.l.margin - x.l.margin, name: (x, y) => x.p.name.localeCompare(y.p.name) };
        const list = all.filter((r) => !t || r.p.name.toLowerCase().includes(t) || r.p.sku.toLowerCase().includes(t)).sort(ORD[s.order]); const mono = c.regime === 'mono';
        $('#pt-tbl', b).innerHTML = P.table([{ h: 'Producto', r: (r) => `<div class="semibold">${esc(r.p.name)}</div><div class="tiny muted">${esc(r.p.sku)}</div>` }, { h: 'Proveedor', num: true, cls: 'nowrap', r: (r) => `${money(r.pr.price)}<div class="tiny muted">${r.pr.withIva ? 'con IVA' : 'sin IVA'} · ${C.pct(r.pr.iva)}</div>` }, { h: mono ? 'Costo (con IVA)' : 'Costo (sin IVA)', num: true, cls: 'nowrap', r: (r) => money(r.l.cost) }, { h: '+ Flete', num: true, cls: 'nowrap', r: (r) => money(r.l.flete) }, { h: '+ Variables', num: true, cls: 'nowrap', r: (r) => money(r.l.varU) }, { h: '+ Fijos', num: true, cls: 'nowrap', r: (r) => money(r.l.fixU) }, { h: '+ Impuestos', num: true, cls: 'nowrap', r: (r) => money(r.l.taxU) }, { h: '= Costo total', num: true, cls: 'nowrap', r: (r) => `<b>${money(r.l.total)}</b>` }, { h: 'Precio', num: true, cls: 'nowrap', r: (r) => money(r.l.price) }, { h: 'Margen', num: true, cls: 'nowrap', r: (r) => marginCell(c, r.l) }, { h: 'Sugerido', num: true, cls: 'nowrap', r: (r) => (r.l.sug ? `<b>${money(r.l.sug)}</b>` : '—') }, { h: '', num: true, r: (r) => `<button class="btn btn-ghost btn-icon" data-pr-edit="${r.p.id}" title="Ver la escalera y editar">${icon('pencil')}</button>` }], list.slice((s.page - 1) * SIZE, s.page * SIZE), { empty: 'No hay productos con esa búsqueda.' }) + P.pager(s.page, list.length, SIZE);
      };
      ctx.t.pro();
    },
    events(v, ctx) {
      const { c } = ctx; const s = () => ctx.sub('pro');
      P.on(v, 'input', '#pq', (e, el) => { s().q = el.value; s().page = 1; ctx.t.pro(); });
      P.on(v, 'change', '#po', (e, el) => { s().order = el.value; s().page = 1; ctx.t.pro(); });
      P.on(v, 'change', '#pt', (e, el) => { c.target = Math.min(90, Math.max(1, +el.value || 12)); ctx.draw(); });
      P.on(v, 'click', '[data-pr-edit]', (e, el) => prodDialog(ctx, P.get(el.dataset.prEdit)));
      P.on(v, 'click', '[data-page]', (e, el) => { if (ctx.st.tab === 'pro') { s().page = +el.dataset.page; ctx.t.pro(); } });
    },
  };

  /* ============================================================ IMPUESTOS ============================================================ */
  const TBASE = { sales: 'Ventas (sin impuesto)', bank: 'Cobros por banco y tarjeta', payroll: 'Sueldos', '': 'Monto fijo por mes' };
  const taxDialog = (ctx) => {
    const { c } = ctx;
    const m = P.modal({ title: 'Nuevo impuesto o carga', size: 'narrow', body: `<div class="stack"><div class="field"><label>Nombre *</label><input class="input" id="xn" placeholder="Ej.: Tasa de seguridad e higiene"></div><div class="grid g2"><div class="field"><label>Tipo</label><select class="input" id="xg"><option value="tax">Impuesto</option><option value="labor">Cargas sociales</option></select></div><div class="field"><label>Se calcula sobre</label><select class="input" id="xb">${['sales', 'bank', 'payroll'].map((x) => `<option value="${x}">${TBASE[x]}</option>`).join('')}</select></div></div><div class="field"><label>Porcentaje (%)</label><input class="input" id="xr" type="number" min="0" step="0.1" placeholder="Ej.: 1,5"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
    m.on('click', '[data-ok]', () => { const name = m.$('#xn').value.trim(); const rate = +m.$('#xr').value; if (name.length < 3 || !(rate > 0)) return P.toast('Completá el nombre y el porcentaje.', 'bad'); c.taxes.push({ id: P.uid('t'), name, kind: 'pct', base: m.$('#xb').value, rate, group: m.$('#xg').value, mode: 'both', custom: true }); P.log('TAX_SAVED', `Impuesto «${name}»`, 'Costos'); m.close(); P.toast('Impuesto guardado.'); ctx.draw(); });
  };
  const impuestos = {
    key: 'tax', label: 'Impuestos', order: 6,
    body(b, ctx) {
      const { c } = ctx; const k = C.calc(); const g = 1 + c.growth / 100; const mono = c.regime === 'mono'; const proj = (r, i) => (r.grows ? r.amt * g ** i : r.amt);
      const act = c.taxes.filter((t) => t.mode === 'both' || t.mode === c.regime); const pay = k.ivaDebit - k.ivaCredit;
      const rows = [];
      if (!mono) rows.push({ iva: 1, name: 'IVA de las ventas (débito fiscal)', grows: true, amt: k.ivaDebit, rate: `<input class="input sm" id="xiva" type="number" min="0" step="0.5" style="width:80px" value="${c.iva}">`, base: 'Ventas (sin impuesto)' }, { iva: 1, name: 'IVA de las compras (crédito fiscal)', grows: true, amt: -k.ivaCredit, rate: '<span class="faint">según producto</span>', base: 'Mercadería vendida' }, { iva: 1, strong: 1, name: pay >= 0 ? 'IVA a pagar' : 'IVA a favor', grows: true, amt: pay, rate: '', base: 'Débito menos crédito' });
      act.forEach((t) => rows.push({ t, name: t.name, grows: t.kind === 'pct' && (t.base === 'sales' || t.base === 'bank'), amt: k.lines.find((l) => l.key === `t:${t.id}`)?.amount || 0, base: TBASE[t.base] }));
      const costRows = rows.filter((r) => r.t); const totals = { name: 'Total de impuestos y cargas (sin IVA)', strong: 1, grows: false, amt: sum(costRows, (r) => r.amt), proj: [0, 1, 2, 3].map((i) => sum(costRows, (r) => proj(r, i))), rate: '', base: '' }; rows.push(totals);
      const cell = (r, i) => `${i === 0 ? money(r.amt) : money(r.proj ? r.proj[i] : proj(r, i))}`;
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('landmark', 'Impuestos y cargas (30 días)', money(k.taxTotal + k.cargas), 'sin contar el IVA', 'bad')}${P.kpi('percent', 'Sobre las ventas', C.pct(k.rev ? ((k.taxTotal + k.cargas) / k.rev) * 100 : 0), 'de lo que vendés', 'gold')}${mono ? P.kpi('file-text', 'Monotributo', money(c.taxes.find((t) => t.id === 't6')?.rate || 0), 'cuota mensual de ejemplo', 'info') : P.kpi('receipt-text', pay >= 0 ? 'IVA a pagar' : 'IVA a favor', money(Math.abs(pay)), 'débito menos crédito; no es un costo', 'info')}${P.kpi('users', 'Cargas sociales', money(k.cargas), `sobre sueldos de ${money(k.payroll)}`)}</div>
        <div class="row wrap mb"><span class="muted small grow">Presupuesto de lo que se paga en impuestos y cargas, con las ventas de los últimos 30 días y una proyección a 3 meses. Las tasas son valores de ejemplo.</span><div class="row"><label class="small muted" for="xgr">Ventas crecen</label><input class="input sm" id="xgr" type="number" step="0.5" style="width:70px" value="${c.growth}"><span class="small muted">% por mes</span></div><button class="btn btn-primary" data-x-new>${icon('plus')} Nuevo impuesto</button></div>
        <div class="card">${P.table([{ h: 'Concepto', r: (r) => `${r.strong ? `<b>${esc(r.name)}</b>` : esc(r.name)}${r.iva ? ' <span class="badge info">IVA · no es costo</span>' : r.t ? ` <span class="badge ${r.t.group === 'labor' ? 'ok' : 'bad'}">${r.t.group === 'labor' ? 'Cargas' : 'Impuesto'}</span>${r.t.note ? `<div class="tiny muted">${esc(r.t.note)}</div>` : ''}` : ''}` }, { h: 'Se calcula sobre', r: (r) => `<span class="muted">${esc(r.base)}</span>` }, { h: 'Tasa', num: true, cls: 'nowrap', r: (r) => (r.rate !== undefined ? r.rate : r.t.kind === 'flat' ? `<input class="input sm" data-x-rate="${r.t.id}" type="number" min="0" step="1000" style="width:100px" value="${r.t.rate}">` : `<input class="input sm" data-x-rate="${r.t.id}" type="number" min="0" step="0.1" style="width:80px" value="${r.t.rate}"> %`) }, { h: 'Últimos 30 días', num: true, cls: 'nowrap', r: (r) => (r.strong ? `<b>${cell(r, 0)}</b>` : cell(r, 0)) }, ...[1, 2, 3].map((i) => ({ h: `Mes +${i}`, num: true, cls: 'nowrap', r: (r) => (r.strong ? `<b>${cell(r, i)}</b>` : cell(r, i)) })), { h: '', num: true, r: (r) => (r.t?.custom ? `<button class="btn btn-ghost btn-icon" data-x-del="${r.t.id}" title="Eliminar" style="color:var(--bad)">${icon('trash-2')}</button>` : '') }], rows)}</div>
        <p class="hint mt8">${mono ? 'En monotributo no hay IVA: lo que se paga en las compras forma parte del costo.' : 'El IVA no es un costo: lo cobrás en las ventas y lo descontás de las compras; solo sale plata si el débito supera al crédito.'}</p>`;
    },
    events(v, ctx) {
      const { c } = ctx;
      P.on(v, 'change', '[data-x-rate]', (e, el) => { c.taxes.find((t) => t.id === el.dataset.xRate).rate = Math.max(0, +el.value || 0); ctx.draw(); });
      P.on(v, 'change', '#xiva', (e, el) => { c.iva = Math.max(0, +el.value || 0); ctx.draw(); });
      P.on(v, 'change', '#xgr', (e, el) => { c.growth = +el.value || 0; ctx.draw(); });
      P.on(v, 'click', '[data-x-new]', () => taxDialog(ctx));
      P.on(v, 'click', '[data-x-del]', (e, el) => { const t = c.taxes.find((x) => x.id === el.dataset.xDel); P.confirm('¿Eliminar el impuesto?', `Se borra «${t.name}» del presupuesto.`, 'Eliminar', () => { c.taxes = c.taxes.filter((x) => x !== t); P.toast('Impuesto eliminado.'); ctx.draw(); }); });
    },
  };

  /* ============================================================ PRESUPUESTOS ============================================================ */
  const execBar = (budget, real) => { const p = budget ? (real / budget) * 100 : 0; return `<div class="row gap4"><div class="bar ${p > 100 ? 'bad' : p >= 85 ? 'warn' : ''}" style="width:110px"><i style="width:${Math.min(100, p)}%"></i></div><span class="small ${p > 100 ? 'red' : 'muted'}">${budget ? `${Math.round(p)} %` : real ? 'sin presupuesto' : '—'}</span></div>`; };
  const diff = (budget, real) => { const d = budget - real; return `<b class="${d < 0 ? 'red' : 'green'}">${d < 0 ? '-' : ''}${money(Math.abs(d)).replace('-', '')}</b>`; };
  const presupuestos = {
    key: 'bud', label: 'Presupuestos', order: 7,
    body(b, ctx) {
      const { c } = ctx; const k = C.calc(); const s = ctx.sub('bud', { view: 'all' });
      const rowsOf = (area) => {
        const m = new Map(); c.budget.filter((x) => x.area === area).forEach((x) => m.set(x.key, { key: x.key, name: x.name, budget: x.amount, real: 0 }));
        k.lines.filter((l) => l.area === area && l.amount > 0).forEach((l) => { const r = m.get(l.key) || m.set(l.key, { key: l.key, name: l.name, budget: 0, real: 0 }).get(l.key); r.real = l.amount; r.name = l.name; });
        return [...m.values()].sort((x, y) => Math.max(y.budget, y.real) - Math.max(x.budget, x.real));
      };
      const areas = C.AREAS.map((a) => { const rows = rowsOf(a); return { area: a, rows, budget: sum(rows, (r) => r.budget), real: sum(rows, (r) => r.real) }; });
      const cur = s.view === 'all' ? null : areas.find((a) => a.area === s.view); const tb = sum(cur ? [cur] : areas, (a) => a.budget); const tr = sum(cur ? [cur] : areas, (a) => a.real);
      b.innerHTML = `${C.chips('data-b-view', [['all', 'Resumen'], ...C.AREAS.map((a) => [a, a])], s.view)}
        <div class="grid g4 mb">${P.kpi('clipboard-list', 'Presupuesto', money(tb), `${cur ? cur.area : 'todas las áreas'}, por mes`, 'info')}${P.kpi('wallet', 'Real (30 días)', money(tr), 'lo que costó de verdad', 'bad')}${P.kpi('scale', tb >= tr ? 'Por debajo' : 'Pasado', `<span class="${tb >= tr ? 'green' : 'red'}">${money(Math.abs(tb - tr))}</span>`, tb >= tr ? 'del presupuesto' : 'del presupuesto', 'gold')}${P.kpi('percent', 'Ejecutado', tb ? C.pct((tr / tb) * 100, 0) : '—', 'real sobre presupuesto')}</div>`
        + (cur ? `<div class="card">${P.table([{ h: 'Concepto', r: (r) => `<b>${esc(r.name)}</b>${r.budget ? '' : ' <span class="badge warn">Sin presupuesto</span>'}` }, { h: 'Presupuesto por mes', num: true, cls: 'nowrap', r: (r) => `<input class="input sm" data-b-amt="${esc(r.key)}" type="number" min="0" step="100" style="width:120px;text-align:right" value="${Math.round(r.budget)}">` }, { h: 'Real (30 días)', num: true, cls: 'nowrap', r: (r) => money(r.real) }, { h: 'Diferencia', num: true, cls: 'nowrap', r: (r) => diff(r.budget, r.real) }, { h: 'Ejecución', r: (r) => execBar(r.budget, r.real) }], cur.rows, { empty: 'Esta área todavía no tiene costos.' })}</div><p class="hint mt8">Cambiá el presupuesto de cualquier línea (también las que no lo tienen): se guarda al salir del campo. El real sale de Gastos, de los costos variables y de Impuestos.</p>`
          : `<div class="grid g2"><div class="card">${P.table([{ h: 'Área', r: (a) => `<b>${esc(a.area)}</b>` }, { h: 'Presupuesto', num: true, cls: 'nowrap', r: (a) => money(a.budget) }, { h: 'Real', num: true, cls: 'nowrap', r: (a) => money(a.real) }, { h: 'Diferencia', num: true, cls: 'nowrap', r: (a) => diff(a.budget, a.real) }, { h: 'Ejecución', r: (a) => execBar(a.budget, a.real) }, { h: '', num: true, r: (a) => `<button class="btn btn-outline btn-sm" data-b-view="${a.area}">Ver</button>` }], areas)}</div><div class="card"><div class="card-h"><div><h3>Costo real por área</h3><p>Últimos 30 días.</p></div></div><div class="card-b">${P.hbars(areas.map((a) => ({ label: a.area, value: a.real })))}</div></div></div>`);
    },
    events(v, ctx) {
      const { c } = ctx;
      P.on(v, 'click', '[data-b-view]', (e, el) => { ctx.sub('bud').view = el.dataset.bView; ctx.draw(); });
      P.on(v, 'change', '[data-b-amt]', (e, el) => {
        const key = el.dataset.bAmt; const area = ctx.sub('bud').view; const amount = Math.max(0, Math.round(+el.value || 0)); const x = c.budget.find((y) => y.key === key && y.area === area);
        if (x) x.amount = amount; else { const l = C.calc().lines.find((z) => z.key === key); c.budget.push({ id: P.uid('b'), area, key, name: l?.name || key, amount }); }
        P.log('BUDGET_SET', `Presupuesto de ${area}: ${money(amount)}`, 'Costos'); ctx.draw();
      });
    },
  };

  [productos, impuestos, presupuestos].forEach(C.tab);
})();
