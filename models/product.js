const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    inStock: {
        type: Boolean,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: {
        score: {
            type: Number,
            required: true
        },
        numOfReviews: {
            type: Number,
            required: true
        },
        message: {
            content: [{
                userId: {
                    type: String,
                    ref: 'User',
                    required: true
                },
                mess: {
                    type: String,
                    required: true
                }
            }]
        }
    }

});

module.exports = mongoose.model('Product', ProductSchema);