# Plexi POS — demostración interactiva

Una simulación del programa para mostrarlo a clientes: **HTML, CSS y JavaScript puros**. No tiene servidor, no usa librerías y no guarda nada. Todo ocurre en el navegador con datos de ejemplo.

## Cómo abrirla

- **Doble clic en `index.html`** (funciona sin internet; con internet se descarga la tipografía Poppins).
- O subir la carpeta tal cual a cualquier hosting estático (o a la landing) y enlazar `index.html`.

## Cómo se usa

1. Se elige el **rubro** de la demostración: comercio general, almacén y kiosco, ropa y calzado, ferretería o fábrica (cada uno trae su catálogo).
2. Se entra como **administrador**, **gerente** o **cajero** (el menú y los permisos cambian como en el programa real).
3. Se prueba lo que se quiera. Al recargar la página, todo vuelve a empezar.

### Enlaces directos (para la landing)

`index.html?rubro=ropa&rol=admin&ir=pos` entra directo, sin pasar por el ingreso.

| Parámetro | Valores |
| --- | --- |
| `rubro` | `general`, `almacen`, `ropa`, `ferreteria`, `fabrica` |
| `rol` | `admin`, `manager`, `cashier` |
| `ir` | `dashboard`, `pos`, `sales`, `cash`, `products`, `inventory`, `customers`, `suppliers`, `employees`, `costs`, `accounting`, `factory` (solo con `rubro=fabrica`), `discounts`, `reports`, `logs`, `users`, `settings` |

Para ver Factory directo: `index.html?rubro=fabrica&rol=admin&ir=factory`.

## Qué se puede probar (todo simulado)

- **Punto de venta**: productos con búsqueda y categorías, cupones (`BIENVENIDA10`, `FIJO500`, `FIESTAS20`, `ORO15`), cliente, canje de puntos, pago dividido, vuelto, cuentas en espera.
- **Cobro con Mercado Pago**: QR fijo y QR automático (se conecta en *Configuración*; "Esperando el pago…" y confirmación simulada).
- **Cuenta corriente (fiado)** con límite de crédito, deuda vencida y cobro de deudas.
- **Recibo**: se ve en formato ticket y se puede **enviar por WhatsApp** (vista del chat) o **por correo** (vista del mensaje; el correo se conecta en *Configuración*).
- **Caja**: abrir turno, retirar e ingresar efectivo, cerrar contando billetes (justa / sobra / falta), historial y conciliación.
- **Productos e inventario**: alta y edición, etiquetas con QR, ajustes de stock con historial. El formulario **se adapta al tipo de comercio** (en *Configuración → Tipo de comercio*).
- **Clientes, proveedores** (calendario de visitas, órdenes de compra, deudas), **empleados, descuentos, reportes, registro de actividad, usuarios y configuración**.
- **Contabilidad** (administrador y gerente): estado de resultados y lo que se cobra y se debe; facturas con **notas de débito** (se suman a la cuenta corriente del cliente); **impuestos** con reglas propias y calculadora; **analítica** (rentabilidad por categoría y gastos por centro de costo); **cheques** a proveedores (bajan la deuda y se pueden imprimir) y **comprobantes electrónicos** simulados. No duplica nada: usa las ventas, gastos, clientes y proveedores que ya están cargados.
- **Factory** (solo en el rubro **Fábrica**, administrador y gerente), con ocho pestañas que juntan los 23 módulos de Inventario, fabricación y mantenimiento de Odoo. Trabaja con productos genéricos (A, B y C, materias primas e insumos) y mueve el stock de Inventario de verdad:
  - **Depósitos**: existencias en tres depósitos, transferencias entre ellos, lotes con vencimiento (con baja de lo vencido) y reposición que arma órdenes de compra en Proveedores.
  - **Valuación y costos**: valor del stock, método de costeo, revalorización y costos de importación (fletes y aduana repartidos entre la mercadería).
  - **Códigos de barras**: EAN-13 de cada producto, etiquetas para imprimir y un escáner simulado que lee códigos GS1 con lote y vencimiento.
  - **Envíos**: transportistas con costo por peso, flota con su carga, envío directo desde el proveedor y aviso por SMS al entregar.
  - **Producción**: listas de materiales, órdenes (confirmar, iniciar, terminar, desarmar), centros de trabajo, costo real por unidad y costos adicionales.
  - **Subcontratación**: talleres externos que terminan el producto; genera la deuda con el taller en Proveedores.
  - **Mantenimiento**: equipos, solicitudes preventivas y correctivas en un tablero; descuenta repuestos y manda el gasto a Costos → Gastos.
  - **Reparaciones**: presupuesto, reparación y factura a la cuenta del cliente, con garantía y repuestos sugeridos desde la lista de materiales.

- **Costos** (administrador y gerente, todos los rubros; antes se llamaba Gastos), con siete solapas para saber en qué se va la plata de un comercio que compra y vende. Se calcula con las ventas de los últimos 30 días y con un interruptor de régimen de IVA (responsable inscripto o monotributo) arriba de todo:
  - **Resumen**: los 10 costos más importantes por importe y por % de las ventas, costos totales, resultado estimado y punto de equilibrio.
  - **Gastos**: la pantalla de antes (lo que realmente se pagó), ahora con el área de cada gasto.
  - **Costos fijos**: lista de lo que se paga aunque no se venda (alquiler, sueldos de Empleados, contador…), con «Registrar pago» que lo anota en Gastos.
  - **Costos variables**: lo que cuesta vender (comisiones de Mercado Pago y tarjetas según el medio de pago real de cada venta, packaging, vendedores, mermas).
  - **Costo de productos**: la escalera de cada producto: costo del proveedor con o sin IVA → costo → flete → variables, fijos e impuestos repartidos como % del precio → costo total, margen real, precio mínimo y precio sugerido (se puede aplicar al precio de venta).
  - **Impuestos**: presupuesto de impuestos y cargas sociales a 3 meses; el IVA se muestra aparte porque no es un costo.
  - **Presupuestos**: presupuesto mensual contra lo real, por área (Administración, Operación, Logística, Compras y Ventas).

## Lo que NO es

Es una maqueta: no hay base de datos ni cuentas reales. El QR de los cobros es un dibujo, la "conexión" con Mercado Pago y con el correo es un simulacro, los PDF no se generan y nada sale de la página. El programa real funciona distinto por dentro (servidor, base de datos, verificación de pagos), pero se ve y se usa igual.

## Archivos

```
index.html          la página
css/app.css         el estilo (la paleta y las formas de Plexi)
js/data.js          datos de ejemplo de los 5 rubros
js/core.js          ventanas, avisos, gráficos, recibo, WhatsApp y correo simulados
js/screens1.js      Panel, Punto de venta, Historial de ventas
js/screens2.js      Productos, Inventario, Clientes, Proveedores
js/screens3.js      Caja, Reportes, Empleados, Descuentos, Registro, Usuarios, Configuración
js/screens4.js      Contabilidad
js/screens5.js      Factory: esqueleto, datos base y las pestañas de inventario (Depósitos, Valuación y costos, Códigos de barras, Envíos)
js/screens6.js      Factory: las pestañas de fabricación (Producción, Subcontratación, Mantenimiento, Reparaciones)
js/screens7.js      Costos: esqueleto, datos, cálculos y las solapas Resumen, Gastos, Costos fijos y Costos variables
js/screens8.js      Costos: las solapas Costo de productos, Impuestos y Presupuestos
js/app.js           ingreso, menú y navegación
js/icons.js         íconos (lucide, licencia ISC)
assets/             logo de Plexi
campo/contabilidad/ mapa de qué módulo de Odoo origina cada pestaña de Contabilidad (solo documentación)
campo/factory/      lo mismo para Factory: los 23 módulos de Inventario, fabricación y mantenimiento (solo documentación)
campo/costos/       de dónde sale cada solapa de Costos (solo documentación)
docs/superpowers/   diseño de Factory
```
