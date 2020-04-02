const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/categories');
const checkAuth = require('../middlewares/check-auth');

//get all categories
router.get('/', checkAuth, CategoryController.get_all_categories);

//get all categories
router.get('/fe', CategoryController.get_all_categories_fe);

router.get('/getAllNecklaces', CategoryController.get_all_necklace_fe);

//create new category
router.post('/', checkAuth, CategoryController.create_category);

//get category by id
router.get('/:cid', checkAuth, CategoryController.get_category_by_id);

//update category
router.post('/update', checkAuth, CategoryController.update_category);

//delete category
router.post('/delete', checkAuth, CategoryController.delete_category);

module.exports = router;