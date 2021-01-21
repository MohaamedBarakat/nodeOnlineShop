const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    },
    admin: {
        type: Boolean,
        required: true
    }
});
userSchema.methods.addToCart = function(product, quantity) {
    const cartProductIndex = this.cart.items.findIndex(cartProduct => {
        return cartProduct.productId.toString() === product._id.toString();
    });
    let newQuantity = quantity;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + quantity;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updateCart = {
        items: updatedCartItems
    }

    this.cart = updateCart;
    return this.save();
}
userSchema.methods.removeFromCart = function(prodId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prodId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}
userSchema.methods.clearCart = function() {
    this.cart = { items: [] }
    return this.save();
}
module.exports = mongoose.model('User', userSchema);