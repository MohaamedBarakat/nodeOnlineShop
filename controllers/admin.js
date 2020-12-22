const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    console.log(price);
    const description = req.body.description;
    const product = new Product(null, title, imageUrl, price, description);
    product.save();
    res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findtById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            edit: editMode,
            product: product
        });
    });

};
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updateTitle = req.body.title;
    const updatePrice = req.body.price;
    const updtaedImageUrl = req.body.imageUrl;
    const updeatedDescription = req.body.description;
    const updatedProduct = new Product(prodId, updateTitle, updtaedImageUrl, updatePrice, updeatedDescription);
    updatedProduct.save();
    res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin products',
            path: '/admin/products'
        });
    });
}
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteProduct(prodId);
    res.redirect('/admin/products');
}