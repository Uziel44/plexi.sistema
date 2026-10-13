# Factory: de dónde sale cada pestaña

La pantalla **Factory** de la demo (`js/screens5.js` y `js/screens6.js`, menú de administrador y gerente, solo en el rubro **Fábrica**) se inspira en los 23 módulos de *Inventario, fabricación y mantenimiento* de **Odoo 20.0 Community** (`addons/stock*`, `addons/mrp*`, `addons/maintenance`, `addons/repair` y `addons/barcodes*`).

Esta carpeta es solo el mapa: **no contiene código de Odoo**. Los módulos son Python y XML, no corren en un navegador, y tienen licencia LGPL-3. La demo reimplementa la idea en JavaScript puro, como el resto de Plexi.

Código fuente de referencia: `100modelos github/73 odoo-20.0/odoo-20.0/addons/<módulo>`.

## Por qué un rubro nuevo

Un comercio no fabrica, así que producción, subcontratación, mantenimiento y reparaciones no tendrían qué mostrar en los otros cuatro rubros. Por eso Factory solo aparece en el rubro **Fábrica**, con productos genéricos (Producto terminado A, B y C, un semielaborado, materias primas, insumos y repuestos) para que cualquier industria se vea reflejada. Los demás rubros no cambian.

## Qué ya tenía Plexi (no se volvió a crear)

| Concepto | Dónde está en Plexi | Cómo lo usa Factory |
|---|---|---|
| Stock, stock mínimo y movimientos | **Inventario** (niveles, ajustes e historial) | El stock total de cada producto es el de Inventario. Cuando Factory consume, fabrica o recibe mercadería, deja el movimiento ahí. |
| Costo y precio de cada producto | **Productos** | La valuación multiplica el stock por el costo. Producir, subcontratar o revalorizar actualizan ese costo. |
| Proveedores, órdenes de compra y deudas | **Proveedores** | Reposición crea órdenes de compra ahí. Los talleres externos son proveedores y su servicio queda como deuda. |
| Gastos | **Gastos** | Un mantenimiento terminado deja un gasto de la categoría «Mantenimiento» (que Contabilidad ya asigna al centro de costo Depósito). |
| Clientes y cuenta corriente | **Clientes** | Una reparación facturada se carga a la cuenta del cliente; los envíos salen de las ventas con cliente. |
| Etiquetas con QR | **Productos** | Factory suma las etiquetas con código de barras EAN-13, no las reemplaza. |

## Qué se sumó

