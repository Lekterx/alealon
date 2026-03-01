import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import EventDetailPage from '../pages/EventDetailPage';
import SubmitEventPage from '../pages/SubmitEventPage';

// Admin pages
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import EventsAdminPage from '../pages/admin/EventsAdminPage';
import EventFormPage from '../pages/admin/EventFormPage';
import SubmissionsAdminPage from '../pages/admin/SubmissionsAdminPage';
import ScrapingAdminPage from '../pages/admin/ScrapingAdminPage';
import AdsAdminPage from '../pages/admin/AdsAdminPage';

export default function AppRouter() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/recherche" element={<SearchPage />} />
        <Route path="/evenement/:slug" element={<EventDetailPage />} />
        <Route path="/proposer" element={<SubmitEventPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute><EventFormPage /></ProtectedRoute>} />
        <Route path="/admin/events/:id/edit" element={<ProtectedRoute><EventFormPage /></ProtectedRoute>} />
        <Route path="/admin/submissions" element={<ProtectedRoute><SubmissionsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/scraping" element={<ProtectedRoute><ScrapingAdminPage /></ProtectedRoute>} />
        <Route path="/admin/ads" element={<ProtectedRoute><AdsAdminPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
