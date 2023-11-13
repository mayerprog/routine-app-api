const multer = require("multer");
const fs = require("fs");
const { uploadDir } = require("../index");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = { upload };

//FOR HANDLING ERRORS

// const uploadMiddleware = (req, res, next) => {
//   upload.array("image", 10)(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ error: err.message });
//     }
//     const files = req.files;
//     const errors = [];

//     // Validate file types and sizes
//     files.forEach((file) => {
//       const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//       //   const maxSize = 7 * 1024 * 1024;
//       if (!allowedTypes.includes(file.mimetype)) {
//         errors.push(`Invalid file type: ${file.originalname}`);
//       }
//       //   if (file.size > maxSize) {
//       //     errors.push(`File is too large: ${file.originalname}`);
//       //   }
//     });

//     // Handle validation errors
//     if (errors.length > 0) {
//       // Remove uploaded files
//       files.forEach((file) => {
//         fs.unlinkSync(file.path);
//       });

//       return res.status(400).json({ errors });
//     }

//     req.files = files;

//     next();
//   });
// };
