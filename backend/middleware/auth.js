const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log('Auth Middleware: No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Auth Middleware: Token verification failed', err.message);
            return res.sendStatus(403);
        }
        req.user = user;
        // console.log('Auth Middleware: User authenticated', user.id);
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
        }
        next();
    };
};

module.exports = { authMiddleware, checkRole };
