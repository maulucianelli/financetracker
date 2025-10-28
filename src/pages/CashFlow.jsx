import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { TrendingUp, TrendingDown, Info, DollarSign, AlertTriangle, Banknote } from 'lucide-react';

const emptySummary = () => ({
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

export default function CashFlow() {
  const { calculateCashFlow } = useFinance();
  const [period, setPeriod] = useState({ start: '', end: '' });
  const [originFilter, setOriginFilter] = useState('all');

  const cashFlowData = calculateCashFlow(period.start, period.end) || { breakdown: {} };
  const breakdown = cashFlowData.breakdown || {
    all: emptySummary(),
    store: emptySummary(),
    transport: emptySummary(),
  };
  const currentSummary = breakdown[originFilter] || emptySummary();

  const payablesOutflow = Math.max(
    currentSummary.cashOutflows - currentSummary.loanPayments - currentSummary.chequeOutflow,
    0
  );
  const hasPendingCheques = currentSummary.pendingChequesValue > 0;
  const revenueInflows = currentSummary.revenueInflows || 0;
  const receivableInflows = currentSummary.receivableInflows || 0;
  const payableOutflows = currentSummary.payableOutflows || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fluxo de Caixa</h1>
        <p className="text-gray-600">Entradas e saídas efetivas de dinheiro (regime de caixa)</p>
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Origem:</span>
            <div className="flex bg-gray-100 rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => setOriginFilter('all')}
                className={`px-3 py-2 ${originFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Geral
              </button>
              <button
                onClick={() => setOriginFilter('store')}
                className={`px-3 py-2 ${originFilter === 'store' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
              >
                Loja
              </button>
              <button
                onClick={() => setOriginFilter('transport')}
                className={`px-3 py-2 ${originFilter === 'transport' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
              >
                Transportadora
              </button>
            </div>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
            Entradas de Caixa
          </h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {currentSummary.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Recebimentos do período</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
            Saídas de Caixa
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {currentSummary.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Pagamentos do período</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Saldo Líquido
          </h3>
          <p className={`text-2xl font-bold ${currentSummary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {currentSummary.netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Entradas - Saídas</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-orange-600" />
            A Pagar Pendente
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            R$ {currentSummary.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Obrigações futuras</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
            <Banknote className="h-4 w-4 mr-1 text-purple-600" />
            Cheques Pendentes
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {currentSummary.pendingChequesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {currentSummary.pendingChequesCount} cheque(s) aguardando compensação
          </p>
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
                <span className="text-sm font-medium text-gray-700">Receitas Registradas</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {revenueInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium text-gray-700">Contas a Receber Recebidas</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {receivableInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium text-gray-700">Entradas Totais</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {currentSummary.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">A Receber Pendente:</span>
                <span className="font-semibold text-gray-900">
                  R$ {currentSummary.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  R$ {payablesOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">Contas a Pagar Quitadas</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {payableOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">Cheques Compensados</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {currentSummary.chequeOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">Parcelas de Empréstimos</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {currentSummary.loanPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2">
                <span className="text-sm font-bold text-gray-900">Total Saídas</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {currentSummary.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">A Pagar Pendente:</span>
                <span className="font-semibold text-orange-600">
                  R$ {currentSummary.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              + R$ {currentSummary.cashInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-700 font-medium">Saídas de Caixa</span>
            <span className="text-xl font-bold text-red-600">
              - R$ {currentSummary.cashOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Inclui cheques compensados</span>
            <span>R$ {currentSummary.chequeOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded">
            <span className="text-gray-900 font-bold text-lg">Saldo Líquido do Período</span>
            <span className={`text-2xl font-bold ${currentSummary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {currentSummary.netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {currentSummary.netCashFlow < 0 && (
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

      {currentSummary.pendingPayables > currentSummary.pendingReceivables && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Alerta:</strong> Suas obrigações futuras (R$ {currentSummary.pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                são maiores que os recebimentos esperados (R$ {currentSummary.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).
                Planeje seu caixa com antecedência.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasPendingCheques && (
        <div className="mt-6 bg-purple-50 border-l-4 border-purple-400 p-4">
          <div className="flex">
            <Banknote className="h-5 w-5 text-purple-400" />
            <div className="ml-3">
              <p className="text-sm text-purple-700">
                <strong>Cheques pendentes:</strong> {currentSummary.pendingChequesCount} cheque(s) aguardando compensação no valor de{' '}
                <strong>R$ {currentSummary.pendingChequesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                Garanta saldo suficiente na data de desconto.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
