var jwt = require('jsonwebtoken');


var authenticate = (req, res, next) => {

    jwt.verify(req.query.token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({
                title: 'Not Authenticated',
                error: err
            });
        }
        next();
    });
};

module.exports = {authenticate};
