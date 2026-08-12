# Changelog

Generado con `scripts/changelog.sh` desde los conventional commits.
No editar a mano: los cambios se pierden en la siguiente regeneracion.

## Agosto 2026

### Novedades

- **pos:** activar el envio a domicilio desde Preferencias ([`dd66d2c`](https://github.com/mitienda-pe/mitiendaPOS/commit/dd66d2c7fd65a1cf0c7f1eb61517c571def862c7))
- **pos:** versionado semver y banner de nueva version publicada ([`c17d215`](https://github.com/mitienda-pe/mitiendaPOS/commit/c17d21589ae97afe9fc2336f0307b4e23a7264e9))
- **pos:** tomar pedidos con envio a domicilio desde el mostrador ([`67a4b97`](https://github.com/mitienda-pe/mitiendaPOS/commit/67a4b979cc715072169fa140cda4070a841c72a4))
- **reportes:** acotar los reportes a ventas de caja y filtrar por sucursal/cajero ([`96569f5`](https://github.com/mitienda-pe/mitiendaPOS/commit/96569f592912308e454545bbce5e6aa3ab7debc6))
- **icbper:** cobrar y mostrar el impuesto a las bolsas (Ley 30884) ([`4e24307`](https://github.com/mitienda-pe/mitiendaPOS/commit/4e243075ab5881fd2ccae15368ff8733fbc549dd))

### Correcciones

- **pos:** no caer al dueno de la tienda como cajero del ticket ([`f477aac`](https://github.com/mitienda-pe/mitiendaPOS/commit/f477aac6db9131a12aaa4020bb173b2323bc90a2))
- **dashboard:** color para el balde "Sin emitir" del grafico de comprobantes ([`fc2f0a5`](https://github.com/mitienda-pe/mitiendaPOS/commit/fc2f0a584e78054697a7cbeedbcd9e3b94438d7f))

## Julio 2026

### Novedades

- **netsuite:** campo Ítem de envío/Delivery en config general POS ([`5d36c24`](https://github.com/mitienda-pe/mitiendaPOS/commit/5d36c244d145082240b4e64c0ad770a8d3a60a98))
- **pos:** declarar contexto POS y toggle "Visible en el POS" ([`d6f7732`](https://github.com/mitienda-pe/mitiendaPOS/commit/d6f7732fee5808ec503879c8ed24f75ba8420a6c))
- **pos:** enviar domicilio fiscal del RUC al crear cliente y vender ([`03670a3`](https://github.com/mitienda-pe/mitiendaPOS/commit/03670a37cd996dc3725e20e31cf03d8030afdf90))
- **pos:** cotizaciones/proformas — guardar carrito sin descontar stock ([`2818ce9`](https://github.com/mitienda-pe/mitiendaPOS/commit/2818ce99a3664aabb1a49dd7b3bd5bb04b656196))
- **pos:** impersonación de superadmin para acceder a cualquier tienda ([`134d31f`](https://github.com/mitienda-pe/mitiendaPOS/commit/134d31fd936c9e03e80486fce29a998b11d40271))
- **pos:** UX descuento V2 + input de cupón en la venta (WIP Fase 1/2) ([`7451f3a`](https://github.com/mitienda-pe/mitiendaPOS/commit/7451f3a3b27127ef9e05b4626ec12064e3d645bc))
- **pos:** informar baja SUNAT diferida al anular una venta ([`01b6fda`](https://github.com/mitienda-pe/mitiendaPOS/commit/01b6fdab179a6a419f63eb2561777765ea431a42))
- **pos:** getters de Promociones V2 en cart store (WIP Fase 1) ([`c13bb3a`](https://github.com/mitienda-pe/mitiendaPOS/commit/c13bb3a367465501088d8fd7d5cacc5da6db4172))
- **ventas:** columna Estado en tabla y enlace a detalle desde ID ([`1a69d42`](https://github.com/mitienda-pe/mitiendaPOS/commit/1a69d42dd27afdf291714aa70ab0bd1536eb3d71))
- **pos:** botón emitir comprobante manual en modal de confirmación ([`0be16a4`](https://github.com/mitienda-pe/mitiendaPOS/commit/0be16a4614c2ce8e2dd547ebeaf3bfd70a495f6a))
- **help:** documentar QZ Tray en Impresora Térmica y Centro de Ayuda ([`0d14fc6`](https://github.com/mitienda-pe/mitiendaPOS/commit/0d14fc60f527291a04027a6412d01c629d8579a8))
- **auth:** enviar source=pos en forgot-password ([`0886556`](https://github.com/mitienda-pe/mitiendaPOS/commit/0886556f2a9c267d1559b6b24342f2b56fc56908))
- **pos:** simplificar menú y fusionar Documentos en Ventas ([`c7ff499`](https://github.com/mitienda-pe/mitiendaPOS/commit/c7ff499fa5ec184db04f1dc6ff07cf0548943179))
- **inventory:** precio con 2 decimales al cargar y al salir del campo ([`de0c59f`](https://github.com/mitienda-pe/mitiendaPOS/commit/de0c59f979c6a17e0af83c3986f7b38fea2ec9f9))
- **inventory:** filtros de categoría y marca + ocultar columna categoría ([`524a1cd`](https://github.com/mitienda-pe/mitiendaPOS/commit/524a1cd870cc01d9c88e01e5b1aada0fde49e950))
- **inventory:** stock obligatorio y quitar toggle Publicado del POS ([`29b87b7`](https://github.com/mitienda-pe/mitiendaPOS/commit/29b87b7d896b941cfaebcec994ea77e2eb3e1a13))
- **inventory:** reordenar y etiquetar el formulario de producto ([`ba887f3`](https://github.com/mitienda-pe/mitiendaPOS/commit/ba887f30d7f27c15ebea088dacf0190a1220d399))
- **pos:** filtrar catálogo por categoría y marca vía API en el modal ([`933b0d2`](https://github.com/mitienda-pe/mitiendaPOS/commit/933b0d20b9b6d981e052796e084a801111043c88))
- **inventory:** edición completa de productos y quitar botón "Volver al Menú" ([`e900982`](https://github.com/mitienda-pe/mitiendaPOS/commit/e9009825092035513cfe05010f95e1fa80b743c7))
- **tax:** respetar afectación IGV por producto en catálogo, caja y recibo ([`1053436`](https://github.com/mitienda-pe/mitiendaPOS/commit/10534361af21d53a78a77a5e4d675626d24f111d))
- **inventory:** ocultar botones de sincronización sin integración NetSuite ([`5ffb82d`](https://github.com/mitienda-pe/mitiendaPOS/commit/5ffb82d3e14dada45528516d76e5a30b5e000445))
- **payment:** pago con Ligo QR en el POS ([`2254c18`](https://github.com/mitienda-pe/mitiendaPOS/commit/2254c188d01a0735191f133b760bfa27425427be))
- **netsuite:** modo de sincronización por canal (web/pos) en config POS ([`42815de`](https://github.com/mitienda-pe/mitiendaPOS/commit/42815deb7eec69082fc1116414f10a1cd62c9303))
- **netsuite:** override de serie por sucursal como select que hereda (POS) ([`4c40686`](https://github.com/mitienda-pe/mitiendaPOS/commit/4c4068680f35cda2e6deed55d574bbf904a7b46b))
- **netsuite:** configurar Modo de sync y Custom Form del Sales Order ([`5585631`](https://github.com/mitienda-pe/mitiendaPOS/commit/5585631c5adaf5a8c99b62ac1fdcfdd07152cd66))

### Correcciones

- **inventario:** declarar contexto POS tambien en inventoryApi ([`14333b5`](https://github.com/mitienda-pe/mitiendaPOS/commit/14333b5e2fb204ab635e7b4e0e99ac6a4ac84d45))
- **pos:** no refrescar token durante impersonación al recibir 401 ([`617c16c`](https://github.com/mitienda-pe/mitiendaPOS/commit/617c16ccc802ec9b1cf0dc744875a75708272c58))
- **billing:** mostrar mensaje real al fallar la emisión de comprobante ([`17bed56`](https://github.com/mitienda-pe/mitiendaPOS/commit/17bed56c750929b8ba2ab25b9763b6cd91ab7a14))
- **pos:** no desagregar IGV en detalle de ventas exoneradas/inafectas ([`4ab0259`](https://github.com/mitienda-pe/mitiendaPOS/commit/4ab02590762c19e5b4b1e4e36c089af8c1bacd06))
- **pos:** no mostrar falsa alerta de error ERP en tiendas sin integración ([`95d7609`](https://github.com/mitienda-pe/mitiendaPOS/commit/95d760953198581e5f6d65f2997f07cf69f966ce))
- **help:** actualizar contacto de soporte en artículo Soporte Técnico ([`ecef2cf`](https://github.com/mitienda-pe/mitiendaPOS/commit/ecef2cf7baebe8d10801529b0677c0c669bcd075))

## Junio 2026

### Novedades

- **pos:** venta al peso con modal de ingreso de peso ([`b301951`](https://github.com/mitienda-pe/mitiendaPOS/commit/b301951acdbd1208e23c2449520bdc80b3689a3c))
- **billing:** configurar Bizlinks desde el POS (además de Nubefact) ([`e36e75e`](https://github.com/mitienda-pe/mitiendaPOS/commit/e36e75eda82cf38736a33b1d997148506ece24b1))
- **billing:** toggle de emisión automática en config Nubefact del POS ([`44ff150`](https://github.com/mitienda-pe/mitiendaPOS/commit/44ff1507e70d27407df2fc2a336f8f69802774c8))
- **register:** aviso no bloqueante cuando el correo ya tiene cuenta ([`1f1eb79`](https://github.com/mitienda-pe/mitiendaPOS/commit/1f1eb79bd1aa8cfcd9d3d3ed818ee2d5f948eca7))
- **inventario:** ingreso y gestión de lotes en el POS (Fase 2) ([`8378ccf`](https://github.com/mitienda-pe/mitiendaPOS/commit/8378ccf00f6f5ff8fc6f3b2e5e4aa29e7a26c11a))
- **productos:** capturar costo y mostrar ganancia (solo admin) ([`4096946`](https://github.com/mitienda-pe/mitiendaPOS/commit/409694660e83b36e76b157dddab013b6fabdbbe2))
- **inventory:** autocompletado del catálogo maestro en alta de productos ([`6967205`](https://github.com/mitienda-pe/mitiendaPOS/commit/6967205b585fb763c8afab505b9843bf64003423))
- **pos:** venta de productos con variaciones ([`8fb5386`](https://github.com/mitienda-pe/mitiendaPOS/commit/8fb5386ad767dcb487c662100e027911eb48be8f))
- **pos:** cargar QR de Yape/Plin desde ajustes de métodos de pago ([`e3db066`](https://github.com/mitienda-pe/mitiendaPOS/commit/e3db066b6e611bd775086d9659dcad9508bbf646))
- **pos:** pago con QR de billetera (Yape/Plin) con conciliación manual ([`4623656`](https://github.com/mitienda-pe/mitiendaPOS/commit/4623656ef27dc1f140e8e2059feca0b7b1910439))
- **billing:** botón "Emitir comprobante" en modo manual ([`06c3928`](https://github.com/mitienda-pe/mitiendaPOS/commit/06c3928425a840cd0a4e7e965a2218bcba313e7f))
- **dashboard:** card de operaciones por método de pago ([`0d20680`](https://github.com/mitienda-pe/mitiendaPOS/commit/0d206808fbfd8f9a01ed2f9144efa0f14981fbbb))
- **pos:** widget de soporte Tawk.to con contexto de sesión ([`ef1d025`](https://github.com/mitienda-pe/mitiendaPOS/commit/ef1d0250e04cae04893c2b52ebe600f850844588))
- **shifts:** mostrar redondeo POS en cierre e historial de caja ([`40e8423`](https://github.com/mitienda-pe/mitiendaPOS/commit/40e8423ef2d3c09fe526064fbb5a8c360cd9fd15))
- **stock:** UI de gestión de stock por sucursal (Etapa 2 multi-sucursal) ([`8750711`](https://github.com/mitienda-pe/mitiendaPOS/commit/8750711bff32c74e7d0a4b5616c2aa04362cc2bd))
- **pos:** rutear tiendas NO-NetSuite al endpoint nativo de api2 ([`4380535`](https://github.com/mitienda-pe/mitiendaPOS/commit/43805350633dc893858286363dd1bc7386a73fc3))
- **pos:** el administrador puede cerrar turno sin PIN de cajero ([`d4d2914`](https://github.com/mitienda-pe/mitiendaPOS/commit/d4d2914ca2607ab4dcc442a6ee733dd007c6a9fc))
- **pos:** el administrador puede abrir turno y vender sin cajero ([`e6d2935`](https://github.com/mitienda-pe/mitiendaPOS/commit/e6d2935b7e8cab05a678969a200e4d757c926794))
- **inventory:** carga masiva de productos por CSV ([`717edb3`](https://github.com/mitienda-pe/mitiendaPOS/commit/717edb3217244b3fff55e26a4eb26e01a77af9e3))

### Correcciones

- **billing:** ocultar selector de formato PDF en config Bizlinks (POS) ([`b7edc28`](https://github.com/mitienda-pe/mitiendaPOS/commit/b7edc28576935e094e50ff079ed899644c5ced85))
- **settings:** eliminar enlace 'Volver al Menú' que obstruía botones de submit ([`1d2bde1`](https://github.com/mitienda-pe/mitiendaPOS/commit/1d2bde1b5726c5ae11ad7997141bdb6fe150500b))
- **pos:** evitar ventas con cajero_id null por sesión de cajero expirada ([`a1fa8fc`](https://github.com/mitienda-pe/mitiendaPOS/commit/a1fa8fc8a2d2c441551cb00879221035b5ca999b))
- **images:** thumbnails reales en grilla POS, inventario y modales ([`cc26775`](https://github.com/mitienda-pe/mitiendaPOS/commit/cc267755030548a5d3c0a2ae1dae26b2837bc569))
- **deploy:** permitir build de workerd (wrangler) y cámara para escáner de barras ([`6f3994d`](https://github.com/mitienda-pe/mitiendaPOS/commit/6f3994df12bccc246eb20a94c7c9b7b5d7889019))
- **users:** soportar respuesta envuelta de check-pin ([`daf74c2`](https://github.com/mitienda-pe/mitiendaPOS/commit/daf74c203de2cbbec3acd1fda45388356e424cb5))
- **pos:** enviar comprobante por email de verdad al finalizar venta ([`ae6365a`](https://github.com/mitienda-pe/mitiendaPOS/commit/ae6365a70ea76151d6a9e0a24e2a1e43da8dde31))
- **auth:** no expulsar al visitante de páginas públicas al iniciar sin sesión ([`66672d9`](https://github.com/mitienda-pe/mitiendaPOS/commit/66672d9193da4aa38f9f4b6ff6b73752367801c4))

### Reversiones

- **pos:** forzar proxy legacy para todas las tiendas ([`cc52004`](https://github.com/mitienda-pe/mitiendaPOS/commit/cc52004556ca894709a95d01778ad9d1b2841e77))

## Mayo 2026

### Novedades

- **auth:** registro self-service en el POS (trial PDV) con OTP email + Cap.js ([`a7907d2`](https://github.com/mitienda-pe/mitiendaPOS/commit/a7907d2c646421636709a9aa6f2111b4c387d275))
- **settings:** administración autónoma del POS (datos, catálogo, facturación, reportes, formas de pago) ([`2521528`](https://github.com/mitienda-pe/mitiendaPOS/commit/25215282923dbbba5360142bb450e9a6e08189cc))
- **settings:** ocultar módulo NetSuite a tiendas sin NetSuite ([`c9ab917`](https://github.com/mitienda-pe/mitiendaPOS/commit/c9ab917a7e24ff78b066d8ae00958a55c41a414e))
- **pos:** subir timeout de bloqueo por inactividad a 10 minutos ([`164ef47`](https://github.com/mitienda-pe/mitiendaPOS/commit/164ef47c7c90bcd4bca3fe828140e7904577a5fb))
- **cashier-login:** recordar ID de tienda para solo digitar PIN ([`2b9f14b`](https://github.com/mitienda-pe/mitiendaPOS/commit/2b9f14bcfdcdb6de2bad1ec5385d26f3e65211f0))
- **mobile-menu:** enlaces directos a todos los módulos en hamburguesa (#12) ([`553eb2f`](https://github.com/mitienda-pe/mitiendaPOS/commit/553eb2fb26c2687582ea564eb6c7cfaf849b948e))
- **inventory:** crear productos desde el POS (formulario mínimo) ([`70f8807`](https://github.com/mitienda-pe/mitiendaPOS/commit/70f880733704b4236ad5993855d0fe18c6c27a63))
- **netsuite-users:** rediseño mobile de usuarios NetSuite (#11) ([`9a240d5`](https://github.com/mitienda-pe/mitiendaPOS/commit/9a240d57c283a2970ea0391936b13157b2c40773))
- **promotions:** rediseño mobile de listado de bonificaciones (#10) ([`66d7a46`](https://github.com/mitienda-pe/mitiendaPOS/commit/66d7a4604ab31f5160fbea55361b01572a8f7e60))
- **inventory:** rediseño mobile de listado de productos (#9) ([`26a2e90`](https://github.com/mitienda-pe/mitiendaPOS/commit/26a2e90035eddf419949fee17914f17d3518b8b9))
- **customers:** rediseño mobile de listado de clientes (#8) ([`bd9b5f6`](https://github.com/mitienda-pe/mitiendaPOS/commit/bd9b5f603a11a22385db69b2507739393aa743d8))
- **sales:** rediseño mobile de historial y detalle de ventas (#7) ([`08bcfcd`](https://github.com/mitienda-pe/mitiendaPOS/commit/08bcfcd02f279d3d8c22a42b6496b951177a00ff))
- **pos:** rediseño mobile con sticky bottom bar + bottom-sheet (#6) ([`f87d493`](https://github.com/mitienda-pe/mitiendaPOS/commit/f87d4939ffbb0436097c92689f1a3b843f8274ce))
- **netsuite:** sección admin de sincronización con NetSuite ([`812a595`](https://github.com/mitienda-pe/mitiendaPOS/commit/812a595be98f7e054ab09ec1b391d1db2c7bc2ea))
- **pos:** mejora del buscador de productos (Meilisearch + UX) ([`127f17f`](https://github.com/mitienda-pe/mitiendaPOS/commit/127f17f94a495c8a901ff6e3c9a8c334589d05f2))
- **pos:** menú filtrado por rol + dashboard de desempeño para cajeros ([`c522ff5`](https://github.com/mitienda-pe/mitiendaPOS/commit/c522ff5352284174e9692ce1810fd22d1ef8bcf6))
- **search:** integrar /products/search detrás de VITE_USE_MEILI_SEARCH ([`d10b08d`](https://github.com/mitienda-pe/mitiendaPOS/commit/d10b08dead9d65402b4c12472b08c819149bf124))
- **pos:** navegación por teclado en el buscador de productos ([`3aea4e1`](https://github.com/mitienda-pe/mitiendaPOS/commit/3aea4e1e3db771ecc14e85c6ac68cabeaeb86703))
- **dashboard:** reemplazar datos hardcoded con métricas reales del POS ([`2a0b45a`](https://github.com/mitienda-pe/mitiendaPOS/commit/2a0b45aea648b65b5f97a8bea63ace42882fe045))
- **ui:** migrar paleta de colores a primary (#00b2a6) en toda la app ([`84029e7`](https://github.com/mitienda-pe/mitiendaPOS/commit/84029e7df8b6c65e0d0418f29ad65a1bfd79b7d7))
- **pdv:** validar mod_pos vía /pos/access antes de permitir entrar ([`6b060b4`](https://github.com/mitienda-pe/mitiendaPOS/commit/6b060b4b145face0b8fe4e546dfe2ca95314b60e))
- **receipt:** mostrar variante seleccionada en el ticket ([`ec21781`](https://github.com/mitienda-pe/mitiendaPOS/commit/ec21781768f8991502a5cbae148c036972873f32))
- **costa-rica:** formatters configurables vía setCurrencyConfig ([`f632850`](https://github.com/mitienda-pe/mitiendaPOS/commit/f6328509d5d3f8a5e711eb4f3164007c46d75b82))
- **netsuite:** banners severity-aware (rojo críticos / amarillo warnings) ([`0ec4785`](https://github.com/mitienda-pe/mitiendaPOS/commit/0ec47854a3c1141dd66f6467fa1154451f5b13a6))
- **netsuite:** pantalla de configuración general + validación de IDs faltantes ([`4382916`](https://github.com/mitienda-pe/mitiendaPOS/commit/4382916ff64949400d46b45e42753ec493767cc9))
- **auth:** banner de sesión cruzada cuando el JWT apunta a otra tienda (#1) ([`287f34a`](https://github.com/mitienda-pe/mitiendaPOS/commit/287f34a85b72a1cbbfecfe27326fe69d33a28be4))
- **inventory:** sync de stock/precios tienda-wide desde el POS ([`1b1872b`](https://github.com/mitienda-pe/mitiendaPOS/commit/1b1872bac163c4d8e51d224665193fa41efe026c))

### Correcciones

- **ticket:** usar datos de la tienda autenticada en vez de hardcodear San Jorge ([`4225bd5`](https://github.com/mitienda-pe/mitiendaPOS/commit/4225bd554fd4fc89bf1acab591a8c8b40b8481d7))
- **menu:** usar clases Tailwind estáticas en vez de template literals ([`450a19c`](https://github.com/mitienda-pe/mitiendaPOS/commit/450a19c610b90467fdea8cc22cb219dab4a83e8c))
- **mobile:** mejorar layout responsive en Dashboard, Settings y todas las vistas ([`e069741`](https://github.com/mitienda-pe/mitiendaPOS/commit/e06974176d463e7f170b67355d52b48b721459b0))
- **mobile:** hacer navbar funcional y mejorar layout en celulares ([`cb4a1ad`](https://github.com/mitienda-pe/mitiendaPOS/commit/cb4a1ad24fb154f55c321b0337ab00411b43c9f5))
- **ci:** subir Node a 22 (pnpm 11.1.1 requiere >=22.13) ([`5e1bdee`](https://github.com/mitienda-pe/mitiendaPOS/commit/5e1bdeebc36998e108d769c2d75d5960cd4acaaf))
- **inventory:** pasar tiendadireccion_id del turno a /products ([`6ce6794`](https://github.com/mitienda-pe/mitiendaPOS/commit/6ce6794dd31e79dc9adc7389ae0bb3a7eced07ce))
- **inventory:** manejar respuesta synced=false / skipped del sync de stock ([`c6e782d`](https://github.com/mitienda-pe/mitiendaPOS/commit/c6e782d648040cef7b56f9b0bbb4e5db55104038))
- **netsuite:** soportar fix_action set_natural_person_with_ruc ([`b945336`](https://github.com/mitienda-pe/mitiendaPOS/commit/b94533696e9b94ef62db71c4510c6768ea575d28))

## Abril 2026

### Novedades

- **netsuite:** UI para overrides de series y generic customer por sucursal ([`1caebf1`](https://github.com/mitienda-pe/mitiendaPOS/commit/1caebf1d2d89ffdf15fe8c97311517b9353295cd))
- pre-validate NetSuite customer before creating POS sale ([`9872076`](https://github.com/mitienda-pe/mitiendaPOS/commit/98720763b7a600cfbc76b27b6e06281db97777bf))
- **payments:** add Kasnet (QR + agente) to PaymentModal ([`593d1d7`](https://github.com/mitienda-pe/mitiendaPOS/commit/593d1d700950d53a54016ac02d78cbd9efca061c))
- sortable column headers in Inventory screen ([`8c90c21`](https://github.com/mitienda-pe/mitiendaPOS/commit/8c90c21d255630d07a45fcd90e94d5e17567ac9a))
- allow cajero role to trigger ERP stock sync ([`f4e7537`](https://github.com/mitienda-pe/mitiendaPOS/commit/f4e753709d27164283837935c772f869ad3d0fd8))
- show void button on POS sales and add manual ERP stock sync ([`04b5d5f`](https://github.com/mitienda-pe/mitiendaPOS/commit/04b5d5fd8f1971bca3bd7db6230c0a67183848b6))
- skip frontend cash movement registration when backend handles it ([`6bd270d`](https://github.com/mitienda-pe/mitiendaPOS/commit/6bd270d219bcf47717c2c1a1c55c000a4b69b415))

### Correcciones

- **netsuite:** comparar tiendadireccion_id como number en getBranchConfig ([`f2ffc29`](https://github.com/mitienda-pe/mitiendaPOS/commit/f2ffc29ce9e38894b71571bf37d2eb32d5793eaa))
- **netsuite:** no enviar header Cache-Control desde el cliente ([`ac079ac`](https://github.com/mitienda-pe/mitiendaPOS/commit/ac079acc5f790d27bf9477f24fdc26d183009be7))
- **netsuite:** cache buster en getNetsuiteConfig ([`4c0f4a2`](https://github.com/mitienda-pe/mitiendaPOS/commit/4c0f4a22a1b5f6a40f6eac72cf7448b81629d8f0))
- **catalog:** send active sucursal as tiendadireccion_id when listing products ([`fe505d8`](https://github.com/mitienda-pe/mitiendaPOS/commit/fe505d8375eefe8de346649fc3125b9d86bbe3e8))
- **stock:** send active sucursal as tiendadireccion_id on stock queries ([`d21cd49`](https://github.com/mitienda-pe/mitiendaPOS/commit/d21cd49bc4bcb65bda440c6dce8fc8afaa208ea2))
- **users:** parse sucursales_ids CSV string when editing empleado ([`80c6f90`](https://github.com/mitienda-pe/mitiendaPOS/commit/80c6f9029fb678fdc3019059bf7c33ce9a7bf23a))
- use source field from API for order origin display ([`4c8dcfb`](https://github.com/mitienda-pe/mitiendaPOS/commit/4c8dcfbb5e7a4ef98c36313d5024f95cf70ab163))
- correct sale detail links in shift movement tables ([`cded156`](https://github.com/mitienda-pe/mitiendaPOS/commit/cded156a8adf9fb10af7258eaf34ab960bad108a))
- prevent modal backdrop close and fix branch checkbox binding in Users view ([`4e7c6eb`](https://github.com/mitienda-pe/mitiendaPOS/commit/4e7c6ebf9703d0620934326f7ff9427daa1aa177))

### Refactor

- **payments:** align kasnet client to backend QR-only refactor ([`94492ca`](https://github.com/mitienda-pe/mitiendaPOS/commit/94492ca6d46edf84966980612ef2bf5996b3923c))

## Marzo 2026

### Novedades

- add void sale UI with auth modal and ANULADO status ([`52b5d95`](https://github.com/mitienda-pe/mitiendaPOS/commit/52b5d9506986d57d588c79385e66a420d8e41f7f))
- show ANULADO badge for voided movements in shift report ([`13727e1`](https://github.com/mitienda-pe/mitiendaPOS/commit/13727e1a56fd6fe6f37b823990115cf8685c65be))
- support NetSuite-emitted billing documents in sale detail ([`2a4e40f`](https://github.com/mitienda-pe/mitiendaPOS/commit/2a4e40fd6e8a8780627f1a52526a28f0af8c7a06))
- add Google Analytics (G-7JXW2GGFX1) ([`2c3b611`](https://github.com/mitienda-pe/mitiendaPOS/commit/2c3b61172ecf19bd59e70dbf2be3b6ea0782d2d6))

### Correcciones

- prevent duplicate order creation on slow API responses ([`8a4a9a6`](https://github.com/mitienda-pe/mitiendaPOS/commit/8a4a9a6b3086fe5faa82b093d7800b00ef38373d))
- apply billingDocumentType after resetSale() to prevent overwrite ([`0b370ca`](https://github.com/mitienda-pe/mitiendaPOS/commit/0b370cac4a93cf0ce0ff741847e07212d55cf662))
- clear shift state when switching stores to prevent cross-tenant movements ([`cfdaca9`](https://github.com/mitienda-pe/mitiendaPOS/commit/cfdaca93cb106c9f2478b7b42c087b95fef0340b))
- handle all error types in stock validation modal and guard NaN ([`5b3c582`](https://github.com/mitienda-pe/mitiendaPOS/commit/5b3c582f42a3f50dfeaf35a95630711c6a834e8e))

## Febrero 2026

### Novedades

- integrate QZ Tray thermal ESC/POS printing for receipt tickets ([`fe7bbc6`](https://github.com/mitienda-pe/mitiendaPOS/commit/fe7bbc6b2b07f8533cbc7ecfa7a570b4be02b690))

### Correcciones

- use unsigned mode for QZ Tray certificate (empty resolve triggers trust dialog) ([`2088ba9`](https://github.com/mitienda-pe/mitiendaPOS/commit/2088ba9a844d415898fd0ecc3d8029058e9f6276))
- use correct field names for POS print ticket (nombre, precio, cantidad) ([`16b3d57`](https://github.com/mitienda-pe/mitiendaPOS/commit/16b3d575cc1466574f85a0bf419714d79424558e))
- POS ticket prints blank page due to inherited print CSS ([`27582b7`](https://github.com/mitienda-pe/mitiendaPOS/commit/27582b7e4750e4cd3c48f6b992310f348b39b0fd))

## Enero 2026

### Novedades

- add NetSuite customer validation before starting sale ([`2dff04a`](https://github.com/mitienda-pe/mitiendaPOS/commit/2dff04aaf4228d761fe628e56dc792d5e07d30d7))
- filter POS promotions to exclude specific-customer audience ([`f693f65`](https://github.com/mitienda-pe/mitiendaPOS/commit/f693f6544147ff715ca52bf38356596f0b4adfcf))
- improve ERP sync status block in POS sale detail ([`3184ed4`](https://github.com/mitienda-pe/mitiendaPOS/commit/3184ed48ab205ce69dee58de904dedf89e8fbe53))
- improve product search in POS ([`321cc35`](https://github.com/mitienda-pe/mitiendaPOS/commit/321cc3538c2be4208ed853420b17eef2fc0a2420))
- show discount info on receipt ticket ([`532fb24`](https://github.com/mitienda-pe/mitiendaPOS/commit/532fb245a76e44062e7dcb894459440c02076c2b))
- **pos:** display discount in payment confirmation modal ticket ([`ee2b0a7`](https://github.com/mitienda-pe/mitiendaPOS/commit/ee2b0a7f6883c9d57d81f344eb8cf3a4ed6fe960))
- send promotion_id and unit_price_original in order payload ([`b6dd319`](https://github.com/mitienda-pe/mitiendaPOS/commit/b6dd31974b187fa84cd2213e08845820803fd4d9))

### Correcciones

- include original_price and discount_percent in ticket items ([`7bad186`](https://github.com/mitienda-pe/mitiendaPOS/commit/7bad1866e76fc803135f9596e3d0d26fdb0c9a5f))
- show unit prices with 2-3 decimals instead of always 2 ([`fe16b21`](https://github.com/mitienda-pe/mitiendaPOS/commit/fe16b21a36ab2591743987ebdd7e9bcedf0362fe))
- require backend totals before payment to prevent discrepancies ([`c099a6c`](https://github.com/mitienda-pe/mitiendaPOS/commit/c099a6c6f99d1bd402b527a78e3c31b30e40d922))
- normalize document_type validation for RUC in factura flow ([`f4f75e4`](https://github.com/mitienda-pe/mitiendaPOS/commit/f4f75e44b207d01a1534b1eff317604ef0c5ce40))
- correct field name for product quantity in promotions ([`9ec2cc9`](https://github.com/mitienda-pe/mitiendaPOS/commit/9ec2cc95fdc19645575bc7ae8e3341af199b88ea))

## Diciembre 2025

### Novedades

- **pos:** display promotion discount in cart items ([`4d3432c`](https://github.com/mitienda-pe/mitiendaPOS/commit/4d3432c9d3e1c9c6526296c12b64fc4ef5969cd9))
- **pos:** display product promotions with strikethrough and discount badge ([`af07246`](https://github.com/mitienda-pe/mitiendaPOS/commit/af072460b96a87140988b6d142e60f6d08856ac7))
- mostrar bonificaciones disponibles en modal de advertencia ([`e33d569`](https://github.com/mitienda-pe/mitiendaPOS/commit/e33d56929b8c8e89ecc0d00f7e2385ad5c12eee5))
- enviar IDs específicos de bonificaciones a excluir en lugar de booleano ([`5fa1627`](https://github.com/mitienda-pe/mitiendaPOS/commit/5fa1627c63811041c6efce8502d87e3c02a946f0))
- implementar skip_bonification_validation en POS para romper loop infinito ([`415f175`](https://github.com/mitienda-pe/mitiendaPOS/commit/415f175b77e84f4a60a55a3389a581c3f49661d9))
- modal de advertencia para bonificaciones sin stock ([`790319a`](https://github.com/mitienda-pe/mitiendaPOS/commit/790319a4e018d268c6824477e2a0d448d21892aa))
- **settings:** add NetSuite configuration modules and reorganize menu ([`67618c5`](https://github.com/mitienda-pe/mitiendaPOS/commit/67618c5a8abde2c526906faf3bc497e9cbd5a26b))
- **help:** add lock/unlock application section to cashier manual ([`67c08e2`](https://github.com/mitienda-pe/mitiendaPOS/commit/67c08e260181dc44822a31cc216c6b0625435b95))
- **orders:** normalize API response with pagination metadata ([`3b0c8a1`](https://github.com/mitienda-pe/mitiendaPOS/commit/3b0c8a1cca4057b7c374f74aa6fdc57e32cfe337))
- add scorecards section to shift report exports ([`1aef0af`](https://github.com/mitienda-pe/mitiendaPOS/commit/1aef0afae4d2524b70f10e5520185db517684a48))
- add CSV and PDF export functionality for shift reports ([`00e450d`](https://github.com/mitienda-pe/mitiendaPOS/commit/00e450dc05cdb2fe5162d549acbf62b38f074497))
- add comprehensive help module with user manuals ([`a3dd67f`](https://github.com/mitienda-pe/mitiendaPOS/commit/a3dd67f77b53e70268dcb1dbd10da11f61d6595f))
- improve cashier login log to show NetSuite ID ([`d065a58`](https://github.com/mitienda-pe/mitiendaPOS/commit/d065a58eed4c7a68a21306d2c938faaa63b8b0a8))
- **orders:** add NetSuite vendor ID to order payload ([`fde7369`](https://github.com/mitienda-pe/mitiendaPOS/commit/fde7369d9c0c3642d4bdf8a4d3cbca065a5af20f))
- **employees:** add NetSuite ID field to employee form ([`de0decb`](https://github.com/mitienda-pe/mitiendaPOS/commit/de0decb3d1858153938e5777b1248aafbc6a83df))
- **shifts:** replace average ticket card with card payments ([`12c258b`](https://github.com/mitienda-pe/mitiendaPOS/commit/12c258bd7cda67252be9200c84f555c03ea0296c))
- **pos:** disable credit note payment method button ([`a7d1746`](https://github.com/mitienda-pe/mitiendaPOS/commit/a7d17468069c3e0dffa61b989a361ba5b8f6f4d5))
- **pos:** disable bank payment method button ([`d3bd202`](https://github.com/mitienda-pe/mitiendaPOS/commit/d3bd202434f5eef40cf630a53402e129cf4507a6))
- **pos:** display currency with 2 decimals in UI ([`f17e614`](https://github.com/mitienda-pe/mitiendaPOS/commit/f17e614d49326fa1d1a43baf809f6df947f257bd))
- add centralized formatters with 8 decimal precision ([`0f8bea5`](https://github.com/mitienda-pe/mitiendaPOS/commit/0f8bea52c428e791530f21056c48e27fcf9a6662))
- **orders:** add email modal for invoice sending ([`7855fa5`](https://github.com/mitienda-pe/mitiendaPOS/commit/7855fa5662074925fbe9daaaddd166990118bab2))

### Correcciones

- **promotions:** use correct field name productobonificacion_cantidad instead of tiendapromocionproducto_cantidad ([`993ad50`](https://github.com/mitienda-pe/mitiendaPOS/commit/993ad5084f57722cfdb3f2b6488036f7e621060e))
- usar precio sin IGV del backend para evitar discrepancias de redondeo ([`2d1ffa6`](https://github.com/mitienda-pe/mitiendaPOS/commit/2d1ffa644033d266aba8cbce34349c7f707a1921))
- enviar skip_bonification_validation al crear orden ([`1ccb0df`](https://github.com/mitienda-pe/mitiendaPOS/commit/1ccb0dfb4ccc94b3b47bbc9a625e73accfc4730d))
- buscar has_bonification_issues también en messages para compatibilidad con CI4 fail() ([`1458e37`](https://github.com/mitienda-pe/mitiendaPOS/commit/1458e374842a563c3757cc1b172c70c5164ce1c5))
- **sales:** use normalized response.data instead of response.orders ([`fc3d176`](https://github.com/mitienda-pe/mitiendaPOS/commit/fc3d1760078e24930c0027994e981a95434c8fbd))
- use backend NetSuite calculation method for cart totals ([`351618a`](https://github.com/mitienda-pe/mitiendaPOS/commit/351618ae74d63440a110e6f6a8ee9aaa15830a4f))
- remove real store ID from cashier login placeholder ([`bc2b2b1`](https://github.com/mitienda-pe/mitiendaPOS/commit/bc2b2b1660ac4597027302be1c3f25af21370eb1))
- send local empleado_id instead of netsuite_id in cajero_id field ([`a598d93`](https://github.com/mitienda-pe/mitiendaPOS/commit/a598d93046ffe2676e7609cd8f2b05d4079a663c))
- normalize IDs to strings for proper comparison ([`78f7533`](https://github.com/mitienda-pe/mitiendaPOS/commit/78f75339fd72ff20c4a9d32ca812d598f4df7974))
- handle sucursales_ids as both array and string format ([`411e045`](https://github.com/mitienda-pe/mitiendaPOS/commit/411e0457aa67799e70950e23e0d80464a7c1ee35))
- **shifts:** filter branches by cashier assignments in open shift modal ([`03acf7f`](https://github.com/mitienda-pe/mitiendaPOS/commit/03acf7fa73845ea44624bb374e35216c4cdaf46f))
- correct response handling for resend email ([`723066a`](https://github.com/mitienda-pe/mitiendaPOS/commit/723066a92fc09705a66e7d3cfd28d65be6cb46dc))
- **emails:** handle success message in error response correctly ([`8961eea`](https://github.com/mitienda-pe/mitiendaPOS/commit/8961eea159a721857e7fef8720059183d103b97b))
- **sales:** ensure order ID is always a valid number ([`eda1be6`](https://github.com/mitienda-pe/mitiendaPOS/commit/eda1be6154f8bf5e7743de554da8ad3c36696fc1))

### Refactor

- simplify sucursales_ids handling to only support array format ([`57f35f5`](https://github.com/mitienda-pe/mitiendaPOS/commit/57f35f5ea7236f4111de15b6ef3e9d017c866fbd))
- rename empleado_id to cajero_id in login log ([`2bd0e1c`](https://github.com/mitienda-pe/mitiendaPOS/commit/2bd0e1cf8d4b1c402d602cc7fd26d3196fdb9389))
- rename empleado_netsuite_id to cajero_id in order payload ([`796fa72`](https://github.com/mitienda-pe/mitiendaPOS/commit/796fa72eb92b25941e507383c5b7533b76f6ae71))
- **employees:** move NetSuite ID field below branch selection ([`d163e9c`](https://github.com/mitienda-pe/mitiendaPOS/commit/d163e9c7a020393492c5f3d52cbb271e781cd939))

## Noviembre 2025

### Novedades

- **pos:** send branch location when opening shift and use it for orders ([`4add94a`](https://github.com/mitienda-pe/mitiendaPOS/commit/4add94ae5ef7302f8380853f2a5edceba2f50f08))
- **receipt:** restructure sales ticket for PANADERIA SAN JORGE ([`80d505f`](https://github.com/mitienda-pe/mitiendaPOS/commit/80d505faf264efd8834b34a85640f0359b43a906))
- **pos:** add NetSuite series configuration UI in Preferences ([`c17f242`](https://github.com/mitienda-pe/mitiendaPOS/commit/c17f242415676673ba4357256bfc1ac8ff051075))
- **cashier-accounts:** add table sorting and duplicate validation ([`4820ccb`](https://github.com/mitienda-pe/mitiendaPOS/commit/4820ccbe04cc3fa4ad3bc5e79289164549efc6d2))
- **cashier-accounts:** add rounding accounts and improve caja selector ([`8e9f704`](https://github.com/mitienda-pe/mitiendaPOS/commit/8e9f704ca641d61a3c6d5e71350abab9070e4e79))
- **pos:** implement 3-level cashier account hierarchy UI ([`a78d083`](https://github.com/mitienda-pe/mitiendaPOS/commit/a78d083a7aac4cb5b8a19cd9e4356ea5eaa3e6aa))
- **pos:** add efectivo to payment methods in cashier accounts ([`8f5bdb7`](https://github.com/mitienda-pe/mitiendaPOS/commit/8f5bdb754c9a07ca47d8e3a1bdff313671241d38))
- **pos:** add cashier account management UI in admin settings ([`6b2a14d`](https://github.com/mitienda-pe/mitiendaPOS/commit/6b2a14df35c6e93e8b31809d680e5805751adb88))
- **payments:** add bank transfer and credit note payment methods ([`2c6dbfa`](https://github.com/mitienda-pe/mitiendaPOS/commit/2c6dbfa04686e5c658adc83fef4d04b830f2d308))
- **payments:** add mandatory authorization number for card payments ([`72019fe`](https://github.com/mitienda-pe/mitiendaPOS/commit/72019fe7740b94016e25cc1ff2472b0de325e736))
- **ui:** mostrar información de redondeo en tickets y detalle de ventas ([`2b935de`](https://github.com/mitienda-pe/mitiendaPOS/commit/2b935deca31e489b97adafcf51950d49b409c5cd))
- **api:** enviar información completa de redondeo al backend ([`5e2a0c8`](https://github.com/mitienda-pe/mitiendaPOS/commit/5e2a0c8765ac108766a6a43f505f4f871e7af68d))
- **header:** mostrar sucursal y número de caja cuando hay turno abierto ([`07e53e6`](https://github.com/mitienda-pe/mitiendaPOS/commit/07e53e6ece2e4dfd176776bfc1958e1afee962ee))
- **pos:** añadir stepper input editable con confirmación de eliminación ([`f3f4fd4`](https://github.com/mitienda-pe/mitiendaPOS/commit/f3f4fd448eb405276da0d032e9f3b7441fd0011d))
- **pos:** add bon_formagrupos config to bonification detail ([`bdf51af`](https://github.com/mitienda-pe/mitiendaPOS/commit/bdf51af26950f687a0f0acc38f0134e2df7ad406))
- **my-shift:** reemplazar scorecard Movimientos por Ticket Promedio ([`3c49932`](https://github.com/mitienda-pe/mitiendaPOS/commit/3c49932d8653233768d07bb9093982bf8144e980))
- aumentar timeout axios de 30s a 60s para órdenes grandes ([`6f9393a`](https://github.com/mitienda-pe/mitiendaPOS/commit/6f9393a8a81ce494f5739a54f148c7981591a02f))
- reuse inventory numbers from stock validation to skip duplicate API calls ([`6969645`](https://github.com/mitienda-pe/mitiendaPOS/commit/69696458fbcf39971da09fc91725b8412d366f36))
- **sale-detail:** mostrar notificación de intento de envío al ERP ([`9621e8c`](https://github.com/mitienda-pe/mitiendaPOS/commit/9621e8cc208d6e400177caba02209573e7dd9b56))
- add reusable ReceiptTicket component for sales detail view ([`0933e84`](https://github.com/mitienda-pe/mitiendaPOS/commit/0933e84b99a6eb7dd2dc12d51538c99919387d6d))
- **pos:** send branch ID (tiendadireccion_id) when creating orders ([`2ea39c4`](https://github.com/mitienda-pe/mitiendaPOS/commit/2ea39c438651c957d99d77099805ba9249ffaad3))
- **branches:** add NetSuite Location ID field to branch management UI ([`f92b814`](https://github.com/mitienda-pe/mitiendaPOS/commit/f92b81403b3a1789a95aa0fd24f1863bc31b559a))
- crear vista completa de detalle de turno (ShiftDetail) ([`5bdac20`](https://github.com/mitienda-pe/mitiendaPOS/commit/5bdac20fde7f8e7dc0606a1d6b82a01e7ef0d27f))
- implementar historial completo de turnos (Shifts) ([`9841341`](https://github.com/mitienda-pe/mitiendaPOS/commit/98413412a3099866d9d04f394104ad9357c8a4e5))
- mejorar resumen de turno y filtrado de movimientos en MyShift ([`ac33e54`](https://github.com/mitienda-pe/mitiendaPOS/commit/ac33e549239ff87c7dacc8190b0ff633bfe159d3))
- mejoras en modal de ticket y funcionalidad de impresión ([`a267a77`](https://github.com/mitienda-pe/mitiendaPOS/commit/a267a7763e0b8577e487c288cd592f3b64a552c4))
- mejorar visualización de pagos en ticket de venta ([`f005770`](https://github.com/mitienda-pe/mitiendaPOS/commit/f005770c2662612c6a9834465dc8916316201a38))
- permitir pagos parciales y auto-finalizar ventas en POS ([`652bdf5`](https://github.com/mitienda-pe/mitiendaPOS/commit/652bdf5535e101a7f514026b7921666ba0489014))
- mejorar UX de validación de stock en POS ([`a887638`](https://github.com/mitienda-pe/mitiendaPOS/commit/a887638926b8af4fc2ee35cbfa48b2447511a34f))
- NetSuite stock validation for POS frontend ([`b826fe5`](https://github.com/mitienda-pe/mitiendaPOS/commit/b826fe56fdc5aa70a67928d96428902a268c68e0))
- implementar módulo completo de Promociones con bonificaciones ([`a88d27d`](https://github.com/mitienda-pe/mitiendaPOS/commit/a88d27d3193fbe044a0dc6c5fa87a7635b23a027))
- agregar logs detallados y fallback para actualización de clientes ([`eeed9ed`](https://github.com/mitienda-pe/mitiendaPOS/commit/eeed9edb6027def79bdbb3ea47fdf9ca638786b0))
- integrar PDF del comprobante y envío por WhatsApp en ticket de venta ([`c5bf88e`](https://github.com/mitienda-pe/mitiendaPOS/commit/c5bf88e6a6f299c417d3c6fabab2692aa2bb288a))
- agregar overlay de procesamiento y mostrar datos reales del backend en ticket ([`24ece43`](https://github.com/mitienda-pe/mitiendaPOS/commit/24ece4312a8fb3a905706351cd0758f420c620df))
- agregar envío de emails de factura y formulario de contacto en POS ([`7ffbe37`](https://github.com/mitienda-pe/mitiendaPOS/commit/7ffbe375cd6007c245bd3f60fd14fe07da229cb1))

### Correcciones

- **payments:** recognize rounded total as complete payment ([`3804709`](https://github.com/mitienda-pe/mitiendaPOS/commit/3804709ed3e35a2da84c4e11dd8ae61882061e60))
- **payments:** treat negative rounding as additional payment ([`5c14fd0`](https://github.com/mitienda-pe/mitiendaPOS/commit/5c14fd054e831d82a48567d7e97546167a6f268f))
- **payments:** accept rounded total as full payment ([`2dac321`](https://github.com/mitienda-pe/mitiendaPOS/commit/2dac32134c1267d9ae845a8b103fdb97ef4a3109))
- **pos:** pass tiendadireccion_id when opening shift from App.vue ([`2fe44dd`](https://github.com/mitienda-pe/mitiendaPOS/commit/2fe44dda56f5ac6a96ad2f16d1af689756086989))
- re-enable tiendadireccion_id in order payload ([`b7e0dea`](https://github.com/mitienda-pe/mitiendaPOS/commit/b7e0deaffa89f86f445423d5b617f60205ddb286))
- disable inventory_numbers optimization for legacy API compatibility ([`b4b94f9`](https://github.com/mitienda-pe/mitiendaPOS/commit/b4b94f96fda57c88f1590335d6aede4d0ef0464e))
- remove authorization_number from order payload to prevent legacy API error ([`91440b9`](https://github.com/mitienda-pe/mitiendaPOS/commit/91440b973868b371a5b830f9d7161afd716c9801))
- disable tiendadireccion_id in order payload to prevent legacy API error ([`6f18a2e`](https://github.com/mitienda-pe/mitiendaPOS/commit/6f18a2e287262ced3175d530247bad67be1df968))
- **payments:** only apply rounding for full cash payments ([`8cc90b4`](https://github.com/mitienda-pe/mitiendaPOS/commit/8cc90b4947c4ee50b5091c688a19457a21410041))
- **payments:** validate payment amount before removing rounding ([`38ac266`](https://github.com/mitienda-pe/mitiendaPOS/commit/38ac266d39e29ed6f31888b99bd9e2f2384b2a69))
- **payments:** remove rounding when combining payment methods ([`735a7ff`](https://github.com/mitienda-pe/mitiendaPOS/commit/735a7ff23d9ae2e1034f650ef544cf55a5a0e0c3))
- **preferences:** check response.success instead of response.error ([`39c9838`](https://github.com/mitienda-pe/mitiendaPOS/commit/39c9838b0288b7a27459ec32316cad84de346002))
- **preferences:** use authStore for store ID instead of localStorage ([`cd13e3c`](https://github.com/mitienda-pe/mitiendaPOS/commit/cd13e3c2cfc8ce34c80d20be426b2e242ff97dcf))
- **cashier-accounts:** resolve type mismatch preventing accounts display ([`2093f3e`](https://github.com/mitienda-pe/mitiendaPOS/commit/2093f3e7ce66df48afdbb8a48e28c4b218279d68))
- **cashier-accounts:** show legacy records without tienda_id ([`fa90097`](https://github.com/mitienda-pe/mitiendaPOS/commit/fa900974a556a8a7821b5cb7866fb9878c9bcc80))
- **cashier-accounts:** generate explicit array for cashier numbers ([`0b991f5`](https://github.com/mitienda-pe/mitiendaPOS/commit/0b991f55a569b458ac5241884967bd785b8df055))
- **cashier-accounts:** show cashier number without 'Caja' prefix in select ([`a213515`](https://github.com/mitienda-pe/mitiendaPOS/commit/a213515b8ae8dd79dcc70d45c8fcc9734852f5b9))
- **payments:** exact payment methods absorb rounding from cash payments ([`2829a4c`](https://github.com/mitienda-pe/mitiendaPOS/commit/2829a4c74613d128d1d6a4b281e0703b867a38c3))
- **ticket:** persistir información de redondeo en snapshot de venta completada ([`f5aaff4`](https://github.com/mitienda-pe/mitiendaPOS/commit/f5aaff4460e60f4e0b1bcb983954d01c9535f87c))
- **pagos:** corregir pérdida de roundingAmount entre PaymentModal y cart store ([`73748ec`](https://github.com/mitienda-pe/mitiendaPOS/commit/73748ec9c37d4d1e37f014a477e6099734cda728))
- **pagos:** aplicar redondeo ANTES de agregar pago al carrito ([`695e9c9`](https://github.com/mitienda-pe/mitiendaPOS/commit/695e9c9c36a12eec663d90460ff3df5839fe1959))
- **pagos:** corregir redondeo, saldo pendiente y montos sugeridos ([`39268ee`](https://github.com/mitienda-pe/mitiendaPOS/commit/39268ee0034cb7222546f0e47d14d3f9d21074bf))
- **header:** mostrar solo caja si no hay información de sucursal ([`612514a`](https://github.com/mitienda-pe/mitiendaPOS/commit/612514a22cb4f926c3073445b0f4935de083d0df))
- **header:** persistir nombre de sucursal y número de caja al abrir turno ([`67afd07`](https://github.com/mitienda-pe/mitiendaPOS/commit/67afd075d321fe4a432ff726b62570ca49786298))
- **pagos:** priorizar redondeos a enteros cercanos en sugerencias ([`c45077c`](https://github.com/mitienda-pe/mitiendaPOS/commit/c45077c46943edf7b4859bb93296f8179d3b3f73))
- **pagos:** sugerir solo denominaciones reales de billetes/monedas ([`e05eacb`](https://github.com/mitienda-pe/mitiendaPOS/commit/e05eacb765dd3afe73eebc1fe154b46f99047d7b))
- **pagos:** mejorar sugerencias de montos óptimos de pago ([`6075d66`](https://github.com/mitienda-pe/mitiendaPOS/commit/6075d66bd3b762009b06fa98fbf3f1895cdacc33))
- **pagos:** aplicar redondeo solo para pagos en efectivo ([`f1db71c`](https://github.com/mitienda-pe/mitiendaPOS/commit/f1db71c3ee9e8d05d51e2719b07581e14dc010e2))
- **pagos:** sincronizar redondeo con validación de pagos parciales ([`663ba2e`](https://github.com/mitienda-pe/mitiendaPOS/commit/663ba2eea6b183530d5c645a4fe33c5480a9d737))
- **auth:** unificar sistema de PINs a 4 dígitos para todos los usuarios ([`380e0d1`](https://github.com/mitienda-pe/mitiendaPOS/commit/380e0d1864fecff1ecddb945cb39a4980c762359))
- **start-sale:** usar código MiTienda (2) para RUC en búsqueda y creación de clientes ([`f44e6bf`](https://github.com/mitienda-pe/mitiendaPOS/commit/f44e6bffe2846fc43c86543542f69e4c4118eaf8))
- **customers:** guardar razón social en campo tiendacliente_razonsocial ([`71ce942`](https://github.com/mitienda-pe/mitiendaPOS/commit/71ce9424d4dc4f3936262090c93455ed1ad0d148))
- **customers:** usar código MiTienda (2) para RUC en lugar de código SUNAT (6) ([`bb13576`](https://github.com/mitienda-pe/mitiendaPOS/commit/bb13576f10db1ee02ba01401c4bf7392166dcf4b))
- **pos:** usar código de documento correcto para RUC (2 en lugar de 6) ([`eef105f`](https://github.com/mitienda-pe/mitiendaPOS/commit/eef105fbdbff19f2f3beffa3e495e10666480dfc))
- **pos:** cargar estado del turno en inicialización después de hard refresh ([`e4cea1b`](https://github.com/mitienda-pe/mitiendaPOS/commit/e4cea1b4ddf93f414d01f9f085217a72fe5ef3ee))
- **pos:** refrescar estado del turno después de desbloquear pantalla ([`915c31a`](https://github.com/mitienda-pe/mitiendaPOS/commit/915c31a8bc314eb0e08b74f6d3a97e3aeec70bc7))
- **pos:** prevenir error 400 al abrir turno con turno previo abierto ([`bee67fc`](https://github.com/mitienda-pe/mitiendaPOS/commit/bee67fc945a0317f92a7310a750fa5b6299061ce))
- **shifts:** CRITICAL - pass parameters correctly to shiftsApi.closeShift ([`b05c17b`](https://github.com/mitienda-pe/mitiendaPOS/commit/b05c17bb408874523d9149ce4f2b864784d55eb3))
- **shifts:** CRITICAL - pass PIN in App.vue shift-closed handler ([`462a4c8`](https://github.com/mitienda-pe/mitiendaPOS/commit/462a4c89c978974c2980f825c2c93f36c1a364a2))
- **shifts:** simplify PIN extraction without toRaw() ([`66f1906`](https://github.com/mitienda-pe/mitiendaPOS/commit/66f19060988354b38550083ee09fc0759c2e9e97))
- **shifts:** unwrap PIN reactive proxy in MyShift event handler ([`9a8a5ea`](https://github.com/mitienda-pe/mitiendaPOS/commit/9a8a5eaba6ce6d1de646c0cdbc6fe4f814ec7357))
- **shifts:** use toRaw() to unwrap PIN reactive ref before emit ([`35ae634`](https://github.com/mitienda-pe/mitiendaPOS/commit/35ae634dad9e41f0afebef368d7fe384912f3415))
- **shifts:** pass PIN in correct data object format to API ([`4a0f650`](https://github.com/mitienda-pe/mitiendaPOS/commit/4a0f650f93931aac87d57c0757e22abc8efd0e07))
- **pos:** use nombres/apellidos fields directly instead of splitting name ([`180178c`](https://github.com/mitienda-pe/mitiendaPOS/commit/180178c6e41433987bf93a13fbc952281d7a9f2c))
- corregir orden de carga en MyShift para mostrar monto inicial ([`ac441af`](https://github.com/mitienda-pe/mitiendaPOS/commit/ac441afc327d225632cba1dbc08b33d1719e09cc))
- usar datos de pago locales en lugar de backend en ticket ([`ebcce2c`](https://github.com/mitienda-pe/mitiendaPOS/commit/ebcce2ce560d9681632ba67c6acaa6e516d4e1f9))
- corregir formato de fecha/hora en módulo de Documentos ([`695e248`](https://github.com/mitienda-pe/mitiendaPOS/commit/695e248a804263f1541c951fafa46c59229b86ea))
- corregir mapeo de campos en actualización de clientes y agregar debug logs ([`7b20c7d`](https://github.com/mitienda-pe/mitiendaPOS/commit/7b20c7da51a7734f71ae3392c6e1b02b3c088222))
- corregir mapeo de datos de cliente para RUC en creación de órdenes ([`9e3a1b5`](https://github.com/mitienda-pe/mitiendaPOS/commit/9e3a1b5acbcd2f11f51f5580b4aa3b693597750b))

### Rendimiento

- **pos:** optimize stock validation for combined payments ([`1922fad`](https://github.com/mitienda-pe/mitiendaPOS/commit/1922fadd19a261368a29a4058df075583394aace))

### Refactor

- **pos:** unify ticket printing using ReceiptTicket component ([`ddd0ea5`](https://github.com/mitienda-pe/mitiendaPOS/commit/ddd0ea56263512457a945c9d260411b6d652102f))
- **cashier-accounts:** redesign UI as table with columns ([`8273a66`](https://github.com/mitienda-pe/mitiendaPOS/commit/8273a669b951ddd460be8288213a45faa184a8b5))
- **cashier-accounts:** simplify UI with unified interface ([`d4758a7`](https://github.com/mitienda-pe/mitiendaPOS/commit/d4758a719fba7ef430d3c0e7107afdedd2779c83))
- **payments:** update button colors and order in payment modal ([`756ea96`](https://github.com/mitienda-pe/mitiendaPOS/commit/756ea965a4e76eaa82acf8345e765e7fe6103863))

## Octubre 2025

### Novedades

- agregar paginación al módulo de Ventas ([`291f5a0`](https://github.com/mitienda-pe/mitiendaPOS/commit/291f5a0d63cb9af01db2feeaa409463eb429dd78))
- mejorar UX de gestión de turnos ([`b0f0431`](https://github.com/mitienda-pe/mitiendaPOS/commit/b0f043169b88ccc2a30ab103e6489a60cdc5c2ba))
- versión estable con mejoras de funcionalidad y manejo de sesiones ([`2776604`](https://github.com/mitienda-pe/mitiendaPOS/commit/27766046cf8436f06bd052162d9fddcceb9f6e0a))
- implementar acceso de solo lectura al inventario para cajeros ([`97b71c1`](https://github.com/mitienda-pe/mitiendaPOS/commit/97b71c1132b9b83e4301a39b1fa9c0a057c8d855))
- cambiar ruta por defecto a login de cajero ([`c0b7d3e`](https://github.com/mitienda-pe/mitiendaPOS/commit/c0b7d3e4d9d4fabf6bb1ce0656fff4e101c55006))
- implementar login directo para cajeros con ID de tienda + PIN ([`be9bc2a`](https://github.com/mitienda-pe/mitiendaPOS/commit/be9bc2a870457bc5de8d243c9b4ad42533537f6f))
- agregar soporte para productos con stock ilimitado en inventario ([`12cdfd7`](https://github.com/mitienda-pe/mitiendaPOS/commit/12cdfd7de52511a4a37980c4a0fd2241c9680d33))
- implementar emisión de comprobantes de pago (boletas y facturas) en POS ([`310575a`](https://github.com/mitienda-pe/mitiendaPOS/commit/310575a2ee2826bbbf0a027bd0d477f56bb62f3e))
- integrar proxy al API legacy para creación de órdenes ([`a992d97`](https://github.com/mitienda-pe/mitiendaPOS/commit/a992d97c82d5ec20fe46fb2cb059a6a5484b6e70))
- asociar turnos al empleado_id del cajero, no al usuario admin ([`bd3a90b`](https://github.com/mitienda-pe/mitiendaPOS/commit/bd3a90bcaa9d09e2558bdb90d1ca24ffb0451b87))
- agregar autenticación de cajero para turnos existentes ([`7374997`](https://github.com/mitienda-pe/mitiendaPOS/commit/7374997056311f08adc2b3c74f1db333a90b3b7f))
- implementar vista "Mi Turno" para gestión de caja (Fase 5) ([`319c6c9`](https://github.com/mitienda-pe/mitiendaPOS/commit/319c6c94f993749f6e66db98d133854e2ce9c4b9))
- prevenir autocompletado del navegador en todos los inputs de PIN ([`25ada83`](https://github.com/mitienda-pe/mitiendaPOS/commit/25ada83b980a7cd00e78394b18d7700f5e4bef4d))
- implementar bloqueo de caja con PIN y auto-bloqueo ([`5afeab2`](https://github.com/mitienda-pe/mitiendaPOS/commit/5afeab2686f9d9dbd80da0adff22a7f63f2dbe54))
- agregar validación de PIN al cerrar turno de caja ([`9cc95d3`](https://github.com/mitienda-pe/mitiendaPOS/commit/9cc95d3b8e535581da6b12b486972a10ced2b198))
- implementar módulos de Sucursales y Empleados POS (frontend) ([`f930aef`](https://github.com/mitienda-pe/mitiendaPOS/commit/f930aef488e6f4bad962a9fb3f1135602ecf600d))
- reorganizar menú y crear módulo Configuración con sidebar ([`f8f28e7`](https://github.com/mitienda-pe/mitiendaPOS/commit/f8f28e7a8a939ba6fff63471b4dc2455b1cd9d4a))
- implementar escáner de código de barras con QuaggaJS ([`c51987a`](https://github.com/mitienda-pe/mitiendaPOS/commit/c51987a5bc04784b27d92e630e22fbd2a3648b72))
- agregar botones Cajas y Usuarios, ocultar módulos en desarrollo ([`ef532d3`](https://github.com/mitienda-pe/mitiendaPOS/commit/ef532d32c3dce067f882f33d1bf643f3b4e0c26c))
- agregar métodos de pago Link y Nota de Crédito ([`91315f0`](https://github.com/mitienda-pe/mitiendaPOS/commit/91315f0f290a108e4ca4616a48d7840920d6636f))
- implementar fusión de ventas del mismo cliente ([`d4f9ebc`](https://github.com/mitienda-pe/mitiendaPOS/commit/d4f9ebc8b6be700036cec55ba41e4e4c968c221c))
- reemplazar confirm nativo con modal personalizado ([`97429da`](https://github.com/mitienda-pe/mitiendaPOS/commit/97429dafc010c2a6a3ae42913d4737c24d6ce0f7))
- mejorar flujo de botones Nueva Venta y Guardar Venta ([`43c9fc0`](https://github.com/mitienda-pe/mitiendaPOS/commit/43c9fc07ca87622f187c679ef776975928ac535f))
- integrar registro de movimientos de caja en POS ([`395f04d`](https://github.com/mitienda-pe/mitiendaPOS/commit/395f04dd034c79271e480f75157dbdd26836dfb5))
- componente reutilizable de arqueo y desglose en cierre de turno ([`37ba2c1`](https://github.com/mitienda-pe/mitiendaPOS/commit/37ba2c182dde8b14db1c1d5df69626509bd8ef80))
- desglose de denominaciones en apertura de turno (arqueo) ([`8ac3922`](https://github.com/mitienda-pe/mitiendaPOS/commit/8ac3922c3fec18f1d272fc9d361e1c47eff00a0e))
- mostrar redondeo aplicado en ticket y resumen de venta ([`a737b37`](https://github.com/mitienda-pe/mitiendaPOS/commit/a737b37bcf2ed110d15c4442b9122068ebf5fa7b))
- gestión inteligente de efectivo con denominaciones peruanas ([`f323be6`](https://github.com/mitienda-pe/mitiendaPOS/commit/f323be6d3f73d8f94960cbe832fb5aeac3a35d15))
- reordenar módulos del menú según prioridad de uso ([`54ee04e`](https://github.com/mitienda-pe/mitiendaPOS/commit/54ee04e37556d33164cde018c9232dcd4556f196))
- ocultar botón 'Menú Principal' cuando ya estás en el menú ([`4bcb38c`](https://github.com/mitienda-pe/mitiendaPOS/commit/4bcb38caa4a6b3344b8e8c0451de9631ee048ae1))
- mejoras de UX y validación de turno de caja obligatorio ([`b9ac9e8`](https://github.com/mitienda-pe/mitiendaPOS/commit/b9ac9e85b9c7b80c19586224cfaf39607988bc11))
- módulo completo de empleados/cajeros con validación real de PIN ([`783bf3d`](https://github.com/mitienda-pe/mitiendaPOS/commit/783bf3da53925e55400afde27efb4bf84b1635c3))
- integrar cart store con validaciones y autorizaciones ([`e9c31c1`](https://github.com/mitienda-pe/mitiendaPOS/commit/e9c31c12bd9515ac6876feda1b732a26c1376f4b))
- sistema de validaciones y controles para POS ([`ade6988`](https://github.com/mitienda-pe/mitiendaPOS/commit/ade69889357c39678f671d2bbbd2bc65c7c3de17))
- mostrar selector de tienda para usuarios con múltiples tiendas ([`7d9d089`](https://github.com/mitienda-pe/mitiendaPOS/commit/7d9d089ac87036b358ab53ade06acc7f905facc1))
- agregar campos de dirección para clientes RUC ([`821c4e7`](https://github.com/mitienda-pe/mitiendaPOS/commit/821c4e73a453f9203026d450943a1629a77853f3))
- módulo de clientes con API real y Decolecta ([`5f680c4`](https://github.com/mitienda-pe/mitiendaPOS/commit/5f680c42fe2c3b42923a5109006088e67752232b))
- valores por defecto en filtros de historial de ventas ([`b9b93e9`](https://github.com/mitienda-pe/mitiendaPOS/commit/b9b93e90c96bda65598e2cdb4eebf8577052bd05))
- muestra nombre del cajero en historial y detalle de ventas ([`e4e4774`](https://github.com/mitienda-pe/mitiendaPOS/commit/e4e4774085751299af52c2bac4f9d6c255aa2182))
- mejora filtros en historial de ventas ([`89edd1f`](https://github.com/mitienda-pe/mitiendaPOS/commit/89edd1fa80201d1b386ae4c2af7c8d8d39db65eb))
- mejoras UX en historial de ventas y formato de orden POS ([`0d5fb9b`](https://github.com/mitienda-pe/mitiendaPOS/commit/0d5fb9b8a3bb9345ed861b63325d571b202350cc))
- completar datos de cliente en payload de orden POS ([`5e0f272`](https://github.com/mitienda-pe/mitiendaPOS/commit/5e0f27251a42e442ee17ae90a6085aae38785040))
- mejorar vista de detalle de ventas con productos, pagos y reimpresión ([`da7bf11`](https://github.com/mitienda-pe/mitiendaPOS/commit/da7bf112715af5d2c581e0443733ff71e5ee05ae))
- implementar módulo de inventario completo (PRD 5.3) ([`086d609`](https://github.com/mitienda-pe/mitiendaPOS/commit/086d60931b765b4f1346ad78ba1512f49d6c37a9))
- implementar selector de tiendas para usuarios multi-tienda ([`ef0ae0e`](https://github.com/mitienda-pe/mitiendaPOS/commit/ef0ae0ecc37a3a4339ecc32285b585d4a1834755))
- frontend para gestión de turnos de caja ([`2841d5e`](https://github.com/mitienda-pe/mitiendaPOS/commit/2841d5e5ecea471fd56136f4a8a1db1f3a206e34))
- ticket de venta con datos reales de tienda y generación PDF ([`244456b`](https://github.com/mitienda-pe/mitiendaPOS/commit/244456be80200bf45fb96eb29657788a1f951ff5))
- actualizar CustomerSearchModal con API real de Decolecta ([`374e0dd`](https://github.com/mitienda-pe/mitiendaPOS/commit/374e0dd3e833efdcd9b3a977c4312a35acfa1354))
- integración real de API de clientes con Decolecta ([`c417dfb`](https://github.com/mitienda-pe/mitiendaPOS/commit/c417dfb3d568ef726743d89431f2f25ae5cb0f47))
- mejora del flujo de inicio de venta con captura de documento ([`e2896cd`](https://github.com/mitienda-pe/mitiendaPOS/commit/e2896cd850722b78b85b8d143ac4ab84764f4d09))
- Implement Sales/Orders history module ([`cd6879a`](https://github.com/mitienda-pe/mitiendaPOS/commit/cd6879aaca771fa0e014f7eed41f085a2b6a7d60))
- Make default store ID configurable via environment variable ([`f204eb3`](https://github.com/mitienda-pe/mitiendaPOS/commit/f204eb3f7e5d2b9d7a2d2bda27e2618dfc198e6c))
- Complete POS integration with real backend API ([`a820eea`](https://github.com/mitienda-pe/mitiendaPOS/commit/a820eea1b14386aee7e6cf37031178aada3c4594))

### Correcciones

- corregir contador de total de ventas en paginación ([`1e12ea9`](https://github.com/mitienda-pe/mitiendaPOS/commit/1e12ea987bd2e37e6a949f5a8742970e65992f5f))
- mantener sesión de cajero activa al cerrar turno ([`9f9e978`](https://github.com/mitienda-pe/mitiendaPOS/commit/9f9e97868c9cb4ac27e3fd62b95abf906bdee79e))
- corregir manejo de respuesta del axios interceptor en inventoryApi ([`353cece`](https://github.com/mitienda-pe/mitiendaPOS/commit/353cece83e60928f1d17c534ff4e8fddc11b58f9))
- corregir redirect después de logout para usar cashier-login ([`85ad52d`](https://github.com/mitienda-pe/mitiendaPOS/commit/85ad52d43c0fc211259f318b62263f756a6e87bf))
- restaurar comportamiento original de routing ([`60b2816`](https://github.com/mitienda-pe/mitiendaPOS/commit/60b28165cdef44c761051142ef22b7795f4fe561))
- simplificar routing para evitar race condition ([`9330b26`](https://github.com/mitienda-pe/mitiendaPOS/commit/9330b26dec446cf3cab0355d49b04b0cfe3ad24e))
- eliminar loop infinito entre login y cashier-login ([`64ca229`](https://github.com/mitienda-pe/mitiendaPOS/commit/64ca2293c396ef083fd96a697b3c67866d515f7e))
- eliminar parpadeo al cargar, redirigir a cashier-login correctamente ([`aef190d`](https://github.com/mitienda-pe/mitiendaPOS/commit/aef190d304286a17936b2ea785ec2e50a800a9fa))
- revertir cambio de ruta raíz, mantener /menu como default ([`6bd5663`](https://github.com/mitienda-pe/mitiendaPOS/commit/6bd5663513fbba3abbe0c4b48c7644ee8dce9d04))
- eliminar auto-focus automático en login de cajero ([`2001e7e`](https://github.com/mitienda-pe/mitiendaPOS/commit/2001e7ed8b699e9b627e71eccd718e5fa3573a03))
- evitar duplicación de nombre en header cuando cajero se autentica directamente ([`31297a8`](https://github.com/mitienda-pe/mitiendaPOS/commit/31297a84f46c4e044ef0356feb640ab615c28916))
- restaurar comportamiento original de ruta raíz y agregar navegación cruzada entre logins ([`653afae`](https://github.com/mitienda-pe/mitiendaPOS/commit/653afae44f74aad9953b169982aebdbf719f40b9))
- corregir router guard para permitir acceso a /cashier-login ([`48e82f6`](https://github.com/mitienda-pe/mitiendaPOS/commit/48e82f68f3def1feeea1644e78ea3815b94f786a))
- agregar soporte completo para productos con stock ilimitado en POS ([`98d4394`](https://github.com/mitienda-pe/mitiendaPOS/commit/98d43942e7ca53dba0dafaaf481a499c2e6c1167))
- restaurar sesión de cajero al recargar la página ([`b9d9fd7`](https://github.com/mitienda-pe/mitiendaPOS/commit/b9d9fd7b01079a10cad772de5fffe60ae4b9a5ed))
- corregir cálculo de IGV para precios que ya incluyen impuesto ([`3bceaab`](https://github.com/mitienda-pe/mitiendaPOS/commit/3bceaabc92bad091c479a67fe1415c641a4a0a13))
- actualizar productsApi para manejar nueva estructura de respuesta con pagination ([`2aca40e`](https://github.com/mitienda-pe/mitiendaPOS/commit/2aca40e8a7fc9d44c13dacb8812155d07b9bc45e))
- preservar campo pagination en interceptor de axios ([`81e4140`](https://github.com/mitienda-pe/mitiendaPOS/commit/81e41407f1322d9a15ceaf225b8cd56ae95d6728))
- actualizar inventoryApi para manejar nueva estructura de paginación del backend ([`d7393f1`](https://github.com/mitienda-pe/mitiendaPOS/commit/d7393f192eeb1a03695638b7ef82c45db6dbde90))
- mejorar logging y manejo de errores en creación de órdenes ([`a82de2c`](https://github.com/mitienda-pe/mitiendaPOS/commit/a82de2ca2c18bea88049d1d52919a8a4664aceb7))
- mejorar manejo de errores y estructura de datos en creación de órdenes ([`b5d1b29`](https://github.com/mitienda-pe/mitiendaPOS/commit/b5d1b293e124e4ff20eff2241f00f6a95b6a1f6a))
- corregir import dinámico que impedía carga del POS ([`1f7482b`](https://github.com/mitienda-pe/mitiendaPOS/commit/1f7482b1c7516aabb2e25c5eecfef6a7dfa6d86e))
- corregir flujo de cierre de turno y eliminar duplicación de formularios/PIN ([`e86ffcf`](https://github.com/mitienda-pe/mitiendaPOS/commit/e86ffcf84c81f82f6cc755bc2d7ac4105cd50549))
- corregir nombre de evento emitido en CloseShiftModal ([`e029ad9`](https://github.com/mitienda-pe/mitiendaPOS/commit/e029ad98af611e018106b29de9eb77afa9bd5d31))
- agregar prop :shift a CloseShiftModal en MyShift ([`03ed7f0`](https://github.com/mitienda-pe/mitiendaPOS/commit/03ed7f02705c2a823e60d0ca07711c917409ffd1))
- corregir flujo de apertura de turno en MyShift y autenticación de cajero ([`d3a10eb`](https://github.com/mitienda-pe/mitiendaPOS/commit/d3a10eb17c73906fa4a7939538d670265fc7405f))
- corregir validación de empleado_id en PIN ([`69ab706`](https://github.com/mitienda-pe/mitiendaPOS/commit/69ab70602c2247a3e3c30f348567e7521061a4f4))
- mostrar nombre de sucursal correctamente en header ([`2b12b81`](https://github.com/mitienda-pe/mitiendaPOS/commit/2b12b81381f84a96dcfa9f82ca117e3e3c4ca07c))
- limpiar todas las sesiones en logout completo ([`25f519b`](https://github.com/mitienda-pe/mitiendaPOS/commit/25f519ba56cc321624e8f71a484dd09a8d3d87b3))
- usar VITE_API_BASE_URL directamente sin condicional DEV ([`5ca37cd`](https://github.com/mitienda-pe/mitiendaPOS/commit/5ca37cd6d588d779c7f4811b929166e8f9fa4cf5))
- revertir cambio de baseURL que duplicaba /api/v1 ([`a025136`](https://github.com/mitienda-pe/mitiendaPOS/commit/a025136f18b5677322ee0dfe3bd617abd711954e))
- agregar /api/v1 a baseURL en producción y limpiar rutas ([`cebae94`](https://github.com/mitienda-pe/mitiendaPOS/commit/cebae949cb71635115898c274653077a1b6bddc9))
- usar apiClient en branchesApi y posEmpleadosApi ([`8145d85`](https://github.com/mitienda-pe/mitiendaPOS/commit/8145d85cddb50c028f61e138e09c97df99cf6395))
- corregir URL del API en servicios de sucursales y empleados ([`7c8436f`](https://github.com/mitienda-pe/mitiendaPOS/commit/7c8436f15ff06f4c2c3336d47cd2b608641d8ac1))
- evitar detecciones múltiples de código de barras ([`a09c8bf`](https://github.com/mitienda-pe/mitiendaPOS/commit/a09c8bf99e6835318ecf909c362cb6552dda91c3))
- ajustar z-index para mostrar video de cámara en escáner ([`43852e2`](https://github.com/mitienda-pe/mitiendaPOS/commit/43852e2d29bca3123fe25eb44c3f3ed3f5092f09))
- restaurar funcionalidad de búsqueda autocompletada en POS ([`e5b0438`](https://github.com/mitienda-pe/mitiendaPOS/commit/e5b043862def1b878bf33d97ade2c0a578a7269a))
- corregir visualización de video en escáner de código de barras ([`f990e1c`](https://github.com/mitienda-pe/mitiendaPOS/commit/f990e1cea3c3fa11a2665354ded50218babdf2c3))
- mostrar video de cámara en escáner de código de barras ([`a141ce2`](https://github.com/mitienda-pe/mitiendaPOS/commit/a141ce2bf66211908957843ab2ff1644c1cfbdc2))
- evitar que handleStartSale limpie carrito en Estado B ([`d9e57ce`](https://github.com/mitienda-pe/mitiendaPOS/commit/d9e57ce98ea08f376bf790381ba3b3be17597e1d))
- agregar variable faltante saleHasUnsavedChanges ([`2d7abec`](https://github.com/mitienda-pe/mitiendaPOS/commit/2d7abec845b79d576f4060c1297e47847ce2b4cf))
- eliminar redondeo automático que causaba loop infinito ([`9ea11af`](https://github.com/mitienda-pe/mitiendaPOS/commit/9ea11af85400ff4f27c7c3c70d9b09031ac52131))
- evitar que botones de montos sugeridos capturen foco ([`ff1da54`](https://github.com/mitienda-pe/mitiendaPOS/commit/ff1da54953d7d6b7cc7bb4ec505cee7bda3b23b9))
- usar CashBreakdownInput en OpenShiftModal ([`2833522`](https://github.com/mitienda-pe/mitiendaPOS/commit/28335229cfa5c1f1f01c540d041306404bcb82bd))
- configurar Netlify para usar dist pre-compilado ([`766ff10`](https://github.com/mitienda-pe/mitiendaPOS/commit/766ff1039f93ee0c6798c88117084fb7cfd48478))
- rebuild completo con campos de arqueo corregidos ([`6fbec13`](https://github.com/mitienda-pe/mitiendaPOS/commit/6fbec132bcd828419e2dff60d670258a64fbeced))
- incluir carpeta dist para deploy y corregir layout de arqueo ([`bb2f23a`](https://github.com/mitienda-pe/mitiendaPOS/commit/bb2f23af4909642610004e2c49358da94813bcd3))
- campos de arqueo más compactos con layout de una columna ([`2e1c8bf`](https://github.com/mitienda-pe/mitiendaPOS/commit/2e1c8bfb137f5d6edfc10735ddacafa5c388044f))
- ajustar campos de conteo de denominaciones ([`fb50995`](https://github.com/mitienda-pe/mitiendaPOS/commit/fb509952a83c53de5b028e5b48998f9dc32ac6a8))
- mejorar persistencia de nombre de usuario con logs detallados ([`4ac4fd9`](https://github.com/mitienda-pe/mitiendaPOS/commit/4ac4fd9790e668efc7373c597914d3d5ee615866))
- persistir nombre de usuario y tienda en header después de refresh ([`fca90de`](https://github.com/mitienda-pe/mitiendaPOS/commit/fca90def5cd22cdf8463f2192b89ce58d6e89681))
- eliminar watch reactivo que causaba flash del selector ([`9610afb`](https://github.com/mitienda-pe/mitiendaPOS/commit/9610afb2c0c8a2fda0087a3c85ba7e6f7f00c0e9))
- eliminar flash del selector de tienda al hacer login ([`95cf4f4`](https://github.com/mitienda-pe/mitiendaPOS/commit/95cf4f423d9211b923ad25b0d934f0aa3c9e94f2))
- corregir mapeo de datos de cliente en StartSaleModal ([`2c2aaf2`](https://github.com/mitienda-pe/mitiendaPOS/commit/2c2aaf272dd173d8403845a623529a9c83d2c56f))
- agregar cache busting con timestamp en build ([`dde754b`](https://github.com/mitienda-pe/mitiendaPOS/commit/dde754bf56404dce9fbeefe47e54eca914537263))
- mejorar búsqueda de clientes y debug en CustomerSearchModal ([`48cb3a6`](https://github.com/mitienda-pe/mitiendaPOS/commit/48cb3a679cc3a64b70e7d81d9978a45ea472ec5a))
- mostrar solo productos publicados en inventario POS ([`b79d378`](https://github.com/mitienda-pe/mitiendaPOS/commit/b79d3780d1a6d7253aa3e1e9b3e2bb43b76a93a9))
- mapeo de datos de cliente desde billing_info en detalle de venta ([`2250e15`](https://github.com/mitienda-pe/mitiendaPOS/commit/2250e15f051e7af6127ec620010fe6db68d22459))
- mapeo de productos y totales en detalle de venta ([`c9401ac`](https://github.com/mitienda-pe/mitiendaPOS/commit/c9401ac25c88016a42b1603dbd7331db0de0fff8))
- usar tienda_razonsocial en lugar de tienda_razon_social ([`1cdd1f0`](https://github.com/mitienda-pe/mitiendaPOS/commit/1cdd1f01f0e520c67cac906776f8745249f24ac8))
- usar campo 'name' del backend en lugar de nombres/apellidos en componentes POS ([`7a82d8f`](https://github.com/mitienda-pe/mitiendaPOS/commit/7a82d8f16779acf4d4da3ad50b5d3da2761d1df2))
- renombrar variable customerData a createdCustomer para evitar conflicto de scope ([`df029de`](https://github.com/mitienda-pe/mitiendaPOS/commit/df029debfd337a3c4c26635c7ed7d470a7239e47))
- agregar fallback para mostrar nombre de cliente ([`5e7dd60`](https://github.com/mitienda-pe/mitiendaPOS/commit/5e7dd6012ef2a1f387a697676c19ed2a32262832))
- corregir imports de apiClient a axios y agregar soporte multi-caja ([`b8b3dde`](https://github.com/mitienda-pe/mitiendaPOS/commit/b8b3dde90d9280f3d02570647b09ee0d278a975e))
- Prevent duplicate order creation on double-click ([`8f16650`](https://github.com/mitienda-pe/mitiendaPOS/commit/8f1665080c288f0a94c3ad9d0f683013dcd6cac5))
- Show order details correctly in modal ([`ee19603`](https://github.com/mitienda-pe/mitiendaPOS/commit/ee19603348fde84283ba49b4148c3fc738d1604a))
- Map BD fields correctly in Sales view ([`18b7374`](https://github.com/mitienda-pe/mitiendaPOS/commit/18b7374bcbd434c0700401f74fd8107a19c14e23))
- Add change display and improve change calculation ([`88843b7`](https://github.com/mitienda-pe/mitiendaPOS/commit/88843b71e6373d2843934b3b99f5d87707ca52b6))
- Remove /api/v1 prefix from ordersApi.js endpoints ([`2371f20`](https://github.com/mitienda-pe/mitiendaPOS/commit/2371f20a01edad780afa0a2be11a9d97705071ff))
- Remove duplicated /api/v1 prefix and add Netlify SPA routing ([`14cbb7b`](https://github.com/mitienda-pe/mitiendaPOS/commit/14cbb7b1af18294adbb4563bfcb556ff4c223006))
- Add /api/v1 prefix to store selection endpoint ([`cb28e1c`](https://github.com/mitienda-pe/mitiendaPOS/commit/cb28e1ccb84eedafbf3e37ee17a721b092100b62))
- Correct change calculation in PaymentModal ([`f07576f`](https://github.com/mitienda-pe/mitiendaPOS/commit/f07576fca7998b5f4d5c1dd432789a7658451dd6))
- Correct store selection endpoint ([`f4b383d`](https://github.com/mitienda-pe/mitiendaPOS/commit/f4b383d1bc43e17f5bcdf5f97a7689017210eb59))
- Enable credentials in axios for CORS requests ([`a65bebe`](https://github.com/mitienda-pe/mitiendaPOS/commit/a65bebe2e80e38ef1d39a57157ec2d15c5743c64))

### Reversiones

- volver a que Netlify haga el build automáticamente ([`a3864d6`](https://github.com/mitienda-pe/mitiendaPOS/commit/a3864d6635083e8dc88ad5a815e7ed9e1fefd476))

### Refactor

- mejorar módulo de Clientes ([`7105129`](https://github.com/mitienda-pe/mitiendaPOS/commit/71051291598456c2b9fa9bb106d5c1f9ae8d7ea6))
- diversificar colores del menú principal ([`7d84c25`](https://github.com/mitienda-pe/mitiendaPOS/commit/7d84c258178e2d5641c67e45a2c73033266cb727))
- cambiar icono de Turnos de Caja a monedas ([`db94b95`](https://github.com/mitienda-pe/mitiendaPOS/commit/db94b958e0f129bf85d206531db908b96811cfb9))
- cambiar icono de Cajas a monitor ([`c42bc83`](https://github.com/mitienda-pe/mitiendaPOS/commit/c42bc831fd3d2901407890690c85cdad3249441e))
- reorganizar orden de botones del menú principal ([`fa36abe`](https://github.com/mitienda-pe/mitiendaPOS/commit/fa36abe7a9c3b497932646a0a7c21ddceaba8340))
- Align API endpoint structure with admin app ([`f237ac6`](https://github.com/mitienda-pe/mitiendaPOS/commit/f237ac60b7870707d842f47a10f0d4fb7c157a77))

