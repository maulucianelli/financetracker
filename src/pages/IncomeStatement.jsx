import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function IncomeStatement() {
  const { calculateDRE } = useFinance();
  const [period, setPeriod] = useState({ start: '', end: '' });

  const dre = calculateDRE(period.start, period.end);
  const chequeExpenses = dre?.chequeExpenses || 0;
  const totalOpWithoutCheques = Math.max(
    (dre?.totalOpExpensesWithoutCheques ?? ((dre?.totalOpExpenses || 0) - chequeExpenses)),
    0
  );
  const storeChequeExpenses = dre?.storeChequeExpenses || 0;
  const transportChequeExpenses = dre?.transportChequeExpenses || 0;
  const storeInterest = dre?.storeInterest || 0;
  const transportInterest = dre?.transportInterest || 0;
  const storeOperationalBase = Math.max((dre?.storeOpExpenses || 0) - storeChequeExpenses, 0);
  const transportOperationalBase = Math.max((dre?.transportOpExpenses || 0) - transportChequeExpenses, 0);

  const MetricRow = ({ label, value, bold = false, indent = 0, color = 'text-gray-900', isSubtotal = false }) => (
    <tr className={`${isSubtotal ? 'border-t-2 border-gray-300' : ''}`}>
      <td className={`px-6 py-3 text-sm ${bold ? 'font-bold' : 'font-medium'} ${color}`} style={{ paddingLeft: `${24 + indent * 16}px` }}>
        {label}
      </td>
      <td className={`px-6 py-3 text-sm ${bold ? 'font-bold' : ''} ${color} text-right`}>
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className={`px-6 py-3 text-sm ${bold ? 'font-bold' : ''} ${color} text-right`}>
        {dre.totalRevenue > 0 ? ((value / dre.totalRevenue) * 100).toFixed(1) : '0.0'}%
      </td>
    </tr>
  );

  const SectionHeader = ({ title }) => (
    <tr className="bg-gray-100">
      <td colSpan="3" className="px-6 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
        {title}
      </td>
    </tr>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DRE - Demonstrativo de Resultados</h1>
        <p className="text-gray-600">Análise contábil em regime de competência</p>
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={period.start}
              onChange={(e) => setPeriod({ ...period, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={period.end}
              onChange={(e) => setPeriod({ ...period, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setPeriod({ start: '', end: '' })}
            className="mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>DRE (Regime de Competência):</strong> Mostra as receitas e despesas do período,
              independente de quando o dinheiro entrou ou saiu do caixa. Útil para entender a lucratividade real do negócio.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {dre.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Lucro Bruto</h3>
          <p className="text-2xl font-bold text-blue-600">
            R$ {dre.totalGrossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Margem: {dre.grossMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Lucro Operacional</h3>
          <p className={`text-2xl font-bold ${dre.totalOperatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {dre.totalOperatingProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Margem: {dre.operatingMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Lucro Líquido</h3>
          <p className={`text-2xl font-bold ${dre.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {dre.totalNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Margem: {dre.netMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cheques (Competência)</h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {chequeExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Incluídos nas despesas fixas</p>
        </div>
      </div>

      {/* DRE Table - Consolidated */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">DRE Consolidado</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor (R$)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <SectionHeader title="Receitas" />
            <MetricRow label="Receita Total" value={dre.totalRevenue} bold />

            <SectionHeader title="(-) Custos Diretos / Variáveis" />
            <MetricRow label="Custos Diretos" value={dre.totalDirectCosts} indent={1} color="text-red-600" />

            <MetricRow
              label="= LUCRO BRUTO"
              value={dre.totalGrossProfit}
              bold
              color={dre.totalGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              isSubtotal
            />

            <SectionHeader title="(-) Despesas Operacionais / Fixas" />
            <MetricRow label="Despesas Operacionais" value={totalOpWithoutCheques} indent={1} color="text-red-600" />
            <MetricRow label="Cheques Emitidos" value={chequeExpenses} indent={2} color="text-red-600" />

            <MetricRow
              label="= LUCRO OPERACIONAL (EBITDA)"
              value={dre.totalOperatingProfit}
              bold
              color={dre.totalOperatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              isSubtotal
            />

            <SectionHeader title="(-) Despesas Financeiras" />
            <MetricRow label="Juros de Empréstimos" value={dre.totalInterest} indent={1} color="text-red-600" />

            <MetricRow
              label="= LUCRO LÍQUIDO"
              value={dre.totalNetProfit}
              bold
              color={dre.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              isSubtotal
            />
          </tbody>
        </table>
      </div>

      {/* DRE by Business Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loja */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-900">DRE - Loja</h2>
          </div>
          <table className="min-w-full">
            <tbody className="divide-y divide-gray-200">
              <MetricRow label="Receita" value={dre.storeRevenue} bold />
              <MetricRow label="(-) Custos Diretos" value={dre.storeDirectCosts} color="text-red-600" />
              <MetricRow
                label="= Lucro Bruto"
                value={dre.storeGrossProfit}
                bold
                color={dre.storeGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricRow label="(-) Despesas Operacionais" value={storeOperationalBase} color="text-red-600" />
            <MetricRow label="(-) Cheques" value={storeChequeExpenses} indent={1} color="text-red-600" />
              <MetricRow
                label="= Lucro Operacional"
                value={dre.storeOperatingProfit}
                bold
                color={dre.storeOperatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricRow label="(-) Juros" value={storeInterest} color="text-red-600" />
              <MetricRow
                label="= Lucro Líquido"
                value={dre.storeNetProfit}
                bold
                color={dre.storeNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
            </tbody>
          </table>
        </div>

        {/* Transportadora */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h2 className="text-lg font-semibold text-gray-900">DRE - Transportadora</h2>
          </div>
          <table className="min-w-full">
            <tbody className="divide-y divide-gray-200">
              <MetricRow label="Receita" value={dre.transportRevenue} bold />
              <MetricRow label="(-) Custos Diretos" value={dre.transportDirectCosts} color="text-red-600" />
              <MetricRow
                label="= Lucro Bruto"
                value={dre.transportGrossProfit}
                bold
                color={dre.transportGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricRow label="(-) Despesas Operacionais" value={transportOperationalBase} color="text-red-600" />
              <MetricRow label="(-) Cheques" value={transportChequeExpenses} indent={1} color="text-red-600" />
              <MetricRow
                label="= Lucro Operacional"
                value={dre.transportOperatingProfit}
                bold
                color={dre.transportOperatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <MetricRow label="(-) Juros" value={transportInterest} color="text-red-600" />
              <MetricRow
                label="= Lucro Líquido"
                value={dre.transportNetProfit}
                bold
                color={dre.transportNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
