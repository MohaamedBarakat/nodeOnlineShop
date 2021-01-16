const Product = require('../models/product');
const Request = require('../models/request');
const Log = require('../models/log-product');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false,
        req: { adminId: req.adminId, userId: req.user._id }
    });
};
exports.postAddProduct = (req, res, next) => {
    const category = req.body.category;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
        category: category,
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    const requestedProduct = new Request({
        product: product,
        userName: req.user.name,
        status: 'Create New Product'
    });
    requestedProduct.save()
        .then(result => {
            console.log('Product On Requested List');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));

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
                req: { adminId: req.adminId, userId: req.user._id }

            })
        })
        .catch(err => console.log(err))

};
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedCategory = req.body.category;
    const updateTitle = req.body.title;
    const updatePrice = req.body.price;
    const updtaedImageUrl = req.body.imageUrl;
    const updeatedDescription = req.body.description;

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.category = updatedCategory;
            product.title = updateTitle
            product.price = updatePrice;
            product.imageUrl = updtaedImageUrl;
            product.description = updeatedDescription;
            return product.save()
                .then(result => {
                    console.log("Updated Product");
                    res.redirect('/admin/products');
                });
        })
        .catch(err => console.log(err))

};
exports.getProducts = (req, res, next) => {
    console.log(req.adminId);
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
                    req: { adminId: req.adminId, userId: req.user._id }

                });
            })
            .catch(err => console.log(err));
    } else {
        Product.find()
            //.select('title price -_id')
            //.populate('userId', 'name')
            .then(products => {
                //console.log(products);
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                    edit: true,
                    req: { adminId: req.adminId, userId: req.user._id }

                });
            })
            .catch(err => console.log(err));
    }

};
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
            console.log("Destroyed Product");
        })
        .then(() => {
            req.user.removeFromCart(prodId);
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));

};
exports.getRequest = (req, res, next) => {
    Request.find()
        .then((user) => {
            //console.log(user);
            res.render('admin/request', {
                products: user,
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
            product.save();
            Request.deleteOne({ _id: reqId })
                .then(() => {
                    console.log('Product sent to log');
                }).catch(err => {
                    console.log(err);
                });
            const log = new Log({ request: request, adminApproval: req.user });
            log.save();
            console.log('Product Approved');
            res.redirect('/admin/request');
        }).catch(err => console.log(err));
};
exports.postDeleteReq = (req, res, next) => {
    const reqId = req.body.requestId;
    //console.log(reqId);
    Request.deleteOne({ _id: reqId })
        .then(() => {
            console.log('Request deleted');
            res.redirect('/admin/request')
        })
        .catch(err => console.log(err));
};
exports.getLog = (req, res, next) => {
    Log.find()
        .then(request => {
            res.render('admin/log', {
                requests: request,
                path: 'admin/log',
                pageTitle: 'Admin Log',
                req: { adminId: req.adminId, userId: req.user._id }

            })
        }).catch(err => console.log(err));

};