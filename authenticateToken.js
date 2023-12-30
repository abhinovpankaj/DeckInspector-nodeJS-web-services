const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  jwt.verify(token, process.env.APP_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;  // Attach user information to the request object
    next();
  });
}
module.exports = authenticateToken
