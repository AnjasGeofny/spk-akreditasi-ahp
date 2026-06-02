const router = require('express').Router();
const assessmentController = require('../controllers/assessmentController');
const { assessmentRules, validate } = require('../middleware/validator');

router.get('/', assessmentController.getAll);
router.post('/', assessmentRules, validate, assessmentController.save);

module.exports = router;
