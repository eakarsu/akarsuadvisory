import ClientEngagementTimeline from '../../components/customViews/ClientEngagementTimeline';
import AdvisoryAreaHeatmap from '../../components/customViews/AdvisoryAreaHeatmap';
import ClientAdvisoryReport from '../../components/customViews/ClientAdvisoryReport';
import ServiceOfferingRulesEditor from '../../components/customViews/ServiceOfferingRulesEditor';

export default function CustomViewsPage() {
  return (
    <div className="admin-page" data-testid="custom-views-page">
      <h1 className="admin-title">Advisory Views</h1>
      <p style={{ color: '#6b7280', marginTop: -16, marginBottom: 24, fontSize: 14 }}>
        Visualizations and operational tools tailored for Akarsu Advisory engagements.
      </p>

      <section>
        <h2 className="admin-subtitle" style={{ marginTop: 8 }}>Visualizations</h2>
        <ClientEngagementTimeline />
        <AdvisoryAreaHeatmap />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="admin-subtitle">Operations</h2>
        <ClientAdvisoryReport />
        <ServiceOfferingRulesEditor />
      </section>
    </div>
  );
}
