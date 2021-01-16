module.exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '',
        req: { adminId: req.adminId, userId: (res.locals.isAuthenticated) ? req.user._id : req.user }
    });
};