| Pestaña | Módulo de Odoo | Qué hace en la demo |
|---|---|---|
| Depósitos | `stock` | Tres depósitos (central, planta y salón), transferencias entre ellos (borrador y validación), lotes con vencimiento y baja de lo vencido, y reglas de reposición con mínimo y máximo que arman órdenes de compra. |
| Depósitos | `mrp_product_expiry` | Los lotes tienen fecha de vencimiento y aviso a 30 días; los productos terminados con vida útil (el B, 365 días) nacen con vencimiento al terminar la orden. |
| Valuación y costos | `stock_account` | Valor del stock a costo y a precio de venta, margen potencial, método de costeo por producto y revalorización con historial. |
| Valuación y costos | `stock_landed_costs` | Costos de importación: fletes, aduana y seguros repartidos por valor, por cantidad o en partes iguales, que suben el costo unitario de la mercadería. |
| Códigos de barras | `barcodes` | Código EAN-13 de cada producto (con su dígito verificador), etiquetas para imprimir y un escáner simulado que lo reconoce. |
| Códigos de barras | `barcodes_gs1_nomenclature` | Lectura de códigos GS1 con GTIN, lote, vencimiento, serie y cantidad, y la tabla de reglas de la nomenclatura. |
| Envíos | `stock_delivery` | Transportistas con costo base y por kilo, y envíos de las ventas con peso y costo calculados. |
| Envíos | `mrp_delivery` | El peso de un producto fabricado es la suma de los pesos de sus componentes (como un kit). |
| Envíos | `stock_dropshipping` | Envío directo desde el proveedor: no pasa por los depósitos. |
| Envíos | `stock_fleet` | Flota propia: vehículos con capacidad y la carga que lleva cada uno; no deja despachar si no entra. |
| Envíos | `stock_sms` | Aviso por SMS al cliente cuando se entrega el pedido (se activa o desactiva en Transportistas). |
| Producción | `mrp` | Listas de materiales, órdenes de producción (confirmar, iniciar, terminar, cancelar y desarmar) y centros de trabajo con su costo por hora y su carga. |
| Producción | `mrp_account` | El costo real de cada orden suma materiales, mano de obra y máquinas, y se imputa a la cuenta analítica «Planta de producción»; al terminar, promedia el costo del producto. |
| Producción | `mrp_landed_costs` | Costos adicionales en la orden (energía, flete interno) que suben el costo por unidad. |
| Subcontratación | `mrp_subcontracting` | Órdenes con talleres externos: se mandan los componentes, el taller termina el producto y se recibe. |
| Subcontratación | `mrp_subcontracting_account` | El costo por unidad suma los componentes, el servicio del taller y los costos adicionales. |
| Subcontratación | `mrp_subcontracting_purchase` | Al recibir, se registra la orden de compra del servicio y la deuda con el taller en Proveedores. |
| Subcontratación | `mrp_subcontracting_dropshipping` | Opción de que el proveedor entregue los componentes directo al taller, sin tocar tus depósitos. |
| Subcontratación | `mrp_subcontracting_landed_costs` | Costos adicionales (fletes al taller) sobre cada orden. |
| Mantenimiento | `maintenance` | Equipos con su frecuencia de mantenimiento y solicitudes preventivas y correctivas en un tablero (nuevas, en curso y hechas); al terminar un preventivo se programa el siguiente. |
| Mantenimiento | `stock_maintenance` | Los repuestos usados salen del stock de Inventario y quedan en Movimientos; el costo (horas y repuestos) va a Gastos. |
| Reparaciones | `repair` | Presupuesto, aprobación, reparación y factura; en garantía no se cobra; al terminar salen los repuestos del stock y al facturar se carga a la cuenta del cliente. |
| Reparaciones | `mrp_repair` | Al reparar un producto fabricado se sugieren los repuestos desde su lista de materiales. |

## Qué se dejó afuera de cada módulo, y por qué

Todos los módulos tienen su lugar, pero la demo no copia todo lo que hace Odoo por dentro:

| Parte de Odoo | Motivo |
|---|---|
| Ubicaciones jerárquicas, rutas de varios pasos (recoger, empaquetar, enviar), paquetes y lotes de preparación | Son configuración de depósitos grandes. Plexi muestra tres depósitos fijos y transferencias directas. |
| Costeo FIFO y estándar con recálculo real | La demo guarda el método elegido, pero el costo siempre se promedia al producir o revalorizar. |
| Números de serie por unidad y trazabilidad hacia atrás | Se muestran lotes con vencimiento; la serie solo se lee en el escáner y se anota en las reparaciones. |
| Planificación de producción (calendario, secuencia de operaciones, órdenes de trabajo en tableta) | Las horas planificadas se suman por centro de trabajo, sin calendario. |
| Contabilidad real de existencias (asientos y cuentas por producto) | Contabilidad ya muestra el resultado; Factory solo actualiza el costo y el valor del stock. |
| Conectores reales de transportistas (etiquetas, seguimiento) y envío real de SMS | Nada sale de la página: el SMS y el despacho son simulados. |
| Reparaciones que generan una venta en el Historial | La reparación se factura a la cuenta del cliente, como las notas de débito de Contabilidad. |

## Datos de ejemplo que arma la pantalla

Se arman la primera vez que se entra a Factory y se reinician con la demo, como todo lo demás:

- 3 depósitos, 3 transferencias (2 hechas y 1 en borrador) y 6 lotes (algunos por vencer y uno vencido).
- 1 costo de importación ya aplicado, 5 envíos de ventas reales (uno directo del proveedor), 4 transportistas y 2 vehículos.
- 4 listas de materiales (productos A, B y C, y el semielaborado), 3 centros de trabajo y 4 órdenes de producción en distintos estados.
- 3 órdenes de subcontratación (recibida, en el taller y borrador con envío directo).
- 4 equipos y 4 solicitudes de mantenimiento (una vencida).
- 5 reparaciones en todas las etapas (una en garantía).
- Insumo 3 sin stock y Materia prima 3 bajo el mínimo, para que Reposición tenga algo que pedir.
