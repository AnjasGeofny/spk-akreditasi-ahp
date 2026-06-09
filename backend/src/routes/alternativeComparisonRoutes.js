const router = require('express').Router();
const altCompController = require('../controllers/alternativeComparisonController');
const { alternativeComparisonRules, validate } = require('../middleware/validator');

router.get('/:subCriteriaId', altCompController.getBySubCriteria);
router.post('/:subCriteriaId', alternativeComparisonRules, validate, altCompController.save);
router.delete('/:subCriteriaId', altCompController.deleteBySubCriteria);

module.exports = router;
