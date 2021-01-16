const Product = require('../models/product');
const Order = require('../models/order');
exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user }
            });
        })
        .catch(err => console.log(err));
};
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                pageTitle: "Product Details",
                product: product,
                path: "/products",
                req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user }
            });
        })
        .catch(err => { console.log(err) });
};
exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user }
            });
        })
        .catch(err => console.log(err));
};
exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            //console.log(user.cart.items);
            const products = user.cart.items;
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products,
                req: { adminId: req.adminId, userId: req.user._id }
            });;
        })
        .catch(err => console.log(err));

};
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            //console.log(product);
            return req.user.addToCart(product);
        })
        .then(result => {
            //console.log(result);
            res.redirect('/cart');
        });
}
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        req: { adminId: req.adminId, userId: req.user._id }

    });
};
exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                req: { adminId: req.adminId, userId: req.user._id }

            });
        })
        .catch(err => console.log(err));

};
exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            //console.log(user.cart.items);
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: {...i.productId._doc } }
            });
            console.log(products);
            const order = new Order({
                user: {
                    name: req.user.name,
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err))
}