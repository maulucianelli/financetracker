import { useFinance } from '../contexts/FinanceContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Banknote } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { data, calculateDRE, calculateCashFlow, computeLoanMetrics } = useFinance();

  // Calculate metrics using correct accounting
  const dre = calculateDRE() || {
    totalRevenue: 0,
    totalNetProfit: 0,
    totalGrossProfit: 0,
    totalOperatingProfit: 0,
    grossMargin: 0,
    operatingMargin: 0,
    storeNetProfit: 0,
    transportNetProfit: 0,
    storeRevenue: 0,
    transportRevenue: 0,
    totalDirectCosts: 0,
    totalOpExpenses: 0,
    totalOpExpensesWithoutCheques: 0,
    totalInterest: 0,
    chequeExpenses: 0,
    storeInterest: 0,
    transportInterest: 0,
    storeChequeExpenses: 0,
    transportChequeExpenses: 0,
    sharedChequeExpenses: 0,
  };

  const cashFlow = calculateCashFlow() || {
    netCashFlow: 0,
    pendingReceivables: 0,
    cashInflows: 0,
    cashOutflows: 0,
    pendingChequesValue: 0,
    chequeOutflow: 0,
  };

  const unpaidAccounts = (data.accountsPayable || []).filter(acc => !acc.paid).length;
  const totalUnpaid = (data.accountsPayable || [])
    .filter(acc => !acc.paid)
    .reduce((sum, acc) => sum + (acc.value || 0), 0);

  const loans = data.loans || [];
  const loanSnapshots = loans.map((loan) => computeLoanMetrics(loan));
  const totalLoans = loanSnapshots.reduce((sum, loan) => sum + (loan.balance || 0), 0);
  const totalLoanInterest = loanSnapshots.reduce((sum, loan) => sum + (loan.monthlyInterest || 0), 0);
  const loanCount = loans.length;
  const operationalWithoutCheques = Math.max(
    (dre.totalOpExpensesWithoutCheques ?? (dre.totalOpExpenses - dre.chequeExpenses)),
    0
  );

  // Prepare chart data
  const profitData = [
    { name: 'Loja', lucro: dre.storeNetProfit, receita: dre.storeRevenue },
    { name: 'Transportadora', lucro: dre.transportNetProfit, receita: dre.transportRevenue },
  ];

  const costsDistribution = [
    { name: 'Custos Diretos', value: dre.totalDirectCosts },
    { name: 'Despesas Operacionais', value: operationalWithoutCheques },
    { name: 'Cheques', value: dre.chequeExpenses },
    { name: 'Despesas Financeiras', value: dre.totalInterest },
  ].filter(item => item.value > 0);

  const MetricCard = ({ title, value, icon, trend, colorClass }) => {
    const Icon = icon;
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {trend !== undefined && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {Math.abs(trend)}%
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Financeiro</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <MetricCard
          title="Receita Total (DRE)"
          value={dre.totalRevenue}
          icon={DollarSign}
          colorClass="text-green-600"
        />
        <MetricCard
          title="Lucro Líquido (DRE)"
          value={dre.totalNetProfit}
          icon={dre.totalNetProfit >= 0 ? TrendingUp : TrendingDown}
          colorClass={dre.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MetricCard
          title="Saldo de Caixa"
          value={cashFlow.netCashFlow}
          icon={DollarSign}
          colorClass={cashFlow.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}
        />
        <MetricCard
          title="Contas a Pagar"
          value={totalUnpaid}
          icon={AlertCircle}
          colorClass="text-orange-600"
        />
        <MetricCard
          title="Cheques Pendentes"
          value={cashFlow.pendingChequesValue}
          icon={Banknote}
          colorClass={cashFlow.pendingChequesValue > 0 ? 'text-purple-600' : 'text-gray-400'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit by Unit */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lucro por Unidade</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receita" />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro Líquido" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Costs Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Custos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costsDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Lucro Bruto</h3>
          <p className={`text-3xl font-bold ${dre.totalGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {dre.totalGrossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">Margem: {dre.grossMargin.toFixed(1)}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Lucro Operacional</h3>
          <p className={`text-3xl font-bold ${dre.totalOperatingProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {dre.totalOperatingProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">Margem: {dre.operatingMargin.toFixed(1)}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Empréstimos Ativos</h3>
          <p className="text-3xl font-bold text-orange-600">
            R$ {totalLoans.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">{loanCount} empréstimo(s)</p>
          <p className="text-xs text-gray-500 mt-1">
            Juros estimados no mês: R$ {totalLoanInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">A Receber Pendente</h3>
          <p className="text-3xl font-bold text-blue-600">
            R$ {cashFlow.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">Recebimentos futuros</p>
        </div>
      </div>

      {/* Pending Accounts Alert */}
      {unpaidAccounts > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Você tem <strong>{unpaidAccounts}</strong> conta(s) a pagar pendente(s) no valor total de{' '}
                <strong>R$ {totalUnpaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
