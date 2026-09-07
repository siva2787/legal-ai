import React, { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { MyInspectionsPage } from './components/pages/MyInspectionsPage';
import { ProfileSettingsPage } from './components/pages/ProfileSettingsPage';
import { KnowledgeBasePage } from './components/pages/KnowledgeBasePage';
import { ProductsPage } from './components/pages/ProductsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { UsersTeamPage } from './components/pages/UsersTeamPage';

import { NewInspectionUpload } from './components/inspection/NewInspectionUpload';
import { AIAnalysisProcessing } from './components/inspection/AIAnalysisProcessing';
import { ExtractedInfoReview } from './components/inspection/ExtractedInfoReview';
import { ComplianceResults } from './components/inspection/ComplianceResults';
import { DetailedRuleResults } from './components/inspection/DetailedRuleResults';
import { ReportPreview } from './components/inspection/ReportPreview';

import { InspectionRecord, UserProfile, ProductContext, PackageImage } from './types';
import { SEED_INSPECTIONS, DEFAULT_POTATO_CHIPS_PRODUCT } from './data/seedInspections';
import { evaluateCompliance } from './legal/ruleEngine';

export default function App() {
  // Authentication & View State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default into Dashboard
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Inspector User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Rohinth Kumaran',
    role: 'Legal Metrology Inspector',
    employee_id: 'LM-10334',
    email: 'rohinth.k@lm.gov.in',
    zone: 'Kumbakonam & Thanjavur District, Tamil Nadu'
  });

  // Inspections Registry - dynamic from SQLite
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [activeInspection, setActiveInspection] = useState<InspectionRecord | null>(null);

  // Active Wizard state for new inspection
  const [uploadedImages, setUploadedImages] = useState<PackageImage[]>([]);
  const [activeProductContext, setActiveProductContext] = useState<ProductContext>(DEFAULT_POTATO_CHIPS_PRODUCT);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);

  // Sync with backend API
  const refreshData = React.useCallback(() => {
    fetch('/api/inspections')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.inspections)) {
          setInspections(data.inspections);
          if (data.inspections.length > 0) {
            setActiveInspection((prev) => prev || data.inspections[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend API inspections fetch fallback to local store:', err);
      });

    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.alerts)) {
          const unread = data.alerts.filter((a: any) => !a.is_read).length;
          setUnreadAlertsCount(unread);
        }
      })
      .catch((err) => {
        console.warn('Backend API alerts fetch error:', err);
      });
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handlers
  const handleStartNewInspection = () => {
    setCurrentView('new_inspection');
  };

  const [analysisStatus, setAnalysisStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalysisPayload, setLastAnalysisPayload] = useState<{
    images: PackageImage[];
    metadata: {
      inspection_number: string;
      inspector_name: string;
      location: string;
      category_hint: string;
      market_type: string;
    };
  } | null>(null);

  const runAnalysis = (payload: {
    images: PackageImage[];
    metadata: {
      inspection_number: string;
      inspector_name: string;
      location: string;
      category_hint: string;
      market_type: string;
    };
  }) => {
    setLastAnalysisPayload(payload);
    setAnalysisStatus('loading');
    setAnalysisError(null);
    setCurrentView('inspection_analysis');

    fetch('/api/analyze-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: payload.images, hints: payload.metadata })
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data && data.success && data.product_context) {
          setActiveProductContext(data.product_context);
          setAnalysisStatus('success');
        } else {
          setAnalysisError(data?.error || 'AI extraction failed. Please try again.');
          setAnalysisStatus('error');
        }
      })
      .catch((err) => {
        console.warn('Analysis error:', err);
        setAnalysisError('Could not reach the analysis service. Check your connection and try again.');
        setAnalysisStatus('error');
      });
  };

  const handleStartAnalysis = (payload: {
    images: PackageImage[];
    metadata: {
      inspection_number: string;
      inspector_name: string;
      location: string;
      category_hint: string;
      market_type: string;
    };
  }) => {
    setUploadedImages(payload.images);
    runAnalysis(payload);
  };

  const handleRetryAnalysis = () => {
    if (lastAnalysisPayload) {
      runAnalysis(lastAnalysisPayload);
    }
  };

  const handleAnalysisCompleted = () => {
    setCurrentView('inspection_review');
  };

  const handleProceedToResults = (updatedContext: ProductContext) => {
    setActiveProductContext(updatedContext);

    // Generate inspection identifier
    const newNumber = `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Run compliance evaluation
    const { results, summary } = evaluateCompliance(updatedContext, {
      inspection_id: newNumber,
      inspector_name: currentUser.name
    });

    const newRecord: InspectionRecord = {
      id: `insp-${Date.now()}`,
      inspection_number: newNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inspector_name: currentUser.name,
      inspector_id: currentUser.employee_id,
      location: currentUser.zone,
      workflow_status: 'COMPLETED',
      images: uploadedImages,
      product_context: updatedContext,
      rule_results: results,
      compliance_summary: summary
    };

    setActiveInspection(newRecord);
    setInspections((prev) => [newRecord, ...prev]);

    // Send to backend store
    fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.inspection) {
          setActiveInspection(data.inspection);
          setInspections((prev) => [
            data.inspection,
            ...prev.filter((i) => i.id !== newRecord.id && i.id !== data.inspection.id)
          ]);
          refreshData();
        }
      })
      .catch((err) => {
        console.warn('Inspection creation error:', err);
      });

    setCurrentView('inspection_results');
  };

  const handleViewInspection = (inspectionId: string) => {
    const target = inspections.find((i) => i.id === inspectionId);
    if (target) {
      setActiveInspection(target);
      setActiveProductContext(target.product_context);
      setUploadedImages(target.images);
      setCurrentView('inspection_results');
    }
  };

  const handleViewReport = (inspectionId: string) => {
    const target = inspections.find((i) => i.id === inspectionId);
    if (target) {
      setActiveInspection(target);
      setCurrentView('inspection_report');
    }
  };

  // Render Login Page
  if (!isAuthenticated || (currentView as any) === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Authenticated Inspector Shell
  return (
    <div className="flex h-screen bg-[#F4F7FB] overflow-hidden antialiased max-w-full">
      {/* Persistent Left Inspector Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={() => {
          setIsAuthenticated(false);
          setCurrentView('login' as any);
        }}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Global Inspector Header */}
        <Header
          user={currentUser}
          inspections={inspections}
          onNavigate={(view) => setCurrentView(view)}
          onViewReport={handleViewReport}
          onLogout={() => {
            setIsAuthenticated(false);
            setCurrentView('login' as any);
          }}
          unreadCount={unreadAlertsCount}
        />

        {/* Dynamic Route View */}
        <main className="flex-1">
          {currentView === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              inspections={inspections}
              onStartNewInspection={handleStartNewInspection}
              onViewInspection={handleViewInspection}
              onViewAllInspections={() => setCurrentView('my_inspections')}
              onViewAllTasks={() => setCurrentView('alerts')}
            />
          )}

          {currentView === 'new_inspection' && (
            <NewInspectionUpload onStartAnalysis={handleStartAnalysis} />
          )}

          {currentView === 'inspection_analysis' && (
            <AIAnalysisProcessing
              status={analysisStatus}
              errorMessage={analysisError}
              onComplete={handleAnalysisCompleted}
              onRetry={handleRetryAnalysis}
              onCancel={() => setCurrentView('new_inspection')}
            />
          )}

          {currentView === 'inspection_review' && (
            <ExtractedInfoReview
              productContext={activeProductContext}
              images={uploadedImages}
              onProceedToResults={handleProceedToResults}
              onBackToUpload={() => setCurrentView('new_inspection')}
            />
          )}

          {currentView === 'inspection_results' &&
            (activeInspection ? (
              <ComplianceResults
                summary={activeInspection.compliance_summary}
                ruleResults={activeInspection.rule_results}
                productContext={activeInspection.product_context}
                onViewDetailedRules={() => setCurrentView('inspection_rules')}
                onGenerateReport={() => setCurrentView('inspection_report')}
                onBackToReview={() => setCurrentView('inspection_review')}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                <p>No active inspection selected.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ))}

          {currentView === 'inspection_rules' &&
            (activeInspection ? (
              <DetailedRuleResults
                ruleResults={activeInspection.rule_results}
                summary={activeInspection.compliance_summary}
                productContext={activeInspection.product_context}
                onBackToResults={() => setCurrentView('inspection_results')}
                onProceedToReport={() => setCurrentView('inspection_report')}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                <p>No active inspection selected.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ))}

          {currentView === 'inspection_report' &&
            (activeInspection ? (
              <ReportPreview
                inspection={activeInspection}
                onReturnToDashboard={() => setCurrentView('dashboard')}
                onBackToResults={() => setCurrentView('inspection_results')}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                <p>No active inspection selected.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ))}

          {currentView === 'my_inspections' && (
            <MyInspectionsPage
              inspections={inspections}
              onStartNew={handleStartNewInspection}
              onViewInspection={handleViewInspection}
              onViewReport={handleViewReport}
            />
          )}

          {currentView === 'analytics' && <AnalyticsPage />}

          {currentView === 'products' && (
            <ProductsPage
              inspections={inspections}
              onViewProductInspection={handleViewInspection}
            />
          )}

          {currentView === 'reports' && (
            <ReportsPage inspections={inspections} onOpenReport={handleViewReport} />
          )}

          {currentView === 'alerts' && (
            <AlertsPage onInspectViolation={handleViewInspection} />
          )}

          {currentView === 'knowledge_base' && <KnowledgeBasePage />}

          {currentView === 'users_team' && <UsersTeamPage />}

          {currentView === 'settings' && (
            <ProfileSettingsPage
              user={currentUser}
              onUpdateProfile={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
            />
          )}
        </main>
      </div>
    </div>
  );
}