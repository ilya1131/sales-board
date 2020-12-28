const mongoose = require('mongoose');
const enums = require('../lib/enums');

const schema = mongoose.Schema;
const userSchema = new schema({
    email: String,
    password: String,
    type: {
        type: String,
        enum: enums.userTypes,
        default: enums.userTypes.regular
    }
});

module.exports = mongoose.model('user', userSchema, 'users');