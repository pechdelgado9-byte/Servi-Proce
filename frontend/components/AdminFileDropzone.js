'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Formatea bytes en KB o MB legibles
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminFileDropzone({
  id = 'admin_file_input',
  name = 'image_file',
  label = 'Imagen destacada (Opcional, máx. 2 MB)',
  accept = '.webp,.jpg,.jpeg,.png,.svg',
  maxSizeMB = 2,
  existingImageUrl = null,
  lang = 'es',
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const isEn = lang === 'en';
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Limpiar URL temporal del preview al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleApplyFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (file.size > maxSizeBytes) {
      setErrorMsg(
        isEn
          ? `File exceeds the ${maxSizeMB} MB limit (${formatBytes(file.size)}).`
          : `El archivo supera el límite de ${maxSizeMB} MB (${formatBytes(file.size)}).`
      );
      return;
    }

    // Sincronizar con el input nativo vía DataTransfer para que FormData en Server Actions lo reciba
    try {
      if (typeof window !== 'undefined' && window.DataTransfer && inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }
    } catch {
      // Soporte defensivo para entornos restringidos
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    if (file.type && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClear = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = 'copy';
    } catch {
      // Ignorar
    }
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      handleApplyFile(droppedFile);
    }
  };

  const handleZoneClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleZoneClick();
    }
  };

  const handleNativeChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      handleApplyFile(f);
    }
  };

  // Mostrar si hay archivo nuevo seleccionado o imagen previa registrada
  const hasActivePreview = Boolean(previewUrl || (existingImageUrl && !selectedFile));
  const displayedImageSrc = previewUrl || (selectedFile ? null : existingImageUrl);

  return (
    <div className="admin-file-dropzone">
      {label && (
        <label className="form__label" htmlFor={id} style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600 }}>
          {label}
        </label>
      )}

      {/* Input nativo oculto para compatibilidad transparente con Server Actions */}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        onChange={handleNativeChange}
        style={{ display: 'none' }}
        tabIndex={-1}
      />

      {selectedFile ? (
        /* Estado: Archivo nuevo seleccionado */
        <div
          className={`admin-file-dropzone__preview-card ${isDragging ? 'admin-file-dropzone__preview-card--dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="admin-file-dropzone__thumb-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="admin-file-dropzone__thumb"
              />
            </div>
          ) : (
            <div className="admin-file-dropzone__icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          )}

          <div className="admin-file-dropzone__info">
            <span className="admin-file-dropzone__filename" title={selectedFile.name}>
              {selectedFile.name}
            </span>
            <div className="admin-file-dropzone__meta">
              <span className="admin-file-dropzone__size">{formatBytes(selectedFile.size)}</span>
              <span className="admin-file-dropzone__ready-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {isEn ? 'Ready to upload' : 'Listo para subir'}
              </span>
            </div>
          </div>

          <div className="admin-file-dropzone__actions">
            <button
              type="button"
              className="admin-file-dropzone__btn-change"
              onClick={handleZoneClick}
              title={isEn ? 'Change file' : 'Cambiar archivo'}
            >
              {isEn ? 'Change' : 'Cambiar'}
            </button>
            <button
              type="button"
              className="admin-file-dropzone__btn-remove"
              onClick={handleClear}
              title={isEn ? 'Remove file' : 'Quitar archivo'}
              aria-label={isEn ? 'Remove file' : 'Quitar archivo'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      ) : existingImageUrl ? (
        /* Estado: Imagen previa ya guardada en el CMS */
        <div
          className={`admin-file-dropzone__preview-card admin-file-dropzone__preview-card--existing ${isDragging ? 'admin-file-dropzone__preview-card--dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="admin-file-dropzone__thumb-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingImageUrl}
              alt={isEn ? 'Current image' : 'Imagen actual'}
              className="admin-file-dropzone__thumb"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="admin-file-dropzone__info">
            <span className="admin-file-dropzone__existing-badge">
              {isEn ? 'Current Image' : 'Imagen actual'}
            </span>
            <span className="admin-file-dropzone__filename" title={existingImageUrl}>
              {existingImageUrl}
            </span>
            <span className="admin-file-dropzone__hint">
              {isEn ? 'Drag a new image or click to replace' : 'Arrastre una nueva imagen o haga clic para reemplazar'}
            </span>
          </div>

          <div className="admin-file-dropzone__actions">
            <button
              type="button"
              className="admin-file-dropzone__btn-change"
              onClick={handleZoneClick}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {isEn ? 'Replace' : 'Reemplazar'}
            </button>
          </div>
        </div>
      ) : (
        /* Estado: Sin archivo (Dropzone vacío listo para arrastrar o hacer clic) */
        <div
          className={`admin-file-dropzone__box ${isDragging ? 'admin-file-dropzone__box--dragging' : ''}`}
          role="button"
          tabIndex={0}
          onClick={handleZoneClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="admin-file-dropzone__icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>

          <div className="admin-file-dropzone__texts">
            <span className="admin-file-dropzone__primary-text">
              {isDragging
                ? (isEn ? 'Drop your image here' : 'Suelte su imagen aquí')
                : (isEn ? 'Choose or drag image here' : 'Seleccionar o arrastrar archivo')}
            </span>
            <span className="admin-file-dropzone__sub-text">
              {isEn
                ? `Formats: WEBP, JPG, PNG, SVG (Max. ${maxSizeMB} MB)`
                : `Formatos: WEBP, JPG, PNG, SVG (Máx. ${maxSizeMB} MB)`}
            </span>
          </div>

          <span className="admin-file-dropzone__browse-pill">
            {isEn ? 'Browse' : 'Explorar'}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="admin-file-dropzone__error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

