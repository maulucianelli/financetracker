import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { TrendingUp, TrendingDown, Info, DollarSign, AlertTriangle } from 'lucide-react';

export default function CashFlow() {
  const { calculateCashFlow, data } = useFinance();
  const [period, setPeriod] = useState({ start: '', end: '' });

  const cashFlow = calculateCashFlow(period.start, period.end);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fluxo de Caixa</h1>
        <p className="text-gray-600">Entradas e saídas efetivas de dinheiro (regime de caixa)</p>
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
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
          <Info className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Fluxo de Caixa (Regime de Caixa):</strong> Mostra apenas o dinheiro que realmente entrou e saiu da conta.
              Essencial para saber se você tem dinheiro em caixa para pagar as contas.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
            Entradas de Caixa
          </h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {cashFlow.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Recebimentos do período</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
            Saídas de Caixa
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {cashFlow.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Pagamentos do período</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Saldo Líquido
          </h3>
          <p className={`text-2xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {cashFlow.netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Entradas - Saídas</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-orange-600" />
            A Pagar Pendente
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            R$ {cashFlow.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Obrigações futuras</p>
        </div>
      </div>

      {/* Cash Flow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inflows */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h2 className="text-lg font-semibold text-gray-900">Entradas de Caixa</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium text-gray-700">Recebimentos (Contas a Receber)</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {cashFlow.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">A Receber Pendente:</span>
                <span className="font-semibold text-gray-900">
                  R$ {cashFlow.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Outflows */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-gray-900">Saídas de Caixa</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">Pagamento de Contas</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {(cashFlow.cashOutflows - cashFlow.loanPayments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">Parcelas de Empréstimos</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {cashFlow.loanPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2">
                <span className="text-sm font-bold text-gray-900">Total Saídas</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {cashFlow.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">A Pagar Pendente:</span>
                <span className="font-semibold text-orange-600">
                  R$ {cashFlow.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Box */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Fluxo de Caixa</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-700 font-medium">Entradas de Caixa</span>
            <span className="text-xl font-bold text-green-600">
              + R$ {cashFlow.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-700 font-medium">Saídas de Caixa</span>
            <span className="text-xl font-bold text-red-600">
              - R$ {cashFlow.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded">
            <span className="text-gray-900 font-bold text-lg">Saldo Líquido do Período</span>
            <span className={`text-2xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {cashFlow.netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {cashFlow.netCashFlow < 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Atenção:</strong> Seu fluxo de caixa está negativo no período.
                Verifique suas contas a pagar e planeje os recebimentos futuros.
              </p>
            </div>
          </div>
        </div>
      )}

      {cashFlow.pendingPayables > cashFlow.pendingReceivables && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Alerta:</strong> Suas obrigações futuras (R$ {cashFlow.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                são maiores que os recebimentos esperados (R$ {cashFlow.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).
                Planeje seu caixa com antecedência.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
