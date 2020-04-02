const express = require("express");
const router = express.Router()

const homePageController = require("../controllers/home-page")
router.get("/", homePageController.get_home_page_data)

module.exports = router