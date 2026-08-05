class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  getOwnerFromRequest(req) {
    return req.header('x-owner-id')?.trim();
  }

  async uploadDocument(req, res) {
    const owner = this.getOwnerFromRequest(req);

    if (!owner) {
      return res.status(400).json({ error: 'Cabecalho X-Owner-Id e obrigatorio.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo e obrigatorio para upload.' });
    }

    try {
      const createdDocument = await this.documentService.createDocument({
        file: req.file,
        owner,
      });

      return res.status(201).json(createdDocument);
    } catch {
      return res.status(500).json({ error: 'Falha ao processar upload.' });
    }
  }

  listDocuments(req, res) {
    const owner = this.getOwnerFromRequest(req);

    if (!owner) {
      return res.status(400).json({ error: 'Cabecalho X-Owner-Id e obrigatorio.' });
    }

    try {
      const documents = this.documentService.listDocumentsByOwner(owner);
      return res.status(200).json({ documents });
    } catch {
      return res.status(500).json({ error: 'Falha ao listar documentos.' });
    }
  }

  async downloadDocument(req, res) {
    const owner = this.getOwnerFromRequest(req);

    if (!owner) {
      return res.status(400).json({ error: 'Cabecalho X-Owner-Id e obrigatorio.' });
    }

    try {
      const document = await this.documentService.getDocumentForDownload({
        id: req.params.id,
        owner,
      });

      if (!document) {
        return res.status(404).json({ error: 'Documento nao encontrado.' });
      }

      return res.download(document.storagePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          res.status(500).json({ error: 'Falha ao baixar documento.' });
        }
      });
    } catch {
      return res.status(500).json({ error: 'Falha ao baixar documento.' });
    }
  }
}

module.exports = DocumentController;
