const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) =>{
    console.log("Started middle ware");
    const origin = req.headers.origin;
    console.log("origin set", origin);
    try{
        const token = req.cookies.token;
        //check json web token exists & is verified
        if (token){
            jwt.verify(token, process.env.TOKEN_KEY, (err, decodedToken) =>{
                if (err){
                    console.log(err.message);
                    res.redirect(origin + '/login');
                }
                else{
                    console.log(decodedToken);
                    next();
                }
            });
        } else{
            res.redirect(origin + '/login');
        }
    }
    catch(err){
        console.log(err.message);
        res.redirect(origin + '/login');
    }
}

module.exports = { requireAuth};