const authService = require('../services/authService');

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await authService.signup({ email, password, name });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'New passwords do not match' });
    const result = await authService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });
    res.json(result);
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await authService.forgotPassword({ email });
    res.json(result);
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });
    const result = await authService.resetPassword({ token, newPassword });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { signup, login, changePassword, forgotPassword, resetPassword };