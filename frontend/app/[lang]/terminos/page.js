import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Términos y Condiciones | Servi Proce' : 'Terms & Conditions | Servi Proce',
    description: lang === 'es'
      ? 'Términos y condiciones de uso del portal web y servicios de consultoría aduanal y logística de Servi Proce.'
      : 'Terms and conditions for the website and customs consulting services of Servi Proce.',
  };
}

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export default async function Terminos({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section 
        className="section bg-surface text-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          padding: '5.5rem 0 4.5rem 0'
        }}
      >
        <div className="section-overlay" style={{ background: 'linear-gradient(135deg, rgba(11, 17, 32, 0.90) 0%, rgba(26, 36, 62, 0.84) 50%, rgba(11, 17, 32, 0.92) 100%)' }}></div>
        <div className="container relative z-10" style={{ maxWidth: '850px' }}>
          <span className="priority-badge fade-in-up" style={{ letterSpacing: '0.08em' }}>
            {lang === 'es' ? 'Términos Jurídicos & Operativos' : 'Legal & Operational Terms'}
          </span>
          <h1 
            className="fade-in-up delay-1" 
            style={{ 
              fontSize: 'clamp(2.25rem, 4.5vw, 3rem)', 
              fontWeight: 900, 
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              background: 'none',
              textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 0 35px rgba(0,0,0,0.6)',
              marginBottom: '1rem'
            }}
          >
            {lang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-white opacity-90" style={{ maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            {lang === 'es'
              ? 'Condiciones generales de uso del sitio web y servicios de comercio exterior.'
              : 'General conditions for the use of the website and foreign trade services.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container" style={{ maxWidth: '900px' }}>
          <article className="card glass-card fade-in-up" style={{ padding: '3.25rem 2.75rem', borderRadius: '1.25rem' }}>
            {/* Cabecera institucional */}
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                    SERVI PROCE | LOGISTICS &amp; SUPPLY CHAIN
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Acuerdo Integral de Términos y Condiciones de Servicio
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <div>Av. Altavista Poniente 450 Int. 110, Zapopan, Jal.</div>
                    <div>www.serviproce.com.mx</div>
                  </div>
                  <a
                    href="/docs/Terminos_y_Condiciones_ServiProce.pdf"
                    download="Terminos_y_Condiciones_ServiProce.pdf"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      background: 'rgba(157, 0, 0, 0.08)',
                      padding: '0.45rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(157, 0, 0, 0.25)',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {lang === 'es' ? 'Descargar PDF Original' : 'Download Original PDF'}
                  </a>
                </div>
              </div>
            </div>

            {lang === 'es' ? (
              <div className="legal-content" style={{ lineHeight: '1.7', color: 'var(--color-secondary)' }}>
                <p className="mb-4">
                  Al acceder y utilizar este servicio, usted acepta y accede a estar obligado por los términos y disposiciones de este acuerdo.
                </p>

                <div style={{ background: 'rgba(157, 0, 0, 0.06)', borderLeft: '3px solid var(--color-primary)', padding: '1rem 1.25rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>Servicios:</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    Debe presentarse un acuerdo mutuo entre cliente y <strong>SERVIPROCE</strong> respecto a la prestación de servicios, respetando siempre la privacidad de ambas partes. El cliente debe presentar los documentos que Serviproce requiera para llevar a cabo la operación siempre oficiales y actuales, así como también firmar un acuerdo de colaboración.
                  </p>
                </div>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  1. Obligaciones del cliente
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">El cliente garantiza que es propietario de las mercancías y que está autorizado a aceptar y acepta estas condiciones.</li>
                  <li className="mb-2">El cliente y cualquier persona que actúa a nombre de cliente deberá proporcionar a Serviproce instrucciones legales, suficientes y ejecutables, así como todos los detalles y documentación necesaria para que Serviproce preste sus servicios, incluidas licencias, descripciones, y detalles de la mercancía, así como su clasificación, información de origen, destino y condiciones de la mercancía.</li>
                  <li className="mb-2">El cliente garantiza que cumplirá con la legislación aplicable en relación con el cumplimiento del acuerdo y llevará a cabo sus negocios de manera ética y legal en todo momento.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  2. Derechos y Obligaciones SERVIPROCE
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">
                    A menos de que se acuerde lo contrario, Serviproce tendrá el derecho a celebrar contratos en su nombre y sin previo aviso al cliente:
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'circle' }}>
                      <li>Para el transporte de mercancías por cualquier ruta, transporte o persona.</li>
                      <li>Para el transporte de mercancías de cualquier descripción.</li>
                      <li>Para el transporte y almacenamiento de mercancías.</li>
                      <li>Para el cumplimiento de obligaciones solicitadas por autoridades.</li>
                    </ul>
                  </li>
                  <li className="mb-2">Serviproce tendrá derecho (sin incurrir en ninguna responsabilidad adicional), pero no estará obligado a apartarse de las instrucciones del cliente en ningún aspecto si Serviproce considera razonablemente que hay una buena razón para hacerlo en interés del cliente.</li>
                  <li className="mb-2">Serviproce puede en cualquier momento cumplir las órdenes o recomendaciones dadas por cualquier autoridad. La responsabilidad y obligación de Serviproce con respecto a los bienes cesará con la entrega u otra disposición de los bienes de acuerdo con dichos pedidos o recomendaciones.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  3. Servicio despachos aduana
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">El cliente garantiza que es propietario o el agente autorizado por el propietario de las mercancías y que está autorizado a aceptar y acepta estas condiciones, no solo para sí mismo sino también como agente y nombre del propietario.</li>
                  <li className="mb-2">El cliente deberá proporcionar datos y la documentación oficial necesaria sobre la mercancía para que Serviproce preste los servicios, todo esto bajo nuestro acuerdo de privacidad; estos documentos son facturas de mercancías y packing list.</li>
                  <li className="mb-2">El cliente deberá firmar las cartas necesarias para llevar a cabo la operación, así como proporcionar datos legales y enviar documentos como comprobante de domicilio, INE, Constancia de situación fiscal, todo esto bajo nuestro acuerdo de privacidad.</li>
                  <li className="mb-2">El cliente manifiesta y declara que la información comercial brindada en los documentos es verídica y SERVIPROCE no se hace responsable en caso de falsedad u omisión.</li>
                  <li className="mb-2">Serviproce puede negarse a prestar servicios debido a problemas de control si Serviproce considera que las mercancías son un producto restringido, cualquiera de las partes involucradas en el comercio sea una parte negada o excluida o la documentación, licencias obtenidas y/o proporcionadas por el cliente son incorrectas, insuficientes, incompletas o se encuentren fuera de lo legal.</li>
                  <li className="mb-2">El cliente deberá indemnizar a Serviproce por los costos, cargos, multas, sanciones y honorarios legales que surjan de o en conexión de los servicios debido a la negligencia del cliente, conducta malintencionada o incumplimiento de sus obligaciones.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  4. Servicios comercializadora
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">El cliente y SERVIPROCE deberán firmar un contrato en donde se llega a un acuerdo mutuo del servicio de comercializadora.</li>
                  <li className="mb-2">El cliente deberá entregar el contrato firmado antes de que comience la operación.</li>
                  <li className="mb-2">El cliente deberá proporcionar datos fiscales, enviar documentos oficiales como comprobante de domicilio, INE y constancia de situación fiscal.</li>
                  <li className="mb-2">El cliente deberá proporcionar número de guía, factura de mercancía y los documentos de la mercancía que sean necesarios para su despacho.</li>
                  <li className="mb-2">El cliente deberá realizar el pago a la cuenta de SERVIPROCE cuando se le indique.</li>
                  <li className="mb-2">Serviproce le entregará al cliente una relación de gastos en donde se desglosen los montos junto con los anticipos realizados por el cliente, así como también una factura de mercancía a nombre del que el cliente indique, de lo contrario se realizará como público en general.</li>
                  <li className="mb-2">Serviproce puede negarse a prestar servicios debido a problemas de control si Serviproce considera que las mercancías son un producto restringido, cualquiera de las partes involucradas en el comercio sea una parte negada o excluida o la documentación, licencias obtenidas y/o proporcionadas por el cliente son incorrectas, insuficientes, incompletas o se encuentren fuera de lo legal.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  5. Servicios coordinación (Logística)
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">El cliente deberá proporcionar las dimensiones, tipo de carga, clave SAT de la carga, así como su origen y destino de esta.</li>
                  <li className="mb-2">El cliente recibirá una cotización de Serviproce por el servicio de coordinación, misma que debe ser aceptada o rechazada por medio de correo electrónico del que se envió la misma.</li>
                  <li className="mb-2">El cliente deberá proporcionar contactos para el momento de recolección, así como también la dirección completa y fotografías de fachada (opcional).</li>
                  <li className="mb-2">El cliente debe realizar el pago de la misma en la fecha que se le indique.</li>
                  <li className="mb-2">Serviproce puede negarse a prestar servicios debido a problemas de control si Serviproce considera razonablemente que el origen, el destino o el país de tránsito es un país restringido o prohibido.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  6. Mercancías peligrosas
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">A menos que se acuerde por escrito, el cliente no entregará a Serviproce, ni hará que Serviproce maneje o manipule mercancías peligrosas.</li>
                  <li className="mb-2">
                    Si el cliente incumple la norma 1 del apartado de mercancías peligrosas:
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'lower-alpha' }}>
                      <li className="mb-1">El cliente será responsable de todas las pérdidas y daños causados por, a o en relación con los productos, sin importar la causa;</li>
                      <li className="mb-1">El cliente defenderá, indemnizará y mantendrá a Serviproce indemne de todas las sanciones, reclamos, daños, costos y gastos que surjan en relación con el mismo y;</li>
                      <li className="mb-1">Serviproce (o cualquier otra persona bajo cuya custodia puedan estar los bienes en el momento pertinente) puede, a su exclusivo criterio, hacer que los bienes sean destruidos o tratados de otra manera. Para los fines de esta sub-cláusula, no se requiere que se notifique a ninguna persona la intención de destruir o disponer de los productos.</li>
                    </ul>
                  </li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  7. Seguros de Carga
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">Serviproce contratará seguros de responsabilidad civil, según lo exija la ley o la práctica común en el comercio.</li>
                  <li className="mb-2">A menos que se acuerde específicamente por escrito, Serviproce no contratará un seguro de carga para los bienes transportados, manipulados y almacenados. <strong>Serviproce alienta a los clientes a contratar un seguro de carga para cubrir los bienes durante el transporte, manipulación y almacenamiento</strong>, ya que Serviproce no se hace responsable de daños, robo o pérdida de la mercancía.</li>
                </ol>
              </div>
            ) : (
              <div className="legal-content" style={{ lineHeight: '1.7', color: 'var(--color-secondary)' }}>
                <p className="mb-4">
                  By accessing and using this service, you agree and accept to be bound by the terms and provisions of this agreement.
                </p>

                <div style={{ background: 'rgba(157, 0, 0, 0.06)', borderLeft: '3px solid var(--color-primary)', padding: '1rem 1.25rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>Services:</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    A mutual agreement must exist between the client and <strong>SERVIPROCE</strong> regarding the rendering of services, always respecting mutual privacy. The client must present official and updated documents required by Serviproce and sign a collaboration agreement.
                  </p>
                </div>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  1. Client Obligations
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">The client represents and warrants that they are the owner of the goods or authorized to accept these terms.</li>
                  <li className="mb-2">The client must provide legal, sufficient, and actionable instructions and documentation (licenses, descriptions, classifications, origin, and destination).</li>
                  <li className="mb-2">The client guarantees compliance with applicable foreign trade legislation and ethical conduct at all times.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  2. SERVIPROCE Rights and Obligations
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">Serviproce holds the right to execute subcontracts for freight, routing, storage, and regulatory compliance on behalf of the client.</li>
                  <li className="mb-2">Serviproce may reasonably depart from client instructions if deemed in the client&apos;s best interest.</li>
                  <li className="mb-2">Serviproce may comply with authority orders without incurring additional liability.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  3. Customs Brokerage Services
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">The client must provide official invoices, packing lists, tax status certificates, and authorized mandate letters under our privacy agreement.</li>
                  <li className="mb-2">The client declares all commercial information to be truthful. SERVIPROCE is not liable for falsity or omission.</li>
                  <li className="mb-2">Serviproce reserves the right to decline service if goods are restricted, parties are debarred, or documentation is illicit.</li>
                  <li className="mb-2">The client shall indemnify Serviproce for fines, penalties, and legal fees resulting from client negligence or non-compliance.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  4. Trading Company Services (Comercializadora)
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">A signed trading company contract must be delivered prior to commencing operations.</li>
                  <li className="mb-2">Client must supply tax IDs, proof of address, tracking numbers, and pay invoices into the designated SERVIPROCE account.</li>
                  <li className="mb-2">Serviproce will issue an itemized statement of expenses along with merchandise invoicing.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  5. Logistics Coordination Services
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">Client must specify cargo dimensions, type, SAT code, and origin/destination coordinates.</li>
                  <li className="mb-2">Coordination quotes must be formally confirmed or rejected via email.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  6. Hazardous Materials (Hazmat)
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">Dangerous goods will not be handled without express prior written agreement.</li>
                  <li className="mb-2">Clients violating this clause assume full liability and Serviproce may destroy or dispose of hazardous goods without prior notice.</li>
                </ol>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  7. Cargo Insurance
                </h3>
                <ol className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li className="mb-2">Serviproce holds civil liability insurance as required by commercial law.</li>
                  <li className="mb-2"><strong>Cargo insurance is not included automatically</strong>. Clients are strongly encouraged to obtain cargo insurance to cover transit, handling, and storage risks, as Serviproce is not liable for loss, damage, or theft.</li>
                </ol>
              </div>
            )}

            {/* Pie de navegación y descarga con mayor separación */}
            <div style={{ marginTop: '4.75rem', paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                <Link 
                  href={`/${lang}`} 
                  className="btn btn--secondary"
                  style={{ 
                    color: 'var(--color-secondary)',
                    border: '1px solid var(--glass-border)',
                    padding: '0.85rem 1.75rem',
                    fontSize: '0.95rem'
                  }}
                >
                  ← {lang === 'es' ? 'Volver al Inicio' : 'Return Home'}
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <a
                    href="/docs/Terminos_y_Condiciones_ServiProce.pdf"
                    download="Terminos_y_Condiciones_ServiProce.pdf"
                    className="btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.85rem 1.6rem',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: 'rgba(157, 0, 0, 0.12)',
                      border: '1.5px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: '0.65rem',
                      boxShadow: '0 4px 14px rgba(157, 0, 0, 0.15)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {lang === 'es' ? 'Descargar Documento en PDF' : 'Download Document as PDF'}
                  </a>

                  <Link href={`/${lang}/contacto`} className="btn btn--primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
                    {lang === 'es' ? 'Contactar con Nosotros' : 'Contact Us'}
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
