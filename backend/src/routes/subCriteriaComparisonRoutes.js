const router = require('express').Router();
const subCriteriaComparisonController = require('../controllers/subCriteriaComparisonController');
const { subCriteriaComparisonRules, validate } = require('../middleware/validator');

router.get('/:criteriaId', subCriteriaComparisonRules[0], validate, subCriteriaComparisonController.getByCriteria);
router.post('/:criteriaId', subCriteriaComparisonRules, validate, subCriteriaComparisonController.save);
router.delete('/:criteriaId', subCriteriaComparisonRules[0], validate, subCriteriaComparisonController.deleteByCriteria);

module.exports = router;
