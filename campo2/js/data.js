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
      fields: [F('crop', 'Cultivo'), F('field', 'Parcela', 'ref'), F('date', 'Fecha', 'date'), F('qty', 'Cantidad', 'number', 'kg'), F('quality', 'Calidad', 'select', ['A', 'B', 'C']), F('value', 'Valor', 'number', 'NZ$')],
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

    livestock('sheep', 'Ovejas', '🐑', ['Merino', 'Romney', 'Corriedale', 'Texel'], { n: 16, pre: 'NZ', base: 2100, w: [42, 82] }),
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
      fields: [F('date', 'Fecha', 'date'), F('type', 'Tipo', 'select', ['Ingreso', 'Gasto']), F('cat', 'Categoría', 'select', ['Ventas', 'Lana y fibra', 'Leche', 'Cosecha', 'Insumos', 'Alimento animal', 'Sueldos', 'Combustible', 'Veterinario', 'Mantenimiento']), F('desc', 'Detalle'), F('amount', 'Monto', 'number', 'NZ$')], sortBy: 'date',
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
    return { farmName, type, seq, rows, phrase, enabled: new Set(P.MODULES.filter((m) => groups.includes(m.group)).map((m) => m.id)), backups: [], country: 'NZ', dismissed: false };
  };
  P.COUNTRIES = { NZ: { label: 'Nueva Zelanda', cur: 'NZ$', area: 'ha' }, AU: { label: 'Australia', cur: 'A$', area: 'ha' }, AR: { label: 'Argentina', cur: 'US$', area: 'ha' }, ES: { label: 'España', cur: '€', area: 'ha' }, US: { label: 'Estados Unidos', cur: 'US$', area: 'acres' } };
  P.WEATHER = [['Hoy', '⛅', 17, 9, 20], ['Mañana', '🌦️', 15, 8, 60], ['Miércoles', '🌧️', 13, 7, 85], ['Jueves', '☀️', 18, 8, 5], ['Viernes', '☀️', 20, 10, 0]];
})();
