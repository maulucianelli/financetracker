import { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

const initialData = {
  // Receitas
  revenues: [], // { date, description, value, origin: 'store' | 'transport', category: 'sales' | 'services' }

  // Custos Diretos (Variáveis - relacionados à produção/operação)
  directCosts: [], // { date, description, value, origin: 'store' | 'transport', category }

  // Despesas Operacionais (Fixas - independentes do volume)
  operationalExpenses: [], // { date, description, value, origin: 'store' | 'transport' | 'shared', category }

  // Contas a Pagar/Receber (Regime de Competência)
  accountsPayable: [],
  accountsReceivable: [], // { date, description, value, dueDate, received, origin, notes }

  // Empréstimos
  loans: [],

  // Configurações
  settings: {
    // Rateio de custos compartilhados (%)
    costAllocation: {
      store: 50,
      transport: 50
    }
  },

  // LEGACY - manter compatibilidade
  monthlyResume: [],
  transportCosts: [],
  storeCosts: [],
};

export const FinanceProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('financeData');
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Garantir que os novos campos existem
      return {
        ...initialData,
        ...parsedData,
        revenues: parsedData.revenues || [],
        directCosts: parsedData.directCosts || [],
        operationalExpenses: parsedData.operationalExpenses || [],
        accountsReceivable: parsedData.accountsReceivable || [],
        settings: parsedData.settings || initialData.settings,
      };
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  // Monthly Resume
  const addMonthlyResume = (item) => {
    setData(prev => ({
      ...prev,
      monthlyResume: [...prev.monthlyResume, { ...item, id: Date.now() }]
    }));
  };

  const updateMonthlyResume = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      monthlyResume: prev.monthlyResume.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteMonthlyResume = (id) => {
    setData(prev => ({
      ...prev,
      monthlyResume: prev.monthlyResume.filter(item => item.id !== id)
    }));
  };

  // Accounts Payable
  const addAccountPayable = (item) => {
    setData(prev => ({
      ...prev,
      accountsPayable: [...prev.accountsPayable, { ...item, id: Date.now() }]
    }));
  };

  const updateAccountPayable = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      accountsPayable: prev.accountsPayable.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteAccountPayable = (id) => {
    setData(prev => ({
      ...prev,
      accountsPayable: prev.accountsPayable.filter(item => item.id !== id)
    }));
  };

  // Transport Costs
  const addTransportCost = (item) => {
    setData(prev => ({
      ...prev,
      transportCosts: [...prev.transportCosts, { ...item, id: Date.now() }]
    }));
  };

  const updateTransportCost = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      transportCosts: prev.transportCosts.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteTransportCost = (id) => {
    setData(prev => ({
      ...prev,
      transportCosts: prev.transportCosts.filter(item => item.id !== id)
    }));
  };

  // Store Costs
  const addStoreCost = (item) => {
    setData(prev => ({
      ...prev,
      storeCosts: [...prev.storeCosts, { ...item, id: Date.now() }]
    }));
  };

  const updateStoreCost = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      storeCosts: prev.storeCosts.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteStoreCost = (id) => {
    setData(prev => ({
      ...prev,
      storeCosts: prev.storeCosts.filter(item => item.id !== id)
    }));
  };

  // Loans
  const addLoan = (item) => {
    setData(prev => ({
      ...prev,
      loans: [...prev.loans, { ...item, id: Date.now() }]
    }));
  };

  const updateLoan = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteLoan = (id) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.filter(item => item.id !== id)
    }));
  };

  // Revenues
  const addRevenue = (item) => {
    setData(prev => ({
      ...prev,
      revenues: [...prev.revenues, { ...item, id: Date.now() }]
    }));
  };

  const updateRevenue = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      revenues: prev.revenues.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteRevenue = (id) => {
    setData(prev => ({
      ...prev,
      revenues: prev.revenues.filter(item => item.id !== id)
    }));
  };

  // Direct Costs
  const addDirectCost = (item) => {
    setData(prev => ({
      ...prev,
      directCosts: [...prev.directCosts, { ...item, id: Date.now() }]
    }));
  };

  const updateDirectCost = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      directCosts: prev.directCosts.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteDirectCost = (id) => {
    setData(prev => ({
      ...prev,
      directCosts: prev.directCosts.filter(item => item.id !== id)
    }));
  };

  // Operational Expenses
  const addOperationalExpense = (item) => {
    setData(prev => ({
      ...prev,
      operationalExpenses: [...prev.operationalExpenses, { ...item, id: Date.now() }]
    }));
  };

  const updateOperationalExpense = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      operationalExpenses: prev.operationalExpenses.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteOperationalExpense = (id) => {
    setData(prev => ({
      ...prev,
      operationalExpenses: prev.operationalExpenses.filter(item => item.id !== id)
    }));
  };

  // Accounts Receivable
  const addAccountReceivable = (item) => {
    setData(prev => ({
      ...prev,
      accountsReceivable: [...prev.accountsReceivable, { ...item, id: Date.now() }]
    }));
  };

  const updateAccountReceivable = (id, updatedItem) => {
    setData(prev => ({
      ...prev,
      accountsReceivable: prev.accountsReceivable.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteAccountReceivable = (id) => {
    setData(prev => ({
      ...prev,
      accountsReceivable: prev.accountsReceivable.filter(item => item.id !== id)
    }));
  };

  // Settings
  const updateCostAllocation = (store, transport) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        costAllocation: { store, transport }
      }
    }));
  };

  // ===== CÁLCULOS AUTOMÁTICOS =====

  const filterByPeriod = (items, startDate, endDate) => {
    if (!items || !Array.isArray(items)) return [];
    if (!startDate || !endDate) return items;
    return items.filter(item => {
      if (!item || !item.date) return false;
      try {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      } catch {
        return false;
      }
    });
  };

  const calculateDRE = (startDate = null, endDate = null) => {
    // Filtrar por período
    const revenues = filterByPeriod(data.revenues || [], startDate, endDate);
    const directCosts = filterByPeriod(data.directCosts || [], startDate, endDate);
    const opExpenses = filterByPeriod(data.operationalExpenses || [], startDate, endDate);
    const loans = data.loans || [];

    const allocation = data.settings?.costAllocation || { store: 50, transport: 50 };

    // RECEITAS
    const storeRevenue = revenues.filter(r => r.origin === 'store').reduce((sum, r) => sum + (r.value || 0), 0);
    const transportRevenue = revenues.filter(r => r.origin === 'transport').reduce((sum, r) => sum + (r.value || 0), 0);
    const totalRevenue = storeRevenue + transportRevenue;

    // CUSTOS DIRETOS (Variáveis)
    const storeDirectCosts = directCosts.filter(c => c.origin === 'store').reduce((sum, c) => sum + (c.value || 0), 0);
    const transportDirectCosts = directCosts.filter(c => c.origin === 'transport').reduce((sum, c) => sum + (c.value || 0), 0);

    // LUCRO BRUTO
    const storeGrossProfit = storeRevenue - storeDirectCosts;
    const transportGrossProfit = transportRevenue - transportDirectCosts;
    const totalGrossProfit = storeGrossProfit + transportGrossProfit;
    const grossMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    // DESPESAS OPERACIONAIS (Fixas)
    const storeOpExpenses = opExpenses.filter(e => e.origin === 'store').reduce((sum, e) => sum + (e.value || 0), 0);
    const transportOpExpenses = opExpenses.filter(e => e.origin === 'transport').reduce((sum, e) => sum + (e.value || 0), 0);
    const sharedExpenses = opExpenses.filter(e => e.origin === 'shared').reduce((sum, e) => sum + (e.value || 0), 0);

    // Ratear custos compartilhados
    const storeSharedExpenses = sharedExpenses * (allocation.store / 100);
    const transportSharedExpenses = sharedExpenses * (allocation.transport / 100);

    const storeTotalOpExpenses = storeOpExpenses + storeSharedExpenses;
    const transportTotalOpExpenses = transportOpExpenses + transportSharedExpenses;
    const totalOpExpenses = storeTotalOpExpenses + transportTotalOpExpenses;

    // LUCRO OPERACIONAL (EBITDA aproximado)
    const storeOperatingProfit = storeGrossProfit - storeTotalOpExpenses;
    const transportOperatingProfit = transportGrossProfit - transportTotalOpExpenses;
    const totalOperatingProfit = storeOperatingProfit + transportOperatingProfit;
    const operatingMargin = totalRevenue > 0 ? (totalOperatingProfit / totalRevenue) * 100 : 0;

    // DESPESAS FINANCEIRAS (Juros de empréstimos)
    const totalInterest = loans.reduce((sum, loan) => {
      // Calcular juros mensais aproximados
      const monthlyInterest = (loan.installmentValue || 0) - ((loan.totalValue || 0) / (loan.totalInstallments || 1));
      return sum + (monthlyInterest > 0 ? monthlyInterest : 0);
    }, 0);

    // LUCRO LÍQUIDO
    const netProfit = totalOperatingProfit - totalInterest;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      // Receitas
      storeRevenue,
      transportRevenue,
      totalRevenue,

      // Custos Diretos
      storeDirectCosts,
      transportDirectCosts,
      totalDirectCosts: storeDirectCosts + transportDirectCosts,

      // Lucro Bruto
      storeGrossProfit,
      transportGrossProfit,
      totalGrossProfit,
      grossMargin,

      // Despesas Operacionais
      storeOpExpenses: storeTotalOpExpenses,
      transportOpExpenses: transportTotalOpExpenses,
      sharedExpenses,
      totalOpExpenses,

      // Lucro Operacional
      storeOperatingProfit,
      transportOperatingProfit,
      totalOperatingProfit,
      operatingMargin,

      // Despesas Financeiras
      totalInterest,

      // Lucro Líquido
      storeNetProfit: storeOperatingProfit - (totalInterest / 2), // Ratear juros
      transportNetProfit: transportOperatingProfit - (totalInterest / 2),
      totalNetProfit: netProfit,
      netMargin,
    };
  };

  const calculateCashFlow = (startDate = null, endDate = null) => {
    // Filtrar contas pagas no período
    const paidPayables = (data.accountsPayable || [])
      .filter(acc => acc.paid)
      .filter(acc => filterByPeriod([acc], startDate, endDate).length > 0);

    const receivedReceivables = (data.accountsReceivable || [])
      .filter(acc => acc.received)
      .filter(acc => filterByPeriod([acc], startDate, endDate).length > 0);

    const loanPayments = (data.loans || []).reduce((sum, loan) => {
      return sum + (loan.installmentValue || 0);
    }, 0);

    // Entradas de Caixa
    const cashInflows = receivedReceivables.reduce((sum, acc) => sum + (acc.value || 0), 0);

    // Saídas de Caixa
    const cashOutflows = paidPayables.reduce((sum, acc) => sum + (acc.value || 0), 0) + loanPayments;

    // Saldo de Caixa
    const netCashFlow = cashInflows - cashOutflows;

    return {
      cashInflows,
      cashOutflows,
      netCashFlow,
      loanPayments,
      pendingPayables: (data.accountsPayable || [])
        .filter(acc => !acc.paid)
        .reduce((sum, acc) => sum + (acc.value || 0), 0),
      pendingReceivables: (data.accountsReceivable || [])
        .filter(acc => !acc.received)
        .reduce((sum, acc) => sum + (acc.value || 0), 0),
    };
  };

  const value = {
    data,
    // Cálculos
    calculateDRE,
    calculateCashFlow,
    // Revenues
    addRevenue,
    updateRevenue,
    deleteRevenue,
    // Direct Costs
    addDirectCost,
    updateDirectCost,
    deleteDirectCost,
    // Operational Expenses
    addOperationalExpense,
    updateOperationalExpense,
    deleteOperationalExpense,
    // Accounts Receivable
    addAccountReceivable,
    updateAccountReceivable,
    deleteAccountReceivable,
    // Settings
    updateCostAllocation,
    // LEGACY - mantém compatibilidade
    // Monthly Resume
    addMonthlyResume,
    updateMonthlyResume,
    deleteMonthlyResume,
    // Accounts Payable
    addAccountPayable,
    updateAccountPayable,
    deleteAccountPayable,
    // Transport Costs
    addTransportCost,
    updateTransportCost,
    deleteTransportCost,
    // Store Costs
    addStoreCost,
    updateStoreCost,
    deleteStoreCost,
    // Loans
    addLoan,
    updateLoan,
    deleteLoan,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
