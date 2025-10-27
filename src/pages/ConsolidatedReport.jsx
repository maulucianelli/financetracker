import { useFinance } from '../contexts/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ConsolidatedReport() {
  const { data } = useFinance();

  // Calculate profits by origin
  const storeProfit = data.monthlyResume.reduce((sum, item) => sum + (item.storeRevenue || 0), 0) -
                     data.storeCosts.reduce((sum, item) => sum + (item.value || 0), 0);

  const transportProfit = data.monthlyResume.reduce((sum, item) => sum + (item.transportRevenue || 0), 0) -
                         data.transportCosts.reduce((sum, item) => sum + (item.value || 0), 0);

  const totalProfit = storeProfit + transportProfit;

  // Calculate total revenues
  const storeRevenue = data.monthlyResume.reduce((sum, item) => sum + (item.storeRevenue || 0), 0);
  const transportRevenue = data.monthlyResume.reduce((sum, item) => sum + (item.transportRevenue || 0), 0);
  const totalRevenue = storeRevenue + transportRevenue;

  // Calculate total expenses
  const storeTotalExpenses = data.storeCosts.reduce((sum, item) => sum + (item.value || 0), 0);
  const transportTotalExpenses = data.transportCosts.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalExpenses = storeTotalExpenses + transportTotalExpenses;

  // Chart data
  const chartData = [
    {
      name: 'Loja',
      receita: storeRevenue,
      despesas: storeTotalExpenses,
      lucro: storeProfit,
    },
    {
      name: 'Transportadora',
      receita: transportRevenue,
      despesas: transportTotalExpenses,
      lucro: transportProfit,
    },
  ];

  const MetricCard = ({ title, value, icon, colorClass, trend }) => {
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
                      {value >= 0 ? 'Lucro' : 'Prejuízo'}
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Relatório Consolidado</h1>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Receita Total"
          value={totalRevenue}
          icon={DollarSign}
          colorClass="text-green-600"
        />
        <MetricCard
          title="Despesas Totais"
          value={totalExpenses}
          icon={DollarSign}
          colorClass="text-red-600"
        />
        <MetricCard
          title="Lucro Total"
          value={totalProfit}
          icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
          colorClass={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
          trend={totalProfit}
        />
      </div>

      {/* Business Unit Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparativo por Unidade</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receita" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Detalhada</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Loja</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receita:</span>
                  <span className="font-semibold text-green-600">
                    R$ {storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Despesas:</span>
                  <span className="font-semibold text-red-600">
                    R$ {storeTotalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Lucro:</span>
                  <span className={`font-bold ${storeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {storeProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Margem:</span>
                  <span className="font-semibold">
                    {storeRevenue > 0 ? ((storeProfit / storeRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Transportadora</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receita:</span>
                  <span className="font-semibold text-green-600">
                    R$ {transportRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Despesas:</span>
                  <span className="font-semibold text-red-600">
                    R$ {transportTotalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Lucro:</span>
                  <span className={`font-bold ${transportProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {transportProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Margem:</span>
                  <span className="font-semibold">
                    {transportRevenue > 0 ? ((transportProfit / transportRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Resumo Mensal</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro Transportadora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Despesas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Entradas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.monthlyResume.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {(item.storeRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {(item.transportRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${(item.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(item.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {(item.totalExits || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {(item.totalEntries || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.monthlyResume.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum dado disponível. Adicione registros no Resumo Mensal para visualizar o relatório.
          </div>
        )}
      </div>
    </div>
  );
}
