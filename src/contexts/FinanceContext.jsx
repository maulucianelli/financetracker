/* eslint-disable react-refresh/only-export-components */
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

  // Cheques
  cheques: [], // { payee, serialNumber, issueDate, clearingDate, value, status, bank, origin, notes }

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

const supportsFSAccess = () =>
  typeof window !== 'undefined'
  && typeof window.showSaveFilePicker === 'function'
  && typeof window.showOpenFilePicker === 'function';

export const FinanceProvider = ({ children }) => {
  const storageSupported = typeof navigator !== 'undefined' && !!navigator.storage?.persist;
  const normalizeOrigin = (origin) => {
    if (!origin) return 'store';
    const lower = origin.toString().toLowerCase();
    if (lower.startsWith('trans')) return 'transport';
    if (lower.startsWith('shared') || lower.startsWith('compart')) return 'shared';
    return 'store';
  };

  const normalizeBank = (bank) => {
    if (!bank) return 'bradesco';
    const lower = bank.toString().toLowerCase();
    if (lower.includes('caix')) return 'caixa';
    if (lower.includes('brad')) return 'bradesco';
    return bank;
  };

  const sanitizeChequePayload = (cheque) => {
    const value = Number(cheque.value) || 0;
    return {
      ...cheque,
      value,
      bank: normalizeBank(cheque.bank),
      origin: normalizeOrigin(cheque.origin),
      status: cheque.status === 'compensado' ? 'compensado' : 'pending',
    };
  };

  const deriveLoanValues = (loan) => {
    const totalValue = Number(loan.totalValue) || 0;
    const totalInstallmentsRaw = Number(loan.totalInstallments);
    const totalInstallments = totalInstallmentsRaw > 0 ? Math.floor(totalInstallmentsRaw) : 1;
    const paidInstallmentsRaw = Number(loan.paidInstallments);
    const paidInstallments = Math.min(Math.max(paidInstallmentsRaw || 0, 0), totalInstallments);
    const interestRate = Number(loan.interestRate) || 0;
    const origin = normalizeOrigin(loan.origin);
    const principalPerInstallment = totalValue / totalInstallments;
    const principalPaid = principalPerInstallment * paidInstallments;
    const balance = Math.max(totalValue - principalPaid, 0);
    const installmentValueInput = Number(loan.installmentValue) || 0;
    const suggestedInstallment = principalPerInstallment + (balance * (interestRate / 100));
    const installmentValue = installmentValueInput > 0 ? installmentValueInput : suggestedInstallment;
    const monthlyInterest = balance * (interestRate / 100);
    return {
      totalValue,
      totalInstallments,
      paidInstallments,
      interestRate,
      origin,
      balance,
      installmentValue,
      monthlyInterest,
      principalPerInstallment,
    };
  };

  const sanitizeLoanPayload = (loan) => {
    const derived = deriveLoanValues(loan);
    return {
      ...loan,
      totalValue: derived.totalValue,
      totalInstallments: derived.totalInstallments,
      paidInstallments: derived.paidInstallments,
      interestRate: derived.interestRate,
      origin: derived.origin,
      balance: derived.balance,
      installmentValue: derived.installmentValue,
    };
  };

  const computeLoanMetrics = (loan) => {
    const derived = deriveLoanValues(loan);
    return {
      balance: derived.balance,
      monthlyInterest: derived.monthlyInterest,
      origin: derived.origin,
      interestRate: derived.interestRate,
    };
  };

  const [persistenceState, setPersistenceState] = useState({
    supported: storageSupported,
    persisted: null,
    checking: !!storageSupported,
    error: null,
  });

  const [fileHandle, setFileHandle] = useState(null);
  const [fileStatus, setFileStatus] = useState({
    supported: supportsFSAccess(),
    choosing: false,
    saving: false,
    error: null,
    fileName: null,
    lastSavedAt: null,
    lastLoadedAt: null,
  });

  const [data, setData] = useState(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('financeData') : null;
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
        cheques: (parsedData.cheques || []).map(sanitizeChequePayload),
        loans: (parsedData.loans || []).map(sanitizeLoanPayload),
      };
    }
    return initialData;
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('financeData', JSON.stringify(data));
    }
    if (fileHandle) {
      (async () => {
        try {
          setFileStatus(prev => ({ ...prev, saving: true, error: null }));
          const permission = await fileHandle.requestPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            setFileStatus(prev => ({ ...prev, saving: false, lastSavedAt: new Date().toISOString() }));
          } else {
            setFileStatus(prev => ({ ...prev, saving: false, error: new Error('Permissão negada para gravar no arquivo selecionado.') }));
          }
        } catch (error) {
          setFileStatus(prev => ({ ...prev, saving: false, error }));
        }
      })();
    }
  }, [data, fileHandle]);

  useEffect(() => {
    if (!storageSupported) {
      setPersistenceState(prev => ({ ...prev, supported: false, checking: false }));
      return;
    }

    let cancelled = false;

    const ensurePersistence = async () => {
      try {
        const persisted = await navigator.storage.persisted();
        if (!cancelled) {
          setPersistenceState(prev => ({ ...prev, persisted, checking: false, error: null }));
        }
        if (!persisted) {
          const granted = await navigator.storage.persist();
          const persistedAfter = granted ? await navigator.storage.persisted() : false;
          if (!cancelled) {
            setPersistenceState(prev => ({ ...prev, persisted: persistedAfter, checking: false, error: null }));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPersistenceState(prev => ({ ...prev, checking: false, error }));
        }
      }
    };

    ensurePersistence();

    return () => {
      cancelled = true;
    };
  }, [storageSupported]);

  const requestPersistence = async () => {
    if (!storageSupported) return false;
    try {
      setPersistenceState(prev => ({ ...prev, checking: true, error: null }));
      const granted = await navigator.storage.persist();
      const persisted = await navigator.storage.persisted();
      setPersistenceState(prev => ({ ...prev, persisted, checking: false }));
      return granted && persisted;
    } catch (error) {
      setPersistenceState(prev => ({ ...prev, checking: false, error }));
      return false;
    }
  };

  useEffect(() => {
    if (!supportsFSAccess() || typeof localStorage === 'undefined') {
      return;
    }
    const savedMeta = localStorage.getItem('financeDataFile');
    if (savedMeta) {
      try {
        const descriptor = JSON.parse(savedMeta);
        setFileStatus(prev => ({
          ...prev,
          fileName: descriptor?.file || prev.fileName,
        }));
      } catch {
        // ignore malformed
      }
    }
  }, []);

  const loadFromHandle = async (handle) => {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      setFileStatus(prev => ({
        ...prev,
        lastLoadedAt: new Date().toISOString(),
        fileName: handle.name,
        error: null,
      }));
      return JSON.parse(text);
    } catch (error) {
      setFileStatus(prev => ({ ...prev, error }));
      return null;
    }
  };

  const selectDataFile = async () => {
    if (!supportsFSAccess()) {
      setFileStatus(prev => ({ ...prev, error: new Error('File System Access API não suportada neste navegador.') }));
      return null;
    }
    try {
      setFileStatus(prev => ({ ...prev, choosing: true, error: null }));
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{
          description: 'Arquivo de dados FinanceTrack',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const permission = await handle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        setFileStatus(prev => ({ ...prev, choosing: false, error: new Error('Permissão negada para acessar arquivo selecionado.') }));
        return null;
      }
      const loaded = await loadFromHandle(handle);
      if (loaded) {
        setData(prev => ({ ...prev, ...loaded }));
      }
      setFileHandle(handle);
      setFileStatus(prev => ({
        ...prev,
        choosing: false,
        fileName: handle.name,
        lastLoadedAt: new Date().toISOString(),
      }));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('financeDataFile', JSON.stringify({ file: handle.name }));
      }
      return handle;
    } catch (error) {
      setFileStatus(prev => ({ ...prev, choosing: false, error }));
      return null;
    }
  };

  const createDataFile = async () => {
    if (!supportsFSAccess()) {
      setFileStatus(prev => ({ ...prev, error: new Error('File System Access API não suportada neste navegador.') }));
      return null;
    }
    try {
      setFileStatus(prev => ({ ...prev, choosing: true, error: null }));
      const handle = await window.showSaveFilePicker({
        suggestedName: 'finance-data.json',
        types: [{
          description: 'Arquivo de dados FinanceTrack',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const permission = await handle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        setFileStatus(prev => ({ ...prev, choosing: false, error: new Error('Permissão negada para criar arquivo.') }));
        return null;
      }
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      setFileHandle(handle);
      setFileStatus(prev => ({
        ...prev,
        choosing: false,
        fileName: handle.name,
        lastSavedAt: new Date().toISOString(),
        lastLoadedAt: new Date().toISOString(),
      }));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('financeDataFile', JSON.stringify({ file: handle.name }));
      }
      return handle;
    } catch (error) {
      setFileStatus(prev => ({ ...prev, choosing: false, error }));
      return null;
    }
  };

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
    const normalized = sanitizeLoanPayload(item);
    setData(prev => ({
      ...prev,
      loans: [...prev.loans, { ...normalized, id: Date.now() }]
    }));
  };

  const updateLoan = (id, updatedItem) => {
    const normalized = sanitizeLoanPayload(updatedItem);
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(item =>
        item.id === id ? { ...item, ...normalized } : item
      )
    }));
  };

  const deleteLoan = (id) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.filter(item => item.id !== id)
    }));
  };

  // Cheques
  const addCheque = (item) => {
    const normalized = sanitizeChequePayload(item);
    setData(prev => ({
      ...prev,
      cheques: [...prev.cheques, { ...normalized, id: Date.now() }]
    }));
  };

  const updateCheque = (id, updatedItem) => {
    const normalized = sanitizeChequePayload(updatedItem);
    setData(prev => ({
      ...prev,
      cheques: prev.cheques.map(item =>
        item.id === id ? { ...item, ...normalized } : item
      )
    }));
  };

  const deleteCheque = (id) => {
    setData(prev => ({
      ...prev,
      cheques: prev.cheques.filter(item => item.id !== id)
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
    const cheques = filterByPeriod(
      (data.cheques || []).map(cheque => ({
        ...cheque,
        date: cheque.issueDate || cheque.clearingDate || null
      })),
      startDate,
      endDate
    );

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
    const sharedOperationalExpenses = opExpenses
      .filter(e => e.origin === 'shared')
      .reduce((sum, e) => sum + (e.value || 0), 0);

    const chequeTotals = cheques.reduce((acc, cheque) => {
      const value = Number(cheque.value) || 0;
      if (value === 0) {
        return acc;
      }
      const origin = normalizeOrigin(cheque.origin);
      if (origin === 'transport') {
        acc.transport += value;
      } else if (origin === 'shared') {
        acc.shared += value;
      } else {
        acc.store += value;
      }
      return acc;
    }, { store: 0, transport: 0, shared: 0 });

    const totalChequeExpenses = chequeTotals.store + chequeTotals.transport + chequeTotals.shared;
    const sharedChequeExpenses = chequeTotals.shared;
    const totalSharedExpenses = sharedOperationalExpenses + sharedChequeExpenses;

    // Ratear custos compartilhados
    const storeSharedExpenses = totalSharedExpenses * (allocation.store / 100);
    const transportSharedExpenses = totalSharedExpenses * (allocation.transport / 100);

    const storeChequeExpenses = chequeTotals.store + (sharedChequeExpenses * (allocation.store / 100));
    const transportChequeExpenses = chequeTotals.transport + (sharedChequeExpenses * (allocation.transport / 100));

    const storeTotalOpExpenses = storeOpExpenses + storeSharedExpenses + chequeTotals.store;
    const transportTotalOpExpenses = transportOpExpenses + transportSharedExpenses + chequeTotals.transport;
    const totalOpExpenses = storeTotalOpExpenses + transportTotalOpExpenses;
    const totalOpExpensesWithoutCheques = Math.max(totalOpExpenses - totalChequeExpenses, 0);

    // LUCRO OPERACIONAL (EBITDA aproximado)
    const storeOperatingProfit = storeGrossProfit - storeTotalOpExpenses;
    const transportOperatingProfit = transportGrossProfit - transportTotalOpExpenses;
    const totalOperatingProfit = storeOperatingProfit + transportOperatingProfit;
    const operatingMargin = totalRevenue > 0 ? (totalOperatingProfit / totalRevenue) * 100 : 0;

    // DESPESAS FINANCEIRAS (Juros de empréstimos)
    const loanInterest = (loans || []).reduce((acc, loan) => {
      const { monthlyInterest, origin } = computeLoanMetrics(loan);
      const value = monthlyInterest || 0;
      acc.total += value;
      if (origin === 'transport') {
        acc.transport += value;
      } else if (origin === 'shared') {
        const split = value / 2;
        acc.store += split;
        acc.transport += split;
      } else {
        acc.store += value;
      }
      return acc;
    }, { total: 0, store: 0, transport: 0 });

    const totalInterest = loanInterest.total;

    // LUCRO LÍQUIDO
    const netProfit = totalOperatingProfit - totalInterest;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const storeNetProfit = storeOperatingProfit - loanInterest.store;
    const transportNetProfit = transportOperatingProfit - loanInterest.transport;

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
      sharedExpenses: sharedOperationalExpenses,
      totalOpExpenses,
      totalOpExpensesWithoutCheques,

      // Lucro Operacional
      storeOperatingProfit,
      transportOperatingProfit,
      totalOperatingProfit,
      operatingMargin,

      // Despesas Financeiras
      totalInterest,
      storeInterest: loanInterest.store,
      transportInterest: loanInterest.transport,

      // Lucro Líquido
      storeNetProfit,
      transportNetProfit,
      totalNetProfit: netProfit,
      netMargin,
      chequeExpenses: totalChequeExpenses,
      storeChequeExpenses,
      transportChequeExpenses,
      sharedChequeExpenses,
    };
  };

  const calculateCashFlow = (startDate = null, endDate = null) => {
    const allocationSetting = data.settings?.costAllocation || { store: 50, transport: 50 };
    const allocationRatio = {
      store: (allocationSetting.store ?? 50) / 100,
      transport: (allocationSetting.transport ?? 50) / 100,
    };

    const revenues = filterByPeriod(data.revenues || [], startDate, endDate);
    const receivables = filterByPeriod(data.accountsReceivable || [], startDate, endDate);
    const payables = filterByPeriod(data.accountsPayable || [], startDate, endDate);
    const chequesInPeriod = filterByPeriod(
      (data.cheques || []).map(cheque => ({
        ...cheque,
        date: cheque.clearingDate || cheque.issueDate || null
      })),
      startDate,
      endDate
    );
    const loans = data.loans || [];

    const baseSummary = () => ({
      cashInflows: 0,
      revenueInflows: 0,
      receivableInflows: 0,
      cashOutflows: 0,
      payableOutflows: 0,
      loanPayments: 0,
      chequeOutflow: 0,
      netCashFlow: 0,
      pendingPayables: 0,
      pendingReceivables: 0,
      pendingChequesValue: 0,
      pendingChequesCount: 0,
    });

    const summaries = {
      all: baseSummary(),
      store: baseSummary(),
      transport: baseSummary(),
    };

    const allocateValue = (origin, value) => {
      const normalized = normalizeOrigin(origin);
      if (normalized === 'transport') {
        return { store: 0, transport: value };
      }
      if (normalized === 'store') {
        return { store: value, transport: 0 };
      }
      return {
        store: value * allocationRatio.store,
        transport: value * allocationRatio.transport,
      };
    };

    const pushValue = (key, origin, value) => {
      const { store, transport } = allocateValue(origin, value);
      summaries.store[key] += store;
      summaries.transport[key] += transport;
      summaries.all[key] += store + transport;
      return { store, transport };
    };

    // Receitas imediatas
    revenues.forEach((revenue) => {
      const value = Number(revenue.value) || 0;
      pushValue('cashInflows', revenue.origin, value);
      pushValue('revenueInflows', revenue.origin, value);
    });

    // Contas a receber
    receivables.forEach((receivable) => {
      const value = Number(receivable.value) || 0;
      if (receivable.received) {
        pushValue('cashInflows', receivable.origin, value);
        pushValue('receivableInflows', receivable.origin, value);
      } else {
        pushValue('pendingReceivables', receivable.origin, value);
      }
    });

    // Contas a pagar
    payables.forEach((payable) => {
      const value = Number(payable.value) || 0;
      if (payable.paid) {
        pushValue('cashOutflows', payable.origin, value);
        pushValue('payableOutflows', payable.origin, value);
      } else {
        pushValue('pendingPayables', payable.origin, value);
      }
    });

    // Empréstimos (parcelas)
    loans.forEach((loan) => {
      const installmentValue = Number(loan.installmentValue) || 0;
      if (installmentValue > 0) {
        pushValue('cashOutflows', loan.origin, installmentValue);
        pushValue('loanPayments', loan.origin, installmentValue);
      }
    });

    // Cheques compensados (saída efetiva)
    chequesInPeriod
      .filter(cheque => cheque.status === 'compensado')
      .forEach((cheque) => {
        const value = Number(cheque.value) || 0;
        pushValue('cashOutflows', cheque.origin, value);
        pushValue('chequeOutflow', cheque.origin, value);
      });

    // Cheques pendentes
    (data.cheques || [])
      .filter(cheque => cheque.status !== 'compensado')
      .forEach((cheque) => {
        const value = Number(cheque.value) || 0;
        const { store, transport } = allocateValue(cheque.origin, value);
        if (store > 0) summaries.store.pendingChequesValue += store;
        if (transport > 0) summaries.transport.pendingChequesValue += transport;
        summaries.all.pendingChequesValue += value;

        summaries.all.pendingChequesCount += 1;
        if (store > 0) summaries.store.pendingChequesCount += 1;
        if (transport > 0) summaries.transport.pendingChequesCount += 1;
      });

    ['all', 'store', 'transport'].forEach((key) => {
      const summary = summaries[key];
      summary.netCashFlow = summary.cashInflows - summary.cashOutflows;
    });

    return {
      ...summaries.all,
      breakdown: summaries,
    };
  };

  const value = {
    data,
    // Cálculos
    calculateDRE,
    calculateCashFlow,
    computeLoanMetrics,
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
    // Cheques
    addCheque,
    updateCheque,
    deleteCheque,
    // File persistence
    fileHandle,
    fileStatus,
    selectDataFile,
    createDataFile,
    // Storage
    storagePersistence: persistenceState,
    requestStoragePersistence: requestPersistence,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
