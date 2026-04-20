const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/assetController');

router.use(auth);

router.get('/dashboard', c.dashboard);
router.get('/types', c.types);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;