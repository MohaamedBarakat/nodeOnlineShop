const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false,
        isAuthenticated: req.session.isLoggedIn
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
    product
        .save()
        .then(result => {
            console.log('Created Product');
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
                isAuthenticated: req.session.isLoggedIn
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
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
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