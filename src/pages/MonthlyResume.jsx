import { useMemo, useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinance } from '../contexts/FinanceContext';

const dateFromString = (value) => {
  if (!value) return null;
  try {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

const monthKeyFromDate = (value) => {
  const date = dateFromString(value);
  if (!date) return null;
  return format(date, 'yyyy-MM');
};

const buildMonthLabel = (key) => {
  try {
    const date = parseISO(`${key}-01`);
    return format(date, "MMMM yyyy", { locale: ptBR });
  } catch {
    return key;
  }
};

const periodBounds = (monthKey) => {
  try {
    const start = startOfMonth(parseISO(`${monthKey}-01`));
    const end = endOfMonth(start);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      startDisplay: format(start, "dd/MM/yyyy"),
      endDisplay: format(end, "dd/MM/yyyy"),
    };
  } catch {
    return { start: null, end: null, startDisplay: '', endDisplay: '' };
  }
};

const collectMonths = (data) => {
  const monthSet = new Set();

  const capture = (items, extractor) => {
    (items || []).forEach((item) => {
      const key = monthKeyFromDate(extractor(item));
      if (key) monthSet.add(key);
    });
  };

  capture(data.revenues, item => item.date);
  capture(data.directCosts, item => item.date);
  capture(data.operationalExpenses, item => item.date);
  capture(data.cheques, item => item.issueDate || item.clearingDate);
  capture(data.accountsPayable, item => item.date || item.dueDate);
  capture(data.accountsReceivable, item => item.date || item.dueDate);
  capture(data.monthlyResume, item => item.month ? `${item.month}-01` : null);

  return Array.from(monthSet).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
};

export default function MonthlyResume() {
  const { data, calculateDRE, calculateCashFlow } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthlySummaries = useMemo(() => {
    const months = collectMonths(data);
    return months.map((monthKey) => {
      const period = periodBounds(monthKey);
      const dre = calculateDRE(period.start, period.end) || {};
      const cashFlow = calculateCashFlow(period.start, period.end) || {};

      const storeRevenue = dre.storeRevenue || 0;
      const transportRevenue = dre.transportRevenue || 0;
      const totalRevenue = dre.totalRevenue || 0;
      const directCosts = dre.totalDirectCosts || 0;
      const operationalExpenses = dre.totalOpExpenses || 0;
      const financialExpenses = dre.totalInterest || 0;
      const totalExpenses = directCosts + operationalExpenses + financialExpenses;
      const netProfit = dre.totalNetProfit || 0;

      return {
        key: monthKey,
        label: buildMonthLabel(monthKey),
        period,
        storeRevenue,
        transportRevenue,
        totalRevenue,
        directCosts,
        operationalExpenses,
        financialExpenses,
        totalExpenses,
        netProfit,
        grossMargin: dre.grossMargin || 0,
        operatingMargin: dre.operatingMargin || 0,
        netMargin: dre.netMargin || 0,
        chequeExpenses: dre.chequeExpenses || 0,
        loanPayments: cashFlow.loanPayments || 0,
      };
    });
  }, [data, calculateDRE, calculateCashFlow]);

  const activeMonth = selectedMonth && monthlySummaries.find(month => month.key === selectedMonth);

  if (monthlySummaries.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Resumo Financeiro Mensal</h1>
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          Não há dados suficientes para gerar o resumo mensal. Cadastre receitas, custos ou despesas para ver os resultados automaticamente.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resumo Financeiro Mensal</h1>
          <p className="text-gray-600 mt-1">
            Valores calculados automaticamente a partir de receitas, custos, despesas e empréstimos registrados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Escolher mês:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth || ''}
            onChange={(event) => setSelectedMonth(event.target.value || null)}
          >
            <option value="">Mais recente</option>
            {monthlySummaries.map(month => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Transportadora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Receitas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Despesas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro Líquido</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlySummaries.map((month) => (
              <tr
                key={month.key}
                className={selectedMonth === month.key ? 'bg-blue-50/40' : ''}
                onClick={() => setSelectedMonth(prev => (prev === month.key ? null : month.key))}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.label}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {month.period.startDisplay} — {month.period.endDisplay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {month.storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {month.transportRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  R$ {month.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {month.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${month.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {month.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeMonth && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Detalhado — {activeMonth.label}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Receita Loja</span>
                <span className="font-semibold">
                  R$ {activeMonth.storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receita Transportadora</span>
                <span className="font-semibold">
                  R$ {activeMonth.transportRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Receita Total</span>
                <span className="font-semibold">
                  R$ {activeMonth.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-gray-600">Custos Diretos (Variáveis)</span>
                <span>
                  R$ {activeMonth.directCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas Operacionais (Fixas)</span>
                <span>
                  R$ {activeMonth.operationalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas Financeiras (Juros)</span>
                <span>
                  R$ {activeMonth.financialExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base">
                <span className="text-gray-900 font-semibold">Lucro Líquido</span>
                <span className={activeMonth.netProfit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  R$ {activeMonth.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicadores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded border border-gray-200">
                <p className="text-gray-600">Margem Bruta</p>
                <p className="text-xl font-semibold text-blue-600">{activeMonth.grossMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded border border-gray-200">
                <p className="text-gray-600">Margem Operacional</p>
                <p className="text-xl font-semibold text-blue-600">{activeMonth.operatingMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded border border-gray-200">
                <p className="text-gray-600">Margem Líquida</p>
                <p className="text-xl font-semibold text-blue-600">{activeMonth.netMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded border border-gray-200">
                <p className="text-gray-600">Cheques (Competência)</p>
                <p className="text-xl font-semibold text-purple-600">
                  R$ {activeMonth.chequeExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded border border-gray-200 sm:col-span-2">
                <p className="text-gray-600">Pagamento Mensal de Empréstimos (aprox.)</p>
                <p className="text-xl font-semibold text-orange-600">
                  R$ {activeMonth.loanPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Estimado a partir do cadastro de empréstimos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
