const Product = require('../models/product');
const Order = require('../models/order');
const get500 = require('../util/error500');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_51IB8FaKlIpM1WFN7DSHK29bnxbjHxahJQlxc3my7VhQ4PoEG9vOAQuuE73zTvyjJXzpUjRWiy8D82gCv3i7w8H7I00zgrkpf4g');
const PDFDocument = require('pdfkit');
const cities = require('egypt-cities');
const ITEMS_PER_PAGE = 4;
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
    //console.log(req.session.user.admin);
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
    const qty = +req.body.qty;
    console.log(qty);
    Product.findById(prodId)
        .then(product => {
            //console.log(product);
            return req.user.addToCart(product, qty);
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
    let products;
    let totalPrice;
    const mobile = req.body.mobile;
    console.log(req.body);
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            //console.log(user.cart.items);
            totalPrice = 0;
            products = user.cart.items;
            products.forEach(product => {
                totalPrice += product.quantity * product.productId.price;
            });
            //console.log(totalPrice);
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    //console.log('hena?');
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'usd',
                        quantity: p.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // http://localhost:3000
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });


        }).then(session => {
            //console.log('hena?');
            res.render('shop/checkout', {
                products: products,
                totalPrice: totalPrice,
                pageTitle: 'Checkout',
                path: '/checkout',
                req: { adminId: req.adminId, userId: req.user._id },
                sessionId: session.id
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
exports.getCheckoutSuccess = (req, res, next) => {
    //console.log("hena?")
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            //console.log("hena?")
            //console.log(user.cart.items);
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: {...i.productId._doc } }
            });
            //console.log("hena?")
            products.forEach(product => {
                Product.findById(product.product._id)
                    .then(prod => {
                        if (prod.quantity - product.quantity < 0) {
                            return res.render('/');
                        }
                        prod.quantity -= product.quantity;
                        if (prod.quantity == 0) {
                            prod.inStock = false;
                        }
                        prod.save();
                    })
                    .catch(err => console.log(err))

            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            //console.log("hena?")
            return order.save();
        })
        .then(result => {
            //console.log("hena?")
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            return next(err);
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
            pdfDoc.text(' ');
            pdfDoc.fontSize(18).text('Address :' + req.user.address, {
                underline: true
            });
            pdfDoc.text(' ');

            pdfDoc.fontSize(18).text('Phone Number :' + req.user.mobile, {
                underline: true
            });
            pdfDoc.text(' ');
            pdfDoc.fontSize(26).text('------------------------');
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
exports.patchNewReview = (req, res, next) => {
    const prodId = req.params.productId;
    const totalScore = req.body.totalScore;
    const message = req.body.message;
    const userId = req.body.userId;
    //console.log(req.body);
    Product.findById(prodId)
        .then(product => {
            product.reviews.score = totalScore;
            product.reviews.numOfReviews += 1;
            const messageReviews = product.reviews.message.content;
            const newReview = { userId: userId, mess: message };
            messageReviews.push(newReview);
            //console.log(messageReviews);
            //console.log(messageReviews.find(({ userId }) => userId === "60089a6041faf626916a41eb"));
            product.reviews.message.content = messageReviews;
            //console.log(product.reviews.message.content);
            //console.log(product.reviews.message.content.find(({ userId }) => userId === "60089a6041faf626916a41eb"));
            product.save();
            res.json({ message: 'success', messageReviews: messageReviews });
        })
        .catch(err => console.log(err));

};
exports.getProductAPI = (req, res, next) => {
    //console.log('hereeeeee');
    Product.find()
        .limit(4)
        .then(products => {
            res.json({ products: products });
        })
        .catch(err => console.log(err))

};
exports.getPersonalInfo = (req, res, next) => {
    //console.log(req.user);
    //console.log(cities.localCities());
    res.render('shop/personal-info', {
        pageTitle: 'Your Personal Contact',
        path: '/personal-info',
        user: req.user,
        req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user },
        cities: cities.localCities()


    })
};
exports.postPersonalInfo = (req, res, next) => {
    console.log(req.body);
    const mobile = req.body.mobile;
    const address = req.body.address;
    const city = req.body.city;
    const zip = req.body.zip;
    //console.log('sounds good', req.user);
    User.findById(req.user._id)
        .then(user => {
            //console.log('sounds good');
            if (!user) {
                return res.redirect('/');
            }
            user.mobile = mobile;
            user.address = address;
            user.city = city;
            user.zip = zip;
            user.save();
            res.redirect('/checkout');
        })
        .catch(err => console.log(err));

};