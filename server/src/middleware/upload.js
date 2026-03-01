const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, GIF'));
  }
};

const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 10) * 1024 * 1024;

const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

module.exports = upload;
