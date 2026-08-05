import { useState } from 'react';
import { downloadDocument } from '../services/documentApi';

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadButton({ ownerId, documentId, fileName, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ownerId.trim()) {
      onError('Informe o owner para baixar documentos.');
      return;
    }

    setIsDownloading(true);
    onError('');

    try {
      const result = await downloadDocument({
        ownerId,
        documentId,
        fallbackName: fileName,
      });

      triggerBrowserDownload(result.blob, result.fileName);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Download'}
    </button>
  );
}
