import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Advisory Pipeline', end: true },
  { to: '/admin/ai', label: 'AI Assistant' },
  { to: '/admin/ai/generate-proposal', label: 'AI Proposal' },
  { to: '/admin/ai/predict-engagement', label: 'AI Engagement' },
  { to: '/admin/consultations', label: 'Consultations' },
  { to: '/admin/contacts', label: 'Contacts' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/industries', label: 'Industries' },
  { to: '/admin/insights', label: 'Insights' },
  { to: '/admin/case-studies', label: 'Case Studies' },
  { to: '/admin/testimonials', label: 'Testimonials' },
];
const visibleNav = import.meta.env.DEV && import.meta.env.VITE_ENABLE_GENERATED_FEATURES === 'true' ? NAV_ITEMS : NAV_ITEMS.slice(0,1);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo.jpg" alt="Akarsu Advisory" style={{ height: 36, width: 'auto' }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Admin</span>
        </div>
        <nav className="admin-nav">
          {visibleNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{user?.name}</span>
          <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
