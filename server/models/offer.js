const mongoose = require('mongoose');

const schema = mongoose.Schema;
const offerSchema = new schema({
    email: String,
    description: String,
    phone: Number,
    title: String,
    type: String,
    viewing: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('offer', offerSchema, 'offers');