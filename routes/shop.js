const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const { body } = require('express-validator/check');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckout);

router.patch('/products/:productId', shopController.patchNewReview);

router.get('/product/api', shopController.getProductAPI);

router.get('/personal-contact', [
    body('mobile', 'Invalid mobile number')
    .isLength({ min: 11, max: 11 })
], shopController.getPersonalInfo);

router.post('/personal-contact', shopController.postPersonalInfo);

module.exports = router;