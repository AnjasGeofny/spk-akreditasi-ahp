const router = require('express').Router();
const altCompController = require('../controllers/alternativeComparisonController');
const { alternativeComparisonRules, validate } = require('../middleware/validator');

router.get('/:criteriaId', altCompController.getByCriteria);
router.post('/:criteriaId', alternativeComparisonRules, validate, altCompController.save);
router.delete('/:criteriaId', altCompController.deleteByCriteria);

module.exports = router;
