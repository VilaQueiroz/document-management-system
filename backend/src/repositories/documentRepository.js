class DocumentRepository {
  constructor() {
    this.documents = [];
  }

  create(documentMetadata) {
    this.documents.push(documentMetadata);
    return documentMetadata;
  }

  findAllByOwner(owner) {
    return this.documents.filter((document) => document.owner === owner);
  }

  findByIdAndOwner(id, owner) {
    return this.documents.find(
      (document) => document.id === id && document.owner === owner
    );
  }
}

module.exports = DocumentRepository;
