/* Arranque de la demostración: pantalla de ingreso, estructura de la aplicación (menú, barra superior) y navegación. */
(function () {
  const P = window.Plexi;
  const { esc, icon, $ } = P;
  const ALL = ['admin', 'manager', 'cashier']; const MGR = ['admin', 'manager'];
  P.NAV = [
    ['dashboard', 'Panel', 'layout-grid', ALL], ['pos', 'Punto de venta', 'shopping-cart', ALL], ['sales', 'Historial de ventas', 'receipt-text', ALL], ['cash', 'Caja', 'landmark', ALL],
    ['products', 'Productos', 'package', ALL], ['inventory', 'Inventario', 'boxes', MGR], ['customers', 'Clientes', 'users', ALL], ['suppliers', 'Proveedores', 'truck', MGR],
    ['employees', 'Empleados', 'id-card', MGR], ['expenses', 'Gastos', 'wallet', MGR], ['discounts', 'Descuentos', 'badge-percent', MGR], ['reports', 'Reportes', 'chart-column', MGR],
    ['logs', 'Registro de actividad', 'history', MGR], ['users', 'Usuarios', 'shield-check', ['admin']], ['settings', 'Configuración', 'settings', ['admin']],
  ];
  const ROLE = { admin: 'Administrador', manager: 'Gerente', cashier: 'Cajero' };
  const app = () => $('#app');
  let chosenType = 'general';

  /* ---------- ingreso ---------- */
  P.showLogin = () => {
    document.body.classList.remove('nav-open'); P.S = null; history.replaceState(null, '', location.pathname + location.search.replace(/[?&]ir=[^&]*/, ''));
    app().innerHTML = `<div class="login"><div class="login-box"><div class="center"><img src="assets/logo-white.png" alt="Plexi" style="height:84px;margin-bottom:12px"></div><h1>PLEXI</h1><div class="sub">Punto de venta · Demostración interactiva</div>
      <div class="login-card stack"><div><label class="lbl" style="color:rgba(255,255,255,.7)">1. Elegí el rubro de la demostración</label><div class="type-grid" id="types">${P.DEMO_TYPES.map((k) => `<button class="type-opt ${k === chosenType ? 'on' : ''}" data-type="${k}">${icon(k === 'ropa' ? 'tag' : k === 'ferreteria' ? 'wrench' : k === 'almacen' ? 'shopping-bag' : 'store')}<span>${esc(P.TYPES[k].label.split(',')[0].replace(' y calzado', ''))}</span></button>`).join('')}</div><div class="hint" style="color:rgba(255,255,255,.5)" id="typehint">${esc(P.TYPES[chosenType].demo)}</div></div>
      <div><label class="lbl" style="color:rgba(255,255,255,.7)">2. Entrá como…</label><div class="demo-users"><button data-role="admin"><b>Administrador</b>ve todo</button><button data-role="manager"><b>Gerente</b>inventario y reportes</button><button data-role="cashier"><b>Cajero</b>solo el mostrador</button></div></div>
      <p class="small center" style="color:rgba(255,255,255,.45);margin:0">Todo es una simulación: los datos son de ejemplo y nada se guarda. Al recargar la página, vuelve a empezar.</p></div></div></div>`;
    P.on(app(), 'click', '[data-type]', (e, el) => { chosenType = el.dataset.type; $$('.type-opt').forEach((b) => b.classList.toggle('on', b === el)); $('#typehint').textContent = P.TYPES[chosenType].demo; });
    P.on(app(), 'click', '[data-role]', (e, el) => P.start(chosenType, el.dataset.role));
  };
  const $$ = P.$$;

  /* ---------- sesión ---------- */
  P.start = (type, role, go = 'dashboard') => {
    chosenType = type; P.S = P.newState(type);
    P.S.user = P.S.users.find((u) => u.role === role); P.cart = { items: [], customerId: '', coupon: '', redeem: false, notes: '' };
    P.S.movements = P.S.sales.slice(0, 24).flatMap((s) => s.items.map((l) => ({ date: s.date, pid: l.pid, name: l.name, type: 'Venta', qty: -l.qty, reason: s.no, by: s.cashier })));
    P.S.notifications = P.lowStock().slice(0, 6).map((p) => ({ title: p.stock === 0 ? 'Sin stock' : 'Alerta de stock bajo', message: `"${p.name}" ${p.stock === 0 ? 'está sin stock' : `bajó a ${p.stock} unidades`}.`, date: Date.now() - Math.random() * 3600000 * 5 }));
    P.log('LOGIN', 'Inició sesión', 'Acceso'); P.buildShell(); P.nav(go);
  };

  /* ---------- estructura ---------- */
  P.buildShell = () => {
    const S = P.S;
    app().innerHTML = `<div class="demo-bar"><span>${icon('info')} <b>Demostración interactiva</b> de Plexi POS · rubro: <b>${esc(P.TYPES[S.type].label)}</b> · los datos son de ejemplo y no se guardan</span><button data-switch>Cambiar rubro o usuario</button></div>
    <div class="shell"><aside class="sidebar"><div class="brand"><img src="assets/logo-white.png" alt=""><div><b id="brand-name">${esc(S.settings.storeName)}</b><span>Punto de venta</span></div></div><nav class="nav" id="nav">${P.NAV.filter((n) => n[3].includes(S.user.role)).map(([k, l, ic]) => `<a data-nav="${k}" id="nav-${k}">${icon(ic)} ${l}</a>`).join('')}</nav><div class="userbox"><span class="avatar">${esc(P.initials(S.user.name))}</span><div class="grow"><b>${esc(S.user.name)}</b><span>${ROLE[S.user.role]}</span></div><button class="btn btn-ghost btn-icon" data-logout title="Cerrar sesión" style="color:#fff">${icon('log-out')}</button></div></aside>
    <div class="main-col"><header class="topbar"><button class="btn btn-ghost btn-icon menu-btn" data-menu>${icon('menu')}</button><div class="search">${icon('search')}<input class="input" id="gs" placeholder="Buscar productos, facturas, clientes…" autocomplete="off"><div class="results hidden" id="gres"></div></div><div class="grow"></div><div class="bell relative"><button class="btn btn-ghost btn-icon" data-bell>${icon('bell')}<span class="n" id="bn"></span></button><div class="drop hidden" id="bdrop"></div></div></header><main id="view"></main></div></div>`;
    const root = app();
    P.on(root, 'click', '[data-nav]', (e, el) => P.nav(el.dataset.nav));
    P.on(root, 'click', '[data-logout],[data-switch]', () => P.showLogin());
    P.on(root, 'click', '[data-menu]', () => document.body.classList.toggle('nav-open'));
    document.body.addEventListener('click', (e) => { if (document.body.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('[data-menu]')) document.body.classList.remove('nav-open'); });
    /* búsqueda global */
    const gs = $('#gs'); const gres = $('#gres');
    gs.addEventListener('input', () => {
      const t = gs.value.trim().toLowerCase(); if (t.length < 2) return gres.classList.add('hidden');
      const prods = S.products.filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)).slice(0, 4);
      const sales = S.sales.filter((s) => s.no.toLowerCase().includes(t) || s.customerName.toLowerCase().includes(t)).slice(0, 3);
      const custs = S.customers.filter((c) => c.name.toLowerCase().includes(t)).slice(0, 3);
      const sec = (title, items) => (items.length ? `<div class="sec">${title}</div>${items.join('')}` : '');
      gres.innerHTML = sec('Productos', prods.map((p) => `<div class="it" data-go="products" data-q="${esc(p.sku)}"><span>${esc(p.name)}</span><span class="muted">${P.money(p.discount || p.price)}</span></div>`)) + sec('Ventas', sales.map((s) => `<div class="it" data-go="sales" data-q="${esc(s.no)}"><span>${esc(s.no)}</span><span class="muted">${esc(s.customerName)}</span></div>`)) + sec('Clientes', custs.map((c) => `<div class="it" data-go="customers" data-q="${esc(c.name)}"><span>${esc(c.name)}</span><span class="muted">${esc(c.phone)}</span></div>`)) || '<div class="empty">Sin resultados.</div>';
      gres.classList.remove('hidden');
    });
    P.on(gres, 'click', '[data-go]', (e, el) => { gres.classList.add('hidden'); gs.value = ''; const go = el.dataset.go; const q = el.dataset.q; if (!P.NAV.find((n) => n[0] === go)[3].includes(S.user.role)) return P.toast('Tu rol no tiene acceso a esa pantalla.', 'warn'); P.nav(go); setTimeout(() => { const i = $('#q'); if (i) { i.value = q; i.dispatchEvent(new Event('input')); } }, 30); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) gres.classList.add('hidden'); if (!e.target.closest('.bell')) $('#bdrop')?.classList.add('hidden'); });
    /* campana */
    P.refreshBell = () => { const n = S.notifications.length; const el = $('#bn'); if (el) { el.textContent = n; el.style.display = n ? '' : 'none'; } };
    P.on(root, 'click', '[data-bell]', () => { const d = $('#bdrop'); d.innerHTML = `<div class="it"><b>Notificaciones</b></div>${S.notifications.slice(0, 8).map((n) => `<div class="it"><b class="small">${esc(n.title)}</b><div class="small muted">${esc(n.message)}</div></div>`).join('') || '<div class="empty">Todo tranquilo.</div>'}${S.notifications.length ? '<div class="it center"><button class="btn btn-ghost btn-sm" data-clearn>Marcar todo como leído</button></div>' : ''}`; d.classList.toggle('hidden'); });
    P.on(root, 'click', '[data-clearn]', () => { S.notifications = []; P.refreshBell(); $('#bdrop').classList.add('hidden'); });
    P.refreshBell();
    P.refreshBrand = () => { const b = $('#brand-name'); if (b) b.textContent = S.settings.storeName; };
  };

  /* ---------- navegación ---------- */
  P.nav = (name) => {
    const S = P.S; if (!S) return;
    const item = P.NAV.find((n) => n[0] === name);
    if (!item || !item[3].includes(S.user.role)) { P.toast('Tu rol no tiene acceso a esa pantalla.', 'warn'); name = 'dashboard'; }
    P.current = name; if (location.hash !== `#/${name}`) history.replaceState(null, '', `#/${name}`);
    $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === name));
    document.body.classList.remove('nav-open');
    const view = $('#view'); const fresh = view.cloneNode(false); view.replaceWith(fresh); // quita los eventos de la pantalla anterior
    P.screens[name].render(fresh); window.scrollTo(0, 0);
  };

  /* ---------- inicio (también acepta ?rubro=ropa&rol=cashier&ir=pos para entrar directo) ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const q = new URLSearchParams(location.search);
    if (q.get('rol')) { const type = P.TYPES[q.get('rubro')] && P.DEMO_TYPES.includes(q.get('rubro')) ? q.get('rubro') : 'general'; P.start(type, ROLE[q.get('rol')] ? q.get('rol') : 'admin', q.get('ir') || 'dashboard'); } else P.showLogin();
  });
})();
