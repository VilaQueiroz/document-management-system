const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const app = require('../src/app');

let server;
let baseUrl;
const filesToCleanup = new Set();

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await Promise.all(
    Array.from(filesToCleanup).map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch {
        // Arquivo pode nao existir caso o fluxo de teste falhe antes de persistir.
      }
    })
  );
});

async function uploadDocument({ owner, fileName, content }) {
  const formData = new FormData();
  formData.append('file', new File([content], fileName, { type: 'text/plain' }));

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'x-owner-id': owner,
    },
    body: formData,
  });

  const body = await response.json();

  if (body.storagePath) {
    filesToCleanup.add(body.storagePath);
  }

  return { response, body };
}

test('POST /upload faz upload e retorna metadados do documento', async () => {
  const owner = `owner-upload-${Date.now()}`;
  const { response, body } = await uploadDocument({
    owner,
    fileName: 'upload-spec.txt',
    content: 'conteudo de upload',
  });

  assert.strictEqual(response.status, 201);
  assert.ok(body.id);
  assert.strictEqual(body.originalName, 'upload-spec.txt');
  assert.strictEqual(body.owner, owner);
  assert.ok(body.storagePath);
});

test('GET /documents lista apenas documentos do owner informado', async () => {
  const owner = `owner-list-${Date.now()}`;
  const otherOwner = `owner-list-other-${Date.now()}`;

  await uploadDocument({ owner, fileName: 'list-1.txt', content: 'doc-1' });
  await uploadDocument({ owner, fileName: 'list-2.txt', content: 'doc-2' });
  await uploadDocument({ owner: otherOwner, fileName: 'list-3.txt', content: 'doc-3' });

  const response = await fetch(`${baseUrl}/documents`, {
    headers: {
      'x-owner-id': owner,
    },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(Array.isArray(body.documents), true);
  assert.strictEqual(body.documents.length, 2);
  assert.deepStrictEqual(
    body.documents.map((document) => document.originalName).sort(),
    ['list-1.txt', 'list-2.txt']
  );
});

test('GET /documents/:id/download baixa o arquivo enviado', async () => {
  const owner = `owner-download-${Date.now()}`;
  const fileName = 'download.txt';
  const content = 'conteudo para download';

  const uploadResult = await uploadDocument({ owner, fileName, content });

  const response = await fetch(`${baseUrl}/documents/${uploadResult.body.id}/download`, {
    headers: {
      'x-owner-id': owner,
    },
  });

  const downloadedContent = await response.text();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(downloadedContent, content);
  assert.match(
    response.headers.get('content-disposition') || '',
    /attachment;\s*filename="?download\.txt"?/
  );
});
