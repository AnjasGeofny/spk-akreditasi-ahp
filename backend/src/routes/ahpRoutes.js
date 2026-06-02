const router = require('express').Router();
const ahpController = require('../controllers/ahpController');
const { idParamRule, validate } = require('../middleware/validator');

router.post('/calculate-criteria', ahpController.calculateCriteria);
router.post('/calculate-alternatives', ahpController.calculateAlternatives);
router.get('/results', ahpController.getResults);
router.get('/results/:id', idParamRule, validate, ahpController.getResultById);

module.exports = router;
