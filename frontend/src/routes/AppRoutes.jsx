import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import CriteriaPage from '../pages/CriteriaPage';
import SubCriteriaPage from '../pages/SubCriteriaPage';
import AlternativesPage from '../pages/AlternativesPage';
import PairwiseComparisonPage from '../pages/PairwiseComparisonPage';
import AlternativeComparisonPage from '../pages/AlternativeComparisonPage';
// import AssessmentPage from '../pages/AssessmentPage';
import AhpResultsPage from '../pages/AhpResultsPage';
import AccreditationResultsPage from '../pages/AccreditationResultsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/criteria" element={<CriteriaPage />} />
        <Route path="/sub-criteria" element={<SubCriteriaPage />} />
        <Route path="/alternatives" element={<AlternativesPage />} />
        <Route path="/pairwise" element={<PairwiseComparisonPage />} />
        <Route path="/alt-comparison" element={<AlternativeComparisonPage />} />
        {/* <Route path="/assessment" element={<AssessmentPage />} /> */}
        <Route path="/ahp-results" element={<AhpResultsPage />} />
        <Route path="/accreditation" element={<AccreditationResultsPage />} />
      </Route>
    </Routes>
  );
}
