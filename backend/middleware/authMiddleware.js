function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminId) return res.status(401).json({ error: 'Authentication required.' });
  next();
}
function requireCsrf(req, res, next) {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  const token = req.get('x-csrf-token');
  if (!token || !req.session.csrfToken || token !== req.session.csrfToken) return res.status(403).json({ error: 'Security token expired. Refresh and try again.' });
  next();
}
module.exports = { requireAuth, requireCsrf };
