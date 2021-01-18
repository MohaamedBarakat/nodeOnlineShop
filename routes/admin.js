const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const { body } = require('express-validator/check');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', [
    body('title', 'Invalid title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
    body('price', 'Invalid price')
    .isFloat(),
    body('description', 'Invalid description')
    .isLength({ min: 5 })
    .trim()

], adminController.postAddProduct);


///admin/product => GET
router.get('/products', isAuth, adminController.getProducts);


// admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// admin/edit-product => POST
router.post('/edit-product', [
    body('title', 'Invalid title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
    body('price', 'Invalid price')
    .isFloat(),
    body('description', 'Invalid description')
    .isLength({ min: 5 })
    .trim()

], isAuth, adminController.postEditProduct);

// admin/delete-product =>POST
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

router.get('/request', isAuth, adminController.getRequest);

router.post('/request', isAuth, adminController.postApproveRequest);

//router.get('/product-detail/:requestId', adminController.getProduct);

router.post('/delete-request', isAuth, adminController.postDeleteReq);

router.get('/log', isAuth, adminController.getLog);

module.exports = router;