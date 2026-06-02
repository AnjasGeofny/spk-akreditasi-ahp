const router = require('express').Router();
const accreditationController = require('../controllers/accreditationController');

router.post('/calculate', accreditationController.calculate);
router.get('/results', accreditationController.getResults);
router.get('/results/latest', accreditationController.getLatest);

module.exports = router;
