const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensionsByMimeType = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${extensionsByMimeType[file.mimetype] || ''}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!extensionsByMimeType[file.mimetype]) {
      return callback(new Error('Formato inválido. Use JPEG, PNG ou WebP.'));
    }
    return callback(null, true);
  }
}).single('image');

function uploadImage(req, res, next) {
  upload(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ error: 'IMAGE_UPLOAD_FAILED', details: error.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'IMAGE_REQUIRED' });
    }
    return next();
  });
}

function getImageUrl(req) {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${publicBaseUrl.replace(/\/$/, '')}/uploads/${req.file.filename}`;
}

module.exports = { uploadImage, getImageUrl };
