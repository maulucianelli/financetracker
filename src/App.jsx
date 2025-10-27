import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './contexts/FinanceContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import IncomeStatement from './pages/IncomeStatement';
import CashFlow from './pages/CashFlow';
import Revenues from './pages/Revenues';
import AccountsPayable from './pages/AccountsPayable';
import Loans from './pages/Loans';
import Settings from './pages/Settings';
// Legacy routes
import MonthlyResume from './pages/MonthlyResume';
import TransportCosts from './pages/TransportCosts';
import StoreCosts from './pages/StoreCosts';
import ConsolidatedReport from './pages/ConsolidatedReport';

function App() {
  return (
    <FinanceProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dre" element={<IncomeStatement />} />
            <Route path="/cash-flow" element={<CashFlow />} />
            <Route path="/revenues" element={<Revenues />} />
            <Route path="/accounts-payable" element={<AccountsPayable />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/settings" element={<Settings />} />
            {/* Legacy routes - mantém compatibilidade */}
            <Route path="/monthly-resume" element={<MonthlyResume />} />
            <Route path="/transport-costs" element={<TransportCosts />} />
            <Route path="/store-costs" element={<StoreCosts />} />
            <Route path="/consolidated" element={<ConsolidatedReport />} />
          </Routes>
        </Layout>
      </Router>
    </FinanceProvider>
  );
}

export default App;
