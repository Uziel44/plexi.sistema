/* Pantalla: Costos (antes «Gastos»). Junta en un solo lugar en qué se va la plata de un comercio que compra y vende: los gastos que se pagaron, los costos fijos y variables,
   el costo real de cada producto, los impuestos y cargas, y los presupuestos por área. Este archivo tiene el esqueleto (P.cst), los datos, los cálculos comunes y las solapas
   Resumen, Gastos, Costos fijos y Costos variables; las otras tres (Costo de productos, Impuestos y Presupuestos) están en screens8.js y se suman con P.cst.tab().
   No duplica nada: lo gastado sigue siendo S.expenses; los costos variables, los impuestos y la mercadería vendida se calculan de las ventas reales de los últimos 30 días. */
(function () {
  const P = window.Plexi;
  const { esc, icon, money, $ } = P;
  P.screens = P.screens || {};
  const DAY = P.DAY;
  const sum = (list, fn) => list.reduce((a, x) => a + fn(x), 0);
  const C = (P.cst = { tabs: [], sum });

  C.pct = (v, d = 1) => `${Number((v || 0).toFixed(d)).toString().replace('.', ',')} %`;
  C.AREAS = ['Administración', 'Operación', 'Logística', 'Compras', 'Ventas'];
  C.AREA_OF = { Alquiler: 'Operación', Electricidad: 'Operación', Mantenimiento: 'Operación', Internet: 'Administración', Sueldos: 'Administración', Contador: 'Administración', Seguros: 'Administración', Transporte: 'Logística', 'Envíos y fletes': 'Logística', Publicidad: 'Ventas', Varios: 'Administración' };
  C.CATS = ['Alquiler', 'Electricidad', 'Internet', 'Sueldos', 'Mantenimiento', 'Transporte', 'Envíos y fletes', 'Publicidad', 'Contador', 'Seguros', 'Varios'];
  C.areaOf = (e) => e.area || C.AREA_OF[e.category] || 'Administración';
  C.BASES = { sales: ['Ventas (sin impuesto)', '%'], cmv: ['Costo de la mercadería vendida', '%'], pay_mp: ['Cobrado con Mercado Pago', '%'], pay_credit: ['Cobrado con tarjeta de crédito', '%'], pay_debit: ['Cobrado con tarjeta de débito', '%'], tickets: ['Cada venta (ticket)', '$'], units: ['Cada unidad vendida', '$'] };
  C.TYPE = { merc: ['Mercadería', 'gold'], gasto: ['Gasto', 'info'], var: ['Variable', 'warn'], imp: ['Impuesto', 'bad'], carga: ['Cargas sociales', 'ok'] };
  C.opt = (list, sel) => list.map((x) => `<option ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join('');
  C.chips = (attr, views, cur) => `<div class="row wrap mb">${views.map(([k, l]) => `<button class="chip ${k === cur ? 'on' : ''}" ${attr}="${k}">${esc(l)}</button>`).join('')}</div>`;
  C.tab = (def) => C.tabs.push(def);
  const IVA_REDUCIDO = ['Almacén', 'Lácteos y fiambres', 'Panadería', 'Congelados'];

  /* ---------- ventas de los últimos 30 días (mismas ideas que Contabilidad, reescritas chicas para no acoplar los archivos) ---------- */
  const ratio = (s) => (s.total ? Math.max(0, s.total - s.refunded) / s.total : 0); // parte de la venta que no se devolvió
  const net = (s) => (s.total - s.tax) * ratio(s);
  const costOf = (s) => sum(s.items, (l) => l.cost * l.qty) * ratio(s);

  /* ---------- costo de cada producto según el régimen de IVA ---------- */
  C.derive = (pr, regime) => { const k = 1 + pr.iva / 100; const n = pr.withIva ? pr.price / k : pr.price; return Math.round(regime === 'mono' ? n * k : n); };
  C.syncProd = () => {
    const S = P.S; const c = S.costs; if (!c) return;
    S.products.forEach((p) => {
      const pr = c.prod[p.id];
      if (!pr) { const iva = IVA_REDUCIDO.includes(p.category) ? 10.5 : 21; c.prod[p.id] = { iva, freight: 2, withIva: false, price: c.regime === 'mono' ? Math.round(p.cost / (1 + iva / 100)) : p.cost, cost: p.cost }; }
      else if (pr.cost !== p.cost) { pr.price = Math.round(c.regime === 'mono' ? p.cost / (1 + pr.iva / 100) : p.cost); pr.withIva = false; pr.cost = p.cost; } // el costo cambió en otra pantalla (compra, producción…)
    });
  };
  C.setRegime = (to) => { const c = P.S.costs; c.regime = to; P.S.products.forEach((p) => { const pr = c.prod[p.id]; if (pr) { p.cost = C.derive(pr, to); pr.cost = p.cost; } }); };

  /* ---------- datos propios (se arman la primera vez que se entra y se reinician con la demo) ---------- */
  C.ensure = () => {
    const S = P.S;
    if (S.costs) return S.costs;
    /* los importes de ejemplo salen de lo que ya hay: el último gasto de cada categoría, el tamaño de los sueldos y el ticket medio, así cada rubro cuenta una historia coherente */
    const last = (cat) => { const e = S.expenses.filter((x) => x.category === cat).sort((a, b) => b.date - a.date)[0]; return e ? Math.round(e.amount / 500) * 500 : 0; };
    const recent = S.sales.filter((x) => x.date >= Date.now() - 30 * DAY && ratio(x) > 0); const avgTicket = recent.length ? sum(recent, net) / recent.length : 10000;
    const habilitacion = Math.round((last('Alquiler') * 0.8) / 1000) * 1000; const packaging = Math.max(10, Math.round((avgTicket * 0.005) / 5) * 5); const cuota = Math.round((62000 * (sum(S.employees, (e) => e.salary) / 280000)) / 1000) * 1000 || 10000;
    const c = (S.costs = { regime: 'ri', iva: 21, target: 12, growth: 2, prod: {}, budget: [],
      fixed: [
        { id: 'f1', name: 'Alquiler del local', area: 'Operación', amount: last('Alquiler'), every: 1, cat: 'Alquiler' }, { id: 'f2', name: 'Sueldos', area: 'Administración', amount: 0, every: 1, cat: 'Sueldos', auto: 'payroll' },
        { id: 'f3', name: 'Electricidad', area: 'Operación', amount: last('Electricidad'), every: 1, cat: 'Electricidad' }, { id: 'f4', name: 'Internet y teléfono', area: 'Administración', amount: last('Internet'), every: 1, cat: 'Internet' },
        { id: 'f5', name: 'Contador', area: 'Administración', amount: last('Contador'), every: 1, cat: 'Contador' }, { id: 'f6', name: 'Seguros', area: 'Administración', amount: last('Seguros'), every: 1, cat: 'Seguros' },
        { id: 'f7', name: 'Publicidad en redes', area: 'Ventas', amount: last('Publicidad'), every: 1, cat: 'Publicidad' }, { id: 'f8', name: 'Mantenimiento del local', area: 'Operación', amount: last('Mantenimiento'), every: 1, cat: 'Mantenimiento' },
        { id: 'f9', name: 'Reparto y transporte', area: 'Logística', amount: last('Transporte'), every: 1, cat: 'Transporte' }, { id: 'f10', name: 'Envíos y fletes', area: 'Logística', amount: last('Envíos y fletes'), every: 1, cat: 'Envíos y fletes' },
        { id: 'f11', name: 'Habilitación municipal (anual)', area: 'Administración', amount: habilitacion, every: 12, cat: 'Varios' },
      ],
      variable: [
        { id: 'v1', name: 'Comisión de Mercado Pago', area: 'Ventas', base: 'pay_mp', rate: 3.5 }, { id: 'v2', name: 'Comisión de tarjeta de crédito', area: 'Ventas', base: 'pay_credit', rate: 3 },
        { id: 'v3', name: 'Comisión de tarjeta de débito', area: 'Ventas', base: 'pay_debit', rate: 1.2 }, { id: 'v4', name: 'Bolsas y packaging', area: 'Ventas', base: 'tickets', rate: packaging },
        { id: 'v5', name: 'Comisión de vendedores', area: 'Ventas', base: 'sales', rate: 1 }, { id: 'v6', name: 'Mermas y faltantes', area: 'Operación', base: 'cmv', rate: 0.8 },
      ],
      taxes: [
        { id: 't1', name: 'Ingresos Brutos', kind: 'pct', base: 'sales', rate: 3, group: 'tax', mode: 'both' }, { id: 't2', name: 'Tasa municipal', note: 'Comercio e industria', kind: 'pct', base: 'sales', rate: 0.6, group: 'tax', mode: 'both' },
        { id: 't3', name: 'Impuesto a créditos y débitos', note: 'Sobre los cobros por banco y tarjeta', kind: 'pct', base: 'bank', rate: 1.2, group: 'tax', mode: 'both' }, { id: 't4', name: 'Cargas sociales', note: 'Aportes patronales, ART y obra social', kind: 'pct', base: 'payroll', rate: 27, group: 'labor', mode: 'both' },
        { id: 't5', name: 'Aguinaldo y vacaciones', note: 'Provisión mensual', kind: 'pct', base: 'payroll', rate: 12.5, group: 'labor', mode: 'both' }, { id: 't6', name: 'Cuota de monotributo', note: 'Monto fijo por mes', kind: 'flat', base: '', rate: cuota, group: 'tax', mode: 'mono' },
      ] });
    S.expenses.forEach((e) => { if (e.area === undefined) e.area = C.AREA_OF[e.category] || 'Administración'; });
    C.syncProd();
    const DEV = [1.06, 0.94, 1.12, 1, 0.9, 1.04, 1.18]; // el presupuesto de ejemplo parte de lo real con un desvío distinto por línea
    C.calc().lines.filter((l) => l.amount > 0).forEach((l, i) => c.budget.push({ id: P.uid('b'), area: l.area, key: l.key, name: l.name, amount: Math.round((l.amount * DEV[i % DEV.length]) / 100) * 100 }));
    return c;
  };
  C.monthly = (f, payroll) => (f.auto === 'payroll' ? payroll : f.amount) / (f.every || 1);

  /* ---------- todos los costos de los últimos 30 días, en una sola lista ---------- */
  C.calc = () => {
    const S = P.S; const c = S.costs; const from = Date.now() - 30 * DAY;
    const sales = S.sales.filter((s) => s.date >= from && ratio(s) > 0);
    const rev = sum(sales, net); const cmv = sum(sales, costOf); const pay = {};
    sales.forEach((s) => s.payments.forEach((p) => { pay[p.method] = (pay[p.method] || 0) + p.amount * ratio(s); }));
    const payroll = sum(S.employees, (e) => e.salary);
    const base = { sales: rev, cmv, payroll, tickets: sales.length, units: sum(sales, (s) => sum(s.items, (l) => l.qty) * ratio(s)), pay_mp: pay.mp || 0, pay_credit: pay.credit || 0, pay_debit: pay.debit || 0, bank: sum(Object.entries(pay).filter(([m]) => m !== 'cash' && m !== 'account'), ([, a]) => a) };
    const lines = [{ key: 'cmv', name: 'Mercadería vendida', area: 'Compras', type: 'merc', amount: cmv }];
    lines.push({ key: 'freight', name: 'Fletes de entrada', area: 'Compras', type: 'merc', amount: sum(sales, (s) => sum(s.items, (l) => (l.cost * l.qty * (c.prod[l.pid]?.freight ?? 2)) / 100) * ratio(s)) });
    const g = {}; S.expenses.filter((e) => e.date >= from).forEach((e) => { const area = C.areaOf(e); const key = `g:${area}:${e.category}`; (g[key] ||= { key, name: e.category, area, type: 'gasto', amount: 0 }).amount += e.amount; });
    lines.push(...Object.values(g));
    c.variable.forEach((v) => lines.push({ key: `v:${v.id}`, name: v.name, area: v.area, type: 'var', amount: C.BASES[v.base][1] === '$' ? base[v.base] * v.rate : (base[v.base] * v.rate) / 100 }));
    c.taxes.filter((t) => t.mode === 'both' || t.mode === c.regime).forEach((t) => lines.push({ key: `t:${t.id}`, name: t.name, area: 'Administración', type: t.group === 'labor' ? 'carga' : 'imp', amount: t.kind === 'flat' ? t.rate : (base[t.base] * t.rate) / 100 }));
    const total = sum(lines, (l) => l.amount); const of = (type) => sum(lines.filter((l) => l.type === type), (l) => l.amount);
    const fixedPlanned = sum(c.fixed, (f) => C.monthly(f, payroll)) + of('carga'); const merc = of('merc');
    const ivaCredit = sum(sales, (s) => sum(s.items, (l) => l.cost * l.qty * ((c.prod[l.pid]?.iva ?? 21) / 100)) * ratio(s));
    const contrib = rev ? 1 - (merc + of('var') + of('imp')) / rev : 0;
    return { rev, cmv, base, lines, total, payroll, result: rev - total, fixedPlanned, merc, varTotal: of('var'), taxTotal: of('imp'), cargas: of('carga'), gastos: of('gasto'), ivaDebit: (rev * c.iva) / 100, ivaCredit,
      varPct: rev ? of('var') / rev : 0, fixPct: rev ? fixedPlanned / rev : 0, taxPct: rev ? of('imp') / rev : 0, breakEven: contrib > 0.03 ? fixedPlanned / contrib : null };
  };

  /* ============================================================ RESUMEN ============================================================ */
  const resumen = {
    key: 'sum', label: 'Resumen', order: 1,
    body(b) {
      const k = C.calc(); const top = k.lines.filter((l) => l.amount > 0).sort((x, y) => y.amount - x.amount); const t10 = top.slice(0, 10); const max = t10[0]?.amount || 1;
      const byType = Object.entries(C.TYPE).map(([t, [label]]) => ({ label, value: sum(k.lines.filter((l) => l.type === t), (l) => l.amount) })).filter((x) => x.value > 0);
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('circle-dollar-sign', 'Ventas (30 días)', money(k.rev), 'sin impuesto, descontando devoluciones')}${P.kpi('wallet', 'Costos totales (30 días)', money(k.total), `${C.pct(k.rev ? (k.total / k.rev) * 100 : 0)} de las ventas`, 'bad')}${P.kpi('piggy-bank', 'Resultado estimado', `<span class="${k.result < 0 ? 'red' : 'green'}">${money(k.result)}</span>`, 'ventas menos todos los costos', 'gold')}${P.kpi('scale', 'Punto de equilibrio', k.breakEven ? money(k.breakEven) : '—', 'ventas por mes para no perder', 'info')}</div>
        <div class="grid g21 mb"><div class="card"><div class="card-h"><div><h3>Los 10 costos más importantes</h3><p>Ordenados por importe, con lo que pesan sobre las ventas.</p></div></div>${P.table([{ h: '#', r: (l, i) => `<b>${i + 1}</b>` }, { h: 'Costo', r: (l) => `<div class="semibold">${esc(l.name)}</div><div class="tiny muted"><span class="badge ${C.TYPE[l.type][1]}">${C.TYPE[l.type][0]}</span> ${esc(l.area)}</div>` }, { h: 'Importe', num: true, cls: 'nowrap', r: (l) => `<b>${money(l.amount)}</b>` }, { h: '% ventas', num: true, cls: 'nowrap', r: (l) => C.pct(k.rev ? (l.amount / k.rev) * 100 : 0) }, { h: '', r: (l) => `<div class="bar" style="width:90px"><i style="width:${(l.amount / max) * 100}%"></i></div>` }], t10, { empty: 'Todavía no hay costos para mostrar.' })}
          <div class="card-b small muted">Estos ${t10.length} costos suman el ${C.pct(k.total ? (sum(t10, (l) => l.amount) / k.total) * 100 : 0, 0)} de los ${money(k.total)} que cuesta el negocio (de ${top.length} costos en total).</div></div>
        <div class="card"><div class="card-h"><div><h3>De qué está hecho el costo</h3><p>Por tipo de costo, últimos 30 días.</p></div></div><div class="card-b">${P.donut(byType)}</div></div></div>
        <div class="notice info">Es una estimación con las ventas de los últimos 30 días. La mercadería vendida y los costos variables salen de las ventas reales; los gastos, de la solapa Gastos; los impuestos, de la solapa Impuestos. Los porcentajes son valores de ejemplo que se pueden cambiar.</div>`;
    },
  };

  /* ============================================================ GASTOS (la pantalla de antes) ============================================================ */
  const SIZE = 12;
  const gastoDialog = (ctx) => {
    const { S } = ctx;
    const m = P.modal({ title: 'Agregar gasto', size: 'narrow', body: `<div class="stack"><div class="field"><label>Detalle *</label><input class="input" id="gt" placeholder="Ej.: factura de la luz"></div><div class="grid g2"><div class="field"><label>Categoría</label><select class="input" id="gc">${C.opt(C.CATS)}</select></div><div class="field"><label>Área</label><select class="input" id="gr">${C.opt(C.AREAS, C.AREA_OF[C.CATS[0]])}</select></div></div><div class="field"><label>Importe *</label><input class="input" id="ga" type="number" min="1"></div><div class="field"><label>Medio de pago</label><select class="input" id="gm"><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="debit">Tarjeta de débito</option></select></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
    m.on('change', '#gc', () => { m.$('#gr').value = C.AREA_OF[m.$('#gc').value] || 'Administración'; });
    m.on('click', '[data-ok]', () => {
      const t = m.$('#gt').value.trim(); const a = +m.$('#ga').value; if (t.length < 3 || !(a > 0)) return P.toast('Completá el detalle y el importe.', 'bad');
      S.expenses.push({ id: P.uid('e'), category: m.$('#gc').value, area: m.$('#gr').value, title: t, amount: a, date: Date.now(), method: m.$('#gm').value });
      P.log('EXPENSE_CREATED', `Gasto registrado: ${t} (${money(a)})`, 'Gastos'); P.toast('Gasto registrado.'); m.close(); ctx.draw();
    });
  };
  const gastos = {
    key: 'gas', label: 'Gastos', order: 2,
    body(b, ctx) {
      const { S } = ctx; const s = ctx.sub('gas', { page: 1 }); const list = S.expenses.slice().sort((x, y) => y.date - x.date); const from = Date.now() - 30 * DAY;
      b.innerHTML = `<div class="grid g3 mb">${P.kpi('wallet', 'Gastos (30 días)', money(sum(S.expenses.filter((e) => e.date >= from), (e) => e.amount)), '', 'bad')}${P.kpi('receipt-text', 'Cantidad de gastos', S.expenses.length)}${P.kpi('trending-up', 'Promedio mensual', money(sum(S.expenses, (e) => e.amount) / 3), 'últimos 3 meses', 'gold')}</div>
        <div class="row wrap mb"><span class="muted small grow">Anotá lo que gastás para ver cuánto se gana de verdad. Es el registro de lo que realmente se pagó.</span><button class="btn btn-outline" data-g-csv>${icon('download')} CSV</button><button class="btn btn-primary" data-g-new>${icon('plus')} Agregar gasto</button></div>
        <div class="card">${P.table([{ h: 'Fecha', cls: 'nowrap', r: (e) => P.date(e.date) }, { h: 'Detalle', r: (e) => `<b>${esc(e.title)}</b>` }, { h: 'Categoría', r: (e) => `<span class="badge">${esc(e.category)}</span>` }, { h: 'Área', r: (e) => `<span class="badge info">${esc(C.areaOf(e))}</span>` }, { h: 'Pago', r: (e) => P.PAY[e.method] }, { h: 'Importe', num: true, cls: 'nowrap', r: (e) => `<b>${money(e.amount)}</b>` }, { h: '', num: true, r: (e) => (P.hasRole('admin') ? `<button class="btn btn-ghost btn-icon" data-g-del="${e.id}" style="color:var(--bad)">${icon('trash-2')}</button>` : '') }], list.slice((s.page - 1) * SIZE, s.page * SIZE), { empty: 'Todavía no cargaste gastos.' })}${P.pager(s.page, list.length, SIZE)}</div>`;
    },
    events(v, ctx) {
      const { S } = ctx;
      P.on(v, 'click', '[data-g-new]', () => gastoDialog(ctx));
      P.on(v, 'click', '[data-page]', (e, el) => { if (ctx.st.tab === 'gas') { ctx.sub('gas').page = +el.dataset.page; ctx.draw(); } });
      P.on(v, 'click', '[data-g-csv]', () => { P.csv([['fecha', 'detalle', 'categoria', 'area', 'importe'], ...S.expenses.map((e) => [P.date(e.date), e.title, e.category, C.areaOf(e), e.amount])], 'plexi-gastos.csv'); P.toast('Se descargó plexi-gastos.csv.'); });
      P.on(v, 'click', '[data-g-del]', (e, el) => P.confirm('¿Eliminar el gasto?', 'Solo un administrador puede borrarlo.', 'Eliminar', () => { S.expenses = S.expenses.filter((x) => x.id !== el.dataset.gDel); P.toast('Gasto eliminado.'); ctx.draw(); }));
    },
  };

  /* ============================================================ COSTOS FIJOS ============================================================ */
  const EVERY = [[1, 'Todos los meses'], [2, 'Cada 2 meses'], [3, 'Cada 3 meses'], [6, 'Cada 6 meses'], [12, 'Una vez al año']];
  const paidOf = (S, f) => sum(S.expenses.filter((e) => e.category === f.cat && e.date >= Date.now() - (f.every || 1) * 30 * DAY), (e) => e.amount);
  const fixedState = (S, f, payroll) => { const due = f.auto === 'payroll' ? payroll : f.amount; const paid = paidOf(S, f); return { due, paid, st: paid >= due * 0.85 ? 'ok' : paid > 0 ? 'part' : 'pend' }; };
  const fixedDialog = (ctx, f) => {
    const { c } = ctx; const d = f || { name: '', area: 'Administración', amount: '', every: 1, cat: 'Varios' };
    const m = P.modal({ title: f ? 'Editar costo fijo' : 'Nuevo costo fijo', size: 'narrow', body: `<div class="stack"><div class="field"><label>Concepto *</label><input class="input" id="fn" value="${esc(d.name)}" placeholder="Ej.: Alquiler del depósito"></div><div class="grid g2"><div class="field"><label>Área</label><select class="input" id="fa">${C.opt(C.AREAS, d.area)}</select></div><div class="field"><label>Categoría de gasto</label><select class="input" id="fc">${C.opt(C.CATS, d.cat)}</select></div></div><div class="grid g2"><div class="field"><label>Importe de cada pago *</label><input class="input" id="fm" type="number" min="1" value="${d.amount}"></div><div class="field"><label>Se paga</label><select class="input" id="fe">${EVERY.map(([n, l]) => `<option value="${n}" ${n === d.every ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
    m.on('click', '[data-ok]', () => {
      const name = m.$('#fn').value.trim(); const amount = Math.round(+m.$('#fm').value || 0); if (name.length < 3 || amount <= 0) return P.toast('Completá el concepto y el importe.', 'bad');
      const data = { name, area: m.$('#fa').value, cat: m.$('#fc').value, amount, every: +m.$('#fe').value };
      if (f) Object.assign(f, data); else c.fixed.push({ id: P.uid('f'), ...data });
      P.log('FIXED_COST_SAVED', `Costo fijo «${name}» (${money(amount)})`, 'Costos'); m.close(); P.toast('Costo fijo guardado.'); ctx.draw();
    });
  };
  const fijos = {
    key: 'fix', label: 'Costos fijos', order: 3,
    body(b, ctx) {
      const { S, c } = ctx; const k = C.calc(); const rows = c.fixed.map((f) => ({ f, ...fixedState(S, f, k.payroll) })); const monthly = sum(c.fixed, (f) => C.monthly(f, k.payroll));
      const ST = { ok: '<span class="badge ok">Pagado</span>', part: '<span class="badge warn">Pago parcial</span>', pend: '<span class="badge bad">Pendiente</span>' };
      b.innerHTML = `<div class="grid g4 mb">${P.kpi('landmark', 'Fijos por mes', money(monthly), 'lo que cuesta tener abierto', 'bad')}${P.kpi('percent', 'Sobre las ventas', C.pct(k.rev ? (monthly / k.rev) * 100 : 0), 'con los últimos 30 días', 'gold')}${P.kpi('circle-check', 'Pagado', money(sum(rows, (r) => Math.min(r.paid, r.due))), 'en el período de cada uno')}${P.kpi('clock', 'Pendiente', money(sum(rows, (r) => Math.max(0, r.due - r.paid))), `${rows.filter((r) => r.st !== 'ok').length} sin pagar del todo`, 'info')}</div>
        <div class="row wrap mb"><span class="muted small grow">Lo que pagás aunque no vendas nada. «Registrar pago» lo anota en Gastos. Los sueldos salen de Empleados.</span><button class="btn btn-primary" data-f-new>${icon('plus')} Nuevo costo fijo</button></div>
        <div class="card">${P.table([{ h: 'Concepto', r: (r) => `<b>${esc(r.f.name)}</b>${r.f.auto ? ' <span class="badge info">Empleados</span>' : ''}<div class="tiny muted">${esc(r.f.cat)}</div>` }, { h: 'Área', r: (r) => esc(r.f.area) }, { h: 'Importe', num: true, cls: 'nowrap', r: (r) => money(r.due) }, { h: 'Se paga', r: (r) => EVERY.find((e) => e[0] === r.f.every)?.[1] || '' }, { h: 'Por mes', num: true, cls: 'nowrap', r: (r) => `<b>${money(C.monthly(r.f, k.payroll))}</b>` }, { h: 'Pagado', num: true, cls: 'nowrap', r: (r) => money(r.paid) }, { h: 'Estado', r: (r) => ST[r.st] }, { h: '', num: true, cls: 'nowrap', r: (r) => `<span class="row end gap4">${r.st !== 'ok' ? `<button class="btn btn-primary btn-sm" data-f-pay="${r.f.id}">Registrar pago</button>` : ''}${r.f.auto ? '' : `<button class="btn btn-ghost btn-icon" data-f-edit="${r.f.id}" title="Editar">${icon('pencil')}</button><button class="btn btn-ghost btn-icon" data-f-del="${r.f.id}" title="Eliminar" style="color:var(--bad)">${icon('trash-2')}</button>`}</span>` }], rows)}</div>`;
    },
    events(v, ctx) {
      const { S, c } = ctx; const byId = (id) => c.fixed.find((x) => x.id === id);
      P.on(v, 'click', '[data-f-new]', () => fixedDialog(ctx));
      P.on(v, 'click', '[data-f-edit]', (e, el) => fixedDialog(ctx, byId(el.dataset.fEdit)));
      P.on(v, 'click', '[data-f-del]', (e, el) => { const f = byId(el.dataset.fDel); P.confirm('¿Eliminar el costo fijo?', `Se borra «${f.name}» de la lista. Los gastos ya pagados no se tocan.`, 'Eliminar', () => { c.fixed = c.fixed.filter((x) => x !== f); P.toast('Costo fijo eliminado.'); ctx.draw(); }); });
      P.on(v, 'click', '[data-f-pay]', (e, el) => {
        const f = byId(el.dataset.fPay); const s = fixedState(S, f, C.calc().payroll); const left = Math.max(1, Math.round(s.due - s.paid));
        const m = P.modal({ title: 'Registrar pago', subtitle: f.name, size: 'narrow', body: `<div class="stack"><div class="field"><label>Importe</label><input class="input" id="pa" type="number" min="1" value="${left}"></div><div class="field"><label>Medio de pago</label><select class="input" id="pm"><option value="transfer">Transferencia</option><option value="cash">Efectivo</option><option value="debit">Tarjeta de débito</option></select></div><p class="hint">Se anota como un gasto de ${esc(f.cat)} en el área ${esc(f.area)}.</p></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Registrar</button></div>` });
        m.on('click', '[data-ok]', () => { const a = Math.round(+m.$('#pa').value || 0); if (a <= 0) return P.toast('Poné un importe mayor a cero.', 'bad'); S.expenses.push({ id: P.uid('e'), category: f.cat, area: f.area, title: f.name, amount: a, date: Date.now(), method: m.$('#pm').value }); P.log('EXPENSE_CREATED', `Pago de «${f.name}» (${money(a)})`, 'Gastos'); m.close(); P.toast(`Pago registrado: ${money(a)} en Gastos.`); ctx.draw(); });
      });
    },
  };

  /* ============================================================ COSTOS VARIABLES ============================================================ */
  const variableDialog = (ctx, x) => {
    const { c } = ctx; const d = x || { name: '', area: 'Ventas', base: 'sales', rate: '' };
    const m = P.modal({ title: x ? 'Editar costo variable' : 'Nuevo costo variable', size: 'narrow', body: `<div class="stack"><div class="field"><label>Concepto *</label><input class="input" id="vn" value="${esc(d.name)}" placeholder="Ej.: Comisión de plataforma"></div><div class="grid g2"><div class="field"><label>Área</label><select class="input" id="va">${C.opt(C.AREAS, d.area)}</select></div><div class="field"><label>Se calcula sobre</label><select class="input" id="vb">${Object.entries(C.BASES).map(([k, [l]]) => `<option value="${k}" ${k === d.base ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div><div class="field"><label id="vl">Tasa</label><input class="input" id="vr" type="number" min="0" step="0.1" value="${d.rate}"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
    const lab = () => { m.$('#vl').textContent = C.BASES[m.$('#vb').value][1] === '$' ? 'Importe por cada uno ($)' : 'Porcentaje (%)'; }; lab(); m.on('change', '#vb', lab);
    m.on('click', '[data-ok]', () => {
      const name = m.$('#vn').value.trim(); const rate = +m.$('#vr').value; if (name.length < 3 || !(rate > 0)) return P.toast('Completá el concepto y la tasa.', 'bad');
      const data = { name, area: m.$('#va').value, base: m.$('#vb').value, rate };
      if (x) Object.assign(x, data); else c.variable.push({ id: P.uid('v'), ...data });
      P.log('VARIABLE_COST_SAVED', `Costo variable «${name}»`, 'Costos'); m.close(); P.toast('Costo variable guardado.'); ctx.draw();
    });
  };
  const variables = {
    key: 'var', label: 'Costos variables', order: 4,
    body(b, ctx) {
      const { c } = ctx; const k = C.calc(); const rows = c.variable.map((x) => ({ x, amount: k.lines.find((l) => l.key === `v:${x.id}`)?.amount || 0 })); const top = rows.slice().sort((p, q) => q.amount - p.amount)[0];
      b.innerHTML = `<div class="grid g3 mb">${P.kpi('trending-up', 'Variables (30 días)', money(k.varTotal), 'crecen con las ventas', 'bad')}${P.kpi('percent', 'Sobre las ventas', C.pct(k.varPct * 100), 'de cada peso que vendés', 'gold')}${P.kpi('triangle-alert', 'El mayor', top ? esc(top.x.name) : '—', top ? money(top.amount) : '', 'info')}</div>
        <div class="row wrap mb"><span class="muted small grow">Lo que cuesta vender: crece y baja con las ventas. Las comisiones se calculan con el medio de pago real de cada venta.</span><button class="btn btn-primary" data-v-new>${icon('plus')} Nuevo costo variable</button></div>
        <div class="card">${P.table([{ h: 'Concepto', r: (r) => `<b>${esc(r.x.name)}</b>` }, { h: 'Área', r: (r) => esc(r.x.area) }, { h: 'Se calcula sobre', r: (r) => esc(C.BASES[r.x.base][0]) }, { h: 'Tasa', num: true, cls: 'nowrap', r: (r) => (C.BASES[r.x.base][1] === '$' ? money(r.x.rate) : C.pct(r.x.rate)) }, { h: 'Importe (30 días)', num: true, cls: 'nowrap', r: (r) => `<b>${money(r.amount)}</b>` }, { h: '% ventas', num: true, cls: 'nowrap', r: (r) => C.pct(k.rev ? (r.amount / k.rev) * 100 : 0) }, { h: '', num: true, cls: 'nowrap', r: (r) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-v-edit="${r.x.id}" title="Editar">${icon('pencil')}</button><button class="btn btn-ghost btn-icon" data-v-del="${r.x.id}" title="Eliminar" style="color:var(--bad)">${icon('trash-2')}</button></span>` }], rows, { empty: 'Todavía no cargaste costos variables.' })}</div>`;
    },
    events(v, ctx) {
      const { c } = ctx; const byId = (id) => c.variable.find((x) => x.id === id);
      P.on(v, 'click', '[data-v-new]', () => variableDialog(ctx));
      P.on(v, 'click', '[data-v-edit]', (e, el) => variableDialog(ctx, byId(el.dataset.vEdit)));
      P.on(v, 'click', '[data-v-del]', (e, el) => { const x = byId(el.dataset.vDel); P.confirm('¿Eliminar el costo variable?', `Se borra «${x.name}» de la lista.`, 'Eliminar', () => { c.variable = c.variable.filter((y) => y !== x); P.toast('Costo variable eliminado.'); ctx.draw(); }); });
    },
  };

  [resumen, gastos, fijos, variables].forEach(C.tab);

  /* ============================================================ PANTALLA ============================================================ */
  P.screens.costs = {
    render(v) {
      const S = P.S; const c = C.ensure(); const st = { tab: 'sum' };
      const ctx = { S, c, v, st, t: {}, sub: (k, d) => (st[k] ||= d), draw: () => draw() };
      const tabs = () => C.tabs.slice().sort((a, b) => a.order - b.order);
      const draw = () => {
        C.syncProd();
        v.innerHTML = `<div class="page">${P.page('Costos', 'En qué se va la plata: gastos, costos fijos y variables, el costo de cada producto, impuestos y presupuestos por área.', 'wallet', `<select class="input" id="creg" style="width:230px" title="Régimen de IVA"><option value="ri" ${c.regime === 'ri' ? 'selected' : ''}>Responsable inscripto</option><option value="mono" ${c.regime === 'mono' ? 'selected' : ''}>Monotributo</option></select>`)}<div class="mb">${P.tabs(tabs().map((t) => [t.key, t.label, t.badge ? t.badge(ctx) : '']), st.tab)}</div><div id="body"></div></div>`;
        $('.tabs', v).classList.add('wrap');
        tabs().find((t) => t.key === st.tab).body($('#body', v), ctx);
      };
      draw();
      P.on(v, 'click', '[data-tab]', (e, el) => { st.tab = el.dataset.tab; draw(); window.scrollTo(0, 0); });
      P.on(v, 'click', '[data-go]', (e, el) => P.nav(el.dataset.go));
      P.on(v, 'change', '#creg', (e, el) => {
        const to = el.value; const mono = to === 'mono';
        const m = P.modal({ title: mono ? '¿Pasar a Monotributo?' : '¿Volver a Responsable inscripto?', size: 'narrow', onClose: () => draw(), body: `<p class="muted">${mono ? 'El IVA de las compras deja de ser crédito fiscal y pasa a ser un costo: sube el costo de todos los productos (se le suma el IVA de cada uno), desaparece el IVA a pagar y aparece la cuota de monotributo.' : 'El IVA de las compras vuelve a ser crédito fiscal: el costo de los productos se calcula sin IVA y vuelve a haber IVA a pagar en Impuestos.'}</p><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Cambiar</button></div>` });
        m.on('click', '[data-ok]', () => { C.setRegime(to); P.log('REGIME_CHANGED', `Régimen de IVA: ${mono ? 'monotributo' : 'responsable inscripto'}`, 'Costos'); P.toast(mono ? 'Ahora el IVA de las compras es un costo.' : 'Ahora el IVA de las compras es crédito fiscal.'); m.close(); });
      });
      tabs().forEach((t) => t.events && t.events(v, ctx));
    },
  };
})();
