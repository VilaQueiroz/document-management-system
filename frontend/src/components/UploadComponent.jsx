import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ ownerId, onUploadSuccess, onError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      onError('Selecione um arquivo antes de enviar.');
      return;
    }

    if (!ownerId.trim()) {
      onError('Informe o owner para enviar documentos.');
      return;
    }

    setIsUploading(true);
    onError('');

    try {
      await uploadDocument({ ownerId, file: selectedFile });
      setSelectedFile(null);
      event.target.reset();
      onUploadSuccess('Upload concluido com sucesso.');
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section>
      <h2>Upload</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="file"
          name="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}
