const Product = require('../models/product');
const Cart = require('../models/cart');
exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            });
        })
        .catch(err => console.log(err));



};
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    /*Product.findAll({ where: { id: prodId } })
        .then(product => {
            res.render('shop/product-detail', {
                pageTitle: product[0].title,
                product: product[0],
                path: "/products"
            })
        })
        .catch(err => console.log(err));*/
    Product.findByPk(prodId).then((product) => {
            res.render('shop/product-detail', {
                pageTitle: "Product Details",
                product: product,
                path: "/products"
            });
        })
        .catch(err => { console.log(err) });


}
exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch(err => console.log(err));



};
exports.getCart = (req, res, next) => {
    Cart.getProducts(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cart.products.find(prod => prod.id === product.id)) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: cartProducts });
        });

    });

};
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findtById(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
    });
    res.redirect('/cart');


}
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findtById(prodId, product => {
        Cart.addProduct(prodId, product.price);

    })
    res.redirect('/cart');
}
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout', path: '/checkout' });
};
exports.getOrders = (req, res, next) => {
    res.render('shop/orders', { pageTitle: 'Your Orders', path: '/orders' });
};