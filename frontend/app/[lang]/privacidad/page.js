import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Aviso de Privacidad | Servi Proce' : 'Privacy Notice | Servi Proce',
    description: lang === 'es'
      ? 'Aviso de Privacidad Integral de Servi Proce en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).'
      : 'Comprehensive Privacy Notice of Servi Proce in compliance with Mexican data protection laws (LFPDPPP).',
  };
}

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export default async function Privacidad({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section 
        className="section bg-surface text-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2070&auto=format&fit=crop")',
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
            {lang === 'es' ? 'Marco Legal & Privacidad' : 'Legal Framework & Privacy'}
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
            {lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Notice'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-white opacity-90" style={{ maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            {lang === 'es'
              ? 'Conforme a lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).'
              : 'In compliance with the Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP).'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container" style={{ maxWidth: '900px' }}>
          <article className="card glass-card fade-in-up" style={{ padding: '3.25rem 2.75rem', borderRadius: '1.25rem' }}>
            {/* Cabecera institucional del documento */}
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                    SERVI PROCE | LOGISTICS &amp; SUPPLY CHAIN
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    JBG Logistics and Supply Chain Solutions
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <div>Av. Altavista Poniente 450 Int. 110, Col. Altavista Residencial</div>
                    <div>Zapopan, Jal., C.P. 45133 • Cel: 3311402745</div>
                  </div>
                  <a
                    href="/docs/Aviso_de_Privacidad_ServiProce.pdf"
                    download="Aviso_de_Privacidad_ServiProce.pdf"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      background: 'rgba(157, 0, 0, 0.08)',
                      padding: '0.45rem 1rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                  <strong>JBG Logistics and Supply Chain Solutions</strong> con domicilio en Av. Altavista poniente 450 int 110. Col Altavista residencial, C.P. 45133, Zapopan, Jal. Conforme a lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, pone a disposición de nuestros clientes y proveedores nuestro aviso de privacidad.
                </p>
                <p className="mb-4">
                  Los datos personales que nos proporciona son utilizados estrictamente en la realización de funciones propias de nuestra empresa y serán utilizados para proveer los servicios solicitados.
                </p>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  1. Datos personales solicitados por única vez a nuestros clientes
                </h3>
                <p className="mb-3 text-text-muted">
                  A nuestros clientes se les solicitará por única vez los siguientes datos personales y documentación legal:
                </p>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>Constancia de situación fiscal.</li>
                  <li>Cédula de RFC.</li>
                  <li>Alta en Hacienda R1 o R2 en caso de aplicar.</li>
                  <li>Comprobante de domicilio (copia sólo válido alta de hacienda, recibo de luz o teléfono).</li>
                  <li>Acta Constitutiva (copia).</li>
                  <li>Poder del Representante Legal (copia).</li>
                  <li>Cédula Fiscal RFC de representante legal (copia).</li>
                  <li>INE de representante legal o personas autorizadas.</li>
                  <li>Datos financieros como datos bancarios, nombre del titular y nombre de la institución bancaria.</li>
                  <li>Carta encomienda (2 juegos) en original con Hoja membretada.</li>
                  <li>
                    Encargo conferido a las patentes: En caso de importación preguntar a su ejecutivo, ya que dependerá de la aduana que realizará trámites. 
                    <em> (Si es por Guadalajara dar de alta la patente <strong>3450</strong> a nombre de <strong>Juan Carlos Delgadillo Casillas</strong> y patente <strong>3451</strong> a nombre de <strong>Victoriano Garza López</strong>).</em>
                  </li>
                  <li>Alta de padrón de importadores (copia de autorización).</li>
                  <li>Comprobante de valor electrónico (COVE) y digitalización de guías, cartas y cualquier otro escrito necesario.</li>
                </ul>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  2. Documentación solicitada por cada embarque
                </h3>
                <p className="mb-3 text-text-muted">
                  A nuestros clientes se les solicitará la siguiente documentación por cada operación o embarque:
                </p>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Copia de factura(s)</strong>, la cual deberá contener:
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'circle' }}>
                      <li>Lugar y fecha de expedición.</li>
                      <li>Nombre y domicilio del destinatario de la mercancía.</li>
                      <li>Descripción detallada de las mercancías (en español, inglés o francés) así como los valores unitarios y totales.</li>
                      <li>Número de identificación fiscal del vendedor (En México RFC o U.S.A. Tax ID Number, IRS, Federal Employer Number).</li>
                    </ul>
                  </li>
                </ul>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  3. Procedimiento para el ejercicio de derechos y contacto
                </h3>
                <p className="mb-4">
                  Usted tiene derecho de acceder, rectificar y cancelar sus datos personales, así como de oponerse al tratamiento de estos o revocar el consentimiento que para tal fin nos haya otorgado, a través de los procedimientos que hemos implementado. Para conocer dichos procedimientos, los requisitos y plazos, se puede poner en contacto con nuestro departamento de datos personales en el correo <a href="mailto:jorgebarrios@serviproce.com.mx" className="text-primary font-bold">jorgebarrios@serviproce.com.mx</a>, en el domicilio Av. Altavista poniente 450 int 110, Col. Altavista residencial, CP. 45133, Zapopan, Jal., o visitar nuestra página de Internet <strong>serviproce.com.mx</strong> en el apartado Aviso de Privacidad.
                </p>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  4. ¿Con quién se comparte su información personal y para qué fines?
                </h3>
                <p className="mb-4">
                  Asimismo, le informamos que sus datos personales pueden ser transferidos y tratados dentro y fuera del país por personas distintas a esta empresa. En ese sentido, su información puede ser compartida con empresas vinculadas con nosotros o con ustedes (clientes, proveedores, Agentes Aduanales, transportistas, etc.) para cumplir con el servicio requerido por su empresa o para cumplir con requerimientos de información específica. Si usted no manifiesta su oposición para que sus datos personales sean transferidos, se entenderá que ha otorgado su consentimiento para ello.
                </p>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
                </h3>
                <p className="mb-3 text-text-muted">
                  La Ley Federal de Protección de Datos Personales en Posesión de los Particulares reconoce sus derechos ARCO. En este sentido usted tiene derecho a:
                </p>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li><strong>Acceso:</strong> Conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos.</li>
                  <li><strong>Rectificación:</strong> Solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta.</li>
                  <li><strong>Cancelación:</strong> Que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente.</li>
                  <li><strong>Oposición:</strong> Oponerse al uso de sus datos personales para fines específicos.</li>
                </ul>
                <p className="mb-3">
                  Para ejercer su derecho ARCO deberá presentar la solicitud a través del correo electrónico <a href="mailto:customerservice@serviproce.com.mx" className="text-primary font-bold">customerservice@serviproce.com.mx</a> o <a href="mailto:jorgebarrios@serviproce.com.mx" className="text-primary font-bold">jorgebarrios@serviproce.com.mx</a> cumpliendo los requisitos citados en el art. 29 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, la cual deberá contener:
                </p>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>El nombre del titular y domicilio u otro medio para comunicarle la respuesta a su solicitud.</li>
                  <li>Los documentos que acrediten la identidad o, en su caso, la representación legal del titular.</li>
                  <li>La descripción clara y precisa de los datos personales respecto de los que se busca ejercer alguno de los derechos antes mencionados.</li>
                  <li>Cualquier otro elemento o documento que facilite la localización de los datos personales.</li>
                </ul>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  6. Finalidades del tratamiento de datos
                </h3>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>Dar cumplimiento al aviso de Privacidad y dar a conocer cómo se almacenan y cuidan estos datos.</li>
                  <li>Dar cumplimiento a obligaciones contratadas con nuestros clientes, empleados o proveedores.</li>
                  <li>Otorgar la mejor calidad en nuestro servicio evitando retrasos por falta de información.</li>
                  <li>Recabar la información requerida para el cumplimiento de nuestros servicios proporcionados por la empresa.</li>
                </ul>

                <div style={{ background: 'rgba(157, 0, 0, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', marginTop: '2rem' }}>
                  <p className="mb-2" style={{ fontWeight: 600 }}>
                    Cancelación de mensajes promocionales:
                  </p>
                  <p className="text-sm text-text-muted mb-0">
                    Si usted desea dejar de recibir mensajes promocionales de nuestra parte puede solicitarlo a través de correo electrónico a <a href="mailto:jorgebarrios@serviproce.com.mx" className="text-primary">jorgebarrios@serviproce.com.mx</a> o al teléfono celular <strong>3311402745</strong>. Cualquier modificación a este aviso de privacidad podrá consultarla en <a href="https://www.serviproce.com.mx" target="_blank" rel="noopener noreferrer" className="text-primary">www.serviproce.com.mx</a>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="legal-content" style={{ lineHeight: '1.7', color: 'var(--color-secondary)' }}>
                <p className="mb-4">
                  <strong>JBG Logistics and Supply Chain Solutions</strong> located at Av. Altavista poniente 450 int 110, Col. Altavista residencial, ZIP Code 45133, Zapopan, Jalisco, Mexico, in compliance with the provisions of the Mexican Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP), makes this privacy notice available to our clients and suppliers.
                </p>
                <p className="mb-4">
                  The personal data you provide is strictly used in performing functions specific to our company and will be utilized to deliver the requested services.
                </p>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  1. One-time personal data requested from clients
                </h3>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>Tax status certificate (Constancia de situación fiscal).</li>
                  <li>Tax ID certificate (Cédula de RFC).</li>
                  <li>Tax registration R1 or R2 if applicable.</li>
                  <li>Proof of address (valid tax registration copy, electricity, or telephone bill).</li>
                  <li>Articles of Incorporation (copy).</li>
                  <li>Power of attorney for Legal Representative (copy).</li>
                  <li>Tax ID certificate (RFC) of the legal representative (copy).</li>
                  <li>Official voter ID (INE) of legal representative and authorized signatories.</li>
                  <li>Financial information including banking details, account holder name, and financial institution.</li>
                  <li>Customs mandate letter (Carta encomienda - 2 original copies on company letterhead).</li>
                  <li>
                    Customs patent endorsement: Depending on customs office. 
                    <em> (For Guadalajara, register patent <strong>3450</strong> under <strong>Juan Carlos Delgadillo Casillas</strong> and patent <strong>3451</strong> under <strong>Victoriano Garza López</strong>).</em>
                  </li>
                  <li>Importer registry authorization copy (Padrón de Importadores).</li>
                  <li>Electronic value proof (COVE) and digitization of airway bills/bills of lading, letters, and required filings.</li>
                </ul>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  2. Documentation required per shipment
                </h3>
                <ul className="list-styled text-text-muted mb-4" style={{ paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Commercial Invoice Copy</strong>, containing:
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyleType: 'circle' }}>
                      <li>Place and date of issuance.</li>
                      <li>Name and address of cargo consignee/recipient.</li>
                      <li>Detailed description of goods (in Spanish, English, or French) along with unit and total values.</li>
                      <li>Seller Tax Identification Number (Mexico RFC or USA Tax ID Number, IRS, EIN).</li>
                    </ul>
                  </li>
                </ul>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  3. ARCO Rights and Contact
                </h3>
                <p className="mb-4">
                  You hold the right to Access, Rectify, Cancel, or Oppose (ARCO) the use of your personal data. Contact our privacy department at <a href="mailto:jorgebarrios@serviproce.com.mx" className="text-primary font-bold">jorgebarrios@serviproce.com.mx</a>, or send an official request to <a href="mailto:customerservice@serviproce.com.mx" className="text-primary font-bold">customerservice@serviproce.com.mx</a>.
                </p>

                <h3 className="text-secondary mt-4 mb-3" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  4. Data Transfers
                </h3>
                <p className="mb-4">
                  Your data may be shared and processed both within and outside Mexico with affiliated partners (clients, suppliers, licensed Customs Brokers, carriers, and port authorities) to fulfill the contracted services.
                </p>

                <div style={{ background: 'rgba(157, 0, 0, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', marginTop: '2rem' }}>
                  <p className="mb-2" style={{ fontWeight: 600 }}>
                    Promotional Notice Opt-Out:
                  </p>
                  <p className="text-sm text-text-muted mb-0">
                    To opt out of promotional communications, notify us at <a href="mailto:jorgebarrios@serviproce.com.mx" className="text-primary">jorgebarrios@serviproce.com.mx</a> or phone +52 3311402745. Policy updates are accessible at <a href="https://www.serviproce.com.mx" target="_blank" rel="noopener noreferrer" className="text-primary">www.serviproce.com.mx</a>.
                  </p>
                </div>
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
                    href="/docs/Aviso_de_Privacidad_ServiProce.pdf"
                    download="Aviso_de_Privacidad_ServiProce.pdf"
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
