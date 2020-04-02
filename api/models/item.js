const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const Media = require('./media');
const Category = require('./category');
const User = require('./user');

const itemSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        itemName: String,
        itemCode: String,
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        price: String,
        size: String,
        gold_weight: String,
        diamond_weight: String,
        description: String,
        isFeatured: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true }, // is available to users or not
        media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
        updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true,
    }
);

itemSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Item', itemSchema);