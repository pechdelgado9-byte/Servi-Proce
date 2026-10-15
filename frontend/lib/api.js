// Simulación de consumo de la API de Strapi (Backend Headless)

// Simula la llamada REST para obtener banners promocionales (RF-02)
export async function fetchPromotions(lang) {
  "use cache";
  // En producción, aquí se haría un fetch a process.env.NEXT_PUBLIC_API_URL + '/promotions'
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    id: 1,
    title: lang === 'es' ? 'Asesoría personalizada para su operación de comercio exterior' : 'Personalized advice for your foreign trade operation',
    description: lang === 'es' ? 'Contáctenos y un asesor le dará seguimiento directo.' : 'Contact us and an advisor will follow up with you directly.',
    validUntil: '2027-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop'
  };
}

const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'nueva-normativa-aduanera-2026',
    date: '2026-10-01',
    author: 'Equipo Legal Servi Proce',
    readTime: { es: '5 min de lectura', en: '5 min read' },
    category: { es: 'Regulaciones', en: 'Regulations' },
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop',
    title: {
      es: 'Nuevas Normativas Aduaneras para 2026',
      en: 'New Customs Regulations for 2026'
    },
    excerpt: {
      es: 'Conozca los cambios más importantes en el despacho aduanal mexicano para este año.',
      en: 'Learn about the most important changes in Mexican customs clearance for this year.'
    },
    content: {
      es: [
        'El panorama del comercio exterior en México continúa transformándose para agilizar el cruce de mercancías y reforzar la trazabilidad de las operaciones. En 2026, las autoridades hacendarias y la Agencia Nacional de Aduanas de México (ANAM) han implementado una serie de adecuaciones clave en las Reglas Generales de Comercio Exterior.',
        'Entre los principales cambios destacan la digitalización integral de los expedientes electrónicos de pedimento, mayores requerimientos en la validación de certificados de origen bajo el T-MEC y el fortalecimiento de los esquemas de cumplimiento fiscal y aduanero.',
        'Para los importadores y exportadores, contar con un aliado logístico y aduanal especializado es determinante para prevenir demoras en punto de entrada, evitar multas por discrepancias arancelarias y garantizar la continuidad ininterrumpida de sus cadenas de suministro.'
      ],
      en: [
        'The foreign trade landscape in Mexico continues to evolve to streamline cargo clearance and strengthen transaction traceability. In 2026, Mexican tax and customs authorities (ANAM) introduced key updates across General Foreign Trade Rules.',
        'Key highlights include complete electronic documentation for pedimentos, enhanced validation protocols for USMCA certificates of origin, and stricter fiscal compliance oversight.',
        'For importers and exporters, partnering with an experienced customs broker is crucial to eliminate port delays, avoid classification penalties, and secure continuous supply chain reliability.'
      ]
    }
  },
  {
    id: 2,
    slug: 'ventajas-nearshoring-mexico',
    date: '2026-09-15',
    author: 'Consultoría Estratégica Servi Proce',
    readTime: { es: '6 min de lectura', en: '6 min read' },
    category: { es: 'Logística', en: 'Logistics' },
    imageUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=1200&auto=format&fit=crop',
    title: {
      es: 'Ventajas del Nearshoring en México',
      en: 'Advantages of Nearshoring in Mexico'
    },
    excerpt: {
      es: 'Cómo su empresa puede aprovechar la relocalización de cadenas de suministro.',
      en: 'How your company can take advantage of supply chain relocation.'
    },
    content: {
      es: [
        'México se ha consolidado como el destino predilecto para la relocalización de inversiones industriales e infraestructura manufacturera proveniente de Asia hacia América del Norte.',
        'La proximidad geográfica con Estados Unidos y Canadá, aunada a los beneficios de tratados comerciales como el T-MEC y programas de fomento como IMMEX y PROSEC, brinda a las organizaciones ventajas competitivas inigualables en costos de flete, tiempos de tránsito y flexibilidad operativa.',
        'En Servi Proce asesoramos a empresas consolidadas y nuevas inversiones en el diseño de su estrategia aduanal, clasificación arancelaria y cumplimiento de NOMs para asegurar una llegada fluida y rentable al mercado nacional.'
      ],
      en: [
        'Mexico has established itself as the top destination for manufacturing relocation and supply chain nearshoring from Asia into North America.',
        'Geographic proximity to the US and Canada, combined with free trade advantages under USMCA and programs such as IMMEX and PROSEC, offers companies unmatched competitive edges in shipping time, freight costs, and operational flexibility.',
        'At Servi Proce, we guide established enterprises and new investors in designing their customs architecture, tariff classifications, and regulatory compliance to ensure smooth, profitable market integration.'
      ]
    }
  }
];

// Simula la llamada REST para obtener los artículos del blog (RF-07)
export async function fetchBlogPosts(lang) {
  "use cache";
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return BLOG_ARTICLES.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title[lang] || article.title.es,
    excerpt: article.excerpt[lang] || article.excerpt.es,
    date: article.date,
    author: article.author,
    readTime: article.readTime[lang] || article.readTime.es,
    category: article.category[lang] || article.category.es,
    imageUrl: article.imageUrl
  }));
}

// Obtener un artículo individual por slug
export async function fetchBlogPostBySlug(slug, lang) {
  "use cache";
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const article = BLOG_ARTICLES.find(a => a.slug === slug);
  if (!article) return null;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title[lang] || article.title.es,
    excerpt: article.excerpt[lang] || article.excerpt.es,
    content: article.content[lang] || article.content.es,
    date: article.date,
    author: article.author,
    readTime: article.readTime[lang] || article.readTime.es,
    category: article.category[lang] || article.category.es,
    imageUrl: article.imageUrl
  };
}
