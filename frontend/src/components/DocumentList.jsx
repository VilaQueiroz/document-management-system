import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (!Number.isFinite(size)) {
    return '-';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, ownerId, onError }) {
  return (
    <section>
      <h2>Documentos</h2>
      {documents.length === 0 ? (
        <p>Nenhum documento encontrado para este owner.</p>
      ) : (
        <ul style={{ display: 'grid', gap: '0.75rem', padding: 0, listStyle: 'none' }}>
          {documents.map((document) => (
            <li
              key={document.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <strong>{document.originalName}</strong>
                <div>Tamanho: {formatFileSize(document.size)}</div>
                <div>Enviado em: {new Date(document.uploadedAt).toLocaleString('pt-BR')}</div>
              </div>
              <DownloadButton
                ownerId={ownerId}
                documentId={document.id}
                fileName={document.originalName}
                onError={onError}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
