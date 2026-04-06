var jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  var header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }
  var token = header.split(' ')[1];
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;