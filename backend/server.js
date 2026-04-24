require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/case-studies', require('./routes/caseStudies'));
app.use('/api/industries', require('./routes/industries'));
app.use('/api/services', require('./routes/services'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/search', require('./routes/search'));

// Admin routes
app.use('/api/admin/insights', require('./routes/adminInsights'));
app.use('/api/admin/case-studies', require('./routes/adminCaseStudies'));
app.use('/api/admin/industries', require('./routes/adminIndustries'));
app.use('/api/admin/services', require('./routes/adminServices'));
app.use('/api/admin/testimonials', require('./routes/adminTestimonials'));
app.use('/api/admin/consultations', require('./routes/adminConsultations'));
app.use('/api/admin/contacts', require('./routes/adminContacts'));
app.use('/api/admin/dashboard', require('./routes/adminDashboard'));
app.use('/api/admin/ai', require('./routes/ai'));

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
