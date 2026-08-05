function buildOwnerHeaders(ownerId) {
  return {
    'X-Owner-Id': ownerId,
  };
}

async function parseApiError(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function uploadDocument({ ownerId, file }) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: buildOwnerHeaders(ownerId),
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, 'Falha ao enviar documento.');
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function listDocuments({ ownerId }) {
  const response = await fetch('/api/documents', {
    headers: buildOwnerHeaders(ownerId),
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, 'Falha ao listar documentos.');
    throw new Error(errorMessage);
  }

  const payload = await response.json();
  return payload.documents || [];
}

function extractFileName(response, fallbackName) {
  const disposition = response.headers.get('content-disposition');

  if (!disposition) {
    return fallbackName;
  }

  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallbackName;
}

export async function downloadDocument({ ownerId, documentId, fallbackName }) {
  const response = await fetch(`/api/documents/${documentId}/download`, {
    headers: buildOwnerHeaders(ownerId),
  });

  if (!response.ok) {
    const errorMessage = await parseApiError(response, 'Falha ao baixar documento.');
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const fileName = extractFileName(response, fallbackName);

  return {
    blob,
    fileName,
  };
}
