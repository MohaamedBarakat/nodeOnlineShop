const Product = require('../models/product');
const Request = require('../models/request');
const User = require('..//models/user');
const Log = require('../models/log-product');
const get500 = require('../util/error500');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator/check');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false,
        req: { adminId: req.adminId, userId: req.user._id },
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};
exports.postAddProduct = (req, res, next) => {
    const category = req.body.category;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const inStock = (quantity <= 0) ? false : true;
    const reviews = {
        score: 0,
        numOfReviews: 0,
        message: { score: 0, numOfReviews: 0, content: [] }
    };

    const errors = validationResult(req);
    //console.log(imageUrl);
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            edit: false,
            hasError: true,
            product: {
                category: category,
                title: title,
                price: price,
                description: description
            },
            req: { adminId: req.adminId, userId: req.user._id },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        })
    }
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            edit: false,
            hasError: true,
            product: {
                category: category,
                title: title,
                price: price,
                description: description
            },
            req: { adminId: req.adminId, userId: req.user._id },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    const imageUrl = image.path;
    const product = new Product({
        category: category,
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user,
        quantity: quantity,
        inStock: inStock,
        reviews: reviews

    });
    const requestedProduct = new Request({
        product: product,
        userName: req.user.name,
        status: 'Create New Product'
    });
    requestedProduct.save()
        .then(result => {
            //throw new Error('Dummy');
            req.flash('succses', 'Your Product On Requested List');
            console.log('Product On Requested List');
            res.redirect('/admin/products');
        })
        .catch(err => {
            return get500.get500Error(err, next);
        });
};
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                edit: editMode,
                product: product,
                req: { adminId: req.adminId, userId: req.user._id },
                hasError: false,
                errorMessage: null,
                validationErrors: []

            })
        })
        .catch(err => {
            return get500.get500Error(err);
        })

};
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedCategory = req.body.category;
    const updateTitle = req.body.title;
    const updatePrice = req.body.price;
    const image = req.file;
    const updeatedDescription = req.body.description;
    const updatedQuantity = req.body.quantity;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            edit: true,
            hasError: true,
            product: {
                category: updatedCategory,
                title: updateTitle,
                price: updatePrice,
                description: updeatedDescription,
                quantity: updatedQuantity,
                _id: prodId
            },
            req: { adminId: req.adminId, userId: req.user._id },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()

        })
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString() && req.adminId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.category = updatedCategory;
            product.title = updateTitle
            product.price = updatePrice;
            product.quantity = updatedQuantity;
            if (product.quantity > 0) {
                product.inStock = true;
            } else {
                product.inStock = false;
            }
            product.description = updeatedDescription;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            return product.save()
                .then(result => {
                    console.log("Updated Product");
                    res.redirect('/admin/products');
                });
        })
        .catch(err => {
            return get500.get500Error(err);
        })

};
exports.getProducts = (req, res, next) => {
    let message = req.flash('succses');
    console.log(message);
    //console.log(req.adminId);
    if (req.adminId.toString() !== req.user._id.toString()) {
        Product.find({ userId: req.user._id })
            //.select('title price -_id')
            //.populate('userId', 'name')
            .then(products => {
                //console.log(products);
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                    edit: true,
                    req: { adminId: req.adminId, userId: req.user._id },
                    succsesMessage: message
                });
            })
            .catch(err => {
                return next(err);
            });
    } else {
        Product.find()
            .then(products => {
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                    edit: true,
                    req: { adminId: req.adminId, userId: req.user._id },
                    succsesMessage: message
                });
            })
            .catch(err => {
                return get500.get500Error(err);
            });
    }

};
exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (product) {
                fileHelper.deleteFile(product.imageUrl);
            } else {
                return next(new Error('Product not found'));
            }
            if (product.userId.toString() !== req.user._id.toString() && req.adminId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            return Product.deleteOne({ _id: prodId });
        })
        .then(() => {
            console.log("Destroyed Product");
        })
        .then(() => {
            req.user.removeFromCart(prodId);
            res.status(200).json({ messgae: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting Product failed' });
        });

};
exports.getRequest = (req, res, next) => {
    Request.find()
        .then(request => {
            console.log('hena?');
            console.log(request);
            res.render('admin/request', {
                products: request,
                pageTitle: 'Products Request',
                path: '/admin/request',
                user: req.user,
                req: { adminId: req.adminId, userId: req.user._id }
            });
        })

};
exports.postApproveRequest = (req, res, next) => {
    const reqId = req.body.requestId;
    //console.log(reqId);
    Request.findById(reqId)
        .then(request => {
            //console.log(request.product);
            const product = new Product(request.product);
            if (product.quantity <= 0) {
                product.inStock = false;
            }
            product.save();
            Request.deleteOne({ _id: reqId })
                .then(() => {
                    console.log('Product sent to log');
                }).catch(err => {
                    return get500.get500Error(err);
                });
            const log = new Log({ request: request, adminApproval: req.user });
            log.save();
            console.log('Product Approved');
            res.redirect('/admin/request');
        }).catch(err => {
            return get500.get500Error(err, next);
        });
};
exports.postDeleteReq = (req, res, next) => {
    const reqId = req.body.requestId;
    //console.log(reqId);
    Request.deleteOne({ _id: reqId })
        .then(() => {
            console.log('Request deleted');
            res.redirect('/admin/request')
        })
        .catch(err => {
            return get500.get500Error(err, next);
        });
};
exports.getLog = (req, res, next) => {
    //console.log('we are here!!');
    //console.log(Log.find());
    Log.find()
        .then(requests => {
            console.log(' are we here!! ', requests);
            //console.log(user[0].request.product);
            res.render('admin/log', {
                requests: requests,
                path: 'admin/log',
                pageTitle: 'Admin Log',
                req: { adminId: req.adminId, userId: req.user._id }
            })
        }).catch(err => {
            //console.log(err);
            return get500.get500Error(err, next);
        });

};

exports.getUsers = (req, res, next) => {
    //console.log('we are here!!');
    //console.log(Log.find());
    User.find()
        .then(users => {
            //console.log(' are we here!! ', users);
            res.render('admin/users', {
                users: users,
                path: 'admin/users',
                pageTitle: 'Admin Users',
                req: { adminId: req.adminId, userId: req.user._id }
            });
        })
        .catch(err => console.log(err));
};
exports.getEditUser = (req, res, next) => {
    const userId = req.params.userId;
    //console.log(userId);
    User.findById(userId)
        .then(user => {
            console.log(' are we here!! ', user);
            res.render('admin/edit-user', {
                user: user,
                path: 'admin/edit-user',
                pageTitle: 'Admin Edit User',
                req: { adminId: req.adminId, userId: req.user._id }
            });
        })
        .catch(err => console.log(err));
};
exports.postUpdateUser = (req, res, next) => {
    const admin = req.body.admin;
    const userId = req.body.userId;
    //console.log(userId, admin);

    User.findById(userId)
        .then(user => {
            user.admin = (admin !== 'on') ? false : true;
            user.save();
            res.redirect('/admin/users');
        })
        .catch(err => console.log(err));



}
exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User.deleteOne({ _id: userId })
        .then(() => {
            res.json({ message: 'success user deleted' });
        })
        .catch(err => console.log(err))
}