const express = require('express');
const multer = require('multer');
const router = express.Router();

const ItemController = require('../controllers/items');
const checkAuth = require('../middlewares/check-auth');
const { ITEM_PIC_URL } = require('../config/config');

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, ITEM_PIC_URL);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }
);

const fileFilter = function (req, file, cb) {
    const mimeType = file.mimetype;
    if (mimeType.startsWith('image/')) {
        return cb(null, true);
    }
    else
        return cb(new Error(mimeType + " file types are not allowed."), false);
}

const upload = multer(
    {
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 524288000 // 500MB in bytes
        }
    }
);

//get all items
router.get('/', checkAuth, ItemController.get_all_items);

//get all items for frontend
router.get('/fe', ItemController.get_all_items_fe);

//create new item
router.post('/', checkAuth, upload.array('itemImage'), ItemController.create_item);

//delete item
router.post('/delete', checkAuth, ItemController.delete_item);

//update item
router.post('/update', checkAuth, upload.array('itemImage'), ItemController.update_item);

//get item by id
router.get('/:id', ItemController.get_item_by_id);

//get item by id for frontend
router.get("/:id/fe", ItemController.get_item_by_id_fe);

//get photo by media id
router.get('/media/:mediaId', ItemController.get_photo);

router.get('/getItemsByCategoryId/:id', ItemController.getItemsByCategoryId);

router.post('/make_featured', checkAuth, ItemController.make_featured);

module.exports = router;