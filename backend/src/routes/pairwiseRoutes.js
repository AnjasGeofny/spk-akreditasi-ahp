const router = require('express').Router();
const pairwiseController = require('../controllers/pairwiseController');
const { pairwiseRules, validate } = require('../middleware/validator');

router.get('/', pairwiseController.getAll);
router.post('/', pairwiseRules, validate, pairwiseController.save);
router.delete('/', pairwiseController.deleteAll);

module.exports = router;
