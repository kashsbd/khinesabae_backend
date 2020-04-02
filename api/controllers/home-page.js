const Item = require("../models/item");
const _ = require('lodash');

const Category = require("../models/category")

exports.get_home_page_data = async (req, res, next) => {

    try {
        let homePageData = {}
        //New arrival
        const newArrival = await Item.find()
            .populate("media")
            .limit(5)
            .sort({ createdAt: 1 })
            .select("itemName media")
            .exec();

        homePageData.newArrival = newArrival

        //featured Item
        const featuredItem = await Item.find({ isFeatured: false })
            .populate("media")
            .limit(4)
            .sort({ createdAt: 1 })
            .select("itemName price media")
            .exec()

        homePageData.featuredItem = featuredItem

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
            .exec();

        const temp = _.uniqBy(sameTypeItem, 'category._id');

        homePageData.featuredCategory = temp;

        //best brand
        const bestBrand = await Item.find()
            .populate("media")
            .limit(6)
            .sort({ createdAt: 1 })
            .select("itemName price media createdAt")
            .exec()

        homePageData.bestBrand = bestBrand

        return res.status(200).send(homePageData)

    } catch (error) {
        return res.status(500).send(error)
    }
}