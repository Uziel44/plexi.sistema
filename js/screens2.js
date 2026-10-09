/* Pantallas: Productos, Inventario, Clientes y Proveedores. */
(function () {
  const P = window.Plexi;
  const { esc, icon, money, $ } = P;
  const cats = () => Object.keys(P.S.categories);
  const attrCols = () => P.fields().filter((f) => f.key === 'size' || f.key === 'color');

  /* ============================================================ PRODUCTOS ============================================================ */
  P.screens.products = {
    render(v) {
      const S = P.S; const mgr = P.hasRole('admin', 'manager');
      let q = ''; let cat = 'all'; let stock = 'all'; let sort = 'newest'; let arch = false; let page = 1; const SIZE = 10; let list = [];
      const SORTS = { newest: ['Más recientes primero', (a, b) => b.created - a.created], name: ['Nombre A–Z', (a, b) => a.name.localeCompare(b.name)], pa: ['Precio: menor a mayor', (a, b) => a.price - b.price], pd: ['Precio: mayor a menor', (a, b) => b.price - a.price], st: ['Stock: menor a mayor', (a, b) => a.stock - b.stock], best: ['Más vendidos', (a, b) => b.sold - a.sold] };
      v.innerHTML = `<div class="page">${P.page('Productos', `${S.products.filter((p) => !p.archived).length} productos`, 'package', `${mgr ? `<button class="btn btn-outline" data-labels>${icon('printer')} Imprimir etiquetas QR</button><button class="btn btn-outline" data-import>${icon('upload')} Importar</button><button class="btn btn-outline" data-csv>${icon('download')} CSV</button><button class="btn btn-primary" data-new>${icon('plus')} Agregar producto</button>` : ''}`)}
        <div class="row wrap mb"><div class="search" style="width:260px">${icon('search')}<input class="input" id="q" placeholder="${attrCols().some((f) => f.key === 'color') ? 'Nombre, SKU, marca, color…' : 'Nombre, SKU, marca…'}"></div>
        <select class="input" id="cat" style="width:210px"><option value="all">Todas las categorías</option>${cats().map((c) => `<option>${esc(c)}</option>`).join('')}</select>
        <select class="input" id="stock" style="width:170px"><option value="all">Todo el stock</option><option value="low">Stock bajo</option><option value="out">Sin stock</option></select>
        <select class="input" id="sort" style="width:220px">${Object.entries(SORTS).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join('')}</select>
        <label class="chip row"><input type="checkbox" id="arch" style="accent-color:var(--brand)"> Archivados</label></div>
        <div class="card"><div id="tbl"></div></div></div>`;
      const columns = () => [
        { h: 'Producto', r: (p) => `<div class="row"><img class="thumb" src="${P.thumb(p.category, cats())}" alt=""><div style="min-width:0"><div class="semibold clip" style="max-width:260px">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}${p.brand ? ` · ${esc(p.brand)}` : ''}</div></div></div>` },
        { h: 'Categoría', r: (p) => `<span class="badge">${esc(p.category)}</span>` },
        ...(attrCols().length ? [{ h: attrCols().map((f) => f.label).join(' / '), r: (p) => esc([p.size, p.color].filter(Boolean).join(' · ') || '—') }] : []),
        { h: 'Precio', num: true, r: (p) => `<b>${money(p.discount || p.price)}</b>${p.discount ? ` <s class="tiny faint">${money(p.price)}</s>` : ''}` },
        { h: 'Stock', num: true, r: (p) => `<b class="${p.stock === 0 ? 'red' : p.stock <= p.min ? 'orange' : ''}">${p.stock}</b>` },
        { h: 'Estado', r: (p) => (p.archived ? '<span class="badge">Archivado</span>' : p.stock === 0 ? '<span class="badge bad">Sin stock</span>' : '<span class="badge ok">Activo</span>') },
        ...(mgr ? [{ h: '', num: true, r: (p) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-qr="${p.id}" title="Ver código QR">${icon('qr-code')}</button><button class="btn btn-ghost btn-icon" data-edit="${p.id}" title="Editar">${icon('pencil')}</button><button class="btn btn-ghost btn-icon" data-arch="${p.id}" title="${p.archived ? 'Restaurar' : 'Archivar'}">${icon(p.archived ? 'archive-restore' : 'archive')}</button><button class="btn btn-ghost btn-icon" data-del="${p.id}" title="Eliminar" style="color:var(--bad)">${icon('trash-2')}</button></span>` }] : [{ h: '', r: (p) => `<button class="btn btn-ghost btn-icon" data-qr="${p.id}" title="Ver código QR">${icon('qr-code')}</button>` }]),
      ];
      const draw = () => {
        const t = q.toLowerCase();
        list = S.products.filter((p) => (arch ? p.archived : !p.archived) && (cat === 'all' || p.category === cat) && (stock === 'all' || (stock === 'low' ? p.stock > 0 && p.stock <= p.min : p.stock <= 0)) && (!t || [p.name, p.sku, p.brand, p.color].some((f) => (f || '').toLowerCase().includes(t)))).sort(SORTS[sort][1]);
        const rows = list.slice((page - 1) * SIZE, page * SIZE);
        $('#tbl', v).innerHTML = P.table(columns(), rows, { click: true, empty: 'No hay productos con esos filtros.' }) + P.pager(page, list.length, SIZE);
        P.$$('tbody tr', v).forEach((tr, i) => { tr._p = rows[i]; });
      };
      draw();
      $('#q', v).addEventListener('input', (e) => { q = e.target.value; page = 1; draw(); });
      for (const [id, set] of [['cat', (x) => (cat = x)], ['stock', (x) => (stock = x)], ['sort', (x) => (sort = x)]]) $(`#${id}`, v).addEventListener('change', (e) => { set(e.target.value); page = 1; draw(); });
      $('#arch', v).addEventListener('change', (e) => { arch = e.target.checked; page = 1; draw(); });
      P.on(v, 'click', '[data-page]', (e, el) => { page = +el.dataset.page; draw(); });
      P.on(v, 'click', 'tbody tr', (e, tr) => {
        const btn = e.target.closest('button'); const p = tr._p;
        if (btn?.dataset.qr) return qrDialog(p);
        if (btn?.dataset.edit) return productForm(p, draw);
        if (btn?.dataset.arch) { p.archived = !p.archived; P.log('PRODUCT_UPDATED', `${p.archived ? 'Archivado' : 'Restaurado'} "${p.name}"`, 'Productos'); P.toast(p.archived ? 'Producto archivado: ya no aparece en el punto de venta.' : 'Producto restaurado.'); return draw(); }
        if (btn?.dataset.del) return P.confirm('¿Eliminar el producto?', `"${p.name}" se borra. Las ventas que ya se hicieron conservan su detalle.`, 'Eliminar', () => { S.products = S.products.filter((x) => x !== p); P.log('PRODUCT_DELETED', `Eliminado "${p.name}"`, 'Productos'); P.toast('Producto eliminado.'); draw(); });
        preview(p, draw);
      });
      P.on(v, 'click', '[data-new]', () => productForm(null, draw));
      P.on(v, 'click', '[data-import]', () => P.toast('En el programa real se importa un archivo .csv, .xlsx o .xls con hasta 5.000 productos.', 'info'));
      P.on(v, 'click', '[data-csv]', () => { P.csv([['nombre', 'sku', 'categoria', 'marca', 'precioCompra', 'precioVenta', 'stock'], ...list.map((p) => [p.name, p.sku, p.category, p.brand, p.cost, p.price, p.stock])], 'plexi-productos.csv'); P.toast('Se descargó plexi-productos.csv con la lista filtrada.'); });
      P.on(v, 'click', '[data-labels]', () => labelsDialog(list.slice((page - 1) * SIZE, page * SIZE)));
    },
  };
  function preview(p, after) {
    const mgr = P.hasRole('admin', 'manager');
    const rows = [['Categoría', `${p.category}${p.sub ? ` / ${p.sub}` : ''}`], ['Marca', p.brand], ...P.fields().map((f) => [f.label, p[f.key]]), ['Precio de compra', mgr ? money(p.cost) : '—'], ['Precio de venta', money(p.price)], ['Precio con descuento', p.discount ? money(p.discount) : '—'], ['Stock', `${p.stock} (mín. ${p.min})`], ['Total vendido', p.sold], ['Proveedor', P.S.suppliers.find((s) => s.id === p.supplierId)?.name || '—']];
    const m = P.modal({ title: p.name, subtitle: p.sku, size: 'wide', body: `<div class="grid g2"><div><img class="thumb lg" src="${P.thumb(p.category, cats())}" alt=""></div><div>${rows.map(([k, val]) => `<div class="kv"><span>${esc(k)}</span><span>${esc(val || '—')}</span></div>`).join('')}</div></div>${mgr ? `<div class="dialog-f"><button class="btn btn-outline" data-qr>${icon('qr-code')} Ver código QR</button><button class="btn btn-primary" data-edit>${icon('pencil')} Editar</button></div>` : ''}` });
    m.on('click', '[data-qr]', () => qrDialog(p)); m.on('click', '[data-edit]', () => { m.close(); productForm(p, after); });
  }
  function qrDialog(p) {
    const m = P.modal({ title: 'Código QR', subtitle: p.name, size: 'narrow', body: `<div class="center stack"><div class="qr print-area">${P.qr(p.sku, 220)}</div><div><b>${esc(p.sku)}</b><div class="muted small">El QR guarda solo el SKU: al escanearlo, Plexi busca los datos actuales, así la etiqueta nunca queda desactualizada.</div></div></div><div class="dialog-f"><button class="btn btn-primary" data-print>${icon('printer')} Imprimir etiqueta</button></div>` });
    m.on('click', '[data-print]', () => window.print());
  }
  function labelsDialog(list) {
    const m = P.modal({ title: 'Etiquetas con código QR', subtitle: `${list.length} productos de esta página`, size: 'xwide', body: `<div class="grid g4 print-area">${list.map((p) => `<div class="type-card center"><div class="qr" style="border:0;padding:0">${P.qr(p.sku, 110)}</div><div class="small semibold mt8">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}</div><div class="bold gold">${money(p.discount || p.price)}</div></div>`).join('')}</div><div class="dialog-f"><button class="btn btn-primary" data-print>${icon('printer')} Imprimir</button></div>` });
    m.on('click', '[data-print]', () => window.print());
  }
  function productForm(p, after) {
    const S = P.S; const isEdit = !!p; const d = p || { name: '', sku: '', category: '', sub: '', brand: '', cost: '', price: '', discount: '', stock: 0, min: 10, supplierId: '', ...Object.fromEntries(P.fields().map((f) => [f.key, f.def || ''])) };
    const fieldHtml = (f) => `<div class="field"><label>${esc(f.label)}</label>${f.options ? `<select class="input" data-f="${f.key}"><option value="">—</option>${f.options.map((o) => `<option ${o === d[f.key] ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>` : `<input class="input" data-f="${f.key}" value="${esc(d[f.key])}" placeholder="${esc(f.ph || '')}">`}</div>`;
    const m = P.modal({ title: isEdit ? 'Editar producto' : 'Agregar producto', subtitle: P.TYPES[S.type].label, size: 'wide', body: `<div class="grid g3">
      <div class="field span3"><label>Nombre *</label><input class="input" data-f="name" value="${esc(d.name)}" placeholder="Ej.: ${esc(P.TYPES[S.type].ex)}"><div class="error-text" data-e="name"></div></div>
      <div class="field"><label>SKU</label><input class="input" data-f="sku" value="${esc(d.sku)}" placeholder="Vacío = se genera solo" ${isEdit ? 'disabled' : ''}></div>
      <div class="field"><label>Categoría *</label><select class="input" data-f="category"><option value="">Elegí una categoría…</option>${cats().map((c) => `<option ${c === d.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><div class="error-text" data-e="category"></div></div>
      <div class="field"><label>Subcategoría</label><select class="input" data-f="sub"></select></div>
      <div class="field"><label>Marca</label><input class="input" data-f="brand" value="${esc(d.brand)}" placeholder="Ej.: la marca del fabricante"></div>
      ${P.fields().map(fieldHtml).join('')}
      <div class="field"><label>Precio de compra *</label><input class="input" type="number" min="0" data-f="cost" value="${d.cost}"><div class="error-text" data-e="cost"></div></div>
      <div class="field"><label>Precio de venta *</label><input class="input" type="number" min="1" data-f="price" value="${d.price}"><div class="error-text" data-e="price"></div></div>
      <div class="field"><label>Precio con descuento (opcional)</label><input class="input" type="number" min="0" data-f="discount" value="${d.discount || ''}"></div>
      <div class="field"><label>Cantidad en stock *</label><input class="input" type="number" min="0" data-f="stock" value="${d.stock}"></div>
      <div class="field"><label>Stock mínimo</label><input class="input" type="number" min="0" data-f="min" value="${d.min}"></div>
      <div class="field"><label>Proveedor</label><select class="input" data-f="supplierId"><option value="">—</option>${S.suppliers.map((s) => `<option value="${s.id}" ${s.id === d.supplierId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></div>
      <div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-save>${icon('check')} Guardar</button></div>` });
    const fill = () => { const c = m.$('[data-f=category]').value; m.$('[data-f=sub]').innerHTML = `<option value="">—</option>${(S.categories[c] || []).map((x) => `<option ${x === d.sub ? 'selected' : ''}>${esc(x)}</option>`).join('')}`; };
    fill(); m.on('change', '[data-f=category]', fill);
    m.on('click', '[data-save]', () => {
      const val = (k) => m.$(`[data-f=${k}]`).value.trim(); const err = {};
      if (val('name').length < 3) err.name = 'Mínimo 3 letras.'; if (!val('category')) err.category = 'La categoría es obligatoria.';
      if (val('cost') === '' || +val('cost') < 0) err.cost = 'Obligatorio.'; if (!(+val('price') > 0)) err.price = 'Debe ser mayor a 0.';
      m.$$('[data-e]').forEach((el) => { el.textContent = err[el.dataset.e] || ''; }); if (Object.keys(err).length) return;
      if (val('discount') && +val('discount') >= +val('price')) return P.toast('El precio con descuento debe ser menor al precio de venta.', 'bad');
      const data = { name: val('name'), category: val('category'), sub: val('sub'), brand: val('brand'), cost: +val('cost'), price: +val('price'), discount: val('discount') ? +val('discount') : null, stock: +val('stock') || 0, min: +val('min') || 10, supplierId: val('supplierId'), ...Object.fromEntries(P.fields().map((f) => [f.key, val(f.key)])) };
      if (isEdit) { Object.assign(p, data); P.log('PRODUCT_UPDATED', `Actualizado "${p.name}"`, 'Productos'); P.toast('Producto actualizado.'); } else {
        const code = data.category.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
        S.products.unshift({ id: P.uid('p'), sku: val('sku') || `PLX-${code}-${Math.floor(1000 + Math.random() * 9000)}`, ...data, archived: false, sold: 0, created: Date.now() });
        P.log('PRODUCT_CREATED', `Producto creado "${data.name}"`, 'Productos'); P.toast('Producto creado: el código QR se generó a partir de su SKU.');
      }
      m.close(); after();
    });
  }

  /* ============================================================ INVENTARIO ============================================================ */
  P.screens.inventory = {
    render(v) {
      const S = P.S; let tab = 'levels'; let q = ''; let cat = 'all'; let lvl = 'all';
      const draw = () => {
        v.innerHTML = `<div class="page">${P.page('Inventario', 'Stock en tiempo real, entradas, salidas y ajustes con su historial.', 'boxes')}<div class="mb">${P.tabs([['levels', 'Niveles de stock', P.lowStock().length], ['moves', 'Movimientos']], tab)}</div><div id="body"></div></div>`;
        const body = $('#body', v);
        if (tab === 'levels') {
          body.innerHTML = `<div class="row wrap mb"><div class="search" style="width:260px">${icon('search')}<input class="input" id="q" placeholder="Buscar producto o SKU…" value="${esc(q)}"></div><select class="input" id="cat" style="width:260px"><option value="all">Todas las categorías</option>${cats().map((c) => `<option value="${esc(c)}" ${c === cat ? 'selected' : ''}>${esc(c)} (${S.products.filter((p) => !p.archived && p.category === c).length})</option>`).join('')}</select><select class="input" id="lvl" style="width:180px"><option value="all">Todos</option><option value="low" ${lvl === 'low' ? 'selected' : ''}>Stock bajo</option><option value="out" ${lvl === 'out' ? 'selected' : ''}>Sin stock</option></select></div><div class="card" id="lt"></div>`;
          const table = () => {
            const t = q.toLowerCase();
            const list = S.products.filter((p) => !p.archived && (cat === 'all' || p.category === cat) && (lvl === 'all' || (lvl === 'low' ? p.stock > 0 && p.stock <= p.min : p.stock <= 0)) && (!t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t))).sort((a, b) => a.stock - b.stock).slice(0, 40);
            $('#lt', v).innerHTML = P.table([{ h: 'Producto', r: (p) => `<div class="row"><img class="thumb" src="${P.thumb(p.category, cats())}" alt=""><div><div class="semibold">${esc(p.name)}</div><div class="tiny muted">${esc(p.sku)}</div></div></div>` }, { h: 'Categoría', r: (p) => esc(p.category) }, { h: 'Stock', num: true, r: (p) => `<b>${p.stock}</b> <span class="tiny muted">/ mín. ${p.min}</span>` }, { h: 'Nivel', r: (p) => `<div class="bar ${p.stock === 0 ? 'bad' : p.stock <= p.min ? 'warn' : ''}" style="width:120px"><i style="width:${Math.min(100, (p.stock / (p.min * 4)) * 100)}%"></i></div>` }, { h: 'Estado', r: (p) => (p.stock === 0 ? '<span class="badge bad">Sin stock</span>' : p.stock <= p.min ? '<span class="badge warn">Stock bajo</span>' : '<span class="badge ok">Bien</span>') }, { h: '', num: true, r: (p) => `<button class="btn btn-outline btn-sm" data-adj="${p.id}">Ajustar stock</button>` }], list, { empty: 'No hay productos con esos filtros.' });
          };
          table();
          $('#q', v).addEventListener('input', (e) => { q = e.target.value; table(); });
          $('#cat', v).addEventListener('change', (e) => { cat = e.target.value; table(); }); $('#lvl', v).addEventListener('change', (e) => { lvl = e.target.value; table(); });
        } else {
          body.innerHTML = `<div class="card">${P.table([{ h: 'Fecha', cls: 'nowrap', r: (m) => P.dateTime(m.date) }, { h: 'Producto', r: (m) => esc(m.name) }, { h: 'Tipo', r: (m) => `<span class="badge ${m.qty > 0 ? 'ok' : 'warn'}">${esc(m.type)}</span>` }, { h: 'Cantidad', num: true, r: (m) => `<b class="${m.qty > 0 ? 'green' : 'red'}">${m.qty > 0 ? '+' : ''}${m.qty}</b>` }, { h: 'Motivo', r: (m) => esc(m.reason) }, { h: 'Quién', r: (m) => esc(m.by) }], S.movements.slice(0, 60), { empty: 'Todavía no hay movimientos.' })}</div>`;
        }
      };
      draw();
      P.on(v, 'click', '[data-tab]', (e, el) => { tab = el.dataset.tab; draw(); });
      P.on(v, 'click', '[data-adj]', (e, el) => adjust(P.get(el.dataset.adj), draw));
    },
  };
  function adjust(p, after) {
    const TYPES = [['in', 'Entrada de mercadería', 1], ['out', 'Salida', -1], ['buy', 'Compra a proveedor', 1], ['damage', 'Daño o merma', -1], ['set', 'Ajuste (fijar la cantidad)', 0]];
    const m = P.modal({ title: 'Ajustar stock', subtitle: `${p.name} · hoy hay ${p.stock}`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Tipo de movimiento</label><select class="input" id="at">${TYPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div><div class="field"><label>Cantidad</label><input class="input" id="aq" type="number" min="0" value="10"></div><div class="field"><label>Motivo</label><input class="input" id="ar" placeholder="Ej.: llegó el pedido"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Aplicar</button></div>` });
    m.on('click', '[data-ok]', () => {
      const t = TYPES.find((x) => x[0] === m.$('#at').value); const q = Math.abs(+m.$('#aq').value || 0); if (!q && t[2] !== 0) return P.toast('Poné una cantidad mayor a cero.', 'bad');
      const delta = t[2] === 0 ? q - p.stock : t[2] * q; if (p.stock + delta < 0) return P.toast('No puede quedar stock negativo.', 'bad');
      p.stock += delta; P.S.movements.unshift({ date: Date.now(), pid: p.id, name: p.name, type: t[1], qty: delta, reason: m.$('#ar').value || '—', by: P.S.user.name });
      P.log('INVENTORY_ADJUSTED', `${t[1]} (${delta > 0 ? '+' : ''}${delta}) en "${p.name}"`, 'Inventario'); P.toast('Stock actualizado: quedó registrado quién, cuándo y por qué.'); m.close(); after();
    });
  }

  /* ============================================================ CLIENTES ============================================================ */
  P.screens.customers = {
    render(v) {
      const S = P.S; let q = ''; let f = 'all'; let page = 1; const SIZE = 10;
      v.innerHTML = `<div class="page">${P.page('Clientes', 'Cuenta corriente (fiado), puntos y avisos por WhatsApp.', 'users', `<button class="btn btn-outline" data-csv>${icon('download')} Exportar</button><button class="btn btn-primary" data-new>${icon('plus')} Agregar cliente</button>`)}
        <div class="row wrap mb"><div class="search" style="width:280px">${icon('search')}<input class="input" id="q" placeholder="Nombre, teléfono o correo…"></div><div id="tabs"></div></div><div class="card" id="tbl"></div></div>`;
      let list = [];
      const draw = () => {
        const t = q.toLowerCase();
        list = S.customers.filter((c) => (f === 'all' || (f === 'debt' ? P.balance(c) > 0 : P.isOverdue(c))) && (!t || [c.name, c.phone, c.email].some((x) => x.toLowerCase().includes(t))));
        $('#tabs', v).innerHTML = P.tabs([['all', 'Todos'], ['debt', 'Con deuda', S.customers.filter((c) => P.balance(c) > 0).length || ''], ['over', 'Deuda vencida', S.customers.filter(P.isOverdue).length || '']], f);
        const rows = list.slice((page - 1) * SIZE, page * SIZE);
        $('#tbl', v).innerHTML = P.table([{ h: 'Cliente', r: (c) => `<div class="row"><span class="avatar" style="background:var(--brand-faint);color:var(--brand)">${esc(P.initials(c.name))}</span><div><div class="semibold">${esc(c.name)} ${c.member ? '<span class="badge gold">Miembro</span>' : ''}</div><div class="tiny muted">${esc(c.phone)} · ${esc(c.email)}</div></div></div>` }, { h: 'Puntos', num: true, r: (c) => P.num(c.points) }, { h: 'Compras', num: true, r: (c) => `${c.orders} · ${money(c.spent)}` }, { h: 'Debe', num: true, r: (c) => (P.balance(c) > 0 ? `<b class="red">${money(P.balance(c))}</b>${P.isOverdue(c) ? ' <span class="badge bad">Vencida</span>' : ''}` : '<span class="faint">—</span>') }, { h: 'Cuenta corriente', r: (c) => (c.credit ? `<span class="badge ok">Habilitada${c.limit ? ` · límite ${money(c.limit)}` : ''}</span>` : '<span class="faint">No</span>') }, { h: '', num: true, r: (c) => `<span class="row end gap4">${P.balance(c) > 0 ? `<button class="btn btn-ghost btn-icon" data-wa="${c.id}" title="Recordar la deuda por WhatsApp" style="color:var(--ok)">${icon('message-circle')}</button>` : ''}<button class="btn btn-outline btn-sm" data-acc="${c.id}">Cuenta</button><button class="btn btn-ghost btn-icon" data-edit="${c.id}">${icon('pencil')}</button></span>` }], rows, { empty: 'No hay clientes con esos filtros.' }) + P.pager(page, list.length, SIZE);
      };
      draw();
      $('#q', v).addEventListener('input', (e) => { q = e.target.value; page = 1; draw(); });
      P.on(v, 'click', '[data-tab]', (e, el) => { f = el.dataset.tab; page = 1; draw(); });
      P.on(v, 'click', '[data-page]', (e, el) => { page = +el.dataset.page; draw(); });
      P.on(v, 'click', '[data-new]', () => customerForm(null, draw));
      P.on(v, 'click', '[data-edit]', (e, el) => customerForm(P.customer(el.dataset.edit), draw));
      P.on(v, 'click', '[data-acc]', (e, el) => accountDialog(P.customer(el.dataset.acc), draw));
      P.on(v, 'click', '[data-wa]', (e, el) => remind(P.customer(el.dataset.wa)));
      P.on(v, 'click', '[data-csv]', () => { P.csv([['nombre', 'telefono', 'correo', 'puntos', 'deuda', 'limite'], ...list.map((c) => [c.name, c.phone, c.email, c.points, P.balance(c), c.limit])], 'plexi-clientes.csv'); P.toast('Se descargó plexi-clientes.csv.'); });
    },
  };
  const remind = (c) => P.waDialog(`54 9 ${c.phone.replace(/\D/g, '')}`, `Hola ${c.name.split(' ')[0]}, te escribimos de ${P.S.settings.storeName}. Te recordamos que tenés un saldo pendiente de ${money(P.balance(c))}. Podés pasar a abonarlo cuando quieras. ¡Gracias!`, 'Recordatorio de deuda');
  function customerForm(c, after) {
    const mgr = P.hasRole('admin', 'manager'); const d = c || { name: '', phone: '', email: '', member: false, credit: false, limit: 0 };
    const m = P.modal({ title: c ? 'Editar cliente' : 'Agregar cliente', body: `<div class="grid g2"><div class="field span2"><label>Nombre *</label><input class="input" id="cn" value="${esc(d.name)}"><div class="error-text" id="en"></div></div><div class="field"><label>Teléfono *</label><input class="input" id="cp" value="${esc(d.phone)}" placeholder="11 5555 1234"><div class="error-text" id="ep"></div></div><div class="field"><label>Correo</label><input class="input" id="ce" value="${esc(d.email)}"></div>
      <label class="check span2"><input type="checkbox" id="cm" ${d.member ? 'checked' : ''}><span><b>Miembro</b><br><span class="small muted">Accede a los cupones exclusivos para miembros.</span></span></label>
      ${mgr ? `<label class="check span2"><input type="checkbox" id="cc" ${d.credit ? 'checked' : ''}><span><b>Permitir cuenta corriente (fiado)</b><br><span class="small muted">Solo gerentes y administradores lo habilitan.</span></span></label><div class="field"><label>Límite de crédito (0 = sin límite)</label><input class="input" id="cl" type="number" min="0" value="${d.limit}"></div>` : ''}</div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Guardar</button></div>` });
    m.on('click', '[data-ok]', () => {
      const name = m.$('#cn').value.trim(); const phone = m.$('#cp').value.trim(); m.$('#en').textContent = name.length < 2 ? 'Escribí el nombre.' : ''; m.$('#ep').textContent = phone.replace(/\D/g, '').length < 7 ? 'Mínimo 7 dígitos.' : ''; if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return;
      const data = { name, phone, email: m.$('#ce').value.trim(), member: m.$('#cm').checked }; if (mgr) { data.credit = m.$('#cc').checked; data.limit = +m.$('#cl').value || 0; }
      if (c) { Object.assign(c, data); P.log('CUSTOMER_UPDATED', `Cliente actualizado: ${name}`, 'Clientes'); } else { P.S.customers.unshift({ id: P.uid('c'), points: 0, ledger: [], spent: 0, orders: 0, created: Date.now(), credit: false, limit: 0, ...data }); P.log('CUSTOMER_CREATED', `Cliente agregado: ${name}`, 'Clientes'); }
      P.toast(c ? 'Cliente actualizado.' : 'Cliente agregado.'); m.close(); after();
    });
  }
  function accountDialog(c, after) {
    const mgr = P.hasRole('admin', 'manager');
    const m = P.modal({ title: c.name, subtitle: 'Cuenta corriente y puntos', size: 'wide', body: '<div id="acc"></div>' });
    const draw = () => {
      const b = P.balance(c);
      m.$('#acc').innerHTML = `<div class="grid g3 mb">${P.kpi('hand-coins', 'Debe', money(b), P.isOverdue(c) ? 'deuda vencida' : '', b > 0 ? 'bad' : '')}${P.kpi('shield-check', 'Límite', c.credit ? (c.limit ? money(c.limit) : 'Sin límite') : 'No habilitada', c.credit ? 'cuenta corriente' : '', 'info')}${P.kpi('star', 'Puntos', P.num(c.points), `valen ${money(c.points * P.S.settings.pointsValue)}`, 'gold')}</div>
      <div class="row wrap mb"><button class="btn btn-primary" data-pay ${b > 0 ? '' : 'disabled'}>${icon('banknote')} Cobrar deuda</button>${mgr ? `<button class="btn btn-outline" data-adj>${icon('wrench')} Ajustar cuenta</button>` : ''}${b > 0 ? `<button class="btn btn-outline" data-wa>${icon('message-circle')} Recordar por WhatsApp</button>` : ''}</div>
      <div class="card">${P.table([{ h: 'Fecha', cls: 'nowrap', r: (e) => P.dateTime(e.date) }, { h: 'Detalle', r: (e) => esc(e.desc) }, { h: 'Tipo', r: (e) => `<span class="badge ${e.type === 'payment' ? 'ok' : 'warn'}">${e.type === 'payment' ? 'Pago' : e.type === 'charge' ? 'Compra' : 'Ajuste'}</span>` }, { h: 'Importe', num: true, r: (e) => `<b class="${e.type === 'payment' ? 'green' : 'red'}">${e.type === 'payment' ? '-' : '+'}${money(e.amount)}</b>` }], [...c.ledger].sort((a, z) => z.date - a.date), { empty: 'Sin movimientos todavía.' })}</div>`;
    };
    draw();
    m.on('click', '[data-wa]', () => remind(c));
    m.on('click', '[data-pay]', () => { const m2 = P.modal({ title: 'Cobrar deuda', subtitle: `Debe ${money(P.balance(c))}`, size: 'narrow', body: `<div class="stack"><div class="field"><label>Importe</label><input class="input" id="pa" type="number" min="1" value="${P.balance(c)}"></div><div class="field"><label>Medio</label><select class="input" id="pm"><option value="cash">Efectivo</option><option value="debit">Tarjeta de débito</option><option value="transfer">Transferencia</option><option value="mp">Mercado Pago</option></select></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Registrar cobro</button></div>` });
      m2.on('click', '[data-ok]', () => { const a = Math.min(+m2.$('#pa').value || 0, P.balance(c)); if (a <= 0) return P.toast('Poné un importe válido.', 'bad'); c.ledger.push({ date: Date.now(), type: 'payment', amount: a, desc: `Pago en ${P.PAY[m2.$('#pm').value].toLowerCase()}` }); c.points += Math.floor(a / P.S.settings.pointsPerAmount); P.log('CUSTOMER_PAYMENT', `Cobro de ${money(a)} a ${c.name}`, 'Clientes'); P.toast(`Cobro registrado: ${money(a)}. Los puntos se suman al pagar la deuda.`); m2.close(); draw(); after(); }); });
    m.on('click', '[data-adj]', () => { const m2 = P.modal({ title: 'Ajustar cuenta', size: 'narrow', body: `<div class="stack"><div class="field"><label>Qué hacer</label><select class="input" id="at"><option value="adjustment">Cargar deuda anterior (cuaderno)</option><option value="payment">Perdonar / bajar la deuda</option></select></div><div class="field"><label>Importe</label><input class="input" id="aa" type="number" min="1" value="1000"></div><div class="field"><label>Motivo</label><input class="input" id="ad" placeholder="Ej.: deuda del cuaderno"></div></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Aplicar</button></div>` });
      m2.on('click', '[data-ok]', () => { const a = +m2.$('#aa').value; if (!(a > 0)) return P.toast('Poné un importe válido.', 'bad'); const t = m2.$('#at').value; c.ledger.push({ date: Date.now(), type: t, amount: t === 'payment' ? Math.min(a, P.balance(c)) : a, desc: m2.$('#ad').value || 'Ajuste manual' }); c.credit = true; P.log('CUSTOMER_ADJUSTMENT', `Ajuste de cuenta de ${c.name}`, 'Clientes'); P.toast('Cuenta ajustada.'); m2.close(); draw(); after(); }); });
  }

  /* ============================================================ PROVEEDORES ============================================================ */
  P.screens.suppliers = {
    render(v) {
      const S = P.S; let tab = 'list'; const DAYS = [[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes'], [6, 'Sábado'], [0, 'Domingo']];
      const draw = () => {
        const pend = S.orders.filter((o) => o.status === 'pending').length;
        v.innerHTML = `<div class="page">${P.page('Proveedores', 'Saldo, visitas, órdenes de compra y deudas.', 'truck', `<button class="btn btn-outline" data-order>${icon('package')} Pedir lo que falta</button>`)}<div class="mb">${P.tabs([['list', 'Proveedores'], ['cal', 'Calendario de visitas'], ['orders', 'Órdenes de compra', pend || ''], ['debts', 'Deudas']], tab)}</div><div id="body"></div></div>`;
        const b = $('#body', v);
        if (tab === 'list') b.innerHTML = `<div class="card">${P.table([{ h: 'Proveedor', r: (s) => `<div class="semibold">${esc(s.name)}</div><div class="tiny muted">${esc(s.contact)} · ${esc(s.phone)}</div>` }, { h: 'Visita', r: (s) => (s.visitDays.length ? s.visitDays.map((d) => `<span class="badge info">${P.WEEKDAYS[d].slice(0, 3)}</span>`).join(' ') : '<span class="faint">Sin día fijo</span>') }, { h: 'Les debés', num: true, r: (s) => (s.balance > 0 ? `<b class="red">${money(s.balance)}</b>` : '<span class="faint">—</span>') }, { h: '', num: true, r: (s) => `<span class="row end gap4"><button class="btn btn-ghost btn-icon" data-swa="${s.id}" title="Escribirle por WhatsApp" style="color:var(--ok)">${icon('message-circle')}</button>${s.balance > 0 ? `<button class="btn btn-outline btn-sm" data-pay="${s.id}">Pagar</button>` : ''}<button class="btn btn-outline btn-sm" data-ord="${s.id}">Pedido</button></span>` }], S.suppliers)}</div>`;
        if (tab === 'cal') b.innerHTML = `<div class="cal">${DAYS.map(([d, l]) => `<div class="day ${new Date().getDay() === d ? 'today' : ''}"><h4>${l}${new Date().getDay() === d ? ' · hoy' : ''}</h4>${S.suppliers.filter((s) => s.visitDays.includes(d)).map((s) => `<div class="sup"><b>${esc(s.name)}</b><div class="row gap4 mt8"><button class="btn btn-outline btn-sm" data-ord="${s.id}">Pedido</button><button class="btn btn-ghost btn-icon" data-swa="${s.id}" style="color:var(--ok)">${icon('message-circle')}</button></div></div>`).join('') || '<div class="tiny faint">Sin visitas</div>'}</div>`).join('')}</div><div class="card mt"><div class="card-b small muted">Proveedores sin día fijo: ${S.suppliers.filter((s) => !s.visitDays.length).map((s) => esc(s.name)).join(', ') || 'ninguno'}.</div></div>`;
        if (tab === 'orders') b.innerHTML = `<div class="card">${P.table([{ h: 'Orden', r: (o) => `<b>${esc(o.number)}</b>` }, { h: 'Proveedor', r: (o) => esc(o.supplier) }, { h: 'Fecha', r: (o) => P.date(o.date) }, { h: 'Artículos', r: (o) => o.items.map((i) => `${i.qty} × ${esc(i.name)}`).join('<br>') }, { h: 'Total', num: true, r: (o) => `<b>${money(o.total)}</b>` }, { h: 'Estado', r: (o) => (o.status === 'pending' ? '<span class="badge warn">Pendiente</span>' : '<span class="badge ok">Recibida</span>') }, { h: '', num: true, r: (o) => (o.status === 'pending' ? `<button class="btn btn-primary btn-sm" data-recv="${o.id}">Recibir mercadería</button>` : '') }], S.orders, { empty: 'Todavía no hay órdenes: probá «Pedir lo que falta».' })}</div>`;
        if (tab === 'debts') { const d = S.suppliers.filter((s) => s.balance > 0); b.innerHTML = `<div class="card"><div class="card-h"><div><h3>Deuda total con proveedores</h3><p>${money(d.reduce((a, s) => a + s.balance, 0))}</p></div></div>${P.table([{ h: 'Proveedor', r: (s) => esc(s.name) }, { h: 'Desde', r: (s) => P.date(s.debtSince) }, { h: 'Debés', num: true, r: (s) => `<b class="red">${money(s.balance)}</b>` }, { h: '', num: true, r: (s) => `<button class="btn btn-primary btn-sm" data-pay="${s.id}">Pagar</button>` }], d, { empty: 'No le debés a nadie.' })}</div>`; }
      };
      draw();
      P.on(v, 'click', '[data-tab]', (e, el) => { tab = el.dataset.tab; draw(); });
      P.on(v, 'click', '[data-swa]', (e, el) => { const s = S.suppliers.find((x) => x.id === el.dataset.swa); P.waDialog(`54 9 ${s.phone.replace(/\D/g, '')}`, `Hola ${s.contact.split(' ')[0]}, te escribimos de ${S.settings.storeName}. ¿Podés pasarnos tu lista de precios actualizada? Gracias.`, 'Escribirle al proveedor'); });
      P.on(v, 'click', '[data-pay]', (e, el) => { const s = S.suppliers.find((x) => x.id === el.dataset.pay); const m = P.modal({ title: 'Pagar a proveedor', subtitle: `${s.name} · les debés ${money(s.balance)}`, size: 'narrow', body: `<div class="field"><label>Importe</label><input class="input" id="pa" type="number" min="1" value="${s.balance}"></div><p class="hint">Los pagos a proveedores no son gastos: no bajan la ganancia.</p><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>Registrar pago</button></div>` }); m.on('click', '[data-ok]', () => { const a = Math.min(+m.$('#pa').value || 0, s.balance); if (a <= 0) return P.toast('Poné un importe válido.', 'bad'); s.balance -= a; P.log('SUPPLIER_PAYMENT', `Pago de ${money(a)} a ${s.name}`, 'Proveedores'); P.toast(`Pago registrado: ${money(a)}.`); m.close(); draw(); }); });
      P.on(v, 'click', '[data-ord]', (e, el) => orderDialog(el.dataset.ord, () => { tab = 'orders'; draw(); }));
      P.on(v, 'click', '[data-order]', () => orderDialog(null, () => { tab = 'orders'; draw(); }));
      P.on(v, 'click', '[data-recv]', (e, el) => { const o = S.orders.find((x) => x.id === el.dataset.recv); o.status = 'received'; o.items.forEach((i) => { const p = P.get(i.pid); if (p) { p.stock += i.qty; p.cost = i.cost; S.movements.unshift({ date: Date.now(), pid: p.id, name: p.name, type: 'Compra a proveedor', qty: i.qty, reason: o.number, by: S.user.name }); } }); const s = S.suppliers.find((x) => x.name === o.supplier); if (s) { s.balance += o.total; s.debtSince = Date.now(); } P.log('PURCHASE_ORDER_RECEIVED', `Orden ${o.number} recibida`, 'Proveedores'); P.toast('Mercadería recibida: entró el stock y quedó anotada la deuda.'); draw(); });
    },
  };
  function orderDialog(supplierId, done) {
    const S = P.S;
    const m = P.modal({ title: 'Pedir lo que falta', subtitle: 'Plexi arma la orden con lo que está en el mínimo o por debajo', size: 'wide', body: `<div class="field"><label>Proveedor</label><select class="input" id="os">${S.suppliers.map((s) => `<option value="${s.id}" ${s.id === supplierId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div><div id="ol" class="mt"></div><div class="dialog-f"><button class="btn btn-outline" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${icon('check')} Crear orden</button></div>` });
    const lines = () => { const sid = m.$('#os').value; let list = S.products.filter((p) => !p.archived && p.supplierId === sid && p.stock <= p.min); if (!list.length) list = S.products.filter((p) => !p.archived && p.supplierId === sid).slice(0, 4); return list; };
    const draw = () => { const list = lines(); m.$('#ol').innerHTML = list.length ? P.table([{ h: 'Producto', r: (p) => `<b>${esc(p.name)}</b><div class="tiny muted">stock ${p.stock} · mín. ${p.min}</div>` }, { h: 'Cantidad', r: (p) => `<input class="input sm" style="width:80px" type="number" min="0" value="${Math.max(p.min * 2 - p.stock, 1)}" data-q="${p.id}">` }, { h: 'Costo', r: (p) => `<input class="input sm" style="width:100px" type="number" min="0" value="${p.cost}" data-c="${p.id}">` }], list) : '<div class="empty">Este proveedor no tiene productos cargados.</div>'; };
    draw(); m.on('change', '#os', draw);
    m.on('click', '[data-ok]', () => { const items = lines().map((p) => ({ pid: p.id, name: p.name, qty: +m.$(`[data-q="${p.id}"]`).value || 0, cost: +m.$(`[data-c="${p.id}"]`).value || p.cost })).filter((i) => i.qty > 0); if (!items.length) return P.toast('Agregá al menos un artículo.', 'bad'); const s = S.suppliers.find((x) => x.id === m.$('#os').value); S.orders.unshift({ id: P.uid('o'), number: `OC-${String(S.orders.length + 1).padStart(4, '0')}`, supplier: s.name, date: Date.now(), items, total: items.reduce((a, i) => a + i.qty * i.cost, 0), status: 'pending' }); P.log('PURCHASE_ORDER_CREATED', `Orden de compra a ${s.name}`, 'Proveedores'); P.toast('Orden de compra creada.'); m.close(); done(); });
  }
})();
