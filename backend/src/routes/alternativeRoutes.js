const router = require('express').Router();
const alternativeController = require('../controllers/alternativeController');
const { alternativeRules, idParamRule, validate } = require('../middleware/validator');

router.get('/', alternativeController.getAll);
router.get('/:id', idParamRule, validate, alternativeController.getById);
router.post('/', alternativeRules, validate, alternativeController.create);
router.put('/:id', idParamRule, alternativeRules, validate, alternativeController.update);
router.delete('/:id', idParamRule, validate, alternativeController.delete);

module.exports = router;
