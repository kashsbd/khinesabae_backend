const express = require("express");
const router = express.Router()

const headerPageController = require("../controllers/header-page");

router.get("/", headerPageController.get_header_page_data);

module.exports = router