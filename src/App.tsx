import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeadProvider } from './context/LeadContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { LeadsList } from './pages/LeadsList';
import { NewLead } from './pages/NewLead';
import { EditLead } from './pages/EditLead';
import { LeadProfile } from './pages/LeadProfile';
import { EmailTemplates } from './pages/EmailTemplates';

function App() {
  return (
    <LeadProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsList />} />
            <Route path="leads/new" element={<NewLead />} />
            <Route path="leads/:id" element={<LeadProfile />} />
            <Route path="leads/:id/edit" element={<EditLead />} />
            <Route path="templates" element={<EmailTemplates />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LeadProvider>
  );
}

export default App;
