/* Pantallas: Panel, Punto de venta e Historial de ventas. */
(function () {
  const P = window.Plexi;
  const { esc, icon, money, $ } = P;
  P.screens = P.screens || {};
  const doneSales = (from = 0) => P.S.sales.filter((s) => s.status !== 'refunded' && s.date >= from);
  const profitOf = (s) => s.items.reduce((a, l) => a + (l.price - l.cost) * l.qty, 0) - s.discount;

  /* ============================================================ PANEL ============================================================ */
  P.screens.dashboard = {
    render(v) {
      const S = P.S; const mgr = P.hasRole('admin', 'manager');
      let range = 14;
      const today = doneSales(P.dayStart());
      const todayTotal = today.reduce((a, s) => a + s.total, 0);
      const month = doneSales(Date.now() - 30 * P.DAY);
      const low = P.lowStock();
      const owing = S.customers.filter((c) => P.balance(c) > 0);
      const owed = owing.reduce((a, c) => a + P.balance(c), 0);
      const dow = new Date().getDay();
      const visits = S.suppliers.filter((s) => s.visitDays.includes(dow));
      const methods = {}; month.forEach((s) => s.payments.forEach((p) => { methods[p.method] = (methods[p.method] || 0) + p.amount; }));
      const topSold = {}; month.forEach((s) => s.items.forEach((l) => { topSold[l.name] = (topSold[l.name] || 0) + l.qty; }));
      const top = Object.entries(topSold).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
      const series = (days) => { const out = []; for (let i = days - 1; i >= 0; i--) { const t0 = P.dayStart(Date.now() - i * P.DAY); const val = doneSales(t0).filter((s) => s.date < t0 + P.DAY).reduce((a, s) => a + s.total, 0); const d = new Date(t0); out.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, value: val }); } return out; };
      v.innerHTML = `<div class="page">${P.page(`Hola, ${S.user.name.split(' ')[0]}`, `${P.WEEKDAYS[dow]} ${P.date(Date.now())} · ${S.settings.storeName}`, 'layout-grid', `<button class="btn btn-primary" data-go="pos">${icon('shopping-cart')} Nueva venta</button>`)}
        <div class="grid g4 mb">
          ${P.kpi('circle-dollar-sign', 'Ventas de hoy', money(todayTotal), `${today.length} ventas`)}
          ${mgr ? P.kpi('trending-up', 'Ganancia de hoy', money(today.reduce((a, s) => a + profitOf(s), 0)), 'después de descuentos', 'gold') : P.kpi('receipt-text', 'Ticket promedio', money(today.length ? todayTotal / today.length : 0), 'de las ventas de hoy', 'gold')}
          ${P.kpi('package-x', 'Stock bajo', `${low.length}`, `${low.filter((p) => p.stock === 0).length} sin stock`, 'bad')}
          ${P.kpi('hand-coins', 'Clientes con deuda', mgr ? money(owed) : `${owing.length}`, mgr ? `${owing.length} clientes · ${S.customers.filter(P.isOverdue).length} vencidas` : 'cuenta corriente', 'info')}
        </div>
        <div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
          <div class="card"><div class="card-h"><div><h3>Ventas por día</h3><p>Total vendido, sin contar reembolsos</p></div><div class="tabs" id="range">${[7, 14, 30].map((d) => `<button class="tab ${d === range ? 'on' : ''}" data-r="${d}">${d} días</button>`).join('')}</div></div><div class="card-b" id="chart"></div></div>
          <div class="card"><div class="card-h"><div><h3>Medios de pago</h3><p>Últimos 30 días</p></div></div><div class="card-b">${P.donut(Object.entries(methods).map(([k, val]) => ({ label: P.PAY[k], value: val })))}</div></div>
        </div>
        <div class="grid g3 mt">
          <div class="card"><div class="card-h"><div><h3>Más vendidos</h3><p>Unidades en 30 días</p></div></div><div class="card-b">${P.hbars(top, P.num)}</div></div>
          <div class="card"><div class="card-h"><div><h3>Hay que reponer</h3><p>Stock en el mínimo o por debajo</p></div>${mgr ? `<button class="btn btn-outline btn-sm" data-go="inventory">Ver inventario</button>` : ''}</div><div class="card-b">${low.slice(0, 6).map((p) => `<div class="list-row"><img class="thumb" src="${P.thumb(p.category, Object.keys(S.categories))}" alt=""><div class="grow"><div class="clip semibold">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}</div></div>${p.stock === 0 ? '<span class="badge bad">Sin stock</span>' : `<span class="badge warn">${p.stock} u.</span>`}</div>`).join('') || '<div class="empty">Todo en orden.</div>'}</div></div>
          <div class="card"><div class="card-h"><div><h3>${mgr ? 'Para hoy' : 'Accesos rápidos'}</h3><p>${mgr ? 'Deudas y visitas de proveedores' : 'Lo que más se usa en el mostrador'}</p></div></div><div class="card-b">${mgr ? `${S.customers.filter(P.isOverdue).slice(0, 3).map((c) => `<div class="list-row"><span class="badge bad">Vencida</span><div class="grow clip">${esc(c.name)}</div><b>${money(P.balance(c))}</b></div>`).join('')}${visits.map((s) => `<div class="list-row"><span class="badge info">Visita hoy</span><div class="grow clip">${esc(s.name)}</div></div>`).join('')}${!visits.length && !S.customers.some(P.isOverdue) ? '<div class="empty">Nada pendiente.</div>' : ''}` : `<div class="stack"><button class="btn btn-outline" data-go="pos">${icon('shopping-cart')} Cobrar una venta</button><button class="btn btn-outline" data-go="cash">${icon('landmark')} Caja del día</button><button class="btn btn-outline" data-go="customers">${icon('users')} Clientes</button></div>`}</div></div>
        </div></div>`;
      const draw = () => { $('#chart', v).innerHTML = P.barChart(series(range)); $('#range', v).innerHTML = [7, 14, 30].map((d) => `<button class="tab ${d === range ? 'on' : ''}" data-r="${d}">${d} días</button>`).join(''); };
      draw();
      P.on(v, 'click', '[data-r]', (e, el) => { range = +el.dataset.r; draw(); });
      P.on(v, 'click', '[data-go]', (e, el) => P.nav(el.dataset.go));
    },
  };

  /* ============================================================ PUNTO DE VENTA ============================================================ */
  P.cart = { items: [], customerId: '', coupon: '', redeem: false, notes: '' };
  const cartTotals = () => {
    const S = P.S; const c = P.cart; const cust = c.customerId ? P.customer(c.customerId) : null;
    const lines = c.items.map((i) => { const p = P.get(i.pid); return { ...i, p, price: p.discount || p.price }; });
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    let discount = 0; let couponError = '';
    if (c.coupon) { const r = P.coupon(c.coupon, subtotal, cust, lines.map((l) => l.p.category)); if (r.error) couponError = r.error; else discount = r.amount; }
    const afterCoupon = subtotal - discount;
    let pts = 0; let ptsDiscount = 0;
    if (c.redeem && cust && S.settings.pointsEnabled) { pts = Math.min(cust.points, Math.floor(afterCoupon / S.settings.pointsValue)); ptsDiscount = pts * S.settings.pointsValue; }
    const base = afterCoupon - ptsDiscount; const tax = Math.round((base * S.settings.taxRate) / 100);
    return { lines, cust, subtotal, discount, couponError, pts, ptsDiscount, tax, total: base + tax, base };
  };
  P.cartTotals = cartTotals;

  P.screens.pos = {
    render(v) {
      const S = P.S; const C = P.cart; const cats = Object.keys(S.categories);
      let q = ''; let cat = 'all';
      v.innerHTML = `<div class="page">${P.page('Punto de venta', 'Tocá un producto para agregarlo. Todo se calcula solo.', 'shopping-cart', `<button class="btn btn-outline" data-held>${icon('clock')} En espera${S.held.length ? ` (${S.held.length})` : ''}</button><button class="btn btn-outline" data-scan>${icon('scan-line')} Escanear producto</button>`)}
        <div class="pos"><div class="stack"><div class="row wrap"><div class="search grow" style="min-width:220px">${icon('search')}<input class="input" id="pq" placeholder="Buscar por nombre, SKU o marca…"></div></div>
        <div class="row wrap" id="chips"></div><div class="pgrid" id="grid"></div></div>
        <aside class="card cart"><div class="card-h"><div><h3>Venta actual</h3><p id="cnt"></p></div><button class="btn btn-ghost btn-sm" data-clear>${icon('trash-2')} Vaciar</button></div>
          <div style="padding:12px 16px 0"><select class="input" id="cust"><option value="">Consumidor final</option>${S.customers.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><div class="tiny muted mt8" id="custinfo"></div></div>
          <div class="cart-items" id="items"></div>
          <div style="padding:0 16px 12px"><div class="row"><input class="input sm" id="coupon" placeholder="Cupón (probá BIENVENIDA10)" style="text-transform:uppercase"><button class="btn btn-outline btn-sm" data-coupon>Aplicar</button></div><div class="error-text" id="cerr"></div><div id="redeem"></div></div>
          <div class="totals" id="totals"></div><div class="row" style="padding:12px 16px"><button class="btn btn-primary btn-lg grow" data-pay>${icon('banknote')} Cobrar</button><button class="btn btn-subtle" data-hold title="Poner la cuenta en espera">${icon('clock')}</button></div></aside></div></div>`;
      $('#cust', v).value = C.customerId; $('#coupon', v).value = C.coupon;

      const drawChips = () => { $('#chips', v).innerHTML = ['all', ...cats].map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${esc(c)}">${c === 'all' ? 'Todo' : esc(c)}</button>`).join(''); };
      const drawGrid = () => {
        const t = q.toLowerCase();
        const list = S.products.filter((p) => !p.archived && (cat === 'all' || p.category === cat) && (!t || [p.name, p.sku, p.brand].some((f) => f.toLowerCase().includes(t)))).slice(0, 60);
        $('#grid', v).innerHTML = list.map((p) => `<button class="pcard ${p.stock <= 0 ? 'out' : ''}" data-add="${p.id}"><img src="${P.thumb(p.category, cats)}" alt=""><div class="nm">${esc(p.name)}</div><div class="sk">${esc([p.sku, p.size].filter(Boolean).join(' · '))}</div><div class="row between mt8"><span class="pr">${money(p.discount || p.price)}${p.discount ? `<s>${money(p.price)}</s>` : ''}</span>${p.stock <= 0 ? '<span class="badge bad">Sin stock</span>' : p.stock <= p.min ? `<span class="badge warn">${p.stock}</span>` : ''}</div></button>`).join('') || '<div class="empty">No hay productos con esa búsqueda.</div>';
      };
      const drawCart = () => {
        const T = cartTotals(); const n = C.items.reduce((a, i) => a + i.qty, 0);
        $('#cnt', v).textContent = `${n} artículo${n === 1 ? '' : 's'}`;
        $('#items', v).innerHTML = T.lines.map((l) => `<div class="cart-line"><div class="grow"><div class="small semibold">${esc(l.p.name)}</div><div class="tiny muted">${money(l.price)} c/u${l.p.size ? ` · ${esc(l.p.size)}` : ''}</div></div><div class="qty"><button data-dec="${l.pid}" aria-label="Disminuir">${icon('minus')}</button><b>${l.qty}</b><button data-inc="${l.pid}" aria-label="Aumentar" ${l.qty >= l.p.stock ? 'disabled' : ''}>${icon('plus')}</button></div><b style="min-width:70px;text-align:right">${money(l.price * l.qty)}</b><button class="btn btn-ghost btn-icon" data-del="${l.pid}" aria-label="Quitar">${icon('x')}</button></div>`).join('') || `<div class="empty">${icon('shopping-cart')}<div class="mt8">Todavía no agregaste nada.</div></div>`;
        const cust = T.cust;
        $('#custinfo', v).innerHTML = cust ? `${cust.member ? '<span class="badge gold">Miembro</span> ' : ''}${cust.points} puntos${P.balance(cust) > 0 ? ` · debe ${money(P.balance(cust))}` : ''}${cust.credit ? ' · cuenta corriente habilitada' : ''}` : '';
        $('#cerr', v).textContent = T.couponError;
        $('#redeem', v).innerHTML = cust && S.settings.pointsEnabled && cust.points > 0 ? `<label class="row small mt8"><input type="checkbox" id="redeemck" ${C.redeem ? 'checked' : ''} style="accent-color:var(--brand)"> Canjear ${cust.points} puntos (${money(cust.points * S.settings.pointsValue)})</label>` : '';
        $('#totals', v).innerHTML = `<div class="t"><span>Subtotal</span><span>${money(T.subtotal)}</span></div>${T.discount ? `<div class="t green"><span>Descuento (${esc(C.coupon.toUpperCase())})</span><span>-${money(T.discount)}</span></div>` : ''}${T.ptsDiscount ? `<div class="t green"><span>Puntos canjeados (${T.pts})</span><span>-${money(T.ptsDiscount)}</span></div>` : ''}<div class="t"><span>Impuesto (${S.settings.taxRate}%)</span><span>${money(T.tax)}</span></div><div class="t tot"><span>Total</span><span>${money(T.total)}</span></div>`;
        $('[data-pay]', v).disabled = !C.items.length;
      };
      const add = (id) => { const p = P.get(id); const it = C.items.find((i) => i.pid === id); if ((it?.qty || 0) >= p.stock) return P.toast(`No hay más stock de "${p.name}".`, 'warn'); if (it) it.qty++; else C.items.push({ pid: id, qty: 1 }); drawCart(); };
      drawChips(); drawGrid(); drawCart();
      $('#pq', v).addEventListener('input', (e) => { q = e.target.value; drawGrid(); });
      $('#cust', v).addEventListener('change', (e) => { C.customerId = e.target.value; C.redeem = false; drawCart(); });
      $('#coupon', v).addEventListener('input', (e) => { C.coupon = e.target.value.trim(); });
      P.on(v, 'click', '[data-cat]', (e, el) => { cat = el.dataset.cat; drawChips(); drawGrid(); });
      P.on(v, 'click', '[data-add]', (e, el) => add(el.dataset.add));
      P.on(v, 'click', '[data-inc]', (e, el) => add(el.dataset.inc));
      P.on(v, 'click', '[data-dec]', (e, el) => { const it = C.items.find((i) => i.pid === el.dataset.dec); if (it && --it.qty <= 0) C.items = C.items.filter((i) => i !== it); drawCart(); });
      P.on(v, 'click', '[data-del]', (e, el) => { C.items = C.items.filter((i) => i.pid !== el.dataset.del); drawCart(); });
      P.on(v, 'click', '[data-clear]', () => { C.items = []; C.coupon = ''; C.redeem = false; $('#coupon', v).value = ''; drawCart(); });
      P.on(v, 'click', '[data-coupon]', () => { C.coupon = $('#coupon', v).value.trim(); const T = cartTotals(); drawCart(); if (!T.couponError && C.coupon) P.toast(`Cupón aplicado: -${money(T.discount)}`); });
      P.on(v, 'change', '#redeemck', (e) => { C.redeem = e.target.checked; drawCart(); });
      P.on(v, 'click', '[data-hold]', () => { if (!C.items.length) return P.toast('No hay nada para poner en espera.', 'warn'); S.held.push({ ...C, items: C.items.map((i) => ({ ...i })), at: Date.now() }); P.cart = { items: [], customerId: '', coupon: '', redeem: false, notes: '' }; P.toast('Cuenta puesta en espera.'); P.nav('pos'); });
      P.on(v, 'click', '[data-held]', () => heldDialog());
      P.on(v, 'click', '[data-scan]', () => scanDialog(add));
      P.on(v, 'click', '[data-pay]', () => { if (S.settings.requireOpenRegister && !S.cash.open) return P.toast('Primero abrí la caja (Caja → Abrir caja).', 'bad'); paymentDialog(() => P.nav('pos')); });
      const heldDialog = () => {
        const m = P.modal({ title: 'Cuentas en espera', body: S.held.length ? S.held.map((h, i) => `<div class="list-row"><div class="grow"><b>${h.items.reduce((a, x) => a + x.qty, 0)} artículos</b><div class="tiny muted">${P.time(h.at)}${h.customerId ? ` · ${esc(P.customer(h.customerId).name)}` : ''}</div></div><button class="btn btn-primary btn-sm" data-take="${i}">Retomar</button><button class="btn btn-ghost btn-icon" data-drop="${i}">${icon('trash-2')}</button></div>`).join('') : '<div class="empty">No hay cuentas en espera.</div>' });
        m.on('click', '[data-take]', (e, el) => { const h = S.held.splice(+el.dataset.take, 1)[0]; P.cart = { items: h.items, customerId: h.customerId, coupon: h.coupon, redeem: false, notes: '' }; m.close(); P.nav('pos'); });
        m.on('click', '[data-drop]', (e, el) => { S.held.splice(+el.dataset.drop, 1); m.close(); P.nav('pos'); });
      };
    },
  };

  const scanDialog = (add) => {
    const S = P.S; const m = P.modal({ title: 'Escanear producto', subtitle: 'En el programa real se usa la cámara y los códigos QR de las etiquetas', size: 'narrow', body: `<div class="center"><div class="qr" style="position:relative">${P.qr('scan', 190)}<div style="position:absolute;left:10px;right:10px;top:50%;height:2px;background:#e0463a;box-shadow:0 0 10px #e0463a"></div></div></div><p class="hint center">Para probarlo, elegí un producto y simulamos la lectura:</p><select class="input" id="scanp">${S.products.filter((p) => !p.archived && p.stock > 0).slice(0, 40).map((p) => `<option value="${p.id}">${esc(p.sku)} — ${esc(p.name)}</option>`).join('')}</select><div class="dialog-f"><button class="btn btn-primary" data-ok>${icon('scan-line')} Simular lectura</button></div>` });
    m.on('click', '[data-ok]', () => { add(m.$('#scanp').value); P.toast('Producto leído y agregado.'); });
  };

  /* ---------- cobro ---------- */
  function paymentDialog(afterSale) {
    const S = P.S; const T = cartTotals(); const cust = T.cust; const timers = [];
    const mpOn = S.settings.mpConnected;
    const rows = [{ id: 1, method: 'cash', amount: T.total, mp: { tab: mpOn ? 'auto' : 'fixed', status: 'idle', ref: '' }, ok: false }]; let seq = 1;
    const m = P.modal({ title: 'Registrar pago', subtitle: `Total a cobrar: ${money(T.total)}`, size: 'wide', onClose: () => timers.forEach(clearTimeout), body: '<div id="pay"></div>' });
    const avail = () => (cust && cust.credit ? (cust.limit > 0 ? Math.max(0, cust.limit - P.balance(cust)) : Infinity) : 0);
    const sums = () => { const paid = rows.reduce((a, r) => a + (+r.amount || 0), 0); const cash = rows.filter((r) => r.method === 'cash').reduce((a, r) => a + (+r.amount || 0), 0); const due = T.total - paid; const change = due < 0 && cash >= -due ? -due : 0; return { paid, due, change }; };
    const problems = () => {
      const sm = sums(); const out = [];
      if (sm.due > 0) out.push(`Falta cobrar ${money(sm.due)}.`);
      if (sm.due < 0 && sm.change === 0) out.push('El vuelto solo puede salir de un pago en efectivo.');
      const acc = rows.filter((r) => r.method === 'account').reduce((a, r) => a + (+r.amount || 0), 0);
      if (acc > 0 && !(cust && cust.credit)) out.push('Para dejar plata a cuenta corriente, elegí un cliente con cuenta corriente habilitada.');
      else if (acc > avail()) out.push(`Se pasa del límite de crédito del cliente (disponible ${money(avail())}).`);
      rows.filter((r) => r.method === 'mp' && !r.ok && +r.amount > 0).forEach(() => out.push('Falta confirmar el pago de Mercado Pago.'));
      if (rows.some((r) => !(+r.amount > 0))) out.push('Hay un medio de pago sin importe.');
      return [...new Set(out)];
    };
    const foot = () => {
      const sm = sums(); const pr = problems();
      return `<div class="row between wrap"><button class="btn btn-outline btn-sm" data-split>${icon('plus')} Dividir pago</button><div class="right"><div class="small muted">Recibido ${money(sm.paid)}</div>${sm.change > 0 ? `<div class="bold green">Vuelto ${money(sm.change)}</div>` : sm.due > 0 ? `<div class="bold red">Falta ${money(sm.due)}</div>` : '<div class="bold green">Pago completo</div>'}</div></div>${pr.length ? `<div class="notice">${pr.map(esc).join('<br>')}</div>` : ''}<div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary btn-lg" data-finish ${pr.length ? 'disabled' : ''}>${icon('check')} Finalizar venta</button></div>`;
    };
    const draw = () => {
      m.$('#pay').innerHTML = `<div class="stack">${rows.map((r, i) => `<div class="card" data-row="${r.id}"><div class="card-b stack"><div class="row wrap"><div style="width:210px"><select class="input" data-method="${r.id}">${Object.entries(P.PAY).map(([k, l]) => `<option value="${k}" ${k === r.method ? 'selected' : ''} ${k === 'account' && !(cust && cust.credit) ? 'disabled' : ''}>${l}${k === 'account' && !(cust && cust.credit) ? ' (elegí un cliente con fiado)' : ''}</option>`).join('')}</select></div><div class="grow"><input class="input" type="number" min="0" data-amount="${r.id}" value="${r.amount}" ${r.method === 'mp' && r.mp.status !== 'idle' ? 'disabled' : ''}></div>${rows.length > 1 ? `<button class="btn btn-ghost btn-icon" data-rm="${r.id}">${icon('trash-2')}</button>` : ''}</div>${r.method === 'cash' ? `<div class="bills">${[['Justo', T.total - rows.filter((x) => x !== r).reduce((a, x) => a + (+x.amount || 0), 0)], ['$ 1.000', 1000], ['$ 2.000', 2000], ['$ 5.000', 5000], ['$ 10.000', 10000], ['$ 20.000', 20000]].map(([l, val]) => `<button class="chip" data-bill="${r.id}:${val}">${l}</button>`).join('')}</div>` : ''}${r.method === 'mp' ? mpPanel(r) : ''}${r.method === 'account' ? `<div class="hint">${cust ? `${esc(cust.name)} debe ${money(P.balance(cust))}. ${cust.limit > 0 ? `Límite ${money(cust.limit)}: disponible ${money(avail())}.` : 'Sin límite de crédito.'}` : ''}</div>` : ''}</div></div>`).join('')}
        <div id="sumbox" class="stack">${foot()}</div></div>`;
    };
    const mpPanel = (r) => {
      const amt = +r.amount || 0; const tabs = `<div class="tabs">${mpOn ? `<button class="tab ${r.mp.tab === 'auto' ? 'on' : ''}" data-mptab="${r.id}:auto">QR automático</button>` : ''}<button class="tab ${r.mp.tab === 'fixed' ? 'on' : ''}" data-mptab="${r.id}:fixed">QR fijo / alias</button></div>`;
      if (r.mp.tab === 'auto' && mpOn) {
        if (r.mp.status === 'idle') return `${tabs}<div class="notice info">Plexi le pide a Mercado Pago que el QR del mostrador cobre exactamente ${money(amt)} y detecta solo cuando el cliente paga.</div><div><button class="btn btn-gold" data-mpgen="${r.id}">${icon('qr-code')} Generar cobro de ${money(amt)}</button></div>`;
        if (r.mp.status === 'waiting') return `${tabs}<div class="row gap16 wrap"><div class="qr">${P.qr(`mp-${amt}-${r.id}`, 150)}</div><div class="stack s2"><div><span class="pulse"></span><b>Esperando el pago…</b></div><div class="small muted">El cliente escanea el QR con su app de Mercado Pago. En la demo se confirma solo en unos segundos.</div><div class="row"><button class="btn btn-outline btn-sm" data-mppay="${r.id}">Simular que el cliente paga</button><button class="btn btn-ghost btn-sm" data-mpcancel="${r.id}">Cancelar cobro</button></div></div></div>`;
        return `${tabs}<div class="notice ok">${icon('circle-check')} <b>Pago recibido.</b> Operación ${esc(r.mp.ref)}.</div>`;
      }
      return `${tabs}<div class="row gap16 wrap"><div class="qr">${P.qr('alias-' + S.settings.mpAlias, 130)}</div><div class="stack s2"><div class="kv" style="min-width:230px"><span>Alias</span><span>${esc(S.settings.mpAlias)}</span></div><div class="kv"><span>Titular</span><span>${esc(S.settings.mpHolder)}</span></div><div class="small muted">El QR fijo no trae el importe: el cliente tiene que pagar ${money(amt)}.</div><label class="row small"><input type="checkbox" data-mpconfirm="${r.id}" ${r.ok ? 'checked' : ''} style="accent-color:var(--brand)"> Ya vi que el pago llegó</label></div></div>`;
    };
    const paid = (r) => { r.mp.status = 'paid'; r.ok = true; r.mp.ref = String(Math.floor(1e9 + Math.random() * 9e9)); draw(); P.toast('Pago de Mercado Pago recibido.'); };
    draw();
    m.on('change', '[data-method]', (e, el) => { const r = rows.find((x) => x.id === +el.dataset.method); r.method = el.value; r.ok = false; r.mp = { tab: mpOn ? 'auto' : 'fixed', status: 'idle', ref: '' }; draw(); });
    m.on('input', '[data-amount]', (e, el) => { const r = rows.find((x) => x.id === +el.dataset.amount); r.amount = el.value === '' ? '' : +el.value; m.$('#sumbox').innerHTML = foot(); /* solo el pie: así no se pierde el foco al escribir */ });
    m.on('change', '[data-amount]', draw);
    m.on('click', '[data-bill]', (e, el) => { const [id, val] = el.dataset.bill.split(':'); const r = rows.find((x) => x.id === +id); r.amount = +val; draw(); });
    m.on('click', '[data-rm]', (e, el) => { rows.splice(rows.findIndex((x) => x.id === +el.dataset.rm), 1); draw(); });
    m.on('click', '[data-split]', () => { const sm = sums(); rows.push({ id: ++seq, method: 'debit', amount: Math.max(0, sm.due), mp: { tab: 'fixed', status: 'idle', ref: '' }, ok: false }); if (rows[0].method === 'cash' && sm.due > 0) { rows[0].amount = Math.round(T.total / 2); rows[1].amount = T.total - rows[0].amount; } draw(); });
    m.on('click', '[data-mptab]', (e, el) => { const [id, tab] = el.dataset.mptab.split(':'); rows.find((x) => x.id === +id).mp.tab = tab; draw(); });
    m.on('click', '[data-mpgen]', (e, el) => { const r = rows.find((x) => x.id === +el.dataset.mpgen); r.mp.status = 'waiting'; draw(); timers.push(setTimeout(() => { if (r.mp.status === 'waiting' && document.body.contains(m.el)) paid(r); }, 5000)); });
    m.on('click', '[data-mppay]', (e, el) => paid(rows.find((x) => x.id === +el.dataset.mppay)));
    m.on('click', '[data-mpcancel]', (e, el) => { rows.find((x) => x.id === +el.dataset.mpcancel).mp.status = 'idle'; draw(); P.toast('Cobro cancelado: el QR del mostrador quedó libre.', 'info'); });
    m.on('change', '[data-mpconfirm]', (e, el) => { rows.find((x) => x.id === +el.dataset.mpconfirm).ok = el.checked; draw(); });
    m.on('click', '[data-finish]', () => { const sale = completeSale(T, rows, sums()); m.close(); P.receiptDialog(sale); afterSale(); });
  }

  function completeSale(T, rows, sm) {
    const S = P.S; const C = P.cart; const cust = T.cust;
    const lines = T.lines.map((l) => ({ pid: l.pid, name: l.p.name, sku: l.p.sku, size: l.p.size, color: l.p.color, qty: l.qty, price: l.price, cost: l.p.cost }));
    const payments = rows.map((r) => ({ method: r.method, amount: +r.amount, ref: r.mp.ref }));
    if (sm.change > 0) { const cash = payments.find((p) => p.method === 'cash'); cash.amount -= sm.change; }
    const today = new Date(); const key = `${String(today.getFullYear()).slice(2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const n = S.sales.filter((s) => s.no.includes(key)).length + 1;
    const paidNow = payments.filter((p) => p.method !== 'account').reduce((a, p) => a + p.amount, 0);
    const earned = cust && S.settings.pointsEnabled ? Math.floor(paidNow / S.settings.pointsPerAmount) : 0;
    const sale = { id: P.uid('sale-'), no: `INV-${key}-${String(n).padStart(4, '0')}`, date: Date.now(), customerId: cust?.id || null, customerName: cust?.name || 'Consumidor final', cashier: S.user.name, items: lines, subtotal: T.subtotal, discount: T.discount, couponCode: T.discount ? C.coupon.toUpperCase() : '', pointsDiscount: T.ptsDiscount, pointsRedeemed: T.pts, taxRate: S.settings.taxRate, tax: T.tax, total: T.total, payments, change: sm.change, status: 'completed', refunded: 0, pointsEarned: earned };
    lines.forEach((l) => { const p = P.get(l.pid); p.stock -= l.qty; p.sold += l.qty; S.movements.unshift({ date: Date.now(), pid: p.id, name: p.name, type: 'Venta', qty: -l.qty, reason: sale.no, by: S.user.name }); if (p.stock <= p.min) P.notify(p.stock === 0 ? 'Sin stock' : 'Alerta de stock bajo', `"${p.name}" ${p.stock === 0 ? 'está sin stock' : `bajó a ${p.stock} unidades`}.`); });
    if (cust) {
      cust.points = cust.points - T.pts + earned; cust.spent += T.total; cust.orders += 1;
      const onAcc = payments.filter((p) => p.method === 'account').reduce((a, p) => a + p.amount, 0);
      if (onAcc) cust.ledger.push({ date: Date.now(), type: 'charge', amount: onAcc, desc: `Venta ${sale.no}` });
    }
    if (sale.couponCode) { const d = S.discounts.find((x) => x.code === sale.couponCode); if (d) d.used++; }
    S.sales.unshift(sale);
    P.log('SALE_COMPLETED', `Venta ${sale.no} por ${money(sale.total)}`, 'Ventas');
    P.cart = { items: [], customerId: '', coupon: '', redeem: false, notes: '' };
    return sale;
  }

  /* ============================================================ HISTORIAL DE VENTAS ============================================================ */
  P.screens.sales = {
    render(v) {
      const S = P.S; let q = ''; let st = 'all'; let page = 1; const SIZE = 12; let list = [];
      v.innerHTML = `<div class="page">${P.page('Historial de ventas', 'Cada venta con su recibo. Los gerentes pueden hacer reembolsos.', 'receipt-text')}
        <div class="row wrap mb"><div class="search" style="width:280px">${icon('search')}<input class="input" id="q" placeholder="Factura, cliente o cajero…"></div><select class="input" id="st" style="width:190px"><option value="all">Todos los estados</option><option value="completed">Completadas</option><option value="refunded">Reembolsadas</option><option value="partial">Reembolso parcial</option></select></div>
        <div class="card"><div id="tbl"></div></div></div>`;
      const draw = () => {
        const t = q.toLowerCase();
        list = S.sales.filter((s) => (st === 'all' || s.status === st) && (!t || [s.no, s.customerName, s.cashier].some((f) => f.toLowerCase().includes(t))));
        const rows = list.slice((page - 1) * SIZE, page * SIZE);
        $('#tbl', v).innerHTML = P.table([
          { h: 'Factura', r: (s) => `<b>${esc(s.no)}</b>` }, { h: 'Fecha', cls: 'nowrap', r: (s) => P.dateTime(s.date) }, { h: 'Cliente', r: (s) => esc(s.customerName) },
          { h: 'Pago', r: (s) => s.payments.map((p) => P.PAY[p.method]).join(' + ') }, { h: 'Total', num: true, r: (s) => `<b>${money(s.total)}</b>` }, { h: 'Estado', r: (s) => P.statusBadge(s.status) },
          { h: '', num: true, r: (s) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-view="${s.id}" title="Ver recibo">${icon('printer')}</button>${P.hasRole('admin', 'manager') && s.status !== 'refunded' ? `<button class="btn btn-ghost btn-icon" data-refund="${s.id}" title="Reembolsar" style="color:var(--bad)">${icon('rotate-ccw')}</button>` : ''}</span>` },
        ], rows, { click: true, empty: 'No hay ventas con esos filtros.' }) + P.pager(page, list.length, SIZE);
        P.$$('tbody tr', v).forEach((tr, i) => { tr._sale = rows[i]; });
      };
      draw();
      $('#q', v).addEventListener('input', (e) => { q = e.target.value; page = 1; draw(); });
      $('#st', v).addEventListener('change', (e) => { st = e.target.value; page = 1; draw(); });
      P.on(v, 'click', '[data-page]', (e, el) => { page = +el.dataset.page; draw(); });
      P.on(v, 'click', 'tbody tr', (e, tr) => { if (e.target.closest('[data-refund]')) return refund(tr._sale, draw); P.receiptDialog(tr._sale); });
    },
  };

  function refund(sale, after) {
    const S = P.S; const left = (l) => l.qty - (l.refundedQty || 0);
    const m = P.modal({ title: 'Reembolsar venta', subtitle: sale.no, body: `<div class="stack">${sale.items.map((l, i) => `<div class="row"><div class="grow small"><b>${esc(l.name)}</b><div class="tiny muted">${l.qty} × ${money(l.price)} · quedan ${left(l)} para devolver</div></div><input class="input sm" style="width:70px" type="number" min="0" max="${left(l)}" value="0" data-rq="${i}" ${left(l) === 0 ? 'disabled' : ''}></div>`).join('')}<div class="field"><label>Motivo</label><input class="input" id="rr" placeholder="${esc(P.S.type === 'ropa' ? 'Problema de talle, defecto, cambio…' : 'Defecto, cambio, error de precio…')}"></div><div class="field"><label>Cómo se devuelve la plata</label><select class="input" id="rm"><option value="cash">Efectivo</option><option value="debit">Tarjeta</option><option value="mp">Mercado Pago</option></select></div><div class="notice info" id="ramt">Elegí cuántas unidades se devuelven.</div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-danger" data-ok>${icon('rotate-ccw')} Procesar reembolso</button></div>` });
    const calc = () => { const sel = m.$$('[data-rq]').map((el) => Math.min(+el.value || 0, left(sale.items[+el.dataset.rq]))); const base = sale.items.reduce((a, l, i) => a + l.price * sel[i], 0); const ratio = sale.subtotal ? sale.total / sale.subtotal : 1; return { sel, amount: Math.round(base * ratio) }; };
    m.on('input', '[data-rq]', () => { const { amount } = calc(); m.$('#ramt').textContent = amount ? `Se devuelven ${money(amount)} (con su parte de impuesto y descuento).` : 'Elegí cuántas unidades se devuelven.'; });
    m.on('click', '[data-ok]', () => {
      const { sel, amount } = calc(); if (!amount) return P.toast('Elegí al menos una unidad para devolver.', 'bad');
      sale.items.forEach((l, i) => { if (sel[i]) { l.refundedQty = (l.refundedQty || 0) + sel[i]; const p = P.get(l.pid); if (p) { p.stock += sel[i]; S.movements.unshift({ date: Date.now(), pid: p.id, name: p.name, type: 'Devolución', qty: sel[i], reason: sale.no, by: S.user.name }); } } });
      sale.refunded += amount; sale.status = sale.items.every((l) => left(l) === 0) ? 'refunded' : 'partial';
      const onAcc = sale.payments.filter((p) => p.method === 'account').reduce((a, p) => a + p.amount, 0);
      if (onAcc && sale.customerId) P.customer(sale.customerId).ledger.push({ date: Date.now(), type: 'payment', amount: Math.min(amount, onAcc), desc: `Reembolso de ${sale.no}` });
      P.log('SALE_REFUNDED', `Reembolso de ${money(amount)} en ${sale.no}`, 'Ventas'); m.close(); P.toast(`Reembolso procesado: ${money(amount)}. El stock volvió al inventario.`); after();
    });
  }
})();
