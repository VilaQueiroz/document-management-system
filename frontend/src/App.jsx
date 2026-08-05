import { useCallback, useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentApi';

export default function App() {
  const [ownerId, setOwnerId] = useState('user-1');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refreshDocuments = useCallback(async () => {
    if (!ownerId.trim()) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextDocuments = await listDocuments({ ownerId });
      setDocuments(nextDocuments);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const handleUploadSuccess = async (message) => {
    setSuccessMessage(message);
    await refreshDocuments();
  };

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      <header>
        <h1>Document Management System</h1>
        <p>Upload, listagem e download de documentos por owner.</p>
      </header>

      <section>
        <label htmlFor="owner-input" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
          Owner ID
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            id="owner-input"
            value={ownerId}
            onChange={(event) => {
              setOwnerId(event.target.value);
              setSuccessMessage('');
            }}
            placeholder="Exemplo: user-1"
          />
          <button type="button" onClick={refreshDocuments} disabled={isLoading}>
            {isLoading ? 'Atualizando...' : 'Atualizar lista'}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <p style={{ background: '#ffe8e8', border: '1px solid #f3bbbb', padding: '0.75rem', borderRadius: '8px' }}>
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p style={{ background: '#e9fbe9', border: '1px solid #c4e8c4', padding: '0.75rem', borderRadius: '8px' }}>
          {successMessage}
        </p>
      ) : null}

      <UploadComponent
        ownerId={ownerId}
        onUploadSuccess={handleUploadSuccess}
        onError={setErrorMessage}
      />

      <DocumentList documents={documents} ownerId={ownerId} onError={setErrorMessage} />
    </main>
  );
}
