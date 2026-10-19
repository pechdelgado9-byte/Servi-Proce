import { SanitizationService } from '../services/SanitizationService.js';

/**
 * Modelo de Dominio: QuotationRequest (RF-01 y RF-04 del ERS)
 * Evalúa el vector formal V = (n, e, s, c) garantizando restricción informativa (Cero Costos).
 */
export class QuotationRequest {
  // Opciones parametrizadas de servicio válidas según RF-01 y Sección 3.1.1 del ERS
  static VALID_SERVICES = [
    'Transporte Aéreo',
    'Transporte Terrestre',
    'Transporte Marítimo',
    'Despacho de Aduana',
    'Seguro de Mercancía',
    // Alias equivalentes del formulario de Contacto (Sección 3.1.1)
    'Despacho',
    'Seguro',
    'NOM',
    'Norma Oficial Mexicana (NOM)',
    'Asesoría',
    'Otros',
  ];

  static RFC5322_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  constructor({
    reference = '',
    name = '',
    email = '',
    phone = '',
    company = '',
    service = '',
    operation = '',
    mode = '',
    country = '',
    industry = '',
    description = '',
    hazmat = false,
    files = [],
    recaptchaScore = 1.0,
  }) {
    this.reference = reference;
    this.name = SanitizationService.sanitizeText(name);
    this.email = SanitizationService.sanitizeText(email).toLowerCase();
    this.phone = SanitizationService.sanitizeText(phone);
    this.company = SanitizationService.sanitizeText(company);
    this.service = SanitizationService.sanitizeText(service);
    this.operation = SanitizationService.sanitizeText(operation);
    this.mode = SanitizationService.sanitizeText(mode);
    this.country = SanitizationService.sanitizeText(country);
    this.industry = SanitizationService.sanitizeText(industry);
    this.description = SanitizationService.sanitizeText(description);
    this.hazmat = Boolean(hazmat);
    this.files = Array.isArray(files) ? files : [];
    this.recaptchaScore = Number(recaptchaScore);

    this.validate();
  }

  /**
   * RF-01 y RF-04 Precondiciones Lógicas:
   * - len(n) > 0
   * - Regex_rfc5322(e) = True
   * - s in S
   */
  validate() {
    if (!this.name || this.name.length > 120) {
      throw new Error('INVALID_NAME: El nombre es obligatorio y no debe exceder 120 caracteres (RF-01/RF-04).');
    }

    if (!QuotationRequest.RFC5322_EMAIL_REGEX.test(this.email) || this.email.length > 160) {
      throw new Error('INVALID_EMAIL: El correo electrónico no cumple con el formato RFC 5322 (RF-01/RF-04).');
    }

    if (!this.service || !QuotationRequest.VALID_SERVICES.includes(this.service)) {
      throw new Error(`INVALID_SERVICE: El servicio seleccionado "${this.service}" no pertenece al catálogo válido S (RF-01).`);
    }
  }
}
