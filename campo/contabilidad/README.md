# Contabilidad: de dónde sale cada pestaña

La pantalla **Contabilidad** de la demo (`js/screens4.js`, menú de administrador y gerente) se inspira en los 14 módulos de *Contabilidad y facturación* de **Odoo 20.0 Community** (`addons/account*` y `addons/analytic`).

Esta carpeta es solo el mapa: **no contiene código de Odoo**. Los módulos son Python y XML, no corren en un navegador, y los 14 juntos pesan 81,5 MB (9,6 MB sin traducciones) con licencia LGPL-3. La demo reimplementa la idea en JavaScript puro, como el resto de Plexi.

Código fuente de referencia: `100modelos github/73 odoo-20.0/odoo-20.0/addons/<módulo>`.

## Qué ya tenía Plexi (no se volvió a crear)

| Concepto contable | Dónde está en Plexi | Cómo lo usa Contabilidad |
|---|---|---|
| Facturas de cliente y notas de crédito | **Historial de ventas** (número de factura, impuesto por venta, reembolso total o parcial) | La pestaña *Facturas* lista esas mismas ventas con su base, impuesto y estado, y abre el mismo recibo. |
| Cobros y cuentas a cobrar | **Clientes** (cuenta corriente y cobro de deudas) y **Caja** | El *Resumen* suma lo que se debe y la nota de débito se carga en la cuenta del cliente. |
| Gastos y facturas de proveedor | **Gastos** y **Proveedores** (deudas y órdenes de compra) | El *Resumen* y la *Analítica* usan esos gastos, y los cheques pagan esas deudas. |
| Resultado y ganancias | **Reportes → Ganancias** | El *Resumen* da el estado de resultados en tres períodos y enlaza a Reportes para el detalle por día. |
| Impuesto general | **Configuración** (una sola tasa) | Aparece como la primera regla de *Impuestos*, de solo lectura. |

## Qué se sumó

| Módulo de Odoo | Pestaña en Plexi | Qué hace en la demo |
|---|---|---|
| `account` (Invoicing) | Resumen y Facturas | Estado de resultados, por cobrar, por pagar y vista contable de las facturas. |
| `account_debit_note` | Facturas → Notas de débito | Emite una nota de débito sobre una factura (intereses, envío, ajuste…). Si el cliente está registrado, se suma a su cuenta corriente. |
| `account_tax_python` | Impuestos | Reglas de impuesto propias (porcentaje, porcentaje sobre el excedente de un mínimo, importe fijo) y una calculadora. No usa código Python: las tres formas se calculan con fórmulas fijas. |
| `analytic` | Analítica | Rentabilidad por categoría de producto y gastos asignables a un centro de costo (Local, Depósito, Administración). |
| `account_check_printing` | Cheques y comprobantes | Emisión de cheques a proveedores: baja la deuda, se imprime con el importe en letras y se puede anular. |
| `account_edi`, `account_edi_ubl_cii`, `account_peppol` | Cheques y comprobantes | Envío simulado del comprobante electrónico de cada factura, con una vista simplificada del archivo. No sale nada de la página. |

## Qué se dejó afuera, y por qué

| Módulo de Odoo | Motivo |
|---|---|
| `account_test`, `account_update_tax_tags`, `account_edi_proxy_client` | Son técnicos: pruebas internas, actualización de etiquetas de impuestos y un servicio de conexión. No tienen pantalla que mostrar. |
| `account_fleet` | Une Contabilidad con Flota, y Plexi no tiene Flota. |
| `account_qr_code_sepa`, `account_qr_code_emv` | QR bancarios. Plexi ya cobra con el QR de Mercado Pago (se conecta en Configuración). |

## Datos de ejemplo que agrega la pantalla

Se arman la primera vez que se entra a Contabilidad y se reinician con la demo, como todo lo demás:

- 3 notas de débito ya cobradas, sobre ventas a consumidor final.
- 2 cheques a proveedores (uno emitido, uno cobrado).
- 5 reglas de impuesto de ejemplo.
- Las 3 facturas más recientes y las del día aparecen como "sin enviar" para poder probar el envío.
- Cada gasto existente queda asignado a un centro de costo según su categoría (se puede cambiar).
