const mongoose = require('mongoose');
const fs = require('fs');
const sharp = require('sharp');
const readFilePromise = require('fs-readfile-promise');
const lodash = require('lodash');
const { ITEM_PIC_URL } = require('../config/config');

const Category = require("../models/category");
const Item = require("../models/item");
const Media = require("../models/media");
const User = require("../models/user");

exports.get_all_items = async (req, res, next) => {
    const page = req.query.page || 1;
    // limit is 10 as default  in mongoose pagination
    const options = {
        sort: { createdAt: -1 },
        select: '-__v',
        populate: [
            { path: 'media', select: 'width height contentType' },
            { path: 'category', select: 'name' }
        ]
    };

    try {
        const result = await Item.paginate({ isAvailable: true }, options);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send(error);
    }
}

exports.get_all_items_fe = async (req, res, next) => {

    const options = {
        sort: { createdAt: -1 },
        select: '-__v',
        populate: [
            { path: 'media', select: 'width height contentType' },
            { path: 'category', select: 'name' }
        ]
    };

    try {
        let cate_ids = [];
        const allCategory = await Category.find().exec();

        for (let i = 0; i < allCategory.length; i++) {
            cate_ids.push(allCategory[i]._id);
        }

        const result = await Item.paginate({ isAvailable: true, category: cate_ids }, options);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send(error);
    }
}

exports.get_item_by_id = async (req, res, next) => {

    const id = req.params.id;

    try {
        const doc = await Item.findById(id)
            .populate('media', 'width height contentType')
            .populate('category', 'name')
            .exec();

        if (doc) {
            console.log(doc);
            return res.status(200).send(doc);
        }

        return res.status(404).json({
            message: "No valid entry found for provided ID"
        });

    } catch (error) {
        return res.status(500).send(error);
    }
}

exports.get_item_by_id_fe = async (req, res, next) => {

    const id = req.params.id;
    let obj = {};

    try {
        const doc = await Item.findById(id)
            .populate('media', 'width height contentType')
            .populate('category', 'name')
            .exec();

        if (doc) {
            obj['item'] = doc;

            if (doc.category) {
                try {
                    let category = await Category.findById(doc.category._id).exec();
                    if (category) {
                        try {
                            let items = await Item.find({ category: category._id })
                                .populate('media', 'width height contentType')
                                .sort({ createdAt: -1 })
                                .limit(12)
                                .exec();

                            if (items && items.length > 0) {
                                obj['categories'] = items;
                            } else {
                                obj['categories'] = [];
                            }
                        } catch (error) {
                            obj['categories'] = [];
                        }
                    } else {
                        obj['categories'] = [];
                    }

                } catch (error) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            } else {
                try {
                    let items = await Item.find()
                        .populate('media', 'width height contentType')
                        .sort({ createdAt: -1 })
                        .limit(4)
                        .exec();

                    if (items && items.length > 0) {
                        obj['categories'] = items;
                    } else {
                        obj['categories'] = [];
                    }
                } catch (error) {
                    obj['categories'] = [];
                }
            }

            return res.status(200).send(obj);
        }

        return res.status(404).json({
            message: "No valid entry found for provided ID"
        });

    } catch (error) {
        return res.status(500).send(error);
    }
}

exports.create_item = async (req, res, next) => {

    const files = req.files || [];

    const {
        itemName,
        itemCode,
        categoryId,
        price,
        size,
        gold_weight,
        diamond_weight,
        description
    } = req.body;

    //init item model
    const item_modal = new Item(
        {
            _id: new mongoose.Types.ObjectId(),
            itemName: itemName,
            itemCode: itemCode,
            category: categoryId,
            price: price,
            description: description
        }
    );

    if (size) {
        item_modal.size = size;
    }

    if (gold_weight) {
        item_modal.gold_weight = gold_weight;
    }

    if (diamond_weight) {
        item_modal.diamond_weight = diamond_weight;
    }

    //for item media
    if (files && files.length > 0) {
        for (let f of files) {
            //init media model
            const media_model = new Media(
                {
                    _id: new mongoose.Types.ObjectId(),
                    type: 'ITEM'
                }
            );
            //check if it is image
            if (f.mimetype.startsWith('image/')) {

                const img = await sharp(f.path).metadata();
                //get img metadata 
                media_model.width = img.width;
                media_model.height = img.height;
                media_model.contentType = f.mimetype;
                media_model.mediaUrl = f.filename;

            }
            //finally save media model and push media id to item model
            const rnMedia = await media_model.save();
            item_modal.media.push(rnMedia._id);
        }
    }

    try {
        const rnItem = await item_modal.save();
        //get populated item by item id
        const doc = await Item.findById(rnItem._id)
            .populate('media', 'width height contentType')
            .populate('category', 'name')
            .exec();

        return res.status(201).send(doc);

    } catch (e) {
        return res.status(500).json({
            error: e
        });
    }
}

