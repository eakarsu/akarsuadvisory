import { Routes, Route, Navigate } from 'react-router-dom';
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
import AdminInsights from './pages/admin/AdminInsights';
import AdminCaseStudies from './pages/admin/AdminCaseStudies';
import AdminServices from './pages/admin/AdminServices';
import AdminIndustries from './pages/admin/AdminIndustries';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminConsultations from './pages/admin/AdminConsultations';
import AdminContacts from './pages/admin/AdminContacts';
import AdminAI from './pages/admin/AdminAI';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <Routes>
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
        <Route index element={<Dashboard />} />
        <Route path="ai" element={<AdminAI />} />
        <Route path="insights" element={<AdminInsights />} />
        <Route path="case-studies" element={<AdminCaseStudies />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="industries" element={<AdminIndustries />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="consultations" element={<AdminConsultations />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>
    </Routes>
  );
}
