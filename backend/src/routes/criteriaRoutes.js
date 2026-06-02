const router = require('express').Router();
const criteriaController = require('../controllers/criteriaController');
const { criteriaRules, idParamRule, validate } = require('../middleware/validator');

router.get('/', criteriaController.getAll);
router.get('/:id', idParamRule, validate, criteriaController.getById);
router.post('/', criteriaRules, validate, criteriaController.create);
router.put('/:id', idParamRule, criteriaRules, validate, criteriaController.update);
router.delete('/:id', idParamRule, validate, criteriaController.delete);

module.exports = router;
