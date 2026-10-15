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
      <section className="section bg-surface text-center">
        <div className="container" style={{ maxWidth: '850px' }}>
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary">
            {lang === 'es'
              ? 'Condiciones generales de uso del sitio web y servicios de comercio exterior.'
              : 'General conditions for the use of the website and foreign trade services.'}
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
                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>1. Objeto y Aceptación</h2>
                <p className="text-text-muted mb-4">
                  El presente documento establece las condiciones que rigen el acceso y uso del sitio web de <strong>Servi Proce</strong>. Al navegar en este portal o utilizar nuestros formularios de cotización y contacto, usted acepta quedar vinculado por estos Términos y Condiciones.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>2. Naturaleza Informativa y Cotizaciones</h2>
                <p className="text-text-muted mb-4">
                  El contenido expuesto en este portal tiene propósitos informativos y de vinculación comercial. El envío de una solicitud de cotización o pre-registro de documentos no constituye la aceptación automática de una operación aduanal ni obliga a las partes hasta la celebración de un contrato de prestación de servicios o encomienda aduanal expresa y formalizada.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>3. Veracidad de la Información y Archivos Adjuntos</h2>
                <p className="text-text-muted mb-4">
                  El usuario garantiza que toda la información, facturas comerciales, especificaciones técnicas y hojas de seguridad (MSDS) proporcionadas son legítimas, verídicas y corresponden fielmente a las mercancías objeto de la consulta. La clasificación arancelaria y determinación de contribuciones dependerán de la exactitud de los datos suministrados.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>4. Confidencialidad Comercial</h2>
                <p className="text-text-muted mb-4">
                  Servi Proce se compromete a mantener estricta reserva y confidencialidad respecto a la información técnica, comercial o financiera contenida en las facturas y documentación remitida, utilizándola únicamente para los fines de análisis aduanal y cotización solicitados.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>5. Propiedad Intelectual</h2>
                <p className="text-text-muted mb-4">
                  Los logotipos, marcas, contenidos textuales, diseño visual, código fuente y estructura de este sitio web son propiedad exclusiva de Servi Proce o de sus respectivos licenciantes, estando protegidos por la Ley Federal de Protección a la Propiedad Industrial y tratados internacionales.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>6. Legislación Aplicable y Jurisdicción</h2>
                <p className="text-text-muted mb-4">
                  Para la interpretación y cumplimiento de estos términos, las partes se someten a la legislación mercantil y aduanera de los Estados Unidos Mexicanos y a la jurisdicción de los tribunales competentes de la ciudad de Guadalajara, Jalisco, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                </p>
              </div>
            ) : (
              <div className="legal-content">
                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>1. Scope and Acceptance</h2>
                <p className="text-text-muted mb-4">
                  These terms govern access and use of the <strong>Servi Proce</strong> website. By browsing or submitting quote inquiries, you agree to comply with and be bound by these Terms and Conditions.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>2. Informational Purpose and Quotations</h2>
                <p className="text-text-muted mb-4">
                  All materials on this site serve commercial informational purposes. Submitting quote details or uploading draft cargo documentation does not constitute an agreement or binding commitment until a formal customs service agreement or power of attorney is executed.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>3. Accuracy of Uploaded Documents</h2>
                <p className="text-text-muted mb-4">
                  The client represents that all invoices, technical descriptions, and safety data sheets (MSDS) provided are genuine and accurate. Tariff determinations and duty estimates depend entirely upon the truthfulness of the provided documents.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>4. Commercial Confidentiality</h2>
                <p className="text-text-muted mb-4">
                  Servi Proce guarantees strict confidentiality regarding corporate pricing, suppliers, and trade secrets disclosed within client documentation, utilizing such data solely for assessment and operational scoping.
                </p>

                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem' }}>5. Governing Law and Jurisdiction</h2>
                <p className="text-text-muted mb-4">
                  These terms shall be governed by the laws of Mexico. Any disputes arising hereunder shall be resolved exclusively within the competent courts of Guadalajara, Jalisco, Mexico.
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