exports.delete_item = async (req, res, next) => {

    const _id = req.body._id;
    const deletedBy = req.body.deletedBy;

    let admin = await User.findById({ _id: deletedBy }).exec();

    if (admin) {
        let item = await Item.findOneAndDelete({ _id }).exec();

        if (item) {
            return res.status(200).json({ message: "Item Deleted" });
        }

        return res.status(404).json({ message: "Item Not Found" });
    }

    return res.status(401).json({ message: "Can't Delete Item. Permission Denied" });
}

exports.get_photo = async (req, res, next) => {
    const mediaId = req.params.mediaId;

    try {
        const media = await Media.findById(mediaId);
        if (media) {
            const mediaUrl = ITEM_PIC_URL + media.mediaUrl;
            try {
                const file = await readFilePromise(mediaUrl);
                return res.status(200).send(file);
            } catch (error) {
                return res.status(404).json({
                    message: 'No such file'
                });
            }
        } else {
            return res.status(404).json({
                message: 'No valid entry found for provided ID'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.update_item = async (req, res, next) => {

    const files = req.files || [];

    const {
        itemName,
        itemCode,
        categoryId,
        price,
        size,
        gold_weight,
        diamond_weight,
        description,
        _id,
        img
    } = req.body;

    const str_to_arr = JSON.parse(img);

    let mapped_img = lodash.map(str_to_arr, '_id');

    try {

        let item = await Item.findById(_id).exec();

        if (item) {
            const item_imgs = item.media;
            //delete all imgs inside filtered_img
            const filtered_img = mapped_img.filter(function (obj) { return item_imgs.indexOf(obj) == -1 });

            for (let i = 0; i < filtered_img.length; i++) {
                const img = await Media.findById(filtered_img[i]).exec();

                if (img) {
                    fs.unlink(ITEM_PIC_URL + img.mediaUrl, (err) => {
                        if (err) {
                            console.log("Can't delete image", err);
                        }
                    })
                    await Media.findOneAndDelete(filtered_img[i]);
                }
            }

            //for item media
            if (files && files.length > 0) {
                for (let f of files) {
                    //init media model
                    const media_model = new Media(
                        {
                            _id: new mongoose.Types.ObjectId(),
                            type: 'ITEM'
                        }
                    );
                    //check if it is image
                    if (f.mimetype.startsWith('image/')) {

                        const img = await sharp(f.path).metadata();
                        //get img metadata 
                        media_model.width = img.width;
                        media_model.height = img.height;
                        media_model.contentType = f.mimetype;
                        media_model.mediaUrl = f.filename;

                    }
                    //finally save media model and push media id to item model
                    const rnMedia = await media_model.save();
                    mapped_img.push(rnMedia._id);
                }
            }

            item.itemName = itemName;
            item.itemCode = itemCode;
            item.category = categoryId;
            item.price = price;
            item.size = size === 'undefined' ? 0 : size;
            item.gold_weight = gold_weight === 'undefined' ? 0 : gold_weight;
            item.diamond_weight = diamond_weight === 'undefined' ? 0 : diamond_weight;
            item.description = description;
            item.media = mapped_img;

            await item.save();

            return res.status(200).json({ message: "Successfully Updated" });
        }

        return res.status(404).json({
            message: 'No valid entry found for provided item id.'
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error.'
        });
    }
}

//get all items by category id
exports.getItemsByCategoryId = async (req, res, next) => {

    const categoryId = req.params.id;

    try {
        let items = await Item.find({ category: categoryId })
            .populate('media', 'width height contentType')
            .sort({ createdAt: -1 })
            .exec();

        if (items && items.length > 0) {
            return res.status(200).send(items);
        }

        return res.status(404).json({ message: "Item Not Found" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.make_featured = async (req, res, next) => {
    const id = req.body._id;

    try {
        let item = await Item.findById(id).exec();

        if (item) {
            item.isFeatured = item.isFeatured ? false : true
            let result = await item.save();
            return res.status(200).send({ message: 'OK' });
        }

        return res.status(404).json({ message: "Item Not Found" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}