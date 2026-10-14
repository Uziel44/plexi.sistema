# Costos: de dónde sale cada solapa

La pantalla **Costos** de la demo (`js/screens7.js` y `js/screens8.js`, menú de administrador y gerente, en todos los rubros) reemplaza a la pantalla Gastos. Junta en un solo lugar lo que ya existía disperso (los gastos, la valuación y los costos de importación de Factory, la analítica de Contabilidad y las ganancias de Reportes) y suma lo que faltaba para un comercio que **compra y vende**: cuánto cuesta de verdad cada producto y en qué se le va la plata.

Esta carpeta es solo el mapa: **no contiene código de Odoo**. Se inspira en módulos de **Odoo 20.0 Community** (`addons/<módulo>`), pero la lógica es de Plexi, en JavaScript puro, y todos los porcentajes y montos son **valores de ejemplo editables**: la demo no es asesoramiento impositivo.

## La idea: una escalera de costos

Del precio que paga el comercio al proveedor hasta lo que realmente le queda por cada producto:

1. **Costo del proveedor**, con o sin IVA.
2. **Sacar el IVA**: en responsable inscripto es crédito fiscal y no un costo; en monotributo sí lo es.
3. **Flete y otros** de traer la mercadería.
4. **Costos variables** de vender (comisiones de cobro, packaging, vendedores, mermas).
5. **Impuestos y cargas sociales** (Ingresos Brutos, tasas, cargas sobre sueldos).
6. **Costos fijos** (alquiler, sueldos, servicios), repartidos como un % de las ventas.
7. **Costo total y margen** de cada producto, con su precio mínimo y su precio sugerido.

## Qué ya tenía Plexi (no se volvió a crear)

| Concepto | Dónde está en Plexi | Cómo lo usa Costos |
|---|---|---|
| Gastos y su categoría | La pantalla **Gastos** de antes (`S.expenses`) | Ahora es la solapa **Gastos**, con el mismo alta, CSV y borrado, más el área. Sigue siendo la única fuente de lo que realmente se pagó. |
| Costo y precio de cada producto | **Productos** (`p.cost`, `p.price`) | `p.cost` es «el costo que cuenta»: se deriva del precio del proveedor y del régimen de IVA, y lo siguen usando Productos, Inventario, Factory y Contabilidad. |
| Ventas, medios de pago y descuentos | **Historial de ventas** | De ahí salen la mercadería vendida, las comisiones de cobro y los costos variables. Nada se carga dos veces. |
| Sueldos | **Empleados** | «Sueldos» en Costos fijos y la base de las cargas sociales. |
| Costos de importación y de producción | **Factory** (solo rubro Fábrica) | Siguen en Factory; Costos usa el costo de los productos que ellos actualizan. |
| Centros de costo y resultado | **Contabilidad** | Conserva sus centros (Local, Depósito, Administración); Costos usa áreas. No se unifican. |

## Qué se sumó

| Solapa | Inspirada en | Qué hace en la demo |
|---|---|---|
| Resumen | `analytic` | Los 10 costos más importantes de los últimos 30 días, por importe y % de las ventas, costos totales, resultado estimado y punto de equilibrio. |
| Gastos | — | La pantalla de antes con el área de cada gasto. |
| Costos fijos | — | Lista de costos que se pagan aunque no se venda, con «Registrar pago» que crea el gasto. |
| Costos variables | — | Lista de costos que crecen con las ventas: base (ventas, cobros por Mercado Pago o tarjeta, tickets, unidades, costo de lo vendido) y tasa. |
| Costo de productos | `product_margin`, `sale_margin`, `pos_sale_margin`, `stock_landed_costs`, `stock_account` | La escalera por producto, con margen real, precio mínimo y precio sugerido; se puede aplicar el sugerido al precio de venta. |
| Impuestos | — | Presupuesto de impuestos y cargas sociales con proyección a 3 meses; el IVA se muestra aparte. |
| Presupuestos | `analytic` | Presupuesto mensual contra lo real por área: Administración, Operación, Logística, Compras y Ventas. |

## Cómo se calcula (últimos 30 días)

- **Ventas** = lo vendido sin impuesto, descontando devoluciones. **Mercadería vendida** = costo de cada línea vendida.
- **Costos variables** = base × tasa, con la base real (por ejemplo, lo cobrado por Mercado Pago). **Impuestos** = tasa sobre ventas, cobros bancarios o sueldos.
- **Fijos repartidos** = fijos del mes (más cargas sociales) ÷ ventas, como un % de cada precio. Lo mismo con variables e impuestos.
- **Costo total de un producto** = costo de reposición (costo + flete) + precio × (variables + fijos + impuestos).
- **Precio mínimo** = costo de reposición ÷ (1 − variables − fijos − impuestos). **Precio sugerido** = lo mismo restando el margen objetivo (12 % de ejemplo, editable).
- **Punto de equilibrio** = fijos ÷ (1 − mercadería − variables − impuestos, como % de las ventas).

## Régimen de IVA

Un interruptor arriba de la pantalla elige **responsable inscripto** (por defecto) o **monotributo**. En monotributo el IVA de las compras no se recupera: se le suma al costo de todos los productos, desaparece el IVA a pagar y aparece una cuota de monotributo de ejemplo. Volver a responsable inscripto deja los costos como estaban, porque se recalculan desde el precio del proveedor guardado.

## Qué se dejó afuera, y por qué

| Parte | Motivo |
|---|---|
| Márgenes de proyectos, horas facturadas y gastos reembolsables (`sale_timesheet_margin`, `sale_project_margin`, `sale_expense_margin`, `project_account`) | Plexi no tiene proyectos ni hojas de horas: es un comercio que compra y vende. |
| Costos de importación y de producción dentro de Costos | Ya están en Factory y solo aplican al rubro Fábrica; Costos usa el costo que ellos dejan en cada producto. |
| Costeo FIFO o por lotes con recálculo real | El costo siempre se promedia; no hay método de costeo por categoría. |
| Impuestos reales por provincia, escalas de monotributo y alícuotas especiales | Las tasas son de ejemplo y se editan a mano. |
| Presupuestos por mes o por año con histórico | Se presupuesta el mes y se compara con los últimos 30 días. |

## Datos de ejemplo

- Los **gastos y sueldos se escalan por rubro** (un comercio de ropa o una ferretería venden mucho más que un almacén), para que los costos fijos pesen cerca del 13 % de las ventas en todos y el resultado ronde el 4 al 7 %.
- Se suman cuatro categorías de gasto (Publicidad, Contador, Seguros, Envíos y fletes); los sueldos de Empleados suman lo mismo que el gasto «Sueldos».
- Costos fijos: 11 (uno anual sin pagar, para probar «Registrar pago»). Costos variables: 6. Impuestos y cargas: 6 (la cuota de monotributo solo cuenta en ese régimen). Presupuestos: uno por cada costo real, con desvíos distintos para que haya líneas pasadas y por debajo.
