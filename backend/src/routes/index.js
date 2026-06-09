const router = require('express').Router();

const criteriaRoutes = require('./criteriaRoutes');
const subCriteriaRoutes = require('./subCriteriaRoutes');
const alternativeRoutes = require('./alternativeRoutes');
const pairwiseRoutes = require('./pairwiseRoutes');
const subCriteriaComparisonRoutes = require('./subCriteriaComparisonRoutes');
const alternativeComparisonRoutes = require('./alternativeComparisonRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const ahpRoutes = require('./ahpRoutes');
const accreditationRoutes = require('./accreditationRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/criteria', criteriaRoutes);
router.use('/sub-criteria', subCriteriaRoutes);
router.use('/alternatives', alternativeRoutes);
router.use('/pairwise-comparisons', pairwiseRoutes);
router.use('/sub-criteria-comparisons', subCriteriaComparisonRoutes);
router.use('/alternative-comparisons', alternativeComparisonRoutes);
router.use('/assessment-scores', assessmentRoutes);
router.use('/ahp', ahpRoutes);
router.use('/accreditation', accreditationRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
