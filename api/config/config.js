const os = require('os');

const local_mongo_path = 'mongodb://localhost:27017/Jewellery';

const MONGO_PATH = local_mongo_path;

const JWT_KEY = 'secure_jewellery_key';

const BASE_PATH = os.homedir() + '/Jewellery/Upload/';

const ITEM_PIC_URL = BASE_PATH + 'ItemPics/';

const CATEGORY_PIC_URL = BASE_PATH + 'CategoryPics/';

module.exports = {
    MONGO_PATH,
    JWT_KEY,
    ITEM_PIC_URL,
    CATEGORY_PIC_URL
};