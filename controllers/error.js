module.exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user },
        isAuthenticated: req.session.isLoggedIn
    });
};
module.exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user },
        isAuthenticated: req.session.isLoggedIn
    });
};