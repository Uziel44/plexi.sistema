# Factory: diseño

Fecha: 2026-10-13. Proyecto: `plexi.sistema` (demo interactiva de Plexi POS, HTML, CSS y JavaScript puros).

## Objetivo

Hacer con los 23 módulos de *Inventario, fabricación y mantenimiento* de Odoo 20.0 Community lo mismo que ya se hizo con los 14 de Contabilidad: reimplementar lo que Plexi no tiene como una sola pantalla de la demo, con pestañas, sin copiar código de Odoo y dejando un mapa de qué módulo origina cada pestaña. La demo se muestra a clientes, así que tiene que verse y usarse como el programa real, con datos de ejemplo.

## Decisiones tomadas con el usuario

- **Una sola pantalla** en el menú, llamada **Factory**, con los 23 módulos adentro, como Contabilidad.
- **Ocho pestañas**: Depósitos, Valuación y costos, Códigos de barras, Envíos, Producción, Subcontratación, Mantenimiento y Reparaciones.
- **Rubro nuevo «Fábrica»** con productos genéricos (A, B y C, materias primas e insumos). Factory aparece solo en ese rubro; los otros cuatro no cambian.
- **Código**: dos archivos que siguen el molde de `screens1.js` a `screens4.js` (`screens5.js` y `screens6.js`), con datos propios armados por una función `ensure()` la primera vez que se entra.
- **Alcance**: todo lo que Plexi no tiene de esos módulos. Lo que se deja afuera de cada uno está en `campo/factory/README.md`.

## Arquitectura

| Archivo | Qué contiene |
|---|---|
| `js/data.js` | Rubro `fabrica` en `P.TYPES` y `P.DEMO_TYPES`, su catálogo (con `stock` y `min` fijos), sus proveedores y la asignación de proveedor por tipo de producto. |
| `js/screens5.js` | Esqueleto `P.screens.factory` y registro `P.fac`; ayudas compartidas (stock por depósito, lotes, EAN-13 y GS1, SMS); datos base; pestañas Depósitos, Valuación y costos, Códigos de barras y Envíos. |
| `js/screens6.js` | Pestañas Producción, Subcontratación, Mantenimiento y Reparaciones y sus datos de ejemplo. Se suman al esqueleto con `P.fac.tab()` y `P.fac.seeders`. |
| `js/app.js` | Un ítem del menú puede limitarse a rubros con un quinto dato (`['fabrica']`); el ingreso suma el botón del rubro. |
| `css/app.css` | Tablero (`.kan`), pestañas que se acomodan en filas (`.tabs.wrap`) y el quinto rubro en el ingreso. |
| `campo/factory/README.md` | Mapa Odoo → Plexi. |

Cada pestaña es un objeto `{ key, label, order, badge, body(b, ctx), events(v, ctx) }`. El esqueleto dibuja las pestañas ordenadas, llama a `body` de la activa y registra una sola vez los eventos de todas; por eso cada pestaña usa su propio prefijo en los atributos (`data-w-*`, `data-v-*`, `data-b-*`, `data-s-*`, `data-p-*`, `data-u-*`, `data-m-*`, `data-r-*`).

## Integración con lo existente (no se duplican datos)

- **Stock**: el total de cada producto es `p.stock` de Inventario. Planta de producción y Salón de ventas guardan su parte (`f.loc`) y el Depósito central es el resto, así los ajustes que se hagan en Inventario nunca desordenan la distribución. Toda operación que cambia la cantidad usa `F.move()`, que deja el movimiento en Inventario.
- **Compras**: Reposición crea órdenes en el mismo formato que Proveedores (`S.orders`). La subcontratación registra una orden ya recibida y suma la deuda al taller (`S.suppliers[].balance`).
- **Gastos**: un mantenimiento terminado agrega un gasto de la categoría «Mantenimiento».
- **Clientes**: una reparación facturada agrega un cargo al libro de la cuenta del cliente.
- **Costos**: terminar una orden o recibir una subcontratación promedia el costo del producto terminado; la revalorización y los costos de importación cambian `p.cost`.

## Verificación

No hay corredor de pruebas. Se verificó en el navegador (servidor estático local):

- Recorrido de las 8 pestañas y todas sus vistas sin errores de JavaScript, en escritorio y en celular (sin desborde horizontal).
- Cada acción que mueve datos, con el efecto comprobado: transferencia (el total no cambia), baja de lote, reposición, revalorización, costo de importación, escáner (EAN-13 con dígito verificador válido y lectura GS1), despacho con flota, entrega con SMS, orden de producción (terminar y desarmar), subcontratación (con y sin envío directo), mantenimiento (repuestos, gasto y próximo preventivo) y reparación (garantía y cobro).
- Los otros cuatro rubros y el rol cajero no ven Factory, y el acceso directo por URL en un rubro sin Factory vuelve al panel.
- Las demás pantallas (Inventario, Productos, Contabilidad, Proveedores, Punto de venta y Panel) siguen funcionando con el rubro nuevo.
