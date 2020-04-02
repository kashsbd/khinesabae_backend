const mongoose = require('mongoose');
const User = require("../models/user");
const Category = require("../models/category");
const Item = require("../models/item");

const _ = require('lodash');

exports.get_all_categories = async (req, res, next) => {
    try {
        const result = await Category.find({ isAvailable: true }).exec();
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send(error);
    }
}

exports.get_all_categories_fe = async (req, res, next) => {
    try {
        let cate_ids = [];
        const allCategory = await Category.find({ isAvailable: true }).exec();

        for (let i = 0; i < allCategory.length; i++) {
            cate_ids.push(allCategory[i]._id);
        }

        const sameTypeItem = await Item.find({ category: cate_ids })
            .populate("category media")
            .select("itemName media")
            .sort({ createdAt: -1 })
            .exec();

        const result = _.uniqBy(sameTypeItem, 'category._id');

        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

exports.get_all_necklace_fe = async (req, res, next) => {
    try {
        let cate_ids = [];
        const allCategory = await Category.find({ isAvailable: true, name: 'Necklace' }).exec();

        for (let i = 0; i < allCategory.length; i++) {
            cate_ids.push(allCategory[i]._id);
        }

        const sameTypeItem = await Item.find({ category: cate_ids })
            .populate("category media")
            .select("itemName media")
            .sort({ createdAt: -1 })
            .exec();

        return res.status(200).send(sameTypeItem);

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}


exports.get_category_by_id = async (req, res, next) => {

    const id = req.params.cid;

    try {
        const doc = await Category.findById(id).exec();

        if (doc) {
            return res.status(200).send(doc);
        }

        return res.status(404).json({
            message: "No valid entry found for provided ID"
        });

    } catch (error) {
        return res.status(500).send(error);
    }
}


exports.create_category = async (req, res, next) => {

    const { name } = req.body;

    const categories = await Category.find({ name: name });
    if (categories && categories.length > 0) {
        return res.status(409).json({ message: "Category Name Already Exit" });
    } else {

        //init category model
        const category_modal = new Category(
            {
                _id: new mongoose.Types.ObjectId(),
                name: name
            }
        );

        try {
            await category_modal.save();
            return res.status(201).json({ message: "OK" });
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    }
}

exports.update_category = async (req, res, next) => {

    const cid = req.body.cid;
    const name = req.body.name;

    try {
        const category = await Category.findById(cid).exec();

        if (category) {
            category.name = name;
            await category.save();
            return res.status(200).json({ message: "OK" });
        }
        return res.status(404).json({ message: "Cateogry Not Found" });

    } catch (error) {
        return res.status(500).json({ error: error });
    }
}

exports.delete_category = async (req, res, next) => {

    const _id = req.body._id;
    const deletedBy = req.body.deletedBy;

    let admin = await User.findById({ _id: deletedBy }).exec();

    if (admin) {
        let category = await Category.findOneAndDelete({ _id }).exec();

        if (category) {
            return res.status(200).json({ message: "Category Deleted" });
        }

        return res.status(404).json({ message: "Category Not Found" });
    }

    return res.status(401).json({ message: "Can't Delete Category. Permission Denied" });
}
