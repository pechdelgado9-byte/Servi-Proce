import path from 'node:path';

/**
 * Servicio Orientado a Objetos para Sanitización de Archivos y Textos (RF-07 y RF-09 del ERS)
 */
export class SanitizationService {
  static CMS_MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB máximo en CMS (Sección 2.1.7 y 3.4.4)
  static DOC_MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB máximo en adjuntos de despacho
  static CMS_ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.svg'];
  static QUOTE_ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.docx', '.xlsx', '.xml'];

  /**
   * RF-09: Sistema de Sanitización y Normalización de Archivos
   * Entradas formales: F = (S_name, ext, B)
   * Postcondiciones:
   *  1. S_mut1 = ToLowerCase(S_name)
   *  2. S_mut2 = ReplaceSpace(S_mut1, "-")
   *  3. S_final = RemoveDiacritics(S_mut2)
   *  4. Garantía de URL Segura: S_final pertenece a Gamma* = [a-z, 0-9, -]
   */
  static normalizeFilename(originalFilename) {
    const rawExt = path.extname(String(originalFilename || '')).toLowerCase();
    const rawBase = path.basename(String(originalFilename || ''), path.extname(String(originalFilename || '')));

    // 1. S_mut1 = ToLowerCase(S_name)
    const sMut1 = rawBase.toLowerCase();

    // 2. S_mut2 = ReplaceSpace(S_mut1, "-")
    const sMut2 = sMut1.replace(/[\s_]+/g, '-');

    // 3. S_final = RemoveDiacritics(S_mut2) y filtrado al alfabeto seguro Gamma = [a-z, 0-9, -]
    const sFinal = sMut2
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'archivo';

    return {
      baseName: sFinal,
      extension: rawExt,
      fullName: `${sFinal}${rawExt}`,
    };
  }

  /**
   * Valida integridad binaria (B != empty), extensión y tamaño según RF-09 y Sección 2.1.7.
   */
  static validateAndSanitizeFile({ originalName, buffer, mode = 'cms' }) {
    if (!buffer || buffer.length === 0) {
      throw new Error('FILE_EMPTY: La carga binaria útil (Blob) no puede estar vacía.');
    }

    const maxBytes = mode === 'cms' ? this.CMS_MAX_IMAGE_BYTES : this.DOC_MAX_FILE_BYTES;
    if (buffer.length > maxBytes) {
      throw new Error(`FILE_TOO_LARGE: El archivo excede el límite permitido de ${Math.round(maxBytes / (1024 * 1024))} MB.`);
    }

    const normalized = this.normalizeFilename(originalName);
    const allowed = mode === 'cms' ? this.CMS_ALLOWED_EXTENSIONS : this.QUOTE_ALLOWED_EXTENSIONS;

    if (!allowed.includes(normalized.extension)) {
      throw new Error(`FILE_INVALID_EXT: Extensión ${normalized.extension} no permitida. Permitidas: ${allowed.join(', ')}`);
    }

    if (!this.verifyBinarySignature(normalized.extension, buffer)) {
      throw new Error(`FILE_SIGNATURE_MISMATCH: La cabecera binaria no corresponde a un archivo ${normalized.extension} válido.`);
    }

    return normalized;
  }

  /**
   * Verifica la firma binaria (Magic Bytes) del archivo subido
   */
  static verifyBinarySignature(ext, buf) {
    const head = buf.subarray(0, 12);
    switch (ext) {
      case '.pdf':
        return head.subarray(0, 4).toString('latin1') === '%PDF';
      case '.png':
        return head[0] === 0x89 && head.subarray(1, 4).toString('latin1') === 'PNG';
      case '.jpg':
      case '.jpeg':
        return head[0] === 0xff && head[1] === 0xd8;
      case '.webp':
        return head.subarray(0, 4).toString('latin1') === 'RIFF' && head.subarray(8, 12).toString('latin1') === 'WEBP';
      case '.svg':
      case '.xml': {
        const textHead = buf.subarray(0, 300).toString('utf8').trimStart().toLowerCase();
        return (textHead.startsWith('<svg') || textHead.startsWith('<?xml') || textHead.startsWith('<')) && !this.containsXss(textHead);
      }
      case '.docx':
      case '.xlsx':
        return head[0] === 0x50 && head[1] === 0x4b;
      default:
        return false;
    }
  }

  /**
   * RF-07 Precondición 2: Sanitización de Datos (Anti-XSS)
   * Verifica que el payload esté libre de scripts ejecutables (<script>, javascript:, on* handlers)
   */
  static containsXss(input) {
    const str = String(input ?? '');
    const dangerousPattern = /<\s*\/?\s*script\b|javascript\s*:|on\w+\s*=\s*["']|<iframe\b|<object\b/i;
    return dangerousPattern.test(str);
  }

  static sanitizeText(input) {
    const str = String(input ?? '').trim();
    if (this.containsXss(str)) {
      throw new Error('XSS_DETECTED: Se detectó código ejecutable no permitido (<script> o javascript:).');
    }
    return str;
  }
}
