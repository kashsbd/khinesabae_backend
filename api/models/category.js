const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const User = require('../models/user');
const Media = require('./media');

const categorySchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        isAvailable: { type: Boolean, default: true }, // is available to users or not
        name: String,
        updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    }
);

categorySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Category', categorySchema);