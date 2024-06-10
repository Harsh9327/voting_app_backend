const jwt = require('jsonwebtoken');
require('dotenv').config();


const jwtAuthMiddleware = (req, res, next) => {

    // first check request header has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: 'token not found'});

    //extract jwt token from request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: 'unauthorized'});

    try {
        //verify jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to the request object
        req.user = decoded
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({error: 'invalide token'});
    }
}

//function to generat jwt token
const generateToken = (userData) =>{
    //generate a new jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET);
}

module.exports = {jwtAuthMiddleware, generateToken};
