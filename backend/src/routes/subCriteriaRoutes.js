const router = require('express').Router();
const subCriteriaController = require('../controllers/subCriteriaController');
const { subCriteriaRules, idParamRule, validate } = require('../middleware/validator');

router.get('/', subCriteriaController.getAll);
router.get('/:id', idParamRule, validate, subCriteriaController.getById);
router.post('/', subCriteriaRules, validate, subCriteriaController.create);
router.put('/:id', idParamRule, subCriteriaRules, validate, subCriteriaController.update);
router.delete('/:id', idParamRule, validate, subCriteriaController.delete);

module.exports = router;
