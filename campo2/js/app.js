/* Datos de ejemplo y definición de los 19 módulos (+ finanzas). Nada se guarda: al recargar vuelve todo a empezar. */
(function () {
  const P = (window.AG = window.AG || {});
  const DAY = 86400000; P.DAY = DAY;

  /* ---------- fechas (se guardan como aaaa-mm-dd, igual que un <input type="date">) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  P.iso = (off = 0) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setTime(d.getTime() + off * DAY); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  P.parse = (s) => new Date(`${s}T12:00:00`);
  P.fmt = (s) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—');
  P.daysFrom = (s) => { const t = new Date(); t.setHours(12, 0, 0, 0); return Math.round((P.parse(s) - t) / DAY); };
  P.addDays = (s, n) => { const d = P.parse(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  /* ---------- generador pseudo-aleatorio fijo (los datos de ejemplo siempre son los mismos) ---------- */
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)]; const int = (a, b) => Math.round(a + rnd() * (b - a));
  const gen = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

  /* ---------- tipos de granja (lo que ofrece el selector de módulos del programa real) ---------- */
  P.TYPES = {
    ganadera: { label: 'Ganadería', icon: '🐑', demo: 'Ovejas, vacas, cabras, ciervos, cerdos, aves y abejas, con potreros y pasturas.', groups: ['Terreno', 'Ganado', 'Registros', 'Gestión'] },
    cultivos: { label: 'Cultivos y huerta', icon: '🥬', demo: 'Planificación de siembras, cosechas, huerto, viñedo, invernadero y acuaponía.', groups: ['Terreno', 'Cultivos', 'Registros', 'Gestión'] },
    mixta: { label: 'Granja mixta', icon: '🌾', demo: 'Todos los módulos activos: cultivos y ganado en la misma granja.', groups: ['Terreno', 'Cultivos', 'Ganado', 'Registros', 'Gestión'] },
  };
  P.GROUPS = ['Terreno', 'Cultivos', 'Ganado', 'Registros', 'Gestión'];

  /* ---------- módulos: campos [clave, etiqueta, tipo, opciones/unidad]; las filas de ejemplo siguen el orden de los campos ---------- */
  const F = (k, l, t = 'text', o) => ({ k, l, t, o });
  const PADDOCKS = ['Potrero Norte', 'Potrero del Río', 'Potrero Este', 'Potrero Sur'];
  const CROPFIELDS = ['Parcela 1 - Hortalizas', 'Huerto Sur', 'Viñedo Alto'];
  const ANIMAL_STATUS = ['Sano', 'Tratamiento', 'Preñada', 'Vendido'];
  const livestock = (id, label, icon, breeds, extra) => ({
    id, label, icon, group: 'Ganado', desc: `Registro individual de ${label.toLowerCase()}: caravana, raza, peso y estado.`,
    fields: [F('tag', 'Caravana'), F('breed', 'Raza', 'select', breeds), F('sex', 'Sexo', 'select', ['Hembra', 'Macho']), F('birth', 'Nacimiento', 'date'), F('weight', 'Peso', 'number', 'kg'), F('paddock', 'Potrero', 'ref'), F('status', 'Estado', 'select', extra.status || ANIMAL_STATUS)],
    sum: ['weight', 'Peso total'], seed: gen(extra.n, (i) => [`${extra.pre}-${extra.base + i}`, pick(breeds), i % 6 === 0 ? 'Macho' : 'Hembra', -int(300, 1800), int(extra.w[0], extra.w[1]), pick(PADDOCKS.slice(0, 3)), pick(extra.status || ANIMAL_STATUS)]),
  });

  P.MODULES = [
    { id: 'field-management', label: 'Potreros y parcelas', icon: '🗺️', group: 'Terreno', desc: 'Los lotes de la granja: superficie, uso, suelo y último trabajo.',
      fields: [F('name', 'Nombre'), F('area', 'Superficie', 'number', 'ha'), F('use', 'Uso', 'select', ['Pastoreo', 'Cultivo', 'Huerto', 'Viñedo', 'Descanso']), F('soil', 'Suelo', 'select', ['Franco', 'Arcilloso', 'Arenoso', 'Limoso']), F('status', 'Estado', 'select', ['Activo', 'En descanso', 'Preparación']), F('lastWork', 'Último trabajo', 'date')],
      sum: ['area', 'Superficie total'],
      seed: [['Potrero Norte', 24, 'Pastoreo', 'Franco', 'Activo', -12], ['Potrero del Río', 18.5, 'Pastoreo', 'Limoso', 'Activo', -20], ['Potrero Este', 31, 'Pastoreo', 'Arenoso', 'En descanso', -40], ['Potrero Sur', 12, 'Pastoreo', 'Franco', 'Activo', -8], ['Parcela 1 - Hortalizas', 2.4, 'Cultivo', 'Franco', 'Activo', -5], ['Huerto Sur', 3.2, 'Huerto', 'Franco', 'Activo', -15], ['Viñedo Alto', 5.8, 'Viñedo', 'Arcilloso', 'Preparación', -30]] },
    { id: 'pasture', label: 'Pasturas', icon: '🌿', group: 'Terreno', desc: 'Altura y cobertura del pasto para decidir cuándo rotar los animales.',
      fields: [F('paddock', 'Potrero', 'ref'), F('species', 'Pastura', 'select', ['Raigrás y trébol', 'Festuca', 'Alfalfa', 'Chicoria']), F('height', 'Altura', 'number', 'cm'), F('cover', 'Cobertura', 'number', 'kg MS/ha'), F('grazed', 'Último pastoreo', 'date'), F('next', 'Próximo pastoreo', 'date')],
      extras: [{ label: 'Descanso', fn: (r) => `${Math.max(0, -P.daysFrom(r.grazed))} días` }],
      seed: [['Potrero Norte', 'Raigrás y trébol', 9, 2400, -6, 3], ['Potrero del Río', 'Festuca', 14, 3100, -25, 1], ['Potrero Este', 'Alfalfa', 18, 3600, -40, 12], ['Potrero Sur', 'Raigrás y trébol', 7, 1900, -4, 6]] },

    { id: 'crop-planning', label: 'Planificación de cultivos', icon: '📅', group: 'Cultivos', desc: 'Qué se siembra, dónde y cuándo se espera cosechar.',
      fields: [F('crop', 'Cultivo'), F('field', 'Parcela', 'ref'), F('sow', 'Siembra', 'date'), F('harvest', 'Cosecha prevista', 'date'), F('status', 'Estado', 'select', ['Planificado', 'Sembrado', 'Creciendo', 'Cosechado'])],
      seed: [['Tomate cherry', 'Parcela 1 - Hortalizas', -50, 12, 'Creciendo'], ['Zanahoria', 'Parcela 1 - Hortalizas', -30, 40, 'Creciendo'], ['Lechuga', 'Huerto Sur', -35, 9, 'Creciendo'], ['Calabaza', 'Huerto Sur', 10, 120, 'Planificado'], ['Papa', 'Parcela 1 - Hortalizas', -110, -8, 'Cosechado']] },
    { id: 'harvest-tracking', label: 'Cosechas', icon: '🧺', group: 'Cultivos', desc: 'Lo que se cosechó, de dónde, con qué calidad y a qué precio.',
      fields: [F('crop', 'Cultivo'), F('field', 'Parcela', 'ref'), F('date', 'Fecha', 'date'), F('qty', 'Cantidad', 'number', 'kg'), F('quality', 'Calidad', 'select', ['A', 'B', 'C']), F('value', 'Valor', 'number', '$')],
      sum: ['value', 'Valor total'], sortBy: 'date',
      seed: [['Papa', 'Parcela 1 - Hortalizas', -8, 840, 'A', 1260], ['Lechuga', 'Huerto Sur', -3, 120, 'A', 360], ['Manzana Gala', 'Huerto Sur', -22, 600, 'B', 780], ['Tomate cherry', 'Parcela 1 - Hortalizas', -1, 65, 'A', 390], ['Uva Pinot', 'Viñedo Alto', -160, 2400, 'A', 4800]] },
    { id: 'vegetables', label: 'Hortalizas', icon: '🥕', group: 'Cultivos', desc: 'Camas de cultivo, variedades y rendimiento.',
      fields: [F('crop', 'Cultivo'), F('variety', 'Variedad'), F('bed', 'Cama'), F('sown', 'Siembra', 'date'), F('yield', 'Rendimiento', 'number', 'kg'), F('status', 'Estado', 'select', ['Sembrado', 'Creciendo', 'Cosechado'])],
      seed: [['Tomate', 'Cherry rojo', 'Cama 1', -50, 65, 'Creciendo'], ['Zanahoria', 'Nantes', 'Cama 2', -30, 0, 'Creciendo'], ['Lechuga', 'Crespa', 'Cama 3', -35, 120, 'Cosechado'], ['Cebolla', 'Amarilla', 'Cama 4', -70, 0, 'Creciendo']] },
    { id: 'orchard', label: 'Huerto frutal', icon: '🍎', group: 'Cultivos', desc: 'Árboles frutales por bloque, variedad y estado.',
      fields: [F('tree', 'Frutal', 'select', ['Manzano', 'Peral', 'Cerezo', 'Kiwi', 'Palta', 'Cítricos']), F('variety', 'Variedad'), F('block', 'Bloque'), F('trees', 'Árboles', 'number'), F('planted', 'Plantación', 'date'), F('status', 'Estado', 'select', ['Floración', 'Cuajado', 'Maduración', 'Cosecha', 'Reposo'])],
      sum: ['trees', 'Árboles en total'],
      seed: [['Manzano', 'Gala', 'A', 120, -2200, 'Cuajado'], ['Manzano', 'Fuji', 'B', 90, -1900, 'Cuajado'], ['Peral', 'Packham', 'C', 60, -1500, 'Floración'], ['Kiwi', 'Hayward', 'D', 48, -900, 'Reposo']] },
    { id: 'viticulture', label: 'Viñedo', icon: '🍇', group: 'Cultivos', desc: 'Variedades, bloques, grados Brix y etapa fenológica.',
      fields: [F('variety', 'Variedad'), F('block', 'Bloque'), F('vines', 'Plantas', 'number'), F('area', 'Superficie', 'number', 'ha'), F('brix', 'Brix', 'number', '°'), F('status', 'Etapa', 'select', ['Reposo', 'Brotación', 'Floración', 'Envero', 'Vendimia'])],
      sum: ['vines', 'Plantas en total'],
      seed: [['Pinot Noir', 'V1', 3200, 2.4, 14, 'Envero'], ['Sauvignon Blanc', 'V2', 2800, 2.1, 17, 'Envero'], ['Chardonnay', 'V3', 1100, 1.3, 11, 'Floración']] },
    { id: 'microgreens', label: 'Microverdes', icon: '🌱', group: 'Cultivos', desc: 'Bandejas en producción: ciclo corto, mucho margen.',
      fields: [F('crop', 'Cultivo'), F('trays', 'Bandejas', 'number'), F('sown', 'Siembra', 'date'), F('harvest', 'Cosecha', 'date'), F('grams', 'Por bandeja', 'number', 'g'), F('status', 'Estado', 'select', ['Germinando', 'Creciendo', 'Listo', 'Cosechado'])],
      seed: [['Rúcula', 24, -5, 4, 180, 'Creciendo'], ['Girasol', 18, -7, 1, 260, 'Listo'], ['Rabanito', 30, -2, 7, 150, 'Germinando'], ['Guisante', 12, -10, -1, 300, 'Cosechado']] },
    { id: 'protected-cropping', label: 'Invernadero', icon: '🏡', group: 'Cultivos', desc: 'Cultivo protegido: temperatura, humedad y siembras bajo techo.',
      fields: [F('structure', 'Estructura'), F('crop', 'Cultivo'), F('temp', 'Temperatura', 'number', '°C'), F('hum', 'Humedad', 'number', '%'), F('sown', 'Siembra', 'date'), F('status', 'Estado', 'select', ['Preparación', 'Creciendo', 'Cosecha'])],
      seed: [['Invernadero 1', 'Tomate', 26, 68, -60, 'Cosecha'], ['Invernadero 2', 'Pimiento', 28, 72, -40, 'Creciendo'], ['Túnel 3', 'Pepino', 24, 75, -15, 'Creciendo']] },
    { id: 'aquaponics', label: 'Acuaponía', icon: '🐟', group: 'Cultivos', desc: 'Peces y plantas en un mismo circuito de agua.',
      fields: [F('system', 'Sistema'), F('fish', 'Peces', 'select', ['Tilapia', 'Trucha', 'Carpa']), F('count', 'Cantidad', 'number'), F('ph', 'pH', 'number'), F('temp', 'Agua', 'number', '°C'), F('plants', 'Plantas'), F('check', 'Último control', 'date')],
      extras: [{ label: 'pH', fn: (r) => (r.ph < 6.2 || r.ph > 7.6 ? '<span class="badge bad">Fuera de rango</span>' : '<span class="badge ok">Normal</span>') }],
      seed: [['Circuito A', 'Tilapia', 220, 6.8, 24, 'Albahaca y lechuga', -1], ['Circuito B', 'Trucha', 140, 7.9, 16, 'Acelga', -3]] },

    livestock('sheep', 'Ovejas', '🐑', ['Merino', 'Romney', 'Corriedale', 'Texel'], { n: 16, pre: 'OV', base: 2100, w: [42, 82] }),
    livestock('cattle-dairy', 'Vacas lecheras', '🐄', ['Holstein', 'Jersey', 'Frisona'], { n: 10, pre: 'LE', base: 301, w: [450, 620], status: ['En ordeño', 'Seca', 'Preñada', 'Tratamiento'] }),
    livestock('cattle-beef', 'Vacas de carne', '🐂', ['Angus', 'Hereford', 'Charolais'], { n: 10, pre: 'CA', base: 501, w: [320, 640], status: ['Cría', 'Engorde', 'Tratamiento', 'Vendido'] }),
    livestock('goats', 'Cabras', '🐐', ['Saanen', 'Boer', 'Angora'], { n: 8, pre: 'CB', base: 701, w: [35, 70] }),
    livestock('deer', 'Ciervos', '🦌', ['Ciervo rojo', 'Wapití'], { n: 6, pre: 'CI', base: 901, w: [90, 210] }),
    livestock('pigs', 'Cerdos', '🐖', ['Large White', 'Duroc', 'Landrace'], { n: 8, pre: 'CE', base: 1101, w: [60, 180], status: ['Sano', 'Engorde', 'Tratamiento', 'Vendido'] }),
    { id: 'poultry', label: 'Aves', icon: '🐔', group: 'Ganado', desc: 'Lotes de gallinas y pollos: postura, galpón y estado.',
      fields: [F('flock', 'Lote'), F('breed', 'Raza', 'select', ['Leghorn', 'Rhode Island', 'Pollo parrillero']), F('birds', 'Aves', 'number'), F('eggs', 'Huevos/día', 'number'), F('shed', 'Galpón'), F('status', 'Estado', 'select', ['Postura', 'Cría', 'Engorde'])],
      sum: ['birds', 'Aves en total'],
      seed: [['Lote 1', 'Leghorn', 180, 152, 'Galpón A', 'Postura'], ['Lote 2', 'Rhode Island', 90, 66, 'Galpón B', 'Postura'], ['Lote 3', 'Pollo parrillero', 250, 0, 'Galpón C', 'Engorde']] },
    { id: 'bees', label: 'Apicultura', icon: '🐝', group: 'Ganado', desc: 'Colmenas: fuerza, producción de miel e inspecciones.',
      fields: [F('hive', 'Colmena'), F('queen', 'Reina (año)', 'number'), F('strength', 'Fuerza', 'select', ['Débil', 'Media', 'Fuerte']), F('honey', 'Miel', 'number', 'kg'), F('inspected', 'Última inspección', 'date'), F('status', 'Estado', 'select', ['Activa', 'Tratamiento', 'Enjambre']), F('place', 'Ubicación')],
      sum: ['honey', 'Miel total'],
      seed: gen(8, (i) => [`C-${10 + i}`, 2022 + (i % 3), pick(['Débil', 'Media', 'Fuerte', 'Fuerte']), int(4, 28), -int(4, 34), i === 5 ? 'Tratamiento' : 'Activa', pick(['Colina', 'Huerto', 'Río'])]) },

    { id: 'pest-spray-log', label: 'Registro de aplicaciones', icon: '🧪', group: 'Registros', desc: 'Productos aplicados, dosis y período de carencia antes de cosechar.',
      fields: [F('product', 'Producto'), F('target', 'Para'), F('field', 'Parcela', 'ref'), F('date', 'Fecha', 'date'), F('dose', 'Dosis'), F('withholding', 'Carencia', 'number', 'días'), F('operator', 'Aplicó')], sortBy: 'date',
      extras: [{ label: 'Estado', fn: (r) => { const d = P.daysFrom(P.addDays(r.date, +r.withholding)); return d >= 0 ? `<span class="badge bad">Carencia: ${d} días</span>` : '<span class="badge ok">Libre</span>'; } }],
      seed: [['Cobre oxicloruro', 'Mildiu', 'Viñedo Alto', -4, '2 kg/ha', 14, 'Pedro'], ['Aceite mineral', 'Ácaros', 'Huerto Sur', -20, '1,5 L/100 L', 7, 'Pedro'], ['Spinosad', 'Trips', 'Parcela 1 - Hortalizas', -2, '0,4 L/ha', 3, 'Ana'], ['Azufre mojable', 'Oídio', 'Viñedo Alto', -40, '3 kg/ha', 5, 'Pedro']] },

    { id: 'finance', label: 'Ingresos y gastos', icon: '💵', group: 'Gestión', desc: 'Lo que entra y lo que sale de la granja.',
      fields: [F('date', 'Fecha', 'date'), F('type', 'Tipo', 'select', ['Ingreso', 'Gasto']), F('cat', 'Categoría', 'select', ['Ventas', 'Lana y fibra', 'Leche', 'Cosecha', 'Insumos', 'Alimento animal', 'Sueldos', 'Combustible', 'Veterinario', 'Mantenimiento']), F('desc', 'Detalle'), F('amount', 'Monto', 'number', '$')], sortBy: 'date',
      seed: [[-3, 'Ingreso', 'Cosecha', 'Venta de lechuga a restaurante', 360], [-6, 'Gasto', 'Alimento animal', 'Heno 20 fardos', 640], [-9, 'Ingreso', 'Leche', 'Entrega semanal de leche', 3150], [-12, 'Gasto', 'Veterinario', 'Vacunas ovejas', 410], [-18, 'Gasto', 'Combustible', 'Diésel tractor', 280],
        [-24, 'Ingreso', 'Ventas', 'Venta de 6 corderos', 1800], [-33, 'Gasto', 'Sueldos', 'Sueldo ayudante', 2400], [-40, 'Ingreso', 'Lana y fibra', 'Esquila: 12 fardos de lana', 2700], [-47, 'Gasto', 'Insumos', 'Semillas y plantines', 530], [-55, 'Gasto', 'Mantenimiento', 'Reparación de alambrados', 770],
        [-64, 'Ingreso', 'Leche', 'Entrega semanal de leche', 3050], [-78, 'Gasto', 'Sueldos', 'Sueldo ayudante', 2400], [-92, 'Ingreso', 'Cosecha', 'Papa a mayorista', 1260], [-105, 'Gasto', 'Alimento animal', 'Concentrado', 910], [-118, 'Ingreso', 'Ventas', 'Venta de 3 novillos', 5400],
        [-130, 'Gasto', 'Insumos', 'Fertilizante', 1250], [-146, 'Ingreso', 'Cosecha', 'Vendimia: 2,4 t de uva', 4800], [-160, 'Gasto', 'Mantenimiento', 'Service del tractor', 940], [-172, 'Ingreso', 'Leche', 'Entrega semanal de leche', 2980]] },
  ];

  P.mod = (id) => P.MODULES.find((m) => m.id === id);

  /* ---------- estado inicial ---------- */
  P.newState = (type, farmName) => {
    const rows = {}; let seq = 0;
    P.MODULES.forEach((m) => {
      rows[m.id] = m.seed.map((vals) => { const r = { id: `r${++seq}` }; m.fields.forEach((f, i) => { r[f.k] = f.t === 'date' && typeof vals[i] === 'number' ? P.iso(vals[i]) : vals[i]; }); return r; });
    });
    const words = ['arroyo', 'trigo', 'lluvia', 'cosecha', 'ovillo', 'sendero', 'cebada', 'establo', 'abeja', 'surco', 'colina', 'manzana', 'invierno', 'rebaño', 'huerta', 'nube', 'tractor', 'mimbre', 'pradera', 'sol', 'granero', 'viento', 'semilla', 'rocío'];
    const phrase = Array.from({ length: 12 }, () => words.splice(Math.floor(rnd() * words.length), 1)[0]);
    const groups = P.TYPES[type].groups;
    return { farmName, type, seq, rows, phrase, enabled: new Set(P.MODULES.filter((m) => groups.includes(m.group)).map((m) => m.id)), backups: [], dismissed: false };
  };
  P.WEATHER = [['Hoy', '⛅', 17, 9, 20], ['Mañana', '🌦️', 15, 8, 60], ['Miércoles', '🌧️', 13, 7, 85], ['Jueves', '☀️', 18, 8, 5], ['Viernes', '☀️', 20, 10, 0]];
})();

