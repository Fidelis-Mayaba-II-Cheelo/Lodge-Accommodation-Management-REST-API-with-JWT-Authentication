import multer from 'multer';
import path from 'path';
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//multer function that shows the destination of where we will store our files and how the file will be stored
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public', 'hostel_images'));//Direct path to were we store our images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)//file.originalname gets the filename and extension fully
    },
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(new Error('Only png, jpeg and jpg files are allowed!'), false);
    }
}

//Initializing multer. It takes two arguments: storage (the destination and filename)
const upload = multer({ storage: fileStorageEngine, fileFilter: fileFilter });


export {
    upload
};