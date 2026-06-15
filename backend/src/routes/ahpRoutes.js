const router = require('express').Router();
const ahpController = require('../controllers/ahpController');
const { idParamRule, validate } = require('../middleware/validator');

router.post('/calculate-criteria', ahpController.calculateCriteria);
router.post('/calculate-sub-criteria/:criteriaId', ahpController.calculateSubCriteria);
router.post('/calculate-alternatives', ahpController.calculateAlternatives);
router.get('/readiness', ahpController.getReadiness);
router.get('/results', ahpController.getResults);
router.get('/results/:id', idParamRule, validate, ahpController.getResultById);

module.exports = router;
