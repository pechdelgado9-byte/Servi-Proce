// Simulación de consumo de la API de Strapi (Backend Headless)

// Simula la llamada REST para obtener banners promocionales (RF-02)
export async function fetchPromotions(lang) {
  "use cache";
  // En producción, aquí se haría un fetch a process.env.NEXT_PUBLIC_API_URL + '/promotions'
  // Simulamos un retraso de red
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    id: 1,
    title: lang === 'es' ? '15% de Descuento en Transporte Marítimo' : '15% Off on Maritime Transport',
    description: lang === 'es' ? 'Aplica para nuevos clientes en contenedores FCL en rutas desde Asia.' : 'Applies for new clients in FCL containers on routes from Asia.',
    validUntil: '2027-12-31',
    // Usando una imagen simulada formato WebP (RNF-01)
    imageUrl: 'https://via.placeholder.com/1200x300.webp/9d0000/ffffff?text=Promo+Banner'
  };
}

// Simula la llamada REST para obtener los artículos del blog (RF-07)
export async function fetchBlogPosts(lang) {
  "use cache";
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return [
    {
      id: 1,
      slug: 'nueva-normativa-aduanera-2026',
      title: lang === 'es' ? 'Nuevas Normativas Aduaneras para 2026' : 'New Customs Regulations for 2026',
      excerpt: lang === 'es' 
        ? 'Conozca los cambios más importantes en el despacho aduanal mexicano para este año.' 
        : 'Learn about the most important changes in Mexican customs clearance for this year.',
      date: '2026-10-01',
      imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      slug: 'ventajas-nearshoring-mexico',
      title: lang === 'es' ? 'Ventajas del Nearshoring en México' : 'Advantages of Nearshoring in Mexico',
      excerpt: lang === 'es'
        ? 'Cómo su empresa puede aprovechar la relocalización de cadenas de suministro.'
        : 'How your company can take advantage of supply chain relocation.',
      date: '2026-09-15',
      imageUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop'
    }
  ];
}
