const crypto = require('node:crypto');
const fs = require('node:fs/promises');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async createDocument({ file, owner }) {
    const documentMetadata = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storagePath: file.path,
    };

    return this.documentRepository.create(documentMetadata);
  }

  listDocumentsByOwner(owner) {
    return this.documentRepository.findAllByOwner(owner);
  }

  async getDocumentForDownload({ id, owner }) {
    const document = this.documentRepository.findByIdAndOwner(id, owner);

    if (!document) {
      return null;
    }

    try {
      await fs.access(document.storagePath);
      return document;
    } catch {
      return null;
    }
  }
}

module.exports = DocumentService;
