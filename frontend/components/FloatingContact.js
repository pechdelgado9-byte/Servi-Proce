export default function FloatingContact() {
  return (
    <div className="floating-contact">
      {/* WhatsApp - RF-05: Protocolo wa.me */}
      <a 
        href="https://wa.me/523321837862" 
        target="_blank" 
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--whatsapp"
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </a>

      {/* Messenger - RF-05: Protocolo m.me */}
      <a 
        href="https://m.me/serviproce_em" 
        target="_blank" 
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--messenger"
        aria-label="Contactar por Messenger"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.1 10.5C21.1 5.8 17 2 12 2S2.9 5.8 2.9 10.5c0 2.5 1.1 4.7 2.9 6.2v3.8l3.4-1.9c1 .3 2.1.4 3.2.4 4.8 0 8.7-3.9 8.7-8.5z"></path>
        </svg>
      </a>
    </div>
  );
}
