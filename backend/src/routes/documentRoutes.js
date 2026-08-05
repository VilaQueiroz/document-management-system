const express = require('express');
const multer = require('multer');
const path = require('node:path');

const DocumentController = require('../controllers/documentController');
const DocumentService = require('../services/documentService');
const DocumentRepository = require('../repositories/documentRepository');

const router = express.Router();

const storageDirectory = path.join(__dirname, '../../storage');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storageDirectory);
  },
  filename: (req, file, callback) => {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const normalizedOriginalName = file.originalname.replace(/\s+/g, '_');
    callback(null, `${uniquePrefix}-${normalizedOriginalName}`);
  },
});

const upload = multer({ storage });

const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
const documentController = new DocumentController(documentService);

router.post('/upload', upload.single('file'), documentController.uploadDocument.bind(documentController));
router.get('/documents', documentController.listDocuments.bind(documentController));
router.get('/documents/:id/download', documentController.downloadDocument.bind(documentController));

module.exports = router;
