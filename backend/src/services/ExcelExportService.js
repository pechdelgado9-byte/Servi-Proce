let cachedExcelJS = null;
async function loadExcelJS() {
  if (cachedExcelJS) return cachedExcelJS;
  try {
    const mod = await import('exceljs');
    cachedExcelJS = mod.default || mod;
    return cachedExcelJS;
  } catch (err) {
    console.warn('[ExcelExportService] No se pudo cargar exceljs dinámicamente:', err.message);
    return null;
  }
}

/**
 * Servicio Corporativo de Exportación a Microsoft Excel (.xlsx)
 * Genera reportes ejecutivos estilizados del historial de cotizaciones
 * con diseño institucional de Servi Proce, autoajuste de columnas y autofiltros.
 */
export class ExcelExportService {
  /**
   * Previene inyección de fórmulas en hojas de cálculo (CSV/Formula Injection)
   * asegurando que cadenas que comiencen con caracteres de control de fórmulas
   * sean tratadas estrictamente como texto literal.
   */
  static #sanitizeCellValue(val) {
    if (typeof val !== 'string') return val ?? '';
    const trimmed = val.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return trimmed;
  }

  /**
   * Traduce el código de operación a una etiqueta legible
   */
  static #formatOperation(op, isEn) {
    if (!op) return '-';
    const low = String(op).toLowerCase().trim();
    if (low === 'import' || low === 'importacion') return isEn ? 'Import' : 'Importación';
    if (low === 'export' || low === 'exportacion') return isEn ? 'Export' : 'Exportación';
    return op;
  }

  /**
   * Traduce el modo de transporte a una etiqueta legible
   */
  static #formatMode(mode, isEn) {
    if (!mode) return '-';
    const low = String(mode).toLowerCase().trim();
    if (low === 'air' || low === 'aereo') return isEn ? 'Air' : 'Aéreo';
    if (low === 'ocean' || low === 'maritimo' || low === 'sea') return isEn ? 'Ocean / Sea' : 'Marítimo';
    if (low === 'ground' || low === 'terrestre' || low === 'land') return isEn ? 'Ground' : 'Terrestre';
    return mode;
  }

  /**
   * Formatea el estado de despacho SMTP
   */
  static #formatSmtpStatus(status, isEn) {
    switch (status) {
      case 'sent_all_smtp':
      case 'sent_smtp':
        return isEn ? 'Sent to Directors & Client' : 'Enviado a Directivos y Cliente';
      case 'sent_directors_only':
        return isEn ? 'Sent to Directors Only' : 'Enviado solo a Directivos';
      case 'ready_html_outbox':
        return isEn ? 'Ready in Outbox (No SMTP)' : 'Listo en Outbox (Sin SMTP)';
      case 'failed':
        return isEn ? 'Delivery Failed' : 'Fallo en Entrega';
      default:
        return status || (isEn ? 'Registered' : 'Registrado');
    }
  }

  /**
   * Genera el libro binario .xlsx con el historial de cotizaciones
   * @param {Array} logs - Lista de registros de quotation_logs
   * @param {Object} options - { locale: 'es' | 'en' }
   * @returns {Promise<Buffer>}
   */
  static async generateQuotationsWorkbook(logs = [], { locale = 'es' } = {}) {
    const isEn = locale === 'en';
    const ExcelJS = await loadExcelJS();
    if (!ExcelJS) {
      throw new Error(
        isEn
          ? 'Excel export module (exceljs) is not installed on the server.'
          : 'El módulo de exportación a Excel (exceljs) no se encuentra instalado en el servidor.'
      );
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Servi Proce | Logistics & Supply Chain';
    workbook.lastModifiedBy = 'Servi Proce Admin Portal';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheetName = isEn ? 'Quotation Requests' : 'Solicitudes de Cotización';
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9, // A4
      },
    });

    const columnsCount = 16;
    const borderThin = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };

    // =========================================================================
    // FILA 1: BANNER CORPORATIVO PRINCIPAL (SERVI PROCE)
    // =========================================================================
    worksheet.mergeCells(1, 1, 1, columnsCount);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SERVI PROCE | LOGISTICS & SUPPLY CHAIN';
    titleCell.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Azul Marino Ejecutivo
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 36;

    // =========================================================================
    // FILA 2: SUBTÍTULO INSTITUCIONAL
    // =========================================================================
    worksheet.mergeCells(2, 1, 2, columnsCount);
    const subCell = worksheet.getCell('A2');
    subCell.value = isEn
      ? 'EXECUTIVE QUOTATION REQUESTS AUDIT LOG — ADMINISTRATIVE PORTAL'
      : 'HISTORIAL EJECUTIVO DE SOLICITUDES DE COTIZACIÓN — PORTAL ADMINISTRATIVO';
    subCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } }; // Rojo Borgoña Servi Proce
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 22;

    // =========================================================================
    // FILA 3: METADATOS DEL REPORTE
    // =========================================================================
    const nowStr = new Date().toLocaleString(isEn ? 'en-US' : 'es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'full',
      timeStyle: 'medium',
    });
    worksheet.mergeCells(3, 1, 3, columnsCount);
    const metaCell = worksheet.getCell('A3');
    metaCell.value = isEn
      ? `Generated on: ${nowStr} (CST) | Total Requests: ${logs.length} | Classification: Strictly Confidential Corporate Audit`
      : `Reporte emitido: ${nowStr} (CST) | Total de Registros: ${logs.length} | Clasificación: Confidencial Corporativo`;
    metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
    metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(3).height = 20;

    // =========================================================================
    // FILA 4: ESPACIADOR
    // =========================================================================
    worksheet.getRow(4).height = 10;

    // =========================================================================
    // FILA 5: ENCABEZADOS DE COLUMNA
    // =========================================================================
    const headers = isEn
      ? [
          'Folio / Ref',
          'Date & Time',
          'Contact Name',
          'Email Address',
          'Phone',
          'Company Name',
          'Primary Service',
          'Operation',
          'Transport Mode',
          'Country',
          'Industry / Sector',
          'Hazmat (Hazardous)',
          'Cargo Description & Requirements',
          'Attached Files',
          'reCAPTCHA Score',
          'Notification Status',
        ]
      : [
          'Folio / Referencia',
          'Fecha y Hora',
          'Nombre del Contacto',
          'Correo Electrónico',
          'Teléfono',
          'Empresa / Razón Social',
          'Servicio Solicitado',
          'Operación',
          'Modalidad',
          'País Origen / Destino',
          'Sector / Industria',
          'Material Peligroso (Hazmat)',
          'Descripción y Requerimientos',
          'Archivos Adjuntos',
          'Score reCAPTCHA',
          'Estado Notificación',
        ];

    const headerRow = worksheet.getRow(5);
    headerRow.height = 28;
    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Azul Pizarra Oscuro
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = borderThin;
    });

    // =========================================================================
    // FILAS DE DATOS (FILA 6 EN ADELANTE)
    // =========================================================================
    let currentRowIdx = 6;
    for (const log of logs) {
      const isEven = currentRowIdx % 2 === 0;
      const rowBgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Zebra striping

      // Formatear archivos adjuntos
      let filesStr = isEn ? 'No files' : 'Sin archivos';
      if (Array.isArray(log.files) && log.files.length > 0) {
        filesStr = `${log.files.length} archivo(s): ${log.files.join(', ')}`;
      }

      // Formatear fecha legible
      const dateFormatted = log.createdAt
        ? String(log.createdAt).replace('T', ' ').slice(0, 19)
        : '-';

      const rowValues = [
        ExcelExportService.#sanitizeCellValue(log.reference),
        dateFormatted,
        ExcelExportService.#sanitizeCellValue(log.name),
        ExcelExportService.#sanitizeCellValue(log.email),
        ExcelExportService.#sanitizeCellValue(log.phone || '-'),
        ExcelExportService.#sanitizeCellValue(log.company || (isEn ? 'Not specified' : 'No especificada')),
        ExcelExportService.#sanitizeCellValue(log.service || (isEn ? 'Customs Clearance' : 'Despacho de Aduana')),
        ExcelExportService.#formatOperation(log.operation, isEn),
        ExcelExportService.#formatMode(log.mode, isEn),
        ExcelExportService.#sanitizeCellValue(log.country || '-'),
        ExcelExportService.#sanitizeCellValue(log.industry || '-'),
        log.hazmat ? (isEn ? 'Yes (Hazardous)' : 'Sí (Peligroso)') : (isEn ? 'No' : 'No'),
        ExcelExportService.#sanitizeCellValue(log.description || '-'),
        filesStr,
        typeof log.recaptchaScore === 'number'
          ? `${log.recaptchaScore.toFixed(1)} (${isEn ? 'Valid' : 'Válido'})`
          : '1.0',
        ExcelExportService.#formatSmtpStatus(log.smtpStatus, isEn),
      ];

      const dataRow = worksheet.getRow(currentRowIdx);
      dataRow.height = 24;

      rowValues.forEach((val, colIdx) => {
        const cell = dataRow.getCell(colIdx + 1);
        cell.value = val;
        cell.border = borderThin;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
        cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1E293B' } };

        // Alineación específica por tipo de dato
        if (colIdx === 0) {
          // Folio: Centrado, Negrita
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
        } else if (colIdx === 1 || colIdx === 7 || colIdx === 8 || colIdx === 9 || colIdx === 11 || colIdx === 14) {
          // Fechas, operación, modalidad, país, hazmat, recaptcha: Centrados
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (colIdx === 11 && log.hazmat) {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFDC2626' } }; // Rojo si es peligroso
          }
        } else if (colIdx === 6 || colIdx === 15) {
          // Servicio y Estado de notificación: Centrado con estilo
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colIdx === 12 || colIdx === 13) {
          // Descripción y Archivos: Ajuste de línea a la izquierda
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        } else {
          // Nombres, empresa, correo, teléfono, industria: Izquierda
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      currentRowIdx++;
    }

    // =========================================================================
    // FILTRO AUTOMÁTICO DE EXCEL
    // =========================================================================
    worksheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: Math.max(5, currentRowIdx - 1), column: columnsCount },
    };

    // =========================================================================
    // AJUSTE AUTOMÁTICO DE ANCHO DE COLUMNAS
    // =========================================================================
    const minWidths = [18, 20, 25, 30, 18, 26, 22, 16, 16, 20, 18, 18, 42, 32, 16, 26];
    const maxWidths = [24, 24, 40, 42, 22, 40, 30, 20, 20, 28, 28, 22, 60, 45, 20, 35];

    worksheet.columns.forEach((col, idx) => {
      let maxLen = headers[idx] ? headers[idx].length : 12;
      for (let r = 6; r < currentRowIdx; r++) {
        const val = worksheet.getCell(r, idx + 1).value;
        if (val) {
          const str = String(val);
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      }
      const calculated = Math.max(minWidths[idx] || 15, Math.min(maxWidths[idx] || 45, maxLen + 3));
      col.width = calculated;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

