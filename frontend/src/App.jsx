import React from 'react';import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import Contact from './pages/public/Contact';
import BookConsultation from './pages/public/BookConsultation';

// Admin pages
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import GovernedAdvisory from './pages/admin/GovernedAdvisory';
import AdminInsights from './pages/admin/AdminInsights';
import AdminCaseStudies from './pages/admin/AdminCaseStudies';
import AdminServices from './pages/admin/AdminServices';
import AdminIndustries from './pages/admin/AdminIndustries';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminConsultations from './pages/admin/AdminConsultations';
import AdminContacts from './pages/admin/AdminContacts';
import AdminAI from './pages/admin/AdminAI';
import AdminGenerateProposal from './pages/admin/AdminGenerateProposal';
import AdminPredictEngagement from './pages/admin/AdminPredictEngagement';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// // === Batch 09 Gaps & Frontend Mounts ===
const PredictiveEngagementModelingClientsLikelyToHireForNeCfs = React.lazy(() => import('./pages/Batch09/PredictiveEngagementModelingClientsLikelyToHireForNeCfs'));
const WhitePaperGenerationFromCaseStudyDataCfs = React.lazy(() => import('./pages/Batch09/WhitePaperGenerationFromCaseStudyDataCfs'));
const ConsultantMatchingByClientIndustrychallengeCfs = React.lazy(() => import('./pages/Batch09/ConsultantMatchingByClientIndustrychallengeCfs'));
const PredictivePricingForServicesCfs = React.lazy(() => import('./pages/Batch09/PredictivePricingForServicesCfs'));
const ClientCommunicationTimelineOptimizationCfs = React.lazy(() => import('./pages/Batch09/ClientCommunicationTimelineOptimizationCfs'));
const CrmIntegrationSalesforcehubspotCfs = React.lazy(() => import('./pages/Batch09/CrmIntegrationSalesforcehubspotCfs'));
const ThoughtLeadershipAutomationCfs = React.lazy(() => import('./pages/Batch09/ThoughtLeadershipAutomationCfs'));
const WebinarspeakingOpportunityIdentificationCfs = React.lazy(() => import('./pages/Batch09/WebinarspeakingOpportunityIdentificationCfs'));
const AiClientIntentScoringOnContactSubmissionsGapAi = React.lazy(() => import('./pages/Batch09/AiClientIntentScoringOnContactSubmissionsGapAi'));
const AiCompetitorPositioningAnalysisGapAi = React.lazy(() => import('./pages/Batch09/AiCompetitorPositioningAnalysisGapAi'));
const AiPersonalizationOfContentPerVisitorSegmentGapAi = React.lazy(() => import('./pages/Batch09/AiPersonalizationOfContentPerVisitorSegmentGapAi'));
const ProposalGenerationBeyondTemplatesGapNon = React.lazy(() => import('./pages/Batch09/ProposalGenerationBeyondTemplatesGapNon'));
const EngagementProjectTrackingGapNon = React.lazy(() => import('./pages/Batch09/EngagementProjectTrackingGapNon'));
const RetainerBillingAndInvoicingGapNon = React.lazy(() => import('./pages/Batch09/RetainerBillingAndInvoicingGapNon'));
const KnowledgeBaseWikiGapNon = React.lazy(() => import('./pages/Batch09/KnowledgeBaseWikiGapNon'));
const CalendarIntegrationForConsultationsGapNon = React.lazy(() => import('./pages/Batch09/CalendarIntegrationForConsultationsGapNon'));
const EmailCampaignModuleGapNon = React.lazy(() => import('./pages/Batch09/EmailCampaignModuleGapNon'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const generated=import.meta.env.DEV&&import.meta.env.VITE_ENABLE_GENERATED_FEATURES==='true';
  return (
    <Routes>
        {generated&&<><Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} /></>}

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book-consultation" element={<BookConsultation />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<GovernedAdvisory />} />
        {generated&&<>
        <Route path="ai" element={<AdminAI />} />
        <Route path="ai/generate-proposal" element={<AdminGenerateProposal />} />
        <Route path="ai/predict-engagement" element={<AdminPredictEngagement />} />
        <Route path="insights" element={<AdminInsights />} />
        <Route path="case-studies" element={<AdminCaseStudies />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="industries" element={<AdminIndustries />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="consultations" element={<AdminConsultations />} />
        <Route path="contacts" element={<AdminContacts />} />
        </>}
      </Route>
    
      {generated&&<>{/* // === Batch 09 Gaps & Frontend Mounts === */}
        <Route path="/batch09/cfs/predictive-engagement-modeling-clients-likely-to-hire-for-ne" element={<React.Suspense fallback={<div>Loading...</div>}><PredictiveEngagementModelingClientsLikelyToHireForNeCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/white-paper-generation-from-case-study-data" element={<React.Suspense fallback={<div>Loading...</div>}><WhitePaperGenerationFromCaseStudyDataCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/consultant-matching-by-client-industrychallenge" element={<React.Suspense fallback={<div>Loading...</div>}><ConsultantMatchingByClientIndustrychallengeCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/predictive-pricing-for-services" element={<React.Suspense fallback={<div>Loading...</div>}><PredictivePricingForServicesCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/client-communication-timeline-optimization" element={<React.Suspense fallback={<div>Loading...</div>}><ClientCommunicationTimelineOptimizationCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/crm-integration-salesforcehubspot" element={<React.Suspense fallback={<div>Loading...</div>}><CrmIntegrationSalesforcehubspotCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/thought-leadership-automation" element={<React.Suspense fallback={<div>Loading...</div>}><ThoughtLeadershipAutomationCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/webinarspeaking-opportunity-identification" element={<React.Suspense fallback={<div>Loading...</div>}><WebinarspeakingOpportunityIdentificationCfs /></React.Suspense>} />
        <Route path="/batch09/gap-ai/ai-client-intent-scoring-on-contact-submissions" element={<React.Suspense fallback={<div>Loading...</div>}><AiClientIntentScoringOnContactSubmissionsGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-ai/ai-competitor-positioning-analysis" element={<React.Suspense fallback={<div>Loading...</div>}><AiCompetitorPositioningAnalysisGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-ai/ai-personalization-of-content-per-visitor-segment" element={<React.Suspense fallback={<div>Loading...</div>}><AiPersonalizationOfContentPerVisitorSegmentGapAi /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/proposal-generation-beyond-templates" element={<React.Suspense fallback={<div>Loading...</div>}><ProposalGenerationBeyondTemplatesGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/engagement-project-tracking" element={<React.Suspense fallback={<div>Loading...</div>}><EngagementProjectTrackingGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/retainer-billing-and-invoicing" element={<React.Suspense fallback={<div>Loading...</div>}><RetainerBillingAndInvoicingGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/knowledge-base-wiki" element={<React.Suspense fallback={<div>Loading...</div>}><KnowledgeBaseWikiGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/calendar-integration-for-consultations" element={<React.Suspense fallback={<div>Loading...</div>}><CalendarIntegrationForConsultationsGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/email-campaign-module" element={<React.Suspense fallback={<div>Loading...</div>}><EmailCampaignModuleGapNon /></React.Suspense>} />
        </>}

      </Routes>
  );
}
