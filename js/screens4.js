/* Pantalla: Contabilidad. Junta en un solo lugar lo que Plexi ya tiene (ventas, gastos, cuenta corriente, proveedores) y suma lo que faltaba:
   notas de débito, reglas de impuesto, cuentas analíticas, cheques y comprobantes electrónicos. No duplica datos: todo se calcula de lo ya cargado. */
(function () {
  const P = window.Plexi;
  const { esc, icon, money, $ } = P;
  P.screens = P.screens || {};
  const DAY = P.DAY;
  const pct = (v) => `${String(v).replace('.', ',')} %`;
  const pad = (n, len) => String(n).padStart(len, '0');

  /* ---------- importe en letras (para el cheque) ---------- */
  const UN = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const TE = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const CE = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  const below1000 = (n) => {
    if (n === 100) return 'cien';
    const c = Math.floor(n / 100); const r = n % 100; const out = [];
    if (c) out.push(CE[c]);
    if (r) out.push(r < 30 ? UN[r] : TE[Math.floor(r / 10)] + (r % 10 ? ` y ${UN[r % 10]}` : ''));
    return out.join(' ');
  };
  const apocope = (t) => t.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
  const words = (n) => {
    n = Math.round(n);
    if (n <= 0) return 'cero';
    if (n >= 1e9) return String(n);
    const m = Math.floor(n / 1e6); const k = Math.floor((n % 1e6) / 1e3); const r = n % 1e3; const out = [];
    if (m) out.push(m === 1 ? 'un millón' : `${apocope(below1000(m))} millones`);
    if (k) out.push(k === 1 ? 'mil' : `${apocope(below1000(k))} mil`);
    if (r) out.push(below1000(r));
    const t = out.join(' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  /* ---------- cálculos contables sobre las ventas que ya existen ---------- */
  const ratio = (s) => (s.total ? Math.max(0, s.total - s.refunded) / s.total : 0); // parte de la venta que no se devolvió
  const revenue = (s) => (s.total - s.tax) * ratio(s); // ingreso sin impuesto
  const taxOf = (s) => s.tax * ratio(s);
  const costOf = (s) => s.items.reduce((a, l) => a + l.cost * l.qty, 0) * ratio(s);
  const sum = (list, f) => list.reduce((a, x) => a + f(x), 0);

  const CENTERS = ['Local', 'Depósito', 'Administración'];
  const CENTER_OF = { Alquiler: 'Local', Electricidad: 'Local', Mantenimiento: 'Depósito', Transporte: 'Depósito', Internet: 'Administración', Sueldos: 'Administración' };
  const REASONS = ['Intereses por mora', 'Gastos de envío no facturados', 'Ajuste de precio', 'Diferencia de cambio', 'Otro motivo'];
  const KINDS = { pct: 'Porcentaje de la base', excess: 'Porcentaje sobre el excedente de un mínimo', flat: 'Importe fijo por comprobante' };

  /* ---------- datos propios de esta pantalla (se arman la primera vez que se entra y se reinician con la demo) ---------- */
  const makeNote = (A, sale, reason, base, status, date = Date.now()) => {
    const rate = P.S.settings.taxRate; const tax = Math.round((base * rate) / 100); const n = ++A.ndSeq;
    return { id: `nd${n}`, no: `ND-${pad(n, 4)}`, date, saleId: sale.id, saleNo: sale.no, customerId: sale.customerId, customerName: sale.customerName, reason, base, taxRate: rate, tax, total: base + tax, status };
  };
  const ensure = () => {
    const S = P.S;
    if (S.acc) return S.acc;
    const A = (S.acc = {
      ndSeq: 0, chkSeq: 1040, notes: [], checks: [], edoc: {},
      taxes: [
        { id: 'tg', name: 'Impuesto general', kind: 'pct', value: 0, system: true, active: true },
        { id: 'tx1', name: 'IVA 21 %', kind: 'pct', value: 21, active: true },
        { id: 'tx2', name: 'IVA 10,5 %', kind: 'pct', value: 10.5, active: true },
        { id: 'tx3', name: 'Percepción sobre el excedente', kind: 'excess', value: 3, min: 50000, active: true },
        { id: 'tx4', name: 'Tasa fija por comprobante', kind: 'flat', value: 150, active: false },
      ],
    });
    const live = S.sales.filter((s) => s.status === 'completed');
    const anon = live.filter((s) => !s.customerId);
    [['Gastos de envío no facturados', 2500, 14], ['Intereses por mora', 1800, 6], ['Ajuste de precio', 900, 3]].forEach(([reason, base, k]) => {
      const s = anon[k] || anon.at(-1);
      if (s) A.notes.push(makeNote(A, s, reason, base, 'paid', Math.min(Date.now(), s.date + 2 * DAY)));
    });
    [[S.suppliers[0], 45000, 'cashed', 18], [S.suppliers[1], 82000, 'issued', 6]].forEach(([sup, amount, status, ago]) => {
      if (sup) A.checks.push({ id: `ck${A.checks.length + 1}`, no: pad(++A.chkSeq, 8), date: Date.now() - ago * DAY, supplierId: sup.id, supplier: sup.name, amount, status });
    });
    live.slice(0, 3).forEach((s) => { A.edoc[s.id] = { status: 'pending' }; });
    S.expenses.forEach((e) => { if (e.analytic === undefined) e.analytic = CENTER_OF[e.category] || ''; });
    return A;
  };
  const eNo = (s) => pad([...s.no].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7), 10);
  const edocOf = (A, s) => A.edoc[s.id] || (s.date >= P.dayStart() ? { status: 'pending' } : { status: 'accepted', no: eNo(s), date: s.date + 120000 });
  const rule = (t) => (t.system ? { ...t, value: P.S.settings.taxRate } : t);
  const how = (t) => (t.kind === 'pct' ? `${pct(t.value)} de la base` : t.kind === 'excess' ? `${pct(t.value)} sobre lo que pase de ${money(t.min)}` : `${money(t.value)} por comprobante`);
  const calc = (t, base) => (t.kind === 'pct' ? (base * t.value) / 100 : t.kind === 'excess' ? (Math.max(0, base - t.min) * t.value) / 100 : t.value);

  /* ============================================================ CONTABILIDAD ============================================================ */
  P.screens.accounting = {
    render(v) {
      const S = P.S; const A = ensure();
      const st = { tab: 'summary', view: 'inv', q: '', page: 1, days: 30, base: 100000 };
      const SIZE = 12;
      const TABS = [['summary', 'Resumen'], ['invoices', 'Facturas'], ['taxes', 'Impuestos'], ['analytic', 'Analítica'], ['docs', 'Cheques y comprobantes']];
      const live = () => S.sales.filter((s) => s.status === 'completed');
      const saleById = (id) => S.sales.find((s) => s.id === id);

      /* ventana de 30 días: i = 0 son los últimos 30 días, 1 los 30 anteriores, etc. */
      const period = (i) => {
        const to = Date.now() - i * 30 * DAY + 1; const from = to - 30 * DAY;
        const sales = S.sales.filter((s) => s.date >= from && s.date < to);
        const notes = A.notes.filter((n) => n.date >= from && n.date < to);
        const sales_rev = sum(sales, revenue); const nd_rev = sum(notes, (n) => n.base); const cost = sum(sales, costOf);
        const exp = sum(S.expenses.filter((e) => e.date >= from && e.date < to), (e) => e.amount);
        const income = sales_rev + nd_rev;
        return { from, to, sales, notes, sales_rev, nd_rev, income, cost, gross: income - cost, exp, result: income - cost - exp, tax: sum(sales, taxOf) + sum(notes, (n) => n.tax) };
      };

      /* ---------- Resumen ---------- */
      const summary = (b) => {
        const p = [0, 1, 2].map(period); const c = p[0];
        const due = sum(S.customers, (x) => Math.max(0, P.balance(x))); const dueN = S.customers.filter((x) => P.balance(x) > 0).length; const over = S.customers.filter(P.isOverdue).length;
        const owe = sum(S.suppliers, (x) => Math.max(0, x.balance)); const oweN = S.suppliers.filter((x) => x.balance > 0).length;
        const ROWS = [
          { l: 'Ventas (sin impuesto)', k: 'sales_rev' }, { l: 'Notas de débito (sin impuesto)', k: 'nd_rev' }, { l: 'Ingresos', k: 'income', strong: true },
          { l: 'Costo de la mercadería vendida', k: 'cost', neg: true }, { l: 'Utilidad bruta', k: 'gross', strong: true }, { l: 'Gastos', k: 'exp', neg: true }, { l: 'Resultado', k: 'result', strong: true },
          { l: 'Impuesto cobrado en las ventas (aparte, no suma al resultado)', k: 'tax', muted: true },
        ];
        const val = (r, i) => { const x = r.neg ? -p[i][r.k] : p[i][r.k]; return r.strong ? `<b class="${r.k === 'result' ? (x < 0 ? 'red' : 'green') : ''}">${money(x)}</b>` : r.muted ? `<span class="muted">${money(x)}</span>` : money(x); };
        const heads = ['Últimos 30 días', 'Hace 30 a 60 días', 'Hace 60 a 90 días'];
        b.innerHTML = `<div class="grid g4 mb">${P.kpi('circle-dollar-sign', 'Ingresos (30 días)', money(c.income), 'ventas y notas de débito, sin impuesto')}${P.kpi('wallet', 'Gastos (30 días)', money(c.exp), '', 'bad')}${P.kpi('piggy-bank', 'Resultado (30 días)', `<span class="${c.result < 0 ? 'red' : ''}">${money(c.result)}</span>`, 'ingresos menos costo y gastos', 'gold')}${P.kpi('percent', 'Impuesto cobrado (30 días)', money(c.tax), `${c.sales.filter((s) => s.status !== 'refunded').length} comprobantes`, 'info')}</div>
          <div class="grid g3 mb">${P.kpi('hand-coins', 'Por cobrar', money(due), `${dueN} clientes con deuda${over ? ` · ${over} vencida${over > 1 ? 's' : ''}` : ''}`, 'gold')}${P.kpi('truck', 'Por pagar', money(owe), `${oweN} proveedores`, 'bad')}${P.kpi('scale', 'Posición neta', `<span class="${due - owe < 0 ? 'red' : 'green'}">${money(due - owe)}</span>`, 'por cobrar menos por pagar')}</div>
          <div class="card mb"><div class="card-h"><div><h3>Estado de resultados</h3><p>El mismo cálculo en tres períodos de 30 días, para ver cómo evoluciona.</p></div><button class="btn btn-outline btn-sm" data-go="reports">${icon('chart-column')} Ver Reportes</button></div>
            ${P.table([{ h: 'Concepto', r: (r) => (r.strong ? `<b>${r.l}</b>` : r.muted ? `<span class="muted">${r.l}</span>` : r.l) }, ...heads.map((h, i) => ({ h, num: true, r: (r) => val(r, i) }))], ROWS)}</div>
          <div class="notice info">Nada se carga dos veces: las facturas salen del Historial de ventas, los gastos de Gastos, y lo que se cobra o se debe, de Clientes y Proveedores. Aquí solo se ordena y se suma lo que faltaba.</div>`;
      };

      /* ---------- Facturas y notas de débito ---------- */
      /* una sola columna de estado: si hubo reembolso se ve eso; si no, cómo se cobró */
      const estado = (s) => (s.status !== 'completed' ? P.statusBadge(s.status) : s.payments.some((p) => p.method === 'account') ? '<span class="badge warn">Cuenta corriente</span>' : '<span class="badge ok">Cobrada</span>');
      const edBadge = (s) => (edocOf(A, s).status === 'accepted' ? '<span class="badge ok">Enviado</span>' : '<span class="badge warn">Sin enviar</span>');
      const ndBadge = (n) => (n.status === 'paid' ? '<span class="badge ok">Cobrada</span>' : '<span class="badge warn">A cuenta del cliente</span>');
      const invoices = (b) => {
        b.innerHTML = `<div class="row wrap mb"><div class="row wrap grow" id="views"></div><div class="search" style="width:260px">${icon('search')}<input class="input" id="aq" placeholder="Factura, cliente o motivo…" value="${esc(st.q)}"></div><button class="btn btn-primary" data-newnd>${icon('plus')} Nueva nota de débito</button></div><div class="card"><div id="tbl"></div></div>`;
        $('#aq', b).addEventListener('input', (e) => { st.q = e.target.value; st.page = 1; drawInv(); });
        drawInv();
      };
      const drawInv = () => {
        const t = st.q.toLowerCase();
        $('#views').innerHTML = [['inv', 'Facturas emitidas', ''], ['nd', 'Notas de débito', A.notes.length]].map(([k, l, n]) => `<button class="chip ${k === st.view ? 'on' : ''}" data-view="${k}">${l}${n !== '' ? ` · ${n}` : ''}</button>`).join('');
        if (st.view === 'inv') {
          const list = S.sales.filter((s) => !t || [s.no, s.customerName].some((f) => f.toLowerCase().includes(t)));
          const rows = list.slice((st.page - 1) * SIZE, st.page * SIZE);
          $('#tbl').innerHTML = P.table([
            { h: 'Factura', cls: 'nowrap', r: (s) => `<b>${esc(s.no)}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (s) => P.date(s.date) }, { h: 'Cliente', r: (s) => esc(s.customerName) },
            { h: 'Base / impuesto', num: true, cls: 'nowrap', r: (s) => `${money(s.total - s.tax)}<div class="tiny muted">+ ${money(s.tax)}</div>` }, { h: 'Total', num: true, cls: 'nowrap', r: (s) => `<b>${money(s.total)}</b>` },
            { h: 'Estado', cls: 'nowrap', r: estado },
            { h: '', num: true, cls: 'nowrap', r: (s) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-rcpt="${s.id}" title="Ver recibo (el mismo del Historial de ventas)">${icon('printer')}</button>${s.status !== 'refunded' ? `<button class="btn btn-outline btn-sm" data-nd="${s.id}">Nota de débito</button>` : ''}</span>` },
          ], rows, { empty: 'No hay facturas con esa búsqueda.' }) + P.pager(st.page, list.length, SIZE);
        } else {
          const list = A.notes.filter((n) => !t || [n.no, n.saleNo, n.customerName, n.reason].some((f) => f.toLowerCase().includes(t))).sort((x, y) => y.date - x.date);
          $('#tbl').innerHTML = P.table([
            { h: 'Nota', cls: 'nowrap', r: (n) => `<b>${esc(n.no)}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (n) => P.date(n.date) }, { h: 'Factura de origen', cls: 'nowrap', r: (n) => esc(n.saleNo) }, { h: 'Cliente', r: (n) => esc(n.customerName) },
            { h: 'Motivo', r: (n) => esc(n.reason) }, { h: 'Importe / impuesto', num: true, cls: 'nowrap', r: (n) => `${money(n.base)}<div class="tiny muted">+ ${money(n.tax)}</div>` }, { h: 'Total', num: true, cls: 'nowrap', r: (n) => `<b>${money(n.total)}</b>` },
            { h: 'Estado', cls: 'nowrap', r: ndBadge }, { h: '', num: true, r: (n) => `<button class="btn btn-ghost btn-icon" data-ndview="${n.id}" title="Ver nota">${icon('file-text')}</button>` },
          ], list, { empty: 'Todavía no hay notas de débito: se crean desde una factura.' });
        }
      };
      const debitNoteDialog = (sale) => {
        const recent = S.sales.filter((s) => s.status !== 'refunded').slice(0, 40);
        const list = sale && !recent.some((s) => s.id === sale.id) ? [sale, ...recent] : recent;
        if (!list.length) return P.toast('Todavía no hay facturas para ajustar.', 'warn');
        const m = P.modal({ title: 'Nueva nota de débito', subtitle: 'Suma un cargo a una factura ya emitida', size: 'narrow', body: `<div class="stack"><div class="field"><label>Factura</label><select class="input" id="ndsale">${list.map((s) => `<option value="${s.id}" ${sale && s.id === sale.id ? 'selected' : ''}>${esc(s.no)} · ${esc(s.customerName)} · ${money(s.total)}</option>`).join('')}</select></div>
          <div class="field"><label>Motivo</label><select class="input" id="ndrs">${REASONS.map((r) => `<option>${esc(r)}</option>`).join('')}</select></div>
          <div class="field"><label>Importe sin impuesto</label><input class="input" id="ndamt" type="number" min="1" placeholder="Ej.: 1500"></div><div class="notice info" id="ndprev"></div></div>
          <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Emitir nota de débito</button></div>` });
        const preview = () => {
          const s = saleById(m.$('#ndsale').value); const base = +m.$('#ndamt').value || 0; const rate = S.settings.taxRate; const tax = Math.round((base * rate) / 100);
          m.$('#ndprev').innerHTML = `${base ? `Impuesto (${pct(rate)}): <b>${money(tax)}</b> · Total de la nota: <b>${money(base + tax)}</b><br>` : 'Escribí el importe para ver el total.<br>'}${s.customerId ? `Se suma a la cuenta corriente de <b>${esc(s.customerName)}</b> (se cobra desde Clientes).` : 'Es consumidor final: se cobra en el momento.'}`;
        };
        preview();
        m.on('input', '#ndamt', preview); m.on('change', '#ndsale', preview);
        m.on('click', '[data-ok]', () => {
          const s = saleById(m.$('#ndsale').value); const base = Math.round(+m.$('#ndamt').value || 0);
          if (base <= 0) return P.toast('Poné un importe mayor a cero.', 'bad');
          const n = makeNote(A, s, m.$('#ndrs').value, base, s.customerId ? 'pending' : 'paid');
          A.notes.push(n);
          if (s.customerId) P.customer(s.customerId).ledger.push({ date: Date.now(), type: 'charge', amount: n.total, desc: `Nota de débito ${n.no} sobre ${s.no}` });
          P.log('DEBIT_NOTE_CREATED', `Nota de débito ${n.no} por ${money(n.total)} sobre ${s.no}`, 'Contabilidad');
          m.close(); P.toast(`Nota de débito ${n.no} emitida por ${money(n.total)}.`); st.view = 'nd'; st.q = ''; st.page = 1; draw(); ndDialog(n);
        });
      };
      const ndDialog = (n) => {
        const cfg = S.settings;
        P.modal({ title: 'Nota de débito', subtitle: n.no, body: `<div class="ticket print-area"><div class="c"><img class="lg" src="assets/logo-dark.png" alt=""><div class="ttl">${esc(cfg.storeName.toUpperCase())}</div><div class="m">${esc(cfg.address)}</div></div><hr>
          <div class="c"><b>NOTA DE DÉBITO</b></div><div class="r"><span>Número</span><b>${esc(n.no)}</b></div><div class="r"><span>Fecha</span><span>${P.date(n.date)}</span></div><div class="r"><span>Factura de origen</span><span>${esc(n.saleNo)}</span></div><div class="r"><span>Cliente</span><span>${esc(n.customerName)}</span></div><hr>
          <div class="r"><span>Motivo</span><span>${esc(n.reason)}</span></div><div class="r"><span>Importe</span><span>${money(n.base)}</span></div><div class="r"><span>Impuesto (${pct(n.taxRate)})</span><span>${money(n.tax)}</span></div><div class="r big"><span>TOTAL</span><span>${money(n.total)}</span></div></div>
          <div class="dialog-f"><button class="btn btn-outline" data-close>Cerrar</button><button class="btn btn-primary" data-print>${icon('printer')} Imprimir</button></div>` }).on('click', '[data-print]', () => window.print());
      };

      /* ---------- Impuestos ---------- */
      const taxes = (b) => {
        const c = period(0); const byRate = {};
        c.sales.filter((s) => ratio(s) > 0).forEach((s) => { const r = (byRate[s.taxRate] ||= { rate: s.taxRate, n: 0, base: 0, tax: 0 }); r.n += 1; r.base += revenue(s); r.tax += taxOf(s); });
        c.notes.forEach((n) => { const r = (byRate[n.taxRate] ||= { rate: n.taxRate, n: 0, base: 0, tax: 0 }); r.n += 1; r.base += n.base; r.tax += n.tax; });
        const rows = Object.values(byRate).sort((x, y) => y.rate - x.rate); const totalBase = sum(rows, (r) => r.base); const totalTax = sum(rows, (r) => r.tax);
        b.innerHTML = `<div class="grid g3 mb">${P.kpi('percent', 'Impuesto cobrado (30 días)', money(totalTax), 'ventas y notas de débito', 'info')}${P.kpi('circle-dollar-sign', 'Base imponible (30 días)', money(totalBase))}${P.kpi('trending-up', 'Tasa efectiva', pct((totalBase ? (totalTax / totalBase) * 100 : 0).toFixed(1)), 'impuesto sobre la base', 'gold')}</div>
          <div class="grid g2 mb"><div class="card"><div class="card-h"><div><h3>Impuesto cobrado por tasa</h3><p>Últimos 30 días, sin contar lo devuelto.</p></div></div>${P.table([{ h: 'Tasa', r: (r) => `<b>${pct(r.rate)}</b>` }, { h: 'Comprobantes', num: true, r: (r) => r.n }, { h: 'Base', num: true, r: (r) => money(r.base) }, { h: 'Impuesto', num: true, r: (r) => `<b>${money(r.tax)}</b>` }], rows, { empty: 'No hay ventas en el período.' })}</div>
          <div class="card"><div class="card-h"><div><h3>Calculadora de impuestos</h3><p>Probá cuánto da cada regla activa sobre un importe.</p></div></div><div class="card-b stack"><div class="field"><label>Importe base</label><input class="input" id="cbase" type="number" min="0" value="${st.base}"></div><div id="cres"></div></div></div></div>
          <div class="card"><div class="card-h"><div><h3>Reglas de impuesto</h3><p>El impuesto general sale de Configuración; las demás reglas se definen aquí.</p></div><button class="btn btn-primary btn-sm" data-tnew>${icon('plus')} Nueva regla</button></div>
          ${P.table([{ h: 'Activa', r: (t) => `<input type="checkbox" data-tact="${t.id}" ${t.active ? 'checked' : ''} style="accent-color:var(--brand)">` }, { h: 'Regla', r: (t) => `<b>${esc(t.name)}</b>${t.system ? ' <span class="badge info">Configuración</span>' : ''}` }, { h: 'Cómo se calcula', r: (t) => how(rule(t)) }, { h: '', num: true, r: (t) => (t.system ? '' : `<button class="btn btn-ghost btn-icon" data-tdel="${t.id}" title="Eliminar" style="color:var(--bad)">${icon('trash-2')}</button>`) }], A.taxes)}</div>`;
        const calcRes = () => {
          const base = Math.max(0, +$('#cbase', b).value || 0); st.base = base; const act = A.taxes.filter((t) => t.active).map(rule);
          const lines = act.map((t) => ({ t, amt: calc(t, base) })); const tot = sum(lines, (x) => x.amt);
          $('#cres', b).innerHTML = act.length ? P.table([{ h: 'Regla', r: (x) => esc(x.t.name) }, { h: 'Impuesto', num: true, r: (x) => money(x.amt) }], lines) + `<div class="row between mt8"><span class="muted">Total con impuestos</span><b>${money(base + tot)}</b></div><div class="row between small"><span class="muted">Suma de impuestos</span><span>${money(tot)}</span></div>` : '<div class="empty">No hay reglas activas.</div>';
        };
        calcRes(); $('#cbase', b).addEventListener('input', calcRes);
      };
      const ruleDialog = () => {
        const m = P.modal({ title: 'Nueva regla de impuesto', size: 'narrow', body: `<div class="stack"><div class="field"><label>Nombre</label><input class="input" id="rn" placeholder="Ej.: Percepción de ingresos"></div><div class="field"><label>Cómo se calcula</label><select class="input" id="rk">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
          <div class="field"><label id="rvl">Porcentaje</label><input class="input" id="rv" type="number" min="0" step="0.1" placeholder="Ej.: 3"></div><div class="field hidden" id="rmw"><label>Mínimo no sujeto</label><input class="input" id="rm" type="number" min="0" placeholder="Ej.: 50000"></div></div>
          <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar regla</button></div>` });
        m.on('change', '#rk', () => { const k = m.$('#rk').value; m.$('#rvl').textContent = k === 'flat' ? 'Importe fijo' : 'Porcentaje'; m.$('#rmw').classList.toggle('hidden', k !== 'excess'); });
        m.on('click', '[data-ok]', () => {
          const name = m.$('#rn').value.trim(); const kind = m.$('#rk').value; const value = +m.$('#rv').value; const min = +m.$('#rm').value || 0;
          if (!name) return P.toast('Ponele un nombre a la regla.', 'bad');
          if (!(value > 0)) return P.toast('Poné un valor mayor a cero.', 'bad');
          A.taxes.push({ id: P.uid('tx'), name, kind, value, min, active: true }); P.log('TAX_RULE_CREATED', `Regla de impuesto «${name}»`, 'Contabilidad'); m.close(); P.toast('Regla guardada.'); draw();
        });
      };

      /* ---------- Analítica ---------- */
      const analytic = (b) => {
        const from = Date.now() - st.days * DAY; const sales = S.sales.filter((s) => s.date >= from && ratio(s) > 0); const cat = {};
        sales.forEach((s) => s.items.forEach((l) => { const c = (cat[P.get(l.pid)?.category || 'Sin categoría'] ||= { rev: 0, cost: 0 }); c.rev += l.price * l.qty * ratio(s); c.cost += l.cost * l.qty * ratio(s); }));
        const rows = Object.entries(cat).map(([c, x]) => ({ c, ...x, margin: x.rev - x.cost })).sort((x, y) => y.margin - x.margin);
        const exps = S.expenses.filter((e) => e.date >= from).sort((x, y) => y.date - x.date); const byC = {};
        [...CENTERS, 'Sin asignar'].forEach((c) => { byC[c] = 0; }); exps.forEach((e) => { byC[e.analytic || 'Sin asignar'] += e.amount; });
        b.innerHTML = `<div class="row wrap mb"><span class="muted small grow">Cada categoría de producto y cada centro de costo funciona como una cuenta analítica: muestra cuánto rinde o cuesta cada parte del negocio.</span><select class="input" id="per" style="width:170px"><option value="30" ${st.days === 30 ? 'selected' : ''}>Últimos 30 días</option><option value="90" ${st.days === 90 ? 'selected' : ''}>Últimos 90 días</option></select></div>
          <div class="grid g2"><div class="card"><div class="card-h"><div><h3>Rentabilidad por categoría</h3><p>Ventas menos costo, antes de descuentos e impuestos.</p></div></div>${P.table([{ h: 'Categoría', r: (r) => esc(r.c) }, { h: 'Ingresos', num: true, r: (r) => money(r.rev) }, { h: 'Costo', num: true, r: (r) => money(r.cost) }, { h: 'Margen', num: true, r: (r) => `<b>${money(r.margin)}</b>` }, { h: '%', num: true, r: (r) => `${r.rev ? Math.round((r.margin / r.rev) * 100) : 0} %` }], rows, { empty: 'No hay ventas en el período.' })}</div>
          <div class="card"><div class="card-h"><div><h3>Gastos por centro de costo</h3><p>Asigná cada gasto a la parte del negocio que lo genera.</p></div></div><div class="card-b">${P.hbars(Object.entries(byC).map(([label, value]) => ({ label, value })))}</div>
          ${P.table([{ h: 'Fecha', cls: 'nowrap', r: (e) => P.date(e.date) }, { h: 'Gasto', r: (e) => esc(e.title) }, { h: 'Importe', num: true, cls: 'nowrap', r: (e) => money(e.amount) }, { h: 'Centro', r: (e) => `<select class="input sm" style="min-width:150px" data-asg="${e.id}"><option value="">Sin asignar</option>${CENTERS.map((c) => `<option ${e.analytic === c ? 'selected' : ''}>${c}</option>`).join('')}</select>` }], exps.slice(0, 12), { empty: 'No hay gastos en el período.' })}</div></div>`;
      };

      /* ---------- Cheques y comprobantes electrónicos ---------- */
      const CHK = { issued: '<span class="badge info">Emitido</span>', cashed: '<span class="badge ok">Cobrado</span>', void: '<span class="badge bad">Anulado</span>' };
      const docs = (b) => {
        const list = live().slice(0, 10);
        b.innerHTML = `<div class="card mb"><div class="card-h"><div><h3>Cheques a proveedores</h3><p>Al emitir un cheque baja lo que les debés.</p></div><button class="btn btn-primary btn-sm" data-chknew>${icon('plus')} Emitir cheque</button></div>
          ${P.table([{ h: 'N.º', cls: 'nowrap', r: (k) => `<b>${k.no}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (k) => P.date(k.date) }, { h: 'Proveedor', r: (k) => esc(k.supplier) }, { h: 'Importe', num: true, cls: 'nowrap', r: (k) => `<b>${money(k.amount)}</b>` }, { h: 'Estado', cls: 'nowrap', r: (k) => CHK[k.status] },
            { h: '', num: true, cls: 'nowrap', r: (k) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-chkprint="${k.id}" title="Ver e imprimir">${icon('printer')}</button>${k.status === 'issued' ? `<button class="btn btn-outline btn-sm" data-chkcash="${k.id}">Cobrado</button><button class="btn btn-ghost btn-icon" data-chkvoid="${k.id}" title="Anular" style="color:var(--bad)">${icon('x')}</button>` : ''}</span>` }], A.checks.slice().reverse(), { empty: 'Todavía no emitiste cheques.' })}</div>
          <div class="card"><div class="card-h"><div><h3>Comprobantes electrónicos</h3><p>Las últimas 10 facturas y si ya se enviaron.</p></div></div>
          ${P.table([{ h: 'Factura', cls: 'nowrap', r: (s) => `<b>${esc(s.no)}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (s) => P.date(s.date) }, { h: 'Cliente', r: (s) => esc(s.customerName) }, { h: 'Total', num: true, cls: 'nowrap', r: (s) => money(s.total) }, { h: 'Estado', cls: 'nowrap', r: edBadge },
            { h: 'N.º de comprobante', cls: 'nowrap', r: (s) => { const e = edocOf(A, s); return e.status === 'accepted' ? `<span class="muted">${e.no}</span>` : '<span class="faint">—</span>'; } },
            { h: '', num: true, cls: 'nowrap', r: (s) => (edocOf(A, s).status === 'accepted' ? `<button class="btn btn-ghost btn-icon" data-edview="${s.id}" title="Ver comprobante">${icon('file-text')}</button>` : `<button class="btn btn-primary btn-sm" data-edsend="${s.id}">${icon('send')} Enviar</button>`) }], list, { empty: 'Todavía no hay facturas.' })}</div>
          <div class="notice info mt">Simulación: aquí no se envía nada a ningún organismo ni red de facturación, ni se imprime un cheque de verdad.</div>`;
      };
      const checkDialog = (k) => {
        const cfg = S.settings;
        P.modal({ title: 'Cheque', subtitle: `N.º ${k.no}`, size: 'wide', body: `<div class="chq print-area"><div class="chq-h"><div><b>${esc(cfg.storeName)}</b><div class="tiny muted">${esc(cfg.address)}</div></div><div class="chq-no">N.º ${k.no}</div></div>
          <div class="chq-r"><span>Páguese a la orden de</span><b>${esc(k.supplier)}</b></div><div class="chq-r"><span>La suma de pesos</span><b>${esc(words(k.amount))} con 00/100</b></div>
          <div class="chq-f"><div class="chq-amt">${money(k.amount)}</div><div>${P.date(k.date)}</div><div class="chq-sign"><i></i>Firma</div></div></div>
          <div class="dialog-f"><button class="btn btn-outline" data-close>Cerrar</button><button class="btn btn-primary" data-print>${icon('printer')} Imprimir cheque</button></div>` }).on('click', '[data-print]', () => window.print());
      };
      const checkNewDialog = () => {
        const sups = S.suppliers.filter((s) => s.balance > 0);
        if (!sups.length) return P.toast('No le debés a ningún proveedor: no hay nada para pagar con cheque.', 'warn');
        const m = P.modal({ title: 'Emitir cheque', subtitle: 'Paga una deuda con un proveedor', size: 'narrow', body: `<div class="stack"><div class="field"><label>Proveedor</label><select class="input" id="ks">${sups.map((s) => `<option value="${s.id}">${esc(s.name)} · les debés ${money(s.balance)}</option>`).join('')}</select></div><div class="field"><label>Importe</label><input class="input" id="ka" type="number" min="1" value="${sups[0].balance}"></div></div>
          <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Emitir cheque</button></div>` });
        m.on('change', '#ks', () => { m.$('#ka').value = S.suppliers.find((s) => s.id === m.$('#ks').value).balance; });
        m.on('click', '[data-ok]', () => {
          const s = S.suppliers.find((x) => x.id === m.$('#ks').value); const amount = Math.round(+m.$('#ka').value || 0);
          if (amount <= 0 || amount > s.balance) return P.toast(`El importe va de 1 a ${money(s.balance)}, que es lo que les debés.`, 'bad');
          s.balance -= amount; const k = { id: `ck${A.checks.length + 1}`, no: pad(++A.chkSeq, 8), date: Date.now(), supplierId: s.id, supplier: s.name, amount, status: 'issued' };
          A.checks.push(k); P.log('CHECK_ISSUED', `Cheque ${k.no} por ${money(amount)} a ${s.name}`, 'Contabilidad'); m.close(); P.toast(`Cheque ${k.no} emitido. La deuda con ${s.name} bajó a ${money(s.balance)}.`); draw(); checkDialog(k);
        });
      };
      const edocDialog = (s, sent) => {
        const cfg = S.settings; const e = edocOf(A, s);
        const xml = `<Invoice>\n  <ID>${s.no}</ID>\n  <IssueDate>${new Date(s.date).toISOString().slice(0, 10)}</IssueDate>\n  <Supplier>${cfg.storeName}</Supplier>\n  <Customer>${s.customerName}</Customer>\n  <TaxTotal rate="${pct(s.taxRate)}">${s.tax}</TaxTotal>\n  <PayableAmount currency="ARS">${s.total}</PayableAmount>\n${s.items.map((l) => `  <Line qty="${l.qty}" price="${l.price}">${l.name}</Line>`).join('\n')}\n</Invoice>`;
        const m = P.modal({ title: sent ? 'Comprobante electrónico' : 'Enviar comprobante electrónico', subtitle: s.no, size: 'wide', body: `<div class="stack"><p class="small muted">Vista simplificada del archivo que viaja al enviar la factura.</p><pre class="card-b" style="margin:0;background:var(--surface);border-radius:var(--r);font-size:12px;overflow:auto;max-height:280px">${esc(xml)}</pre>
          ${sent ? `<div class="notice ok">Enviado y aceptado el ${P.dateTime(e.date)}. N.º de comprobante: <b>${e.no}</b>.</div><div class="dialog-f"><button class="btn btn-outline" data-close>Cerrar</button></div>` : '<div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>' + icon('send') + ' Enviar comprobante</button></div>'}</div>` });
        m.on('click', '[data-ok]', () => {
          const btn = m.$('[data-ok]'); btn.disabled = true; btn.innerHTML = `${icon('loader-circle', 'spin')} Enviando…`;
          setTimeout(() => { A.edoc[s.id] = { status: 'accepted', no: eNo(s), date: Date.now() }; P.log('EDOC_SENT', `Comprobante electrónico de ${s.no} enviado`, 'Contabilidad'); m.close(); P.toast(`Comprobante de ${s.no} enviado y aceptado.`); draw(); }, 900);
        });
      };

      /* ---------- estructura y eventos ---------- */
      const BODY = { summary, invoices, taxes, analytic, docs };
      const draw = () => {
        const pend = live().slice(0, 10).filter((s) => edocOf(A, s).status === 'pending').length;
        v.innerHTML = `<div class="page">${P.page('Contabilidad', 'Facturas, impuestos, cuentas analíticas, cheques y comprobantes, a partir de lo que ya cargás en Plexi.', 'scale')}<div class="mb">${P.tabs(TABS.map(([k, l]) => (k === 'docs' ? [k, l, pend || ''] : [k, l])), st.tab)}</div><div id="body"></div></div>`;
        BODY[st.tab]($('#body', v));
      };
      draw();
      P.on(v, 'click', '[data-tab]', (e, el) => { st.tab = el.dataset.tab; draw(); window.scrollTo(0, 0); });
      P.on(v, 'click', '[data-go]', (e, el) => P.nav(el.dataset.go));
      P.on(v, 'click', '[data-page]', (e, el) => { st.page = +el.dataset.page; drawInv(); });
      P.on(v, 'click', '[data-view]', (e, el) => { st.view = el.dataset.view; st.page = 1; drawInv(); });
      P.on(v, 'click', '[data-newnd]', () => debitNoteDialog());
      P.on(v, 'click', '[data-nd]', (e, el) => debitNoteDialog(saleById(el.dataset.nd)));
      P.on(v, 'click', '[data-rcpt]', (e, el) => P.receiptDialog(saleById(el.dataset.rcpt)));
      P.on(v, 'click', '[data-gosale]', (e, el) => { const q = el.dataset.gosale; P.nav('sales'); setTimeout(() => { const i = $('#q'); if (i) { i.value = q; i.dispatchEvent(new Event('input')); } }, 30); });
      P.on(v, 'click', '[data-ndview]', (e, el) => ndDialog(A.notes.find((n) => n.id === el.dataset.ndview)));
      P.on(v, 'click', '[data-tnew]', () => ruleDialog());
      P.on(v, 'change', '[data-tact]', (e, el) => { A.taxes.find((t) => t.id === el.dataset.tact).active = el.checked; draw(); });
      P.on(v, 'click', '[data-tdel]', (e, el) => { const t = A.taxes.find((x) => x.id === el.dataset.tdel); P.confirm('¿Eliminar la regla?', `Se borra «${t.name}».`, 'Eliminar', () => { A.taxes = A.taxes.filter((x) => x.id !== t.id); P.toast('Regla eliminada.'); draw(); }); });
      P.on(v, 'change', '#per', (e, el) => { st.days = +el.value; draw(); });
      P.on(v, 'change', '[data-asg]', (e, el) => { const x = S.expenses.find((y) => y.id === el.dataset.asg); x.analytic = el.value; P.log('EXPENSE_ASSIGNED', `«${x.title}» asignado a ${el.value || 'sin asignar'}`, 'Contabilidad'); P.toast(el.value ? `Gasto asignado a ${el.value}.` : 'Gasto sin centro asignado.'); draw(); });
      P.on(v, 'click', '[data-chknew]', () => checkNewDialog());
      P.on(v, 'click', '[data-chkprint]', (e, el) => checkDialog(A.checks.find((k) => k.id === el.dataset.chkprint)));
      P.on(v, 'click', '[data-chkcash]', (e, el) => { const k = A.checks.find((x) => x.id === el.dataset.chkcash); k.status = 'cashed'; P.toast(`Cheque ${k.no} marcado como cobrado.`); draw(); });
      P.on(v, 'click', '[data-chkvoid]', (e, el) => { const k = A.checks.find((x) => x.id === el.dataset.chkvoid); P.confirm('¿Anular el cheque?', `La deuda de ${money(k.amount)} con ${k.supplier} vuelve a quedar pendiente.`, 'Anular cheque', () => { k.status = 'void'; const s = S.suppliers.find((x) => x.id === k.supplierId); if (s) s.balance += k.amount; P.log('CHECK_VOIDED', `Cheque ${k.no} anulado`, 'Contabilidad'); P.toast('Cheque anulado: la deuda volvió a quedar pendiente.'); draw(); }); });
      P.on(v, 'click', '[data-edsend]', (e, el) => edocDialog(saleById(el.dataset.edsend), false));
      P.on(v, 'click', '[data-edview]', (e, el) => edocDialog(saleById(el.dataset.edview), true));
    },
  };
})();
