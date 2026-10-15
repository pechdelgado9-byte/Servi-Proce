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
      <section className="section bg-surface text-center">
        <div className="container" style={{ maxWidth: '850px' }}>
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Notice'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary">
            {lang === 'es'
              ? 'En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).'
              : 'In compliance with the Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP).'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container" style={{ maxWidth: '850px' }}>
          <article className="card glass-card fade-in-up" style={{ padding: '3rem 2.5rem' }}>
            <div className="text-sm text-text-muted mb-4">
              <strong>{lang === 'es' ? 'Última actualización: ' : 'Last updated: '}</strong>
              {lang === 'es' ? 'Octubre 2026' : 'October 2026'}
            </div>

            {lang === 'es' ? (
              <div className="legal-content">
                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>1. Identidad y Domicilio del Responsable</h2>
                <p className="text-text-muted mb-4">
                  <strong>Servi Proce</strong> (en adelante &quot;La Empresa&quot;), con domicilio fiscal y operativo en Guadalajara, Jalisco, México, es responsable del uso, tratamiento y protección de sus datos personales y corporativos recabados a través de este portal web.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>2. Datos Personales que Recabamos</h2>
                <p className="text-text-muted mb-3">
                  Para atender sus solicitudes de cotización, despacho aduanal y logística internacional, recabamos los siguientes datos:
                </p>
                <ul className="list-styled text-text-muted mb-4">
                  <li>Datos de identificación y contacto: Nombre completo, correo electrónico, número telefónico / WhatsApp y nombre de la empresa.</li>
                  <li>Datos de operación de comercio exterior: Tipo de régimen (importación/exportación), medio de transporte (aéreo, marítimo, terrestre), país de origen/destino y sector industrial.</li>
                  <li>Documentos y archivos adjuntos: Facturas comerciales, fichas y especificaciones técnicas, y hojas de datos de seguridad (MSDS) para materiales o sustancias químicas.</li>
                </ul>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>3. Finalidades del Tratamiento de los Datos</h2>
                <p className="text-text-muted mb-3">
                  Los datos personales y documentación proporcionada serán utilizados exclusivamente para:
                </p>
                <ul className="list-styled text-text-muted mb-4">
                  <li>Evaluar la viabilidad técnica y normativa de la operación aduanal o logística solicitada.</li>
                  <li>Permitir que un asesor especializado dé seguimiento personalizado a su cotización y requerimientos de servicio.</li>
                  <li>Integrar los expedientes digitales preliminares necesarios para la planeación aduanera conforme a las leyes fiscales y aduaneras mexicanas.</li>
                  <li>No comercializamos, transferimos ni vendemos sus datos personales a terceros con fines publicitarios.</li>
                </ul>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>4. Derechos ARCO</h2>
                <p className="text-text-muted mb-4">
                  Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición). Para el ejercicio de cualquiera de los derechos ARCO, puede enviar un correo a: <a href="mailto:customerservice@serviproce.com.mx" className="text-primary font-bold">customerservice@serviproce.com.mx</a>.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>5. Medidas de Seguridad</h2>
                <p className="text-text-muted mb-4">
                  Implementamos controles técnicos, administrativos y físicos rigurosos para salvaguardar sus archivos y datos de contacto contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>6. Modificaciones al Aviso de Privacidad</h2>
                <p className="text-text-muted mb-4">
                  El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de nuestras propias prácticas operativas. Cualquier cambio será publicado oportunamente en este mismo apartado.
                </p>
              </div>
            ) : (
              <div className="legal-content">
                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>1. Controller Identity and Address</h2>
                <p className="text-text-muted mb-4">
                  <strong>Servi Proce</strong> (hereinafter &quot;The Company&quot;), located in Guadalajara, Jalisco, Mexico, is responsible for the processing and protection of your personal and corporate data collected through this website.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>2. Personal Data We Collect</h2>
                <p className="text-text-muted mb-3">
                  To process your inquiries for quotations, customs clearance, and global logistics, we collect:
                </p>
                <ul className="list-styled text-text-muted mb-4">
                  <li>Contact and Identification Data: Full name, business email, telephone/WhatsApp number, and company name.</li>
                  <li>Foreign Trade Data: Operation type (import/export), transport mode (air, ocean, ground), country of origin/destination, and industry sector.</li>
                  <li>Operational Documents: Commercial invoices, technical specifications, and Material Safety Data Sheets (MSDS) for chemical or regulated cargo.</li>
                </ul>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>3. Purposes of Data Processing</h2>
                <p className="text-text-muted mb-3">
                  Your information is processed strictly for:
                </p>
                <ul className="list-styled text-text-muted mb-4">
                  <li>Assessing customs feasibility and regulatory prerequisites for your cargo.</li>
                  <li>Enabling a designated customs consultant to reach out and deliver tailored quotation follow-up.</li>
                  <li>Creating compliant electronic files under Mexican foreign trade provisions.</li>
                  <li>We never sell or disclose your records to third-party marketing entities.</li>
                </ul>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>4. ARCO Rights</h2>
                <p className="text-text-muted mb-4">
                  You possess the legal right to Access, Rectify, Cancel, or Oppose (ARCO rights) the processing of your personal information. To exercise these rights, submit your request to <a href="mailto:customerservice@serviproce.com.mx" className="text-primary font-bold">customerservice@serviproce.com.mx</a>.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>5. Security Safeguards</h2>
                <p className="text-text-muted mb-4">
                  We enforce administrative, technical, and physical safeguards to prevent loss, misuse, unauthorized access, or alteration of confidential commercial documentation.
                </p>
              </div>
            )}

            <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-surface)' }}>
              <div className="flex-center gap-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Link href={`/${lang}`} className="btn btn--secondary">
                  ← {lang === 'es' ? 'Volver al Inicio' : 'Return Home'}
                </Link>
                <Link href={`/${lang}/contacto`} className="btn btn--primary">
                  {lang === 'es' ? 'Contactar con Nosotros' : 'Contact Us'}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
