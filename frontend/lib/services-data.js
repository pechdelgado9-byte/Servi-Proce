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
    title: t('Documentación (Opcional / Flexible)', 'Documentation (Optional / Flexible)'),
    desc: t(
      'Si ya cuenta con documentos los revisamos; si no, nuestro equipo de asesores le guía paso a paso para gestionarlos fácilmente.',
      'If you have documents ready, we review them; if not, our advisory team guides you step-by-step to handle them easily.'
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
  { 
    id: 'autopartes', 
    label: t('Autopartes', 'Auto Parts'),
    badge: t('Automotriz Tier 1 & 2', 'Automotive Tier 1 & 2'),
    desc: t(
      'Cumplimiento de Regla 8ª, programas IMMEX y cruces expeditos en frontera para líneas de ensamble just-in-time.',
      'Rule 8 compliance, IMMEX programs, and expedited border crossings for just-in-time assembly lines.'
    )
  },
  { 
    id: 'electronica', 
    label: t('Electrónica', 'Electronics'),
    badge: t('Tecnología & Consumo', 'Technology & Consumer'),
    desc: t(
      'Certificación y cumplimiento de NOMs de seguridad (NOM-001/019), pedimentos virtuales y fletes aéreos de alta seguridad.',
      'Safety NOM certification (NOM-001/019), virtual entries, and high-security air freight.'
    )
  },
  { 
    id: 'textil', 
    label: t('Textil', 'Textiles'),
    badge: t('Padrón Sectorial', 'Sectoral Registry'),
    desc: t(
      'Gestión de padrón sectorial textil, permisos automáticos de importación de la SE y validación de reglas de origen.',
      'Textile sectoral registry filing, automatic import permits, and rules of origin validation.'
    )
  },
  { 
    id: 'calzado', 
    label: t('Calzado', 'Footwear'),
    badge: t('Precios Estimados', 'Estimated Reference Prices'),
    desc: t(
      'Cumplimiento de precios estimados del SAT, padrón específico de calzado y etiquetado comercial NOM-020.',
      'SAT estimated reference prices compliance, footwear specific registry, and NOM-020 commercial labeling.'
    )
  },
  { 
    id: 'maquinaria', 
    label: t('Maquinaria', 'Machinery & Equipment'),
    badge: t('Bienes de Capital', 'Capital Goods'),
    desc: t(
      'Despacho aduanal de activo fijo, importación temporal bajo tratados comerciales y fletes especializados en cama baja.',
      'Fixed asset customs clearance, temporary imports under free trade agreements, and specialized lowboy transport.'
    )
  },
  { 
    id: 'siderurgicos', 
    label: t('Siderúrgicos', 'Steel & Metals'),
    badge: t('Avisos Automáticos', 'Automatic Notices'),
    desc: t(
      'Avisos automáticos de importación de productos de acero, control de molinos y clasificación arancelaria NICO rigurosa.',
      'Automatic steel import notices, mill test report validation, and rigorous NICO tariff classification.'
    )
  },
];

// ---------------------------------------------------------------
// SERVICIOS SECUNDARIOS (interactivos). Todos son secundarios al despacho.
// ---------------------------------------------------------------
export const secondaryServices = [
  {
    id: 'clasificacion',
    title: t('Clasificación arancelaria', 'Tariff classification'),
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop',
    includes: t(
      'Revisión de elegibilidad (T-MEC, TLCUE, CPTPP, etc.) y certificados de origen.',
      'Eligibility review (USMCA, EU-Mexico FTA, CPTPP, etc.) and certificates of origin.'
    ),
    benefit: t('Arancel preferencial o cero.', 'Preferential or zero tariff.'),
  },
  {
    id: 'padron',
    title: t('Padrón de importadores y sectores específicos', 'Importers registry and specific sectors'),
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
    includes: t('Inscripción, actualización y reactivación.', 'Registration, updates and reactivation.'),
    benefit: t(
      'Evita suspensiones que paralicen la operación.',
      'Prevents suspensions that would halt your operation.'
    ),
  },
  {
    id: 'planeacion',
    title: t('Planeación de importación y exportación', 'Import and export planning'),
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop',
    includes: t(
      'Cobertura de riesgos de su producto durante el traslado.',
      'Coverage of your product’s risks during transit.'
    ),
    benefit: t('Su mercancía viaja protegida.', 'Your goods travel protected.'),
  },
  {
    id: 'adicionales',
    title: t('Servicios adicionales', 'Additional services'),
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200&auto=format&fit=crop',
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
