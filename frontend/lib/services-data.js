// Contenido bilingüe de servicios (fuente: DESPACHO_ADUANAL_SERVIPROCE.docx).
// Para editar textos del sitio, basta con modificar este archivo.

const t = (es, en) => ({ es, en });

// ---------------------------------------------------------------
// SERVICIO PRINCIPAL: Despachos Aduanales (4 subservicios en viñetas)
// ---------------------------------------------------------------
export const despachoSubservices = [
  {
    id: 'importacion',
    title: t('Despacho de importación', 'Import clearance'),
    includes: t(
      'Elaboración y validación del pedimento, cálculo de contribuciones (IGI, IVA, DTA), revisión documental, previo de mercancía y liberación.',
      'Customs entry (pedimento) preparation and validation, duty and tax calculation (IGI, VAT, DTA), document review, pre-inspection of goods and release.'
    ),
    forWho: t('Empresas que compran a proveedores extranjeros.', 'Companies that buy from foreign suppliers.'),
  },
  {
    id: 'exportacion',
    title: t('Despacho de exportación', 'Export clearance'),
    includes: t(
      'Pedimento de exportación, documentación de salida y coordinación con el agente o broker del país destino.',
      'Export entry, outbound documentation and coordination with the agent or broker in the destination country.'
    ),
    forWho: t(
      'Fabricantes y comercializadoras que venden fuera de México.',
      'Manufacturers and traders that sell outside Mexico.'
    ),
  },
  {
    id: 'temporales',
    title: t('Importaciones y exportaciones temporales', 'Temporary imports and exports'),
    includes: t(
      'Pedimentos para maquinaria, moldes, muestras, exhibiciones o insumos que regresarán.',
      'Entries for machinery, molds, samples, exhibitions or inputs that will be returned.'
    ),
    forWho: t(
      'Maquiladoras, expositores y empresas con equipo en préstamo.',
      'Maquiladoras, exhibitors and companies with borrowed equipment.'
    ),
  },
  {
    id: 'operaciones',
    title: t('Operaciones aéreas, marítimas y terrestres', 'Air, ocean and land operations'),
    includes: t(
      'Despacho en aeropuertos (GDL, CDMX), puertos (Manzanillo, Lázaro Cárdenas, Veracruz) y fronteras (Nuevo Laredo, Nogales, Tijuana, entre otras).',
      'Clearance at airports (GDL, CDMX), seaports (Manzanillo, Lázaro Cárdenas, Veracruz) and border crossings (Nuevo Laredo, Nogales, Tijuana, among others).'
    ),
    forWho: t('Cualquier importador o exportador.', 'Any importer or exporter.'),
  },
];

export const despachoValueAdded = [
  t('Seguimiento en tiempo real del estatus del pedimento', 'Real-time tracking of the entry (pedimento) status'),
  t('Expediente electrónico de cada operación', 'Electronic file for every operation'),
  t('Respuesta rápida ante reconocimientos aduaneros (semáforo rojo)', 'Fast response to customs inspections (red light)'),
];

// ---------------------------------------------------------------
// ¿Cómo trabajamos? (5 pasos)
// ---------------------------------------------------------------
export const processSteps = [
  {
    id: 'cotizacion',
    title: t('Cotización', 'Quote'),
    desc: t(
      'Revisamos su operación, identificamos trámites y regulaciones desde el inicio y un asesor le da seguimiento directo.',
      'We review your operation, identify procedures and regulations up front and an advisor follows up with you directly.'
    ),
  },
  {
    id: 'documentacion',
    title: t('Documentación', 'Documentation'),
    desc: t(
      'Reunimos y validamos factura, especificaciones, permisos y certificados antes de que la carga se mueva.',
      'We gather and validate the invoice, specifications, permits and certificates before the cargo moves.'
    ),
  },
  {
    id: 'embarque',
    title: t('Embarque', 'Shipment'),
    desc: t(
      'Coordinamos el transporte aéreo, marítimo o terrestre con el agente o broker correspondiente.',
      'We coordinate air, ocean or land transport with the corresponding agent or broker.'
    ),
  },
  {
    id: 'despacho',
    title: t('Despacho', 'Clearance'),
    desc: t(
      'Presentamos el pedimento, damos seguimiento a su estatus y atendemos cualquier reconocimiento aduanero.',
      'We file the entry, track its status and handle any customs inspection.'
    ),
  },
  {
    id: 'entrega',
    title: t('Entrega', 'Delivery'),
    desc: t(
      'Liberada la mercancía, se entrega en su destino y le dejamos el expediente electrónico de la operación.',
      'Once released, the goods are delivered to their destination and you receive the electronic file of the operation.'
    ),
  },
];

// ---------------------------------------------------------------
// Industrias que atendemos
// ---------------------------------------------------------------
export const industries = [
  { id: 'autopartes', label: t('Autopartes', 'Auto parts') },
  { id: 'electronica', label: t('Electrónica', 'Electronics') },
  { id: 'textil', label: t('Textil', 'Textiles') },
  { id: 'calzado', label: t('Calzado', 'Footwear') },
  { id: 'maquinaria', label: t('Maquinaria', 'Machinery') },
  { id: 'siderurgicos', label: t('Siderúrgicos', 'Steel & metals') },
];

// ---------------------------------------------------------------
// SERVICIOS SECUNDARIOS (interactivos). Todos son secundarios al despacho.
// ---------------------------------------------------------------
export const secondaryServices = [
  {
    id: 'clasificacion',
    title: t('Clasificación arancelaria', 'Tariff classification'),
    includes: t(
      'Determinación de la fracción arancelaria y NICO correcta para cada producto.',
      'Determination of the correct tariff code and NICO for each product.'
    ),
    benefit: t(
      'Evita pagar impuestos de más o multas por clasificación errónea.',
      'Avoids overpaying duties or fines for misclassification.'
    ),
  },
  {
    id: 'nom',
    title: t('Cumplimiento de NOM', 'NOM compliance'),
    includes: t(
      'Revisión de normas aplicables, etiquetado, constancias y certificados.',
      'Review of applicable standards, labeling, statements and certificates.'
    ),
    benefit: t(
      'La mercancía no se detiene en aduana por falta de cumplimiento.',
      'Your goods are not held at customs for lack of compliance.'
    ),
  },
  {
    id: 'regulaciones',
    title: t('Regulaciones y restricciones no arancelarias', 'Non-tariff regulations and restrictions'),
    includes: t(
      'Permisos, avisos automáticos, cupos y requisitos de otras dependencias (SE, SADER, COFEPRIS, SEMARNAT).',
      'Permits, automatic notices, quotas and requirements from other agencies (SE, SADER, COFEPRIS, SEMARNAT).'
    ),
    benefit: t(
      'Se identifican los trámites desde la cotización, no cuando la carga ya llegó.',
      'Procedures are identified at quote time, not once the cargo has already arrived.'
    ),
  },
  {
    id: 'immex',
    title: t('Programas IMMEX y PROSEC', 'IMMEX and PROSEC programs'),
    includes: t(
      'Asesoría para obtenerlos, mantenerlos y operar bajo ellos.',
      'Advice to obtain, maintain and operate under them.'
    ),
    benefit: t(
      'Diferimiento o reducción de aranceles e IVA en insumos.',
      'Deferral or reduction of tariffs and VAT on inputs.'
    ),
  },
  {
    id: 'tlc',
    title: t('Tratados de libre comercio y reglas de origen', 'Free trade agreements and rules of origin'),
    includes: t(
      'Revisión de elegibilidad (T-MEC, TLCUE, CPTPP, etc.) y certificados de origen.',
      'Eligibility review (USMCA, EU-Mexico FTA, CPTPP, etc.) and certificates of origin.'
    ),
    benefit: t('Arancel preferencial o cero.', 'Preferential or zero tariff.'),
  },
  {
    id: 'padron',
    title: t('Padrón de importadores y sectores específicos', 'Importers registry and specific sectors'),
    includes: t('Inscripción, actualización y reactivación.', 'Registration, updates and reactivation.'),
    benefit: t(
      'Evita suspensiones que paralicen la operación.',
      'Prevents suspensions that would halt your operation.'
    ),
  },
  {
    id: 'planeacion',
    title: t('Planeación de importación y exportación', 'Import and export planning'),
    includes: t(
      'Análisis de costos totales (landed cost), rutas, incoterms y regímenes.',
      'Total cost (landed cost) analysis, routes, incoterms and customs regimes.'
    ),
    benefit: t(
      'Decisiones de compra con números claros antes de cerrar con el proveedor.',
      'Purchasing decisions backed by clear numbers before you close with the supplier.'
    ),
  },
  {
    id: 'custom-broker',
    title: t('Custom Broker Americano', 'US Customs Broker'),
    includes: t(
      'Preparación de documentos, cálculo y pago de impuestos, y comunicación entre las autoridades estadounidenses y el exportador mexicano.',
      'Document preparation, tax calculation and payment, and communication between US authorities and the Mexican exporter.'
    ),
    benefit: t(
      'Un solo aliado para cumplir en ambos lados de la frontera.',
      'A single partner to comply on both sides of the border.'
    ),
  },
  {
    id: 'seguros',
    title: t('Seguros de carga', 'Cargo insurance'),
    includes: t(
      'Cobertura de riesgos de su producto durante el traslado.',
      'Coverage of your product’s risks during transit.'
    ),
    benefit: t('Su mercancía viaja protegida.', 'Your goods travel protected.'),
  },
  {
    id: 'adicionales',
    title: t('Servicios adicionales', 'Additional services'),
    includes: t(
      'Transporte, almacenaje, distribución y soluciones integrales en la cadena de suministro.',
      'Transport, storage, distribution and comprehensive supply chain solutions.'
    ),
    benefit: t(
      'Cubrimos la cadena completa con un solo proveedor.',
      'We cover the whole chain with a single provider.'
    ),
  },
];

// ---------------------------------------------------------------
// FREIGHT FORWARDER (servicio aparte)
// ---------------------------------------------------------------
export const freightModes = [
  {
    id: 'aereo',
    href: 'transporte/aereo',
    title: t('Aéreo', 'Air'),
    desc: t(
      'Rapidez y disponibilidad para su carga: nacional, importación, exportación, charters y Hazmat.',
      'Speed and availability for your cargo: domestic, import, export, charters and Hazmat.'
    ),
  },
  {
    id: 'maritimo',
    href: 'transporte/maritimo',
    title: t('Marítimo', 'Ocean'),
    desc: t(
      'Soluciones marítimas para su carga internacional.',
      'Ocean freight solutions for your international cargo.'
    ),
  },
  {
    id: 'terrestre',
    href: 'transporte/terrestre',
    title: t('Terrestre', 'Land'),
    desc: t(
      'Transporte terrestre nacional e internacional.',
      'Domestic and international land transportation.'
    ),
  },
];

export function pick(obj, lang) {
  return obj?.[lang] ?? obj?.es ?? '';
}
