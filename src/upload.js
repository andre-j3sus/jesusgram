
// Implementation of image uploading system

const multer = require('multer');
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("./app-config").db;
const util = require("util");


const storage = new GridFsStorage({
    url: dbConfig.uri,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-jesusgram-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: dbConfig.imgsBucket,
            filename: `${Date.now()}-jesusgram-${file.originalname}`
        };
    }
});

const uploadFiles = multer({ storage: storage }).single("image");
const uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = uploadFilesMiddleware;
