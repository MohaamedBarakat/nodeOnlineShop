const Product = require('../models/product');
const Order = require('../models/order');
const get500 = require('../util/error500');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ITEMS_PER_PAGE = 1;
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user },
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            return get500.get500Error(err);
        });
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
        .catch(err => {
            return get500.get500Error(err);
        });
};
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user },
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            return get500.get500Error(err);
        });
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
        .catch(err => {
            return get500.get500Error(err);
        });

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
        .catch(err => {
            return get500.get500Error(err);
        });
}

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            //console.log(user.cart.items);
            const products = user.cart.items;
            let totalPrice = 0;
            products.forEach(product => {
                totalPrice += product.quantity * product.productId.price;
            });
            console.log(totalPrice);
            res.render('shop/checkout', {
                products: products,
                totalPrice: totalPrice,
                pageTitle: 'Checkout',
                path: '/checkout',
                req: { adminId: req.adminId, userId: req.user._id }
            })
        })
        .catch(err => {
            //console.log('hena?');
            return next(err);
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
        .catch(err => {
            return get500.get500Error(err);
        });
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
            //console.log(products);
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
        .catch(err => {
            return get500.get500Error(err);
        });
};
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    //console.log('we are in order');
    Order.findById(orderId)
        .then(order => {
            //console.log(order);
            if (!order) {
                return next(new Error('No order found'))
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'))
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Hello ' + req.user.name, {
                underline: true
            });
            pdfDoc.text('------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
            });
            pdfDoc.fontSize(26).text('------------------------');
            pdfDoc.fontSize(20).text('Total price: $' + totalPrice);
            pdfDoc.end();
        }).catch(err => {
            next(err);
        })

};