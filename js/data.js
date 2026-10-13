/* Datos de ejemplo de la demostración. Nada de esto sale de la página ni se guarda: al recargar vuelve todo a empezar. */
(function () {
  const P = (window.Plexi = window.Plexi || {});

  /* ---------- tipos de comercio (lo mismo que ofrece Configuración en el programa real) ---------- */
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Talle único'];
  const COLORS = ['Negro', 'Blanco', 'Azul marino', 'Gris', 'Beige', 'Verde oliva', 'Bordó', 'Celeste', 'Rojo'];
  const GENDERS = ['Hombre', 'Mujer', 'Unisex', 'Niños'];
  const MATERIALS = ['Algodón', 'Denim', 'Lino', 'Poliéster', 'Mezcla de lana', 'Seda', 'Cuero'];
  P.TYPES = {
    general: { label: 'Comercio general', demo: 'Un poco de todo: almacén, kiosco, bazar, librería…', hint: 'Un poco de todo: almacén, kiosco, bazar, librería… Los productos llevan nombre, marca, precio y stock.', fields: [], ex: 'Fideos tallarín 500 g', cats: { 'Almacén': ['Fideos y arroz', 'Aceites', 'Conservas', 'Infusiones'], 'Bebidas': ['Gaseosas', 'Aguas y jugos', 'Cervezas', 'Vinos'], 'Lácteos y fiambres': ['Leches', 'Quesos', 'Fiambres'], 'Golosinas y kiosco': ['Alfajores', 'Chocolates', 'Snacks'], 'Limpieza': ['Detergentes', 'Papel'], 'Perfumería': ['Higiene personal', 'Cuidado del cabello'], 'Bazar y hogar': ['Cocina', 'Baño', 'Iluminación'], 'Librería': ['Cuadernos', 'Lapiceras'], 'Electrónica': ['Auriculares', 'Cargadores', 'Pilas'], 'Indumentaria': ['Remeras', 'Medias'] } },
    almacen: { label: 'Almacén, kiosco y supermercado de barrio', demo: 'Comestibles, bebidas, golosinas y limpieza', hint: 'Comestibles, bebidas, golosinas y limpieza. Se vende por unidad.', fields: [], ex: 'Gaseosa cola 2,25 L', cats: { 'Bebidas': ['Gaseosas', 'Aguas y jugos', 'Cervezas'], 'Golosinas y kiosco': ['Alfajores', 'Chocolates', 'Caramelos', 'Snacks'], 'Lácteos y fiambres': ['Leches', 'Quesos', 'Fiambres', 'Yogures'], 'Almacén': ['Fideos y arroz', 'Aceites', 'Conservas', 'Infusiones'], 'Panadería': ['Pan', 'Facturas'], 'Congelados': ['Helados', 'Hamburguesas'], 'Limpieza': ['Detergentes', 'Papel'] } },
    ropa: { label: 'Ropa y calzado', demo: 'Talle, color, género y material en cada producto', hint: 'Cada producto pide talle, color, género y material.', fields: [{ key: 'size', label: 'Talle', options: SIZES, def: 'M' }, { key: 'color', label: 'Color', options: COLORS }, { key: 'gender', label: 'Género', options: GENDERS, def: 'Unisex' }, { key: 'material', label: 'Material', options: MATERIALS }], ex: 'Remera clásica negra cuello redondo', cats: { 'Remeras': ['Cuello redondo', 'Polo', 'Estampada'], 'Camisas': ['Casual', 'Formal', 'Denim'], 'Jeans': ['Slim', 'Recto', 'Chupín'], 'Vestidos': ['Midi', 'Casual', 'De fiesta'], 'Camperas': ['Bomber', 'De jean', 'Inflable'], 'Buzos': ['Canguro', 'Con cierre'], 'Pantalones': ['Chino', 'Cargo'], 'Sweaters': ['Cárdigan', 'Cuello alto'], 'Ropa deportiva': ['Jogging', 'Calzas'] } },
    ferreteria: { label: 'Ferretería y materiales', demo: 'Medida, material y color en cada producto', hint: 'Cada producto pide medida, material y color.', fields: [{ key: 'size', label: 'Medida', ph: 'Ej.: 1/2 pulgada, 6 mm' }, { key: 'material', label: 'Material', ph: 'Ej.: acero, PVC, cobre' }, { key: 'color', label: 'Color', ph: 'Ej.: blanco' }], ex: 'Taladro percutor 650 W', cats: { 'Herramientas manuales': ['Martillos', 'Destornilladores', 'Llaves y pinzas'], 'Herramientas eléctricas': ['Taladros', 'Amoladoras', 'Discos'], 'Electricidad': ['Cables', 'Tomas y llaves', 'Lámparas'], 'Plomería': ['Caños', 'Canillas', 'Selladores'], 'Pinturas': ['Látex', 'Rodillos y pinceles'], 'Tornillería': ['Tornillos', 'Tarugos'], 'Construcción': ['Cemento', 'Adhesivos'], 'Jardín': ['Mangueras', 'Fertilizantes'], 'Seguridad': ['Candados', 'Protección'] } },
    libreria: { label: 'Librería y papelería', demo: '', hint: 'Cada producto pide formato y color.', fields: [{ key: 'size', label: 'Formato', ph: 'Ej.: A4, 48 hojas, tapa dura' }, { key: 'color', label: 'Color', ph: 'Ej.: azul' }], ex: 'Cuaderno tapa dura 48 hojas', cats: { 'Cuadernos y papelería': ['Cuadernos', 'Resmas'], 'Escritura': ['Lapiceras', 'Marcadores'], 'Libros': ['Infantiles', 'Texto escolar'], 'Arte y manualidades': ['Pinturas', 'Pegamentos'] } },
    perfumeria: { label: 'Perfumería y cosmética', demo: '', hint: 'Cada producto pide presentación y tono o fragancia.', fields: [{ key: 'size', label: 'Presentación', ph: 'Ej.: 100 ml, 250 g' }, { key: 'color', label: 'Tono o fragancia', ph: 'Ej.: rosa nude, vainilla' }], ex: 'Shampoo reparador 400 ml', cats: { 'Perfumes': ['Mujer', 'Hombre'], 'Maquillaje': ['Rostro', 'Ojos', 'Labios'], 'Cuidado de la piel': ['Cremas', 'Protector solar'], 'Cuidado del cabello': ['Shampoo', 'Tinturas'] } },
    bazar: { label: 'Bazar y hogar', demo: '', hint: 'Cada producto pide medida o capacidad, color y material.', fields: [{ key: 'size', label: 'Medida o capacidad', ph: 'Ej.: 24 cm, 500 ml' }, { key: 'color', label: 'Color', ph: 'Ej.: blanco' }, { key: 'material', label: 'Material', ph: 'Ej.: vidrio, acero' }], ex: 'Sartén antiadherente 24 cm', cats: { 'Cocina': ['Ollas y sartenes', 'Utensilios'], 'Mesa': ['Vasos', 'Platos'], 'Decoración': ['Velas', 'Macetas'], 'Textiles': ['Sábanas', 'Cortinas'] } },
    electronica: { label: 'Electrónica y tecnología', demo: '', hint: 'Cada producto pide modelo o capacidad y color.', fields: [{ key: 'size', label: 'Modelo o capacidad', ph: 'Ej.: 64 GB, modelo A12' }, { key: 'color', label: 'Color', ph: 'Ej.: negro' }], ex: 'Auriculares con cable', cats: { 'Celulares y accesorios': ['Fundas', 'Cargadores'], 'Audio': ['Auriculares', 'Parlantes'], 'Computación': ['Teclados y mouse', 'Cables'], 'Energía': ['Pilas', 'Zapatillas'] } },
  };
  /* Fábrica: rubro con productos genéricos (A, B y C) para que cualquier industria se vea reflejada. Es el único rubro que muestra la pantalla Factory. */
  P.TYPES.fabrica = { label: 'Fábrica', demo: 'Materias primas, insumos y productos terminados (A, B y C)', hint: 'Cada producto pide su unidad de medida: unidad, kg, metro, litro o caja.', fields: [{ key: 'size', label: 'Unidad de medida', options: ['Unidad', 'Kg', 'Metro', 'Litro', 'Caja'], def: 'Unidad' }], ex: 'Producto terminado A', cats: { 'Productos terminados': ['Línea A', 'Línea B'], 'Semielaborados': ['Conjuntos'], 'Materias primas': ['Sólidas', 'Líquidas'], 'Insumos': ['Embalaje', 'Consumibles'], 'Repuestos': ['Mecánicos'] } };
  P.DEMO_TYPES = ['general', 'almacen', 'ropa', 'ferreteria', 'fabrica'];

  /* ---------- catálogos de la demostración: [categoría, subcategoría, nombre, marca, costo, atributos?] ---------- */
  const CATALOGS = {
    general: [
      ['Almacén', 'Fideos y arroz', 'Fideos tallarín 500 g', 'Doña Marta', 650], ['Almacén', 'Fideos y arroz', 'Arroz largo fino 1 kg', 'Doña Marta', 1100],
      ['Almacén', 'Aceites', 'Aceite de girasol 900 ml', 'Campo Verde', 1900], ['Almacén', 'Conservas', 'Atún al natural 170 g', 'Mar Azul', 1500],
      ['Almacén', 'Infusiones', 'Yerba mate 1 kg', 'Don Tomás', 2800], ['Almacén', 'Infusiones', 'Café molido 250 g', 'Don Tomás', 3200],
      ['Bebidas', 'Gaseosas', 'Gaseosa cola 2,25 L', 'Brisa', 1600], ['Bebidas', 'Gaseosas', 'Gaseosa lima-limón 1,5 L', 'Brisa', 1100],
      ['Bebidas', 'Aguas y jugos', 'Agua mineral 2 L', 'Manantial', 700], ['Bebidas', 'Cervezas', 'Cerveza rubia 1 L', 'Cervecería Andina', 1500],
      ['Bebidas', 'Vinos', 'Vino tinto malbec 750 ml', 'Bodega Los Sauces', 3500], ['Lácteos y fiambres', 'Leches', 'Leche entera 1 L', 'La Pradera', 1100],
      ['Lácteos y fiambres', 'Quesos', 'Queso cremoso 500 g', 'La Pradera', 3600], ['Lácteos y fiambres', 'Fiambres', 'Jamón cocido 200 g', 'El Gaucho', 2400],
      ['Golosinas y kiosco', 'Alfajores', 'Alfajor triple de chocolate', 'Dulce Hogar', 450], ['Golosinas y kiosco', 'Chocolates', 'Chocolate con leche 100 g', 'Dulce Hogar', 1100],
      ['Golosinas y kiosco', 'Snacks', 'Papas fritas 120 g', 'Sol Naciente', 1000], ['Limpieza', 'Detergentes', 'Detergente 750 ml', 'Brillo Hogar', 1300],
      ['Limpieza', 'Papel', 'Papel higiénico x4', 'Nube', 1900], ['Perfumería', 'Cuidado del cabello', 'Shampoo 400 ml', 'Aurora', 2300],
      ['Perfumería', 'Higiene personal', 'Jabón de tocador x3', 'Aurora', 1300], ['Bazar y hogar', 'Cocina', 'Set de 6 vasos de vidrio', 'Casa Linda', 4200],
      ['Bazar y hogar', 'Cocina', 'Sartén antiadherente 24 cm', 'Casa Linda', 9500], ['Bazar y hogar', 'Iluminación', 'Lámpara LED 9 W', 'Lumina', 1500],
      ['Librería', 'Cuadernos', 'Cuaderno tapa dura 48 hojas', 'Papelera Norte', 2200], ['Librería', 'Lapiceras', 'Lapiceras azules x3', 'Papelera Norte', 900],
      ['Electrónica', 'Auriculares', 'Auriculares con cable', 'Tecno Pop', 5200], ['Electrónica', 'Cargadores', 'Cargador USB 2 A', 'Tecno Pop', 4300],
      ['Electrónica', 'Pilas', 'Pilas AA x4', 'Tecno Pop', 2600], ['Indumentaria', 'Remeras', 'Remera básica de algodón', 'Cumbre', 3500],
    ],
    almacen: [
      ['Bebidas', 'Gaseosas', 'Gaseosa cola 2,25 L', 'Brisa', 1600], ['Bebidas', 'Gaseosas', 'Gaseosa naranja 1,5 L', 'Brisa', 1100], ['Bebidas', 'Gaseosas', 'Gaseosa cola 500 ml', 'Brisa', 700],
      ['Bebidas', 'Aguas y jugos', 'Agua mineral 500 ml', 'Manantial', 350], ['Bebidas', 'Aguas y jugos', 'Jugo de naranja 1 L', 'Manantial', 950], ['Bebidas', 'Cervezas', 'Cerveza rubia lata 473 ml', 'Cervecería Andina', 1000],
      ['Golosinas y kiosco', 'Alfajores', 'Alfajor triple de chocolate', 'Dulce Hogar', 450], ['Golosinas y kiosco', 'Alfajores', 'Alfajor de maicena', 'Dulce Hogar', 320], ['Golosinas y kiosco', 'Chocolates', 'Chocolate con leche 100 g', 'Dulce Hogar', 1100],
      ['Golosinas y kiosco', 'Caramelos', 'Caramelos masticables', 'Sol Naciente', 300], ['Golosinas y kiosco', 'Caramelos', 'Chicles de menta', 'Sol Naciente', 250], ['Golosinas y kiosco', 'Snacks', 'Papas fritas 120 g', 'Sol Naciente', 1000],
      ['Golosinas y kiosco', 'Snacks', 'Maní salado 150 g', 'Sol Naciente', 800], ['Lácteos y fiambres', 'Leches', 'Leche entera 1 L', 'La Pradera', 1100], ['Lácteos y fiambres', 'Yogures', 'Yogur firme frutilla 190 g', 'La Pradera', 480],
      ['Lácteos y fiambres', 'Quesos', 'Queso cremoso 500 g', 'La Pradera', 3600], ['Lácteos y fiambres', 'Fiambres', 'Jamón cocido 200 g', 'El Gaucho', 2400], ['Almacén', 'Fideos y arroz', 'Fideos tallarín 500 g', 'Doña Marta', 650],
      ['Almacén', 'Fideos y arroz', 'Arroz largo fino 1 kg', 'Doña Marta', 1100], ['Almacén', 'Aceites', 'Aceite de girasol 900 ml', 'Campo Verde', 1900], ['Almacén', 'Conservas', 'Atún al natural 170 g', 'Mar Azul', 1500],
      ['Almacén', 'Infusiones', 'Yerba mate 1 kg', 'Don Tomás', 2800], ['Panadería', 'Pan', 'Pan lactal 500 g', 'Molino Sur', 1300], ['Panadería', 'Facturas', 'Medialunas x6', 'Panificados Sur', 1800],
      ['Congelados', 'Helados', 'Helado 1 L dulce de leche', 'Polar', 3300], ['Congelados', 'Hamburguesas', 'Hamburguesas x4', 'El Gaucho', 2900], ['Limpieza', 'Detergentes', 'Detergente 750 ml', 'Brillo Hogar', 1300],
      ['Limpieza', 'Papel', 'Papel higiénico x4', 'Nube', 1900], ['Limpieza', 'Papel', 'Servilletas x100', 'Nube', 600],
    ],
    ropa: [
      ['Remeras', 'Cuello redondo', 'Remera básica algodón', 'Cumbre', 3500, { size: 'M', color: 'Negro', gender: 'Unisex', material: 'Algodón' }],
      ['Remeras', 'Polo', 'Remera polo piqué', 'Cotton Club', 5200, { size: 'L', color: 'Azul marino', gender: 'Hombre', material: 'Algodón' }],
      ['Remeras', 'Estampada', 'Remera estampada oversize', 'Urban Thread', 4300, { size: 'S', color: 'Blanco', gender: 'Unisex', material: 'Algodón' }],
      ['Camisas', 'Formal', 'Camisa formal slim', 'Apex Wear', 9800, { size: 'M', color: 'Celeste', gender: 'Hombre', material: 'Algodón' }],
      ['Camisas', 'Denim', 'Camisa de jean', 'Nova Denim', 11200, { size: 'L', color: 'Azul marino', gender: 'Unisex', material: 'Denim' }],
      ['Camisas', 'Casual', 'Camisa de lino manga larga', 'Silk Route', 10500, { size: 'S', color: 'Beige', gender: 'Mujer', material: 'Lino' }],
      ['Jeans', 'Slim', 'Jean slim azul', 'Nova Denim', 14500, { size: 'M', color: 'Azul marino', gender: 'Hombre', material: 'Denim' }],
      ['Jeans', 'Recto', 'Jean recto negro', 'Nova Denim', 14000, { size: 'L', color: 'Negro', gender: 'Hombre', material: 'Denim' }],
      ['Jeans', 'Chupín', 'Jean chupín tiro alto', 'Urban Thread', 15200, { size: 'S', color: 'Celeste', gender: 'Mujer', material: 'Denim' }],
      ['Vestidos', 'Midi', 'Vestido midi floreado', 'Silk Route', 16800, { size: 'M', color: 'Verde oliva', gender: 'Mujer', material: 'Viscosa' }],
      ['Vestidos', 'De fiesta', 'Vestido de fiesta largo', 'Silk Route', 24500, { size: 'S', color: 'Bordó', gender: 'Mujer', material: 'Seda' }],
      ['Vestidos', 'Casual', 'Vestido casual de lino', 'Meraki', 13900, { size: 'L', color: 'Beige', gender: 'Mujer', material: 'Lino' }],
      ['Camperas', 'Bomber', 'Campera bomber', 'Apex Wear', 28000, { size: 'M', color: 'Negro', gender: 'Unisex', material: 'Poliéster' }],
      ['Camperas', 'De jean', 'Campera de jean', 'Nova Denim', 26500, { size: 'L', color: 'Celeste', gender: 'Unisex', material: 'Denim' }],
      ['Camperas', 'Inflable', 'Campera inflable', 'Urban Thread', 38000, { size: 'XL', color: 'Gris', gender: 'Hombre', material: 'Poliéster' }],
      ['Buzos', 'Canguro', 'Buzo canguro con capucha', 'Cumbre', 12500, { size: 'L', color: 'Gris', gender: 'Unisex', material: 'Algodón' }],
      ['Buzos', 'Con cierre', 'Buzo con cierre', 'Cotton Club', 13800, { size: 'M', color: 'Negro', gender: 'Hombre', material: 'Algodón' }],
      ['Pantalones', 'Chino', 'Pantalón chino', 'Apex Wear', 12900, { size: 'M', color: 'Beige', gender: 'Hombre', material: 'Algodón' }],
      ['Pantalones', 'Cargo', 'Pantalón cargo', 'Urban Thread', 13400, { size: 'L', color: 'Verde oliva', gender: 'Unisex', material: 'Algodón' }],
      ['Sweaters', 'Cárdigan', 'Cárdigan tejido', 'Meraki', 15800, { size: 'S', color: 'Bordó', gender: 'Mujer', material: 'Mezcla de lana' }],
      ['Sweaters', 'Cuello alto', 'Sweater cuello alto', 'Meraki', 14900, { size: 'M', color: 'Gris', gender: 'Unisex', material: 'Mezcla de lana' }],
      ['Ropa deportiva', 'Jogging', 'Jogging de friza', 'Cumbre', 11700, { size: 'L', color: 'Negro', gender: 'Unisex', material: 'Algodón' }],
      ['Ropa deportiva', 'Calzas', 'Calza deportiva', 'Cumbre', 8900, { size: 'M', color: 'Negro', gender: 'Mujer', material: 'Poliéster' }],
      ['Remeras', 'Cuello redondo', 'Remera básica algodón', 'Cumbre', 3500, { size: 'S', color: 'Blanco', gender: 'Unisex', material: 'Algodón' }],
      ['Remeras', 'Cuello redondo', 'Remera básica algodón', 'Cumbre', 3500, { size: 'L', color: 'Gris', gender: 'Unisex', material: 'Algodón' }],
      ['Jeans', 'Slim', 'Jean slim negro', 'Nova Denim', 14500, { size: 'S', color: 'Negro', gender: 'Mujer', material: 'Denim' }],
      ['Camperas', 'Bomber', 'Campera bomber', 'Apex Wear', 28000, { size: 'L', color: 'Verde oliva', gender: 'Unisex', material: 'Poliéster' }],
      ['Buzos', 'Canguro', 'Buzo canguro con capucha', 'Cumbre', 12500, { size: 'S', color: 'Bordó', gender: 'Mujer', material: 'Algodón' }],
      ['Pantalones', 'Chino', 'Pantalón chino', 'Apex Wear', 12900, { size: 'L', color: 'Azul marino', gender: 'Hombre', material: 'Algodón' }],
    ],
    ferreteria: [
      ['Herramientas manuales', 'Martillos', 'Martillo de carpintero', 'Bremen', 3800, { size: '500 g', material: 'Acero', color: 'Negro' }],
      ['Herramientas manuales', 'Destornilladores', 'Juego de destornilladores x6', 'Bremen', 5200, { size: '6 piezas', material: 'Acero cromado', color: 'Rojo' }],
      ['Herramientas manuales', 'Llaves y pinzas', 'Pinza universal', 'Stanley', 4100, { size: '8 pulgadas', material: 'Acero', color: 'Rojo' }],
      ['Herramientas manuales', 'Llaves y pinzas', 'Llave francesa', 'Stanley', 6800, { size: '10 pulgadas', material: 'Acero', color: 'Gris' }],
      ['Herramientas eléctricas', 'Taladros', 'Taladro percutor 650 W', 'Dewalt', 58000, { size: '13 mm', material: 'Plástico reforzado', color: 'Amarillo' }],
      ['Herramientas eléctricas', 'Amoladoras', 'Amoladora angular 820 W', 'Dewalt', 49000, { size: '115 mm', material: 'Plástico reforzado', color: 'Amarillo' }],
      ['Herramientas eléctricas', 'Discos', 'Disco de corte x5', 'Norton', 6500, { size: '115 mm', material: 'Abrasivo', color: 'Azul' }],
      ['Electricidad', 'Cables', 'Cable unipolar 2,5 mm (rollo 100 m)', 'Pirelli', 42000, { size: '2,5 mm', material: 'Cobre', color: 'Verde' }],
      ['Electricidad', 'Tomas y llaves', 'Tomacorriente doble', 'Kalop', 3200, { size: '10 A', material: 'Plástico', color: 'Blanco' }],
      ['Electricidad', 'Lámparas', 'Lámpara LED 12 W', 'Lumina', 1900, { size: 'E27', material: 'Vidrio', color: 'Blanco cálido' }],
      ['Plomería', 'Caños', 'Caño PVC 110 mm (3 m)', 'Tigre', 9800, { size: '110 mm', material: 'PVC', color: 'Blanco' }],
      ['Plomería', 'Canillas', 'Canilla monocomando', 'FV', 28500, { size: '1/2 pulgada', material: 'Bronce cromado', color: 'Cromo' }],
      ['Plomería', 'Selladores', 'Cinta teflón x10', 'Tigre', 450, { size: '12 mm', material: 'Teflón', color: 'Blanco' }],
      ['Pinturas', 'Látex', 'Látex interior 20 L', 'Alba', 62000, { size: '20 L', material: 'Látex', color: 'Blanco' }],
      ['Pinturas', 'Látex', 'Látex interior 4 L', 'Alba', 16500, { size: '4 L', material: 'Látex', color: 'Blanco' }],
      ['Pinturas', 'Rodillos y pinceles', 'Rodillo de lana 22 cm', 'Rolly', 4800, { size: '22 cm', material: 'Lana', color: 'Gris' }],
      ['Pinturas', 'Rodillos y pinceles', 'Pincel cerda 2 pulgadas', 'Rolly', 1900, { size: '2 pulgadas', material: 'Cerda', color: 'Madera' }],
      ['Tornillería', 'Tornillos', 'Tornillos autoperforantes x100', 'Fixo', 3900, { size: '6 x 1 pulgada', material: 'Acero zincado', color: 'Plateado' }],
      ['Tornillería', 'Tarugos', 'Tarugos de nylon 8 mm x50', 'Fixo', 2100, { size: '8 mm', material: 'Nylon', color: 'Gris' }],
      ['Construcción', 'Cemento', 'Cemento 50 kg', 'Loma Negra', 11800, { size: '50 kg', material: 'Cemento', color: 'Gris' }],
      ['Construcción', 'Adhesivos', 'Adhesivo para cerámicos 30 kg', 'Klaukol', 9400, { size: '30 kg', material: 'Cemento cola', color: 'Gris' }],
      ['Jardín', 'Mangueras', 'Manguera reforzada 25 m', 'Tramontina', 21500, { size: '25 m', material: 'PVC', color: 'Verde' }],
      ['Jardín', 'Fertilizantes', 'Fertilizante universal 1 kg', 'Compo', 3800, { size: '1 kg', material: 'Granulado', color: 'Marrón' }],
      ['Seguridad', 'Candados', 'Candado 40 mm', 'Yale', 5900, { size: '40 mm', material: 'Acero', color: 'Dorado' }],
      ['Seguridad', 'Protección', 'Guantes de seguridad', 'Steelpro', 3400, { size: 'M', material: 'Cuero', color: 'Gris' }],
      ['Seguridad', 'Protección', 'Anteojos de protección', 'Steelpro', 2900, { size: 'Único', material: 'Policarbonato', color: 'Transparente' }],
      ['Herramientas manuales', 'Martillos', 'Maza de goma', 'Bremen', 4700, { size: '450 g', material: 'Goma', color: 'Negro' }],
      ['Electricidad', 'Cables', 'Cinta aisladora x3', 'Kalop', 1700, { size: '19 mm', material: 'PVC', color: 'Negro' }],
      ['Plomería', 'Caños', 'Codo PVC 110 mm', 'Tigre', 1400, { size: '110 mm', material: 'PVC', color: 'Blanco' }],
    ],
    /* Fábrica: el stock y el mínimo van fijos (stock, min) para que las listas de materiales, la reposición y los lotes de Factory cuenten una historia coherente */
    fabrica: [
      ['Productos terminados', 'Línea A', 'Producto terminado A', 'Marca propia', 8200, { size: 'Unidad', stock: 48, min: 15 }],
      ['Productos terminados', 'Línea A', 'Producto terminado B', 'Marca propia', 13500, { size: 'Unidad', stock: 22, min: 10 }],
      ['Productos terminados', 'Línea B', 'Producto terminado C', 'Marca propia', 24800, { size: 'Unidad', stock: 9, min: 8 }],
      ['Semielaborados', 'Conjuntos', 'Semielaborado 1', 'Marca propia', 3100, { size: 'Unidad', stock: 36, min: 12 }],
      ['Materias primas', 'Sólidas', 'Materia prima 1', 'Genérica', 950, { size: 'Kg', stock: 420, min: 150 }],
      ['Materias primas', 'Sólidas', 'Materia prima 2', 'Genérica', 1400, { size: 'Kg', stock: 180, min: 120 }],
      ['Materias primas', 'Sólidas', 'Materia prima 3', 'Genérica', 620, { size: 'Metro', stock: 95, min: 100 }],
      ['Materias primas', 'Líquidas', 'Materia prima 4', 'Genérica', 1800, { size: 'Litro', stock: 60, min: 30 }],
      ['Insumos', 'Embalaje', 'Insumo 1', 'Genérica', 2300, { size: 'Caja', stock: 40, min: 20 }],
      ['Insumos', 'Consumibles', 'Insumo 2', 'Genérica', 180, { size: 'Unidad', stock: 800, min: 300 }],
      ['Insumos', 'Consumibles', 'Insumo 3', 'Genérica', 90, { size: 'Unidad', stock: 0, min: 200 }],
      ['Repuestos', 'Mecánicos', 'Repuesto 1', 'Genérica', 5200, { size: 'Unidad', stock: 14, min: 4 }],
      ['Repuestos', 'Mecánicos', 'Repuesto 2', 'Genérica', 9800, { size: 'Unidad', stock: 6, min: 3 }],
    ],
  };

  const SUPPLIERS = {
    general: ['Distribuidora Norte', 'Bebidas del Sur', 'Mayorista La Económica', 'Lácteos Cuyo', 'Limpieza Total', 'Golosinas Express'],
    almacen: ['Distribuidora Norte', 'Bebidas del Sur', 'Lácteos Cuyo', 'Golosinas Express', 'Panificados Sur', 'Mayorista La Económica'],
    ropa: ['Textil Norte', 'Denim Directo', 'Sedas Argentinas', 'Indumentaria Express', 'Tejidos Maestros', 'Importadora Estilo'],
    ferreteria: ['Herramientas del Sur', 'Eléctrica Central', 'Pinturas Alba', 'Sanitarios Cuyo', 'Corralón Mayorista', 'Fijaciones Express'],
    fabrica: ['Materias Primas Norte', 'Insumos Industriales', 'Repuestos del Centro', 'Importadora Técnica', 'Taller Externo A', 'Taller Externo B'],
  };
  const FIRST = ['Sofía', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Lucas', 'Martina', 'Facundo', 'Julieta', 'Nicolás', 'Lucía', 'Joaquín', 'Agustina', 'Tomás', 'Florencia', 'Franco'];
  const LAST = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 'Romero', 'Díaz'];
  const HUES = ['#c9a24b', '#3f7ca8', '#d9c6a5', '#c4572f', '#4f9a7a', '#8f6aa8', '#7a7f87', '#b3893a', '#2f4f7a', '#6d1f2b', '#5a8f4c', '#a85a7a'];

  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /** Foto de ejemplo: una cajita del color de la categoría (como en el programa real). */
  P.thumb = function (category, cats) {
    const i = Math.max(0, cats.indexOf(category));
    const fill = HUES[i % HUES.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#efe9dd"/><path d="M100 36 164 68v64l-64 32-64-32V68z" fill="${fill}" stroke="#00000033" stroke-width="2" stroke-linejoin="round"/><path d="M36 68l64 32 64-32M100 100v64" fill="none" stroke="#ffffff77" stroke-width="3"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  /* ---------- arma el estado completo de la demostración ---------- */
  P.newState = function (type) {
    const R = rng(20261009);
    const rand = (a, b) => Math.floor(R() * (b - a + 1)) + a;
    const pick = (l) => l[rand(0, l.length - 1)];
    const NOW = Date.now();
    const DAY = 86400000;
    const day0 = new Date(); day0.setHours(0, 0, 0, 0);
    const at = (daysAgo, hour, min) => { const d = new Date(day0.getTime() - daysAgo * DAY); d.setHours(hour, min, 0, 0); return d.getTime(); };

    const catalog = CATALOGS[type];
    const cats = [...new Set(catalog.map((r) => r[0]))];
    const S = {
      type, user: null, now: NOW,
      settings: { storeName: 'Plexi', tagline: type === 'ropa' ? 'Tienda de moda' : type === 'fabrica' ? 'Tu fábrica' : 'Tu comercio de barrio', phone: '+54 11 4000-0000', email: 'hola@plexi.com.ar', address: 'Av. Corrientes 1234, Local 12, Buenos Aires', taxRate: 5, requireOpenRegister: false, pointsEnabled: true, pointsPerAmount: 100, pointsValue: 1, overdueDays: 15, waCountry: '54', receiptFooter: '¡Gracias por tu compra en Plexi!', returnPolicy: 'Los artículos se pueden cambiar dentro de los 14 días presentando el recibo original.', mpAlias: 'plexi.comercio', mpHolder: 'Plexi Comercio SRL', mpConnected: false, mailConnected: false, mailFrom: '' },
      categories: Object.fromEntries(Object.entries(P.TYPES[type].cats).map(([k, v]) => [k, v.slice()])),
      products: [], customers: [], suppliers: [], sales: [], movements: [], cashSessions: [], held: [], orders: [], logs: [], notifications: [], expenses: [], employees: [], users: [], discounts: [], backups: [],
      cash: { open: false, openedAt: 0, float: 0, moves: [] }, seq: 1000,
    };
    for (const c of cats) if (!S.categories[c]) S.categories[c] = [...new Set(catalog.filter((r) => r[0] === c).map((r) => r[1]))];

    const sup = SUPPLIERS[type];
    S.suppliers = sup.map((name, i) => ({
      id: `s${i + 1}`, name, contact: `${pick(FIRST)} ${pick(LAST)}`, phone: `11 ${rand(4000, 7999)}-${rand(1000, 9999)}`, email: `contacto@${name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.com.ar`,
      visitDays: i % 4 === 3 ? [] : [(i % 5) + 1], balance: i % 3 === 0 ? rand(20, 150) * 1000 : 0, debtSince: NOW - (6 + i * 9) * DAY, status: 'active',
    }));

    S.products = catalog.map((r, i) => {
      const [category, sub, name, brand, cost, attrs] = r;
      const price = Math.round((cost * (1.25 + R() * 0.45)) / 10) * 10;
      const stock = attrs?.stock ?? (i % 9 === 0 ? 0 : i % 5 === 0 ? rand(1, 9) : rand(15, 90));
      const code = category.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
      return {
        id: `p${i + 1}`, name, sku: `PLX-${code}-${rand(1000, 9999)}`, category, sub, brand, cost, price, discount: R() < 0.2 ? Math.round((price * 0.85) / 10) * 10 : null,
        stock, min: attrs?.min ?? 10, supplierId: pick(S.suppliers).id, size: attrs?.size || '', color: attrs?.color || '', gender: attrs?.gender || '', material: attrs?.material || '', archived: false, sold: 0, created: at(rand(30, 300), 10, 0),
      };
    });

    /* Fábrica: cada tipo de producto lo provee su proveedor natural (los talleres externos solo hacen subcontratación) */
    if (type === 'fabrica') { const BY_CAT = { 'Materias primas': 0, Insumos: 1, Repuestos: 2, Semielaborados: 3, 'Productos terminados': 3 }; S.products.forEach((p) => { p.supplierId = S.suppliers[BY_CAT[p.category] ?? 0].id; }); }

    const names = [];
    for (let i = 0; i < 16; i++) names.push(`${FIRST[i]} ${LAST[i % LAST.length]}`);
    S.customers = names.map((name, i) => ({
      id: `c${i + 1}`, name, phone: `11 ${rand(4000, 7999)}-${rand(1000, 9999)}`, email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(' ', '.')}@gmail.com`, points: rand(0, 400), member: i % 3 === 0,
      credit: i < 4, limit: i === 0 ? 50000 : i === 1 ? 0 : 30000, ledger: [], spent: 0, orders: 0, created: at(rand(30, 365), 11, 0),
    }));
    S.customers[0].ledger.push({ date: NOW - 32 * DAY, type: 'adjustment', amount: 18500, desc: 'Deuda anterior (cuaderno de fiado)' });
    S.customers[1].ledger.push({ date: NOW - 4 * DAY, type: 'charge', amount: 6200, desc: 'Compra del fin de semana' });
    S.customers[2].ledger.push({ date: NOW - 10 * DAY, type: 'charge', amount: 12400, desc: 'Compra a cuenta' }, { date: NOW - 6 * DAY, type: 'payment', amount: 5000, desc: 'Pago en efectivo' });

    /* ventas de los últimos 90 días */
    const METHODS = ['cash', 'cash', 'cash', 'debit', 'credit', 'transfer', 'mp', 'mp'];
    const raw = [];
    for (let i = 0; i < 430; i++) {
      const off = i < 5 ? 0 : rand(0, 89);
      const hour = off === 0 ? rand(9, Math.max(9, new Date().getHours() - 1)) : rand(9, 21);
      const date = at(off, hour, rand(0, 59));
      if (off === 0 && date > NOW) continue;
      const lines = [];
      const n = rand(1, 4);
      for (let k = 0; k < n; k++) {
        const p = pick(S.products);
        if (lines.some((l) => l.pid === p.id)) continue;
        lines.push({ pid: p.id, name: p.name, sku: p.sku, size: p.size, color: p.color, qty: rand(1, type === 'ferreteria' || type === 'ropa' ? 2 : 3), price: p.discount || p.price, cost: p.cost });
        p.sold += lines[lines.length - 1].qty;
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const discount = R() < 0.15 ? Math.round(subtotal * 0.1) : 0;
      const rate = S.settings.taxRate;
      const tax = Math.round(((subtotal - discount) * rate) / 100);
      const total = subtotal - discount + tax;
      const cust = R() < 0.55 ? pick(S.customers) : null;
      const m = pick(METHODS);
      const sale = { date, customerId: cust?.id || null, customerName: cust?.name || 'Consumidor final', cashier: pick(['Carlos Cajero', 'Admin Demo', 'María Gerente']), items: lines, subtotal, discount, couponCode: discount ? 'BIENVENIDA10' : '', pointsDiscount: 0, pointsRedeemed: 0, taxRate: rate, tax, total, payments: [{ method: m, amount: total, ref: m === 'mp' ? String(rand(10 ** 9, 10 ** 10 - 1)) : '' }], status: R() < 0.04 ? 'refunded' : 'completed', refunded: 0, pointsEarned: 0 };
      if (sale.status === 'refunded') sale.refunded = total;
      raw.push(sale);
    }
    raw.sort((a, b) => a.date - b.date);
    const perDay = {};
    raw.forEach((s, i) => {
      const d = new Date(s.date);
      const key = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      perDay[key] = (perDay[key] || 0) + 1;
      s.id = `sale-${i + 1}`;
      s.no = `INV-${key}-${String(perDay[key]).padStart(4, '0')}`;
      if (s.customerId && s.status === 'completed') { const c = S.customers.find((x) => x.id === s.customerId); c.spent += s.total; c.orders += 1; }
    });
    S.sales = raw.reverse();

    /* gastos, empleados, usuarios, cupones */
    const EXP = [['Electricidad', 28000], ['Alquiler', 150000], ['Internet', 9000], ['Sueldos', 280000], ['Mantenimiento', 12000], ['Transporte', 7500]];
    for (let m = 0; m < 3; m++) EXP.forEach(([cat, amt], k) => S.expenses.push({ id: `e${m}-${k}`, category: cat, title: `${cat} — mensual`, amount: Math.round(amt * (0.9 + R() * 0.2)), date: at(m * 30 + rand(1, 15), 12, 0), method: cat === 'Alquiler' ? 'transfer' : 'cash' }));
    S.employees = [['María Gerente', 'Gerente', 112000], ['Carlos Cajero', 'Cajero', 56000], ['Julieta Díaz', 'Cajero', 54000], ['Bruno Sosa', 'Cajero', 52000], ['Lucía Paz', 'Gerente', 108000]].map(([name, role, salary], i) => ({ id: `emp${i + 1}`, name, role, salary, phone: `11 ${rand(4000, 7999)}-${rand(1000, 9999)}`, present: rand(20, 26), absent: rand(0, 3), leave: rand(0, 2) }));
    S.users = [{ id: 'u1', email: 'admin@demo.com', name: 'Admin Demo', role: 'admin', status: 'Activo' }, { id: 'u2', email: 'gerente@demo.com', name: 'María Gerente', role: 'manager', status: 'Activo' }, { id: 'u3', email: 'cajero@demo.com', name: 'Carlos Cajero', role: 'cashier', status: 'Activo' }];
    const topCat = cats[1] || cats[0];
    S.discounts = [
      { code: 'BIENVENIDA10', type: 'percentage', value: 10, scope: 'all', min: 2000, active: true, desc: 'Descuento de bienvenida para clientes nuevos', used: 31 },
      { code: 'FIJO500', type: 'flat', value: 500, scope: 'all', min: 5000, active: true, desc: '500 de descuento fijo en compras grandes', used: 12 },
      { code: 'FIESTAS20', type: 'percentage', value: 20, scope: 'all', min: 0, active: true, desc: 'Promo de fiestas', used: 18 },
      { code: 'ORO15', type: 'percentage', value: 15, scope: 'members', min: 0, active: true, desc: 'Exclusivo para clientes con membresía', used: 9 },
      { code: 'CATEGORIA15', type: 'percentage', value: 15, scope: 'category', category: topCat, min: 0, active: false, desc: `15 % en ${topCat}`, used: 4 },
    ];

    /* cierres de caja de los días anteriores */
    for (let i = 1; i <= 6; i++) {
      const expected = rand(60, 140) * 1000; const diff = [0, 0, -500, 0, 1200, 0][i - 1];
      S.cashSessions.push({ id: `cs${i}`, register: 'Caja 1', opened: at(i, 9, 0), closed: at(i, 21, 30), float: 20000, expected, counted: expected + diff, diff, by: i % 2 ? 'Carlos Cajero' : 'Julieta Díaz' });
    }
    S.backups = [{ name: 'plexi-2026-10-08-23-00.db', size: 512 * 1024 + 1234, date: NOW - DAY }];
    S.orders = [];
    S.logs = [['LOGIN', 'Inició sesión', 'Acceso'], ['SALE_COMPLETED', 'Venta realizada', 'Ventas'], ['INVENTORY_ADJUSTED', 'Entrada de stock × 20', 'Inventario'], ['CUSTOMER_CREATED', 'Cliente agregado', 'Clientes'], ['EXPENSE_CREATED', 'Gasto registrado', 'Gastos']]
      .flatMap((l, i) => [0, 1].map((k) => ({ action: l[0], text: l[1], module: l[2], user: ['Admin Demo', 'María Gerente', 'Carlos Cajero'][(i + k) % 3], date: NOW - (i * 2 + k + 1) * 3600000 * 5 })));
    return S;
  };
})();
