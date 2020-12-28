const mongoose = require('mongoose');
const enums = require('../lib/enums');

const schema = mongoose.Schema;
const offerSchema = new schema({
    email: String,
    description: String,
    phone: Number,
    title: String,
    type: {
        type: String,
        enum: enums.offerTypes,
        default: enums.offerTypes.type1
    },
    viewing: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('offer', offerSchema, 'offers');