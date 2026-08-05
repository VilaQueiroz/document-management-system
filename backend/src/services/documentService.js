const crypto = require('node:crypto');
const fs = require('node:fs/promises');

class DocumentMetadataFactory {
  create({ file, owner }) {
    return {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storagePath: file.path,
    };
  }
}

class LocalStorageAvailabilityChecker {
  async isAvailable(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

class DocumentService {
  constructor(
    documentRepository,
    {
      metadataFactory = new DocumentMetadataFactory(),
      storageAvailabilityChecker = new LocalStorageAvailabilityChecker(),
    } = {}
  ) {
    this.documentRepository = documentRepository;
    this.metadataFactory = metadataFactory;
    this.storageAvailabilityChecker = storageAvailabilityChecker;
  }

  async createDocument({ file, owner }) {
    const documentMetadata = this.metadataFactory.create({ file, owner });

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

    const isAvailable = await this.storageAvailabilityChecker.isAvailable(
      document.storagePath
    );

    if (!isAvailable) {
      return null;
    }

    return document;
  }
}

module.exports = DocumentService;