/* =====================================================================================================================
   Pantallas y navegación. Todo en memoria: ningún dato sale de la página.
   ===================================================================================================================== */
(function () {
  const P = window.AG;
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ICONS = {
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  };
  const icon = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const num = (n) => nf.format(n || 0);
  const money = (n) => `${n < 0 ? '-' : ''}$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.abs(Math.round(n || 0)))}`;
  const on = (root, ev, sel, fn) => root.addEventListener(ev, (e) => { const el = e.target.closest(sel); if (el && root.contains(el)) fn(e, el); });
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const HERD = ['sheep', 'cattle-dairy', 'cattle-beef', 'goats', 'deer', 'pigs'];

  /* ---------- avisos y ventanas ---------- */
  function toast(msg, kind = 'ok') {
    let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = `toast ${kind === 'ok' ? '' : kind}`; t.innerHTML = `${icon(kind === 'ok' ? 'check' : kind === 'bad' ? 'alert' : 'info')}<div>${esc(msg)}</div>`;
    box.appendChild(t); setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.overlay').at(-1)?.remove(); });
  function modal(title, body, foot = '') {
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="modal"><div class="modal-h"><h3>${esc(title)}</h3><button class="btn btn-ghost btn-icon" data-x>${icon('x')}</button></div><div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div>`;
    document.body.appendChild(ov); ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); }); return ov;
  }

  /* ---------- alertas y eventos (se calculan con los datos de los módulos activos) ---------- */
  const active = (id) => P.S.enabled.has(id);
  function alerts() {
    const R = P.S.rows; const out = [];
    if (active('pest-spray-log')) R['pest-spray-log'].forEach((r) => { const end = P.addDays(r.date, +r.withholding); const d = P.daysFrom(end); if (d >= 0) out.push({ lvl: 'bad', mod: 'pest-spray-log', title: `Carencia activa: ${r.product}`, msg: `${r.field}: no cosechar hasta el ${P.fmt(end)} (${d} días).` }); });
    if (active('aquaponics')) R.aquaponics.forEach((r) => { if (r.ph < 6.2 || r.ph > 7.6) out.push({ lvl: 'bad', mod: 'aquaponics', title: `pH fuera de rango en ${r.system}`, msg: `Está en ${r.ph}. Lo normal es entre 6,2 y 7,6.` }); });
    if (active('pasture')) R.pasture.forEach((r) => { const d = P.daysFrom(r.next); if (d <= 3) out.push({ lvl: 'warn', mod: 'pasture', title: `Rotar animales a ${r.paddock}`, msg: d < 0 ? `Tenía que rotarse hace ${-d} días.` : d === 0 ? 'Corresponde rotar hoy.' : `Corresponde rotar en ${d} días.` }); });
    if (active('bees')) { const late = R.bees.filter((r) => P.daysFrom(r.inspected) < -21); if (late.length) out.push({ lvl: 'warn', mod: 'bees', title: `${late.length} colmenas sin inspeccionar hace más de 21 días`, msg: late.map((r) => r.hive).join(', ') }); }
    HERD.concat('poultry').filter(active).forEach((id) => { const t = R[id].filter((r) => r.status === 'Tratamiento'); if (t.length) out.push({ lvl: 'warn', mod: id, title: `${t.length} ${P.mod(id).label.toLowerCase()} en tratamiento`, msg: t.map((r) => r.tag).join(', ') }); });
    if (active('crop-planning')) R['crop-planning'].forEach((r) => { const d = P.daysFrom(r.harvest); if (r.status !== 'Cosechado' && d >= 0 && d <= 21) out.push({ lvl: 'info', mod: 'crop-planning', title: `Cosecha próxima: ${r.crop}`, msg: `${r.field}, en ${d} días (${P.fmt(r.harvest)}).` }); });
    if (active('microgreens')) R.microgreens.filter((r) => r.status === 'Listo').forEach((r) => out.push({ lvl: 'info', mod: 'microgreens', title: `${r.crop}: listo para cosechar`, msg: `${r.trays} bandejas.` }));
    return out.sort((a, b) => ['bad', 'warn', 'info'].indexOf(a.lvl) - ['bad', 'warn', 'info'].indexOf(b.lvl));
  }
  function events() {
    const R = P.S.rows; const ev = []; const add = (date, title, mod, kind) => { if (date) ev.push({ date, title, mod, kind }); };
    if (active('crop-planning')) R['crop-planning'].forEach((r) => { if (r.status === 'Planificado') add(r.sow, `Sembrar ${r.crop}`, 'crop-planning', 'ok'); if (r.status !== 'Cosechado') add(r.harvest, `Cosechar ${r.crop}`, 'crop-planning', 'warn'); });
    if (active('pest-spray-log')) R['pest-spray-log'].forEach((r) => add(P.addDays(r.date, +r.withholding), `Fin de carencia: ${r.product}`, 'pest-spray-log', 'bad'));
    if (active('pasture')) R.pasture.forEach((r) => add(r.next, `Rotar a ${r.paddock}`, 'pasture', 'info'));
    if (active('bees')) R.bees.forEach((r) => add(P.addDays(r.inspected, 21), `Inspeccionar ${r.hive}`, 'bees', 'warn'));
    if (active('microgreens')) R.microgreens.filter((r) => r.status !== 'Cosechado').forEach((r) => add(r.harvest, `Cosechar ${r.crop}`, 'microgreens', 'ok'));
    if (active('aquaponics')) R.aquaponics.forEach((r) => add(P.addDays(r.check, 7), `Controlar ${r.system}`, 'aquaponics', 'info'));
    return ev;
  }

  /* ---------- piezas de pantalla ---------- */
  const page = (title, sub, ic, actions = '') => `<div class="page-h"><div><h1><span>${ic}</span>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div><div class="row wrap">${actions}</div></div>`;
  const kpi = (emoji, label, value, sub, tone = '') => `<div class="card kpi ${tone}"><div class="kpi-i">${emoji}</div><div><div class="small muted">${esc(label)}</div><div class="kpi-v">${value}</div><div class="tiny muted">${sub}</div></div></div>`;
  const hbars = (items) => { const max = Math.max(1, ...items.map((i) => i.value)); return items.map((i) => `<div class="hbar"><span class="clip">${esc(i.label)}</span><div><i style="width:${(i.value / max) * 100}%"></i></div><b class="right">${i.fmt ? i.fmt(i.value) : num(i.value)}</b></div>`).join('') || '<div class="empty">Sin datos.</div>'; };
  const monthKey = (d) => d.slice(0, 7);
  const last6 = () => Array.from({ length: 6 }, (_, k) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - k)); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; return { key, label: MONTHS[d.getMonth()].slice(0, 3) }; });
  function flow() {
    const fin = P.S.rows.finance; return last6().map((m) => ({ ...m, inc: fin.filter((r) => monthKey(r.date) === m.key && r.type === 'Ingreso').reduce((a, r) => a + +r.amount, 0), exp: fin.filter((r) => monthKey(r.date) === m.key && r.type === 'Gasto').reduce((a, r) => a + +r.amount, 0) }));
  }
  function barChart(series) {
    const max = Math.max(1, ...series.flatMap((s) => [s.inc, s.exp]));
    return `<div class="bars">${series.map((s) => `<div class="bcol"><div class="bpair"><i class="inc" style="height:${(s.inc / max) * 100}%" title="Ingresos ${money(s.inc)}"></i><i class="exp" style="height:${(s.exp / max) * 100}%" title="Gastos ${money(s.exp)}"></i></div><span class="tiny muted">${s.label}</span></div>`).join('')}</div><div class="legend"><span><b style="background:var(--brand)"></b>Ingresos</span><span><b style="background:var(--accent)"></b>Gastos</span></div>`;
  }

  /* ---------- panel ---------- */
  function dashboard(v) {
    const S = P.S; const R = S.rows;
    const area = R['field-management'].reduce((a, r) => a + (+r.area || 0), 0);
    const herd = HERD.filter(active).map((id) => ({ label: P.mod(id).label, value: R[id].filter((r) => r.status !== 'Vendido').length }));
    const heads = herd.reduce((a, h) => a + h.value, 0) + (active('poultry') ? R.poultry.reduce((a, r) => a + +r.birds, 0) : 0);
    const mk = P.iso(0).slice(0, 7); const fin = R.finance.filter((r) => monthKey(r.date) === mk);
    const inc = fin.filter((r) => r.type === 'Ingreso').reduce((a, r) => a + +r.amount, 0); const exp = fin.filter((r) => r.type === 'Gasto').reduce((a, r) => a + +r.amount, 0);
    const al = alerts(); const next = events().filter((e) => { const d = P.daysFrom(e.date); return d >= 0 && d <= 21; }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    v.innerHTML = `<div class="page">${page(S.farmName, `${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${P.TYPES[S.type].label}`, '🌾', `<button class="btn btn-primary" data-go="finance">${icon('plus')} Registrar movimiento</button>`)}
      <div class="grid g4 mb">${kpi('🗺️', 'Superficie', `${num(area)} ha`, `${R['field-management'].length} potreros y parcelas`)}${kpi('🐑', 'Animales', num(heads), 'cabezas de ganado y aves', 'accent')}${kpi('💵', 'Balance del mes', money(inc - exp), `${money(inc)} entra · ${money(exp)} sale`, 'info')}${kpi('⚠️', 'Alertas activas', al.length, `${al.filter((a) => a.lvl === 'bad').length} urgentes`, 'bad')}</div>
      <div class="grid dash2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        <div class="card"><div class="card-h"><h3>Ingresos y gastos</h3><p>Últimos 6 meses</p></div><div class="card-b">${barChart(flow())}</div></div>
        <div class="card"><div class="card-h"><h3>Clima</h3><p>Pronóstico simulado</p></div><div class="card-b"><div class="weather" style="grid-template-columns:repeat(5,1fr)">${P.WEATHER.map((w) => `<div><div class="tiny muted">${w[0].slice(0, 3)}</div><div class="e">${w[1]}</div><b class="small">${w[2]}°</b><div class="tiny muted">${w[3]}° · ${w[4]}%</div></div>`).join('')}</div><p class="tiny muted mt">Aviso: se espera lluvia el miércoles. Conviene mover la aplicación del jueves.</p></div></div>
      </div>
      <div class="grid g3 mt">
        <div class="card"><div class="card-h"><h3>Ganado</h3><p>Animales por especie</p></div><div class="card-b">${hbars(herd)}</div></div>
        <div class="card"><div class="card-h"><h3>Alertas</h3><p>Lo que pide atención</p></div><div class="card-b">${al.slice(0, 5).map((a) => `<div class="list-row" data-go="${a.mod}" style="cursor:pointer"><span class="badge ${a.lvl}">${a.lvl === 'bad' ? 'Urgente' : a.lvl === 'warn' ? 'Atención' : 'Aviso'}</span><div class="grow clip small">${esc(a.title)}</div></div>`).join('') || '<div class="empty">Todo en orden.</div>'}<div class="mt"><button class="btn btn-outline btn-sm" data-go="alerts">Ver todas</button></div></div></div>
        <div class="card"><div class="card-h"><h3>Próximas tareas</h3><p>En los próximos 21 días</p></div><div class="card-b">${next.map((e) => `<div class="list-row"><span class="badge">${P.fmt(e.date).slice(0, 5)}</span><div class="grow clip small">${esc(e.title)}</div></div>`).join('') || '<div class="empty">Sin tareas.</div>'}<div class="mt"><button class="btn btn-outline btn-sm" data-go="calendar">Abrir calendario</button></div></div></div>
      </div></div>`;
  }

  /* ---------- calendario ---------- */
  let calOff = 0;
  function calendar(v) {
    const draw = () => {
      const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + calOff); const y = base.getFullYear(); const m = base.getMonth();
      const lead = (base.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); const ev = events(); const cells = [];
      for (let i = 0; i < Math.ceil((lead + days) / 7) * 7; i++) {
        const dn = i - lead + 1; const dt = new Date(y, m, dn); const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        const list = ev.filter((e) => e.date === iso);
        cells.push(`<div class="day ${dt.getMonth() !== m ? 'out' : ''} ${iso === P.iso(0) ? 'today' : ''}"><span class="dn">${dt.getDate()}</span>${list.slice(0, 3).map((e) => `<a class="ev ${e.kind}" data-go="${e.mod}" title="${esc(e.title)}">${esc(e.title)}</a>`).join('')}${list.length > 3 ? `<div class="tiny muted">+${list.length - 3} más</div>` : ''}</div>`);
      }
      v.innerHTML = `<div class="page">${page('Calendario de la granja', 'Siembras, cosechas, carencias, rotaciones e inspecciones, juntas en un solo lugar', '📅', `<button class="btn btn-outline btn-icon" data-m="-1">‹</button><b style="min-width:150px;text-align:center">${MONTHS[m]} ${y}</b><button class="btn btn-outline btn-icon" data-m="1">›</button><button class="btn btn-outline btn-sm" data-m="0">Hoy</button>`)}
        <div class="cal">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => `<div class="dh">${d}</div>`).join('')}${cells.join('')}</div></div>`;
    };
    draw(); on(v, 'click', '[data-m]', (e, el) => { calOff = el.dataset.m === '0' ? 0 : calOff + +el.dataset.m; draw(); });
  }

  /* ---------- alertas ---------- */
  function alertsScreen(v) {
    const al = alerts();
    v.innerHTML = `<div class="page">${page('Alertas y soporte de decisiones', 'Se calculan solas con los registros de cada módulo', '⚠️')}
      <div class="stack">${al.map((a) => `<div class="card card-b row"><span class="badge ${a.lvl}">${a.lvl === 'bad' ? 'Urgente' : a.lvl === 'warn' ? 'Atención' : 'Aviso'}</span><div class="grow"><b>${esc(a.title)}</b><div class="small muted">${esc(a.msg)}</div></div><button class="btn btn-outline btn-sm" data-go="${a.mod}">Ver módulo</button></div>`).join('') || '<div class="card empty">Todo en orden. No hay alertas.</div>'}</div></div>`;
  }

  /* ---------- módulos (tabla + formulario genérico) ---------- */
  const BADGE = { ok: ['Activo', 'Sano', 'Creciendo', 'Fuerte', 'Postura', 'En ordeño', 'Cosechado', 'A', 'Activa', 'Engorde', 'Cría', 'Listo', 'Cosecha', 'Maduración'], warn: ['En descanso', 'Preparación', 'Planificado', 'Tratamiento', 'Media', 'Seca', 'B', 'Preñada', 'Brotación', 'Floración', 'Envero', 'Sembrado', 'Germinando', 'Cuajado'], bad: ['Débil', 'Enjambre', 'C'] };
  const isBadge = (f) => f.t === 'select' && ['status', 'quality', 'strength'].includes(f.k);
  const badge = (v) => `<span class="badge ${Object.keys(BADGE).find((k) => BADGE[k].includes(v)) || ''}">${esc(v)}</span>`;
  const cell = (m, f, r) => {
    const v = r[f.k];
    if (f.t === 'date') return P.fmt(v);
    if (f.t === 'number') return f.o === '$' ? (m.id === 'finance' ? `<b class="${r.type === 'Ingreso' ? 'green' : 'red'}">${r.type === 'Ingreso' ? '+' : '-'}${money(v)}</b>` : money(v)) : `${num(v)}${f.o ? ` <span class="muted tiny">${esc(f.o)}</span>` : ''}`;
    if (isBadge(f)) return badge(v);
    return esc(v);
  };
  const refOptions = () => P.S.rows['field-management'].map((r) => r.name);

  function openForm(m, row, done) {
    const isNew = !row; const r = row || {};
    const inputs = m.fields.map((f) => {
      const val = isNew ? (f.t === 'date' ? P.iso(0) : f.t === 'select' ? f.o[0] : f.t === 'ref' ? refOptions()[0] : '') : r[f.k];
      const input = f.t === 'select' || f.t === 'ref' ? `<select class="input" name="${f.k}">${(f.t === 'ref' ? refOptions() : f.o).map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>` : `<input class="input" name="${f.k}" type="${f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : 'text'}" ${f.t === 'number' ? 'step="any"' : ''} value="${esc(val)}">`;
      return `<div><label class="lbl">${esc(f.l)}${f.t === 'number' && f.o && f.o !== '$' ? ` (${esc(f.o)})` : ''}${f.o === '$' ? ' ($)' : ''}</label>${input}</div>`;
    }).join('');
    const ov = modal(`${isNew ? 'Nuevo registro' : 'Editar registro'} · ${m.label}`, `<form id="f" class="grid g2">${inputs}</form><div class="error small red" id="err" style="margin-top:8px"></div>`, `${isNew ? '' : '<button class="btn btn-danger btn-sm" data-del style="margin-right:auto">Eliminar</button>'}<button class="btn btn-outline" data-x>Cancelar</button><button class="btn btn-primary" data-save>Guardar</button>`);
    on(ov, 'click', '[data-save]', () => {
      const data = {}; for (const f of m.fields) { const el = $(`[name="${f.k}"]`, ov); let v = el.value.trim(); if (f.t === 'number') { if (v === '' || isNaN(+v)) { $('#err', ov).textContent = `"${f.l}" tiene que ser un número.`; return; } v = +v; } else if (!v) { $('#err', ov).textContent = `Completá "${f.l}".`; return; } data[f.k] = v; }
      if (isNew) P.S.rows[m.id].unshift({ id: `r${++P.S.seq}`, ...data }); else Object.assign(r, data);
      ov.remove(); toast(isNew ? 'Registro agregado.' : 'Cambios guardados.'); done(); buildNav();
    });
    on(ov, 'click', '[data-del]', () => { P.S.rows[m.id] = P.S.rows[m.id].filter((x) => x !== r); ov.remove(); toast('Registro eliminado.', 'warn'); done(); buildNav(); });
  }

  let pendingQ = '';
  function moduleScreen(v, id) {
    const m = P.mod(id); const q0 = pendingQ; pendingQ = ''; let q = q0; let flt = '';
    const sf = m.fields.find((f) => f.k === 'status' && f.t === 'select');
    v.innerHTML = `<div class="page">${page(m.label, m.desc, m.icon, `<button class="btn btn-outline" data-imp>${icon('upload')} Importar CSV</button><button class="btn btn-outline" data-exp>${icon('download')} Exportar</button><button class="btn btn-primary" data-new>${icon('plus')} Nuevo registro</button>`)}
      <div class="grid g3 mb" id="kp"></div>
      <div class="card"><div class="card-b row wrap" style="border-bottom:1px solid var(--line)"><div class="search grow" style="min-width:200px;max-width:340px">${icon('search')}<input class="input" id="q" placeholder="Buscar en ${esc(m.label.toLowerCase())}…" value="${esc(q0)}" autocomplete="off"></div>${sf ? `<div class="row wrap" id="chips"><button class="chip on" data-f="">Todos</button>${sf.o.map((o) => `<button class="chip" data-f="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}</div><div class="table-wrap flush" id="tbl"></div></div></div>`;
    const draw = () => {
      let rows = [...P.S.rows[id]]; if (m.sortBy) rows.sort((a, b) => b[m.sortBy].localeCompare(a[m.sortBy]));
      const t = q.trim().toLowerCase(); if (t) rows = rows.filter((r) => m.fields.some((f) => String(r[f.k]).toLowerCase().includes(t))); if (flt) rows = rows.filter((r) => r.status === flt);
      const sumF = m.sum && m.fields.find((f) => f.k === m.sum[0]); const total = sumF ? P.S.rows[id].reduce((a, r) => a + +r[sumF.k], 0) : 0;
      $('#kp', v).innerHTML = kpi(m.icon, 'Registros', P.S.rows[id].length, 'en total') + (sumF ? kpi('∑', m.sum[1], sumF.o === '$' ? money(total) : `${num(total)}${sumF.o ? ` ${sumF.o}` : ''}`, 'suma de todos los registros', 'accent') : '') + kpi('🔎', 'Mostrando', rows.length, t || flt ? 'con el filtro aplicado' : 'sin filtros', 'info');
      $('#tbl', v).innerHTML = rows.length ? `<table><thead><tr>${m.fields.map((f) => `<th class="${f.t === 'number' ? 'num' : ''}">${esc(f.l)}</th>`).join('')}${(m.extras || []).map((x) => `<th>${esc(x.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr class="click" data-id="${r.id}">${m.fields.map((f) => `<td class="${f.t === 'number' ? 'num' : ''}">${cell(m, f, r)}</td>`).join('')}${(m.extras || []).map((x) => `<td>${x.fn(r)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<div class="empty">No hay registros que coincidan.</div>';
    };
    draw();
    on(v, 'input', '#q', (e, el) => { q = el.value; draw(); });
    on(v, 'click', '[data-f]', (e, el) => { flt = el.dataset.f; $$('#chips .chip', v).forEach((c) => c.classList.toggle('on', c === el)); draw(); });
    on(v, 'click', '[data-new]', () => openForm(m, null, draw));
    on(v, 'click', 'tr[data-id]', (e, el) => openForm(m, P.S.rows[id].find((r) => r.id === el.dataset.id), draw));
    on(v, 'click', '[data-imp]', () => toast('Importar CSV: en el programa real se elige un archivo y se mapean las columnas. Aquí es solo una simulación.', 'info'));
    on(v, 'click', '[data-exp]', () => toast('Exportar: en el programa real se descarga un CSV. Aquí es solo una simulación.', 'info'));
  }

  /* ---------- reportes ---------- */
  function reports(v) {
    const R = P.S.rows; const fin = R.finance; const cats = {};
    fin.filter((r) => r.type === 'Gasto').forEach((r) => { cats[r.cat] = (cats[r.cat] || 0) + +r.amount; });
    const totInc = fin.filter((r) => r.type === 'Ingreso').reduce((a, r) => a + +r.amount, 0); const totExp = fin.filter((r) => r.type === 'Gasto').reduce((a, r) => a + +r.amount, 0);
    const herd = HERD.filter(active).map((id) => { const rs = R[id].filter((r) => r.status !== 'Vendido'); return { id, label: P.mod(id).label, icon: P.mod(id).icon, n: rs.length, w: rs.length ? rs.reduce((a, r) => a + +r.weight, 0) / rs.length : 0 }; });
    v.innerHTML = `<div class="page">${page('Reportes y análisis', 'Resumen de la granja listo para imprimir o exportar', '📊', `<button class="btn btn-outline" data-exp>${icon('download')} Exportar PDF</button><button class="btn btn-outline" data-exp>${icon('download')} Exportar CSV</button>`)}
      <div class="grid g3 mb">${kpi('📈', 'Ingresos (6 meses)', money(totInc), 'según Ingresos y gastos')}${kpi('📉', 'Gastos (6 meses)', money(totExp), 'según Ingresos y gastos', 'accent')}${kpi('💰', 'Resultado', money(totInc - totExp), totInc ? `margen ${num(((totInc - totExp) / totInc) * 100)}%` : '', 'info')}</div>
      <div class="grid g2"><div class="card"><div class="card-h"><h3>Evolución mensual</h3></div><div class="card-b">${barChart(flow())}</div></div>
      <div class="card"><div class="card-h"><h3>Gastos por categoría</h3></div><div class="card-b">${hbars(Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, fmt: money })))}</div></div></div>
      ${herd.length ? `<div class="card mt"><div class="card-h"><h3>Inventario de ganado</h3><p>Sin contar animales vendidos</p></div><div class="table-wrap"><table><thead><tr><th>Especie</th><th class="num">Cabezas</th><th class="num">Peso promedio</th></tr></thead><tbody>${herd.map((h) => `<tr><td>${h.icon} ${esc(h.label)}</td><td class="num">${h.n}</td><td class="num">${num(h.w)} kg</td></tr>`).join('')}</tbody></table></div></div>` : ''}</div>`;
    on(v, 'click', '[data-exp]', () => toast('En el programa real se genera el archivo. Aquí es solo una simulación.', 'info'));
  }

  /* ---------- respaldo cifrado ---------- */
  function backup(v) {
    const S = P.S;
    const draw = () => {
      v.innerHTML = `<div class="page">${page('Respaldo cifrado', 'Tus datos viven en tu equipo. Con la frase de recuperación los restaurás en cualquier otro.', '🔐')}
        <div class="grid g2"><div class="card"><div class="card-h"><h3>Frase de recuperación</h3><p>Guardala en papel. Sin ella no se puede restaurar.</p></div><div class="card-b"><div class="phrase">${S.phrase.map((w, i) => `<span><em>${i + 1}</em>${w}</span>`).join('')}</div><div class="notice mt">En esta demostración la frase es inventada. En el programa real se genera en tu equipo y nunca se envía a ningún lado.</div></div></div>
        <div class="card"><div class="card-h"><h3>Crear respaldo</h3><p>Un archivo cifrado con todos los registros</p></div><div class="card-b stack"><button class="btn btn-primary" data-bk>${icon('lock')} Crear respaldo ahora</button><div class="progress hidden" id="pg"><i></i></div><div><label class="lbl">Restaurar con la frase</label><div class="row"><input class="input" id="rp" placeholder="Escribí las 12 palabras separadas por espacios"><button class="btn btn-outline" data-rs>Restaurar</button></div></div></div></div></div>
        <div class="card mt"><div class="card-h"><h3>Respaldos creados</h3></div><div class="table-wrap">${S.backups.length ? `<table><thead><tr><th>Fecha</th><th>Tamaño</th><th>Cifrado</th></tr></thead><tbody>${S.backups.map((b) => `<tr><td>${esc(b.date)}</td><td>${esc(b.size)}</td><td><span class="badge ok">Cifrado</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Todavía no hay respaldos en esta demostración.</div>'}</div></div></div>`;
    };
    draw();
    on(v, 'click', '[data-bk]', () => { const pg = $('#pg', v); pg.classList.remove('hidden'); requestAnimationFrame(() => requestAnimationFrame(() => { $('i', pg).style.width = '100%'; })); setTimeout(() => { const n = Object.values(S.rows).reduce((a, r) => a + r.length, 0); S.backups.unshift({ date: new Date().toLocaleString('es-AR'), size: `${(n * 0.9 + 12).toFixed(0)} KB` }); toast('Respaldo cifrado creado (simulado).'); draw(); }, 1500); });
    on(v, 'click', '[data-rs]', () => { const t = $('#rp', v).value.trim().toLowerCase().split(/\s+/).join(' '); if (t === S.phrase.join(' ')) toast('Frase correcta. Los datos se restaurarían (simulado).'); else toast('La frase no coincide. Revisá las palabras y el orden.', 'bad'); });
  }

  /* ---------- ajustes ---------- */
  function settings(v) {
    const S = P.S;
    v.innerHTML = `<div class="page">${page('Ajustes', 'Datos de la granja y módulos activos', '⚙️')}
      <div class="card mb"><div class="card-h"><h3>Granja</h3></div><div class="card-b row wrap"><div class="grow" style="min-width:220px"><label class="lbl">Nombre</label><input class="input" id="fn" value="${esc(S.farmName)}"></div><div style="align-self:end"><button class="btn btn-primary" data-sn>Guardar</button></div></div></div>
      <div class="card"><div class="card-h"><h3>Módulos</h3><p>Activá solo lo que usás: el menú se adapta (como el selector de módulos del programa real)</p></div><div class="card-b stack">${P.GROUPS.filter((g) => g !== 'Gestión').map((g) => `<div><div class="small bold mb" style="margin-bottom:8px">${g}</div><div class="grid g3">${P.MODULES.filter((m) => m.group === g).map((m) => `<label class="switch"><input type="checkbox" data-mod="${m.id}" ${S.enabled.has(m.id) ? 'checked' : ''}> ${m.icon} ${esc(m.label)}</label>`).join('')}</div></div>`).join('')}</div></div>
      <div class="mt"><button class="btn btn-outline" data-reset>Reiniciar la demostración</button></div></div>`;
    on(v, 'click', '[data-sn]', () => { S.farmName = $('#fn', v).value.trim() || S.farmName; $('#brand-name').textContent = S.farmName; toast('Nombre guardado.'); });
    on(v, 'change', '[data-mod]', (e, el) => { el.checked ? S.enabled.add(el.dataset.mod) : S.enabled.delete(el.dataset.mod); buildNav(); toast(`${P.mod(el.dataset.mod).label}: ${el.checked ? 'activado' : 'desactivado'}.`, 'info'); });
    on(v, 'click', '[data-reset]', () => showSetup());
  }

  /* ---------- estructura y navegación ---------- */
  const SCREENS = { dashboard, calendar, alerts: alertsScreen, reports, backup, settings };
  function buildNav() {
    const S = P.S; const nAl = alerts().length; const item = (id, label, e, n = 0) => `<a data-go="${id}" class="${S.cur === id ? 'on' : ''}"><span class="e">${e}</span>${esc(label)}${n ? `<span class="n">${n}</span>` : ''}</a>`;
    $('#nav').innerHTML = item('dashboard', 'Panel', '🏠') + item('calendar', 'Calendario', '📅') + item('alerts', 'Alertas', '⚠️', nAl)
      + P.GROUPS.map((g) => { const ms = P.MODULES.filter((m) => m.group === g && S.enabled.has(m.id)); return ms.length ? `<h4>${g}</h4>${ms.map((m) => item(m.id, m.label, m.icon)).join('')}` : ''; }).join('')
      + '<h4>Sistema</h4>' + item('reports', 'Reportes', '📊') + item('backup', 'Respaldo cifrado', '🔐') + item('settings', 'Ajustes', '⚙️');
    const b = $('#bn'); if (b) { b.textContent = nAl; b.style.display = nAl ? '' : 'none'; }
  }
  function go(name) {
    const S = P.S; if (!S) return;
    if (!SCREENS[name] && !P.mod(name)) name = 'dashboard';
    if (P.mod(name) && !S.enabled.has(name)) { toast('Ese módulo está desactivado. Se activa en Ajustes.', 'warn'); name = 'dashboard'; }
    S.cur = name; history.replaceState(null, '', `#/${name}`); buildNav(); document.body.classList.remove('nav-open');
    const view = $('#view'); const fresh = view.cloneNode(false); view.replaceWith(fresh);
    (SCREENS[name] || ((el) => moduleScreen(el, name)))(fresh); window.scrollTo(0, 0);
  }
  function buildShell() {
    $('#app').innerHTML = `<div class="demo-bar"><span>ℹ️ <b>Demostración interactiva</b> de Plexi Agriculture · los datos son de ejemplo y no se guardan</span><button data-reset>Reiniciar</button></div>
      <div class="shell"><aside class="sidebar"><div class="brand"><span class="logo">🌾</span><div><b id="brand-name">${esc(P.S.farmName)}</b><span>Plexi Agriculture</span></div></div><nav class="nav" id="nav"></nav><div class="userbox">Una sola granja, sin cuentas ni contraseñas.<br>Todo se guarda en este equipo.</div></aside>
      <div class="main-col"><header class="topbar"><button class="btn btn-ghost btn-icon menu-btn" data-menu>${icon('menu')}</button><div class="search relative">${icon('search')}<input class="input" id="gs" placeholder="Buscar animales, parcelas, cultivos…" autocomplete="off"><div class="drop hidden" id="gres"></div></div><div class="grow"></div><div class="bell relative"><button class="btn btn-ghost btn-icon" data-bell>${icon('bell')}<span class="n" id="bn"></span></button><div class="drop hidden" id="bdrop"></div></div></header><main id="view"></main></div></div>`;
  }

  /* ---------- eventos globales (una sola vez) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    const goEl = t.closest('[data-go]'); if (goEl && P.S) { e.preventDefault(); $('#gres')?.classList.add('hidden'); if (goEl.dataset.q) { pendingQ = goEl.dataset.q; const gs = $('#gs'); if (gs) gs.value = ''; } go(goEl.dataset.go); return; }
    if (t.closest('[data-menu]')) return document.body.classList.toggle('nav-open');
    if (document.body.classList.contains('nav-open') && !t.closest('.sidebar')) document.body.classList.remove('nav-open');
    if (t.closest('[data-reset]') && t.closest('.demo-bar')) return showSetup();
    if (t.closest('[data-bell]')) { const d = $('#bdrop'); const al = alerts(); d.innerHTML = `<div class="it"><b>Alertas</b></div>${al.slice(0, 6).map((a) => `<div class="it" data-go="${a.mod}"><span class="badge ${a.lvl}">${a.lvl === 'bad' ? 'Urgente' : a.lvl === 'warn' ? 'Atención' : 'Aviso'}</span><div class="small" style="margin-top:4px">${esc(a.title)}</div></div>`).join('') || '<div class="empty">Todo tranquilo.</div>'}<div class="it" data-go="alerts" style="text-align:center">Ver todas</div>`; d.classList.toggle('hidden'); return; }
    if (!t.closest('.bell')) $('#bdrop')?.classList.add('hidden'); if (!t.closest('.search')) $('#gres')?.classList.add('hidden');
  });
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'gs') return; const gres = $('#gres'); const t = e.target.value.trim().toLowerCase(); if (t.length < 2) return gres.classList.add('hidden');
    const hits = []; P.MODULES.filter((m) => P.S.enabled.has(m.id)).forEach((m) => P.S.rows[m.id].forEach((r) => { if (m.fields.some((f) => String(r[f.k]).toLowerCase().includes(t))) hits.push({ m, r }); }));
    gres.innerHTML = hits.slice(0, 8).map(({ m, r }) => `<div class="it" data-go="${m.id}" data-q="${esc(t)}">${m.icon} <b>${esc(r[m.fields[0].k])}</b> <span class="muted small">· ${esc(m.label)}</span></div>`).join('') || '<div class="empty">Sin resultados.</div>'; gres.classList.remove('hidden');
  });

  /* ---------- ingreso: nombre y tipo de granja, luego frase de recuperación ---------- */
  let chosen = 'mixta';
  function showSetup() {
    document.body.classList.remove('nav-open'); P.S = null; history.replaceState(null, '', location.pathname + location.search);
    $('#app').innerHTML = `<div class="demo-bar"><span>ℹ️ <b>Demostración interactiva</b> de Plexi Agriculture</span><span></span></div><div class="login"><div class="login-box"><h1>🌾 PLEXI AGRICULTURE</h1><div class="sub">Gestión de campo · funciona sin internet · Demostración interactiva</div>
      <div class="login-card stack"><div><label class="lbl" style="color:rgba(255,255,255,.75)">1. Nombre de la granja</label><input class="input" id="fname" value="Estancia Los Álamos"></div>
      <div><label class="lbl" style="color:rgba(255,255,255,.75)">2. ¿Qué producís?</label><div class="type-grid" id="types">${Object.entries(P.TYPES).map(([k, t]) => `<button class="type-opt ${k === chosen ? 'on' : ''}" data-type="${k}"><span class="e">${t.icon}</span>${t.label}</button>`).join('')}</div><div class="small" style="opacity:.6;margin-top:8px" id="thint">${esc(P.TYPES[chosen].demo)}</div></div>
      <button class="btn btn-accent btn-lg btn-block" data-create>Crear granja</button>
      <p class="small center" style="opacity:.5;margin:0">No hay usuarios ni contraseñas: es una sola granja en tu equipo. Los datos son de ejemplo y nada se guarda.</p></div></div></div>`;
  }
  function showPhrase() {
    $('#app').innerHTML = `<div class="demo-bar"><span>ℹ️ <b>Demostración interactiva</b> de Plexi Agriculture</span><span></span></div><div class="login"><div class="login-box"><h1>🔐 Tu frase de recuperación</h1><div class="sub">Con estas 12 palabras restaurás tus datos si cambiás de equipo</div>
      <div class="login-card stack"><div class="phrase">${P.S.phrase.map((w, i) => `<span><em>${i + 1}</em>${w}</span>`).join('')}</div><label class="switch" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)"><input type="checkbox" id="saved"> Ya la anoté en un lugar seguro</label><button class="btn btn-accent btn-lg btn-block" data-enter>Entrar a ${esc(P.S.farmName)}</button></div></div></div>`;
  }
  document.addEventListener('click', (e) => {
    const ty = e.target.closest('[data-type]'); if (ty) { chosen = ty.dataset.type; $$('.type-opt').forEach((b) => b.classList.toggle('on', b === ty)); $('#thint').textContent = P.TYPES[chosen].demo; }
    if (e.target.closest('[data-create]')) { P.S = P.newState(chosen, $('#fname').value.trim() || 'Mi granja'); showPhrase(); }
    if (e.target.closest('[data-enter]')) { if (!$('#saved').checked) return toast('Marcá que anotaste la frase para continuar.', 'warn'); buildShell(); go('dashboard'); }
  });

  /* ---------- arranque: ?tipo=ganadera|cultivos|mixta&ir=sheep entra directo ---------- */
  const qs = new URLSearchParams(location.search);
  if (P.TYPES[qs.get('tipo')]) { chosen = qs.get('tipo'); P.S = P.newState(chosen, 'Estancia Los Álamos'); buildShell(); go(qs.get('ir') || location.hash.replace('#/', '') || 'dashboard'); } else showSetup();
})();
