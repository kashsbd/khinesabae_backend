const Item = require("../models/item");
const Category = require("../models/category");

const _ = require('lodash');

exports.get_header_page_data = async (req, res, next) => {

    try {
        let header_data = {};

        //Featured Category
        let cate_ids = [];
        const allCategory = await Category.find().exec();

        for (let i = 0; i < allCategory.length; i++) {
            cate_ids.push(allCategory[i]._id);
        }

        const sameTypeItem = await Item.find({ category: cate_ids })
            .populate("category media")
            .select("itemName media")
            .sort({ createdAt: -1 })
            .limit(7)
            .exec();

        const temp = _.uniqBy(sameTypeItem, 'category._id');

        header_data.categories = temp;

        //get latest items
        const allItems = await Item.find()
            .populate("category media")
            .select("itemName media")
            .limit(5)
            .sort({ createdAt: 1 })

        header_data.items = allItems;

        return res.status(200).send(header_data);

    } catch (error) {
        return res.status(500).send(error);
    }
}