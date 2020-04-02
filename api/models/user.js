const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        //crendential info
        email: {
            type: String,
            required: true,
            unique: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: {
            type: String,
            required: true
        },
        //detail info
        name: {
            type: String,
            required: [true, 'User name is needed.']
        },
        role: {
            type: String,
            default: "USER"
        }
    },
    {
        timestamps: true
    }
);


userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', userSchema);