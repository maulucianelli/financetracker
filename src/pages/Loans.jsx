import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const originOptions = [
  { value: 'store', label: 'Loja' },
  { value: 'transport', label: 'Transportadora' },
];

const formatOriginLabel = (origin) => {
  const value = typeof origin === 'string' ? origin.toLowerCase() : '';
  if (value.startsWith('trans')) return 'Transportadora';
  if (value.startsWith('shared')) return 'Compartilhado';
  return 'Loja';
};

export default function Loans() {
  const { data, addLoan, updateLoan, deleteLoan, computeLoanMetrics } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    bank: '',
    loanType: '',
    totalValue: 0,
    totalInstallments: 0,
    paidInstallments: 0,
    installmentValue: 0,
    nextDue: '',
    interestRate: 0,
    origin: 'store',
  });

  const resetForm = () => {
    setFormData({
      bank: '',
      loanType: '',
      totalValue: 0,
      totalInstallments: 0,
      paidInstallments: 0,
      installmentValue: 0,
      nextDue: '',
      interestRate: 0,
      origin: 'store',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = {
      ...formData,
      totalValue: Number(formData.totalValue),
      totalInstallments: Number(formData.totalInstallments),
      paidInstallments: Number(formData.paidInstallments),
      installmentValue: Number(formData.installmentValue),
      interestRate: Number(formData.interestRate),
      origin: formData.origin,
    };

    if (editingItem) {
      updateLoan(editingItem.id, item);
    } else {
      addLoan(item);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const originValue = typeof item.origin === 'string' && item.origin.toLowerCase().startsWith('trans') ? 'transport' : 'store';
    setFormData({
      bank: item.bank,
      loanType: item.loanType,
      totalValue: item.totalValue,
      totalInstallments: item.totalInstallments,
      paidInstallments: item.paidInstallments,
      installmentValue: item.installmentValue,
      nextDue: item.nextDue,
      interestRate: item.interestRate ?? 0,
      origin: originValue,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
      deleteLoan(id);
    }
  };

  const loanSnapshots = (data.loans || []).map((loan) => computeLoanMetrics(loan));
  const aggregates = loanSnapshots.reduce(
    (acc, snapshot) => {
      const balance = snapshot.balance || 0;
      const monthlyInterest = snapshot.monthlyInterest || 0;
      acc.totalBalance += balance;
      acc.totalMonthlyInterest += monthlyInterest;
      if (snapshot.origin === 'transport') {
        acc.transportBalance += balance;
        acc.transportInterest += monthlyInterest;
      } else if (snapshot.origin === 'shared') {
        acc.storeBalance += balance / 2;
        acc.transportBalance += balance / 2;
        acc.storeInterest += monthlyInterest / 2;
        acc.transportInterest += monthlyInterest / 2;
      } else {
        acc.storeBalance += balance;
        acc.storeInterest += monthlyInterest;
      }
      return acc;
    },
    { totalBalance: 0, totalMonthlyInterest: 0, storeBalance: 0, transportBalance: 0, storeInterest: 0, transportInterest: 0 }
  );
  const totalMonthlyPayment = (data.loans || []).reduce((sum, loan) => sum + (Number(loan.installmentValue) || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empréstimos e Financiamentos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Empréstimo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Saldo Devedor Total</h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {aggregates.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pagamento Mensal Total</h3>
          <p className="text-2xl font-bold text-orange-600">
            R$ {totalMonthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Juros Mensais Estimados</h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {aggregates.totalMonthlyInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Empréstimos Ativos</h3>
          <p className="text-2xl font-bold text-gray-900">{data.loans.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Loja</h3>
          <p className="text-2xl font-bold text-blue-600">
            R$ {aggregates.storeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Juros mês: R$ {aggregates.storeInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Transportadora</h3>
          <p className="text-2xl font-bold text-emerald-600">
            R$ {aggregates.transportBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Juros mês: R$ {aggregates.transportInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Parcela</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Devedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Juros Mensais</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa de Juros (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próximo Venc.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.loans.map((item) => {
              const metrics = computeLoanMetrics(item);
              const totalInstallments = Number(item.totalInstallments) || 0;
              const paidInstallments = Number(item.paidInstallments) || 0;
              const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
              const interestRate = Number(item.interestRate) || 0;
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.bank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.loanType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${metrics.origin === 'transport' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {formatOriginLabel(metrics.origin)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {Number(item.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">{paidInstallments}/{totalInstallments}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {Number(item.installmentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    R$ {metrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {metrics.monthlyInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interestRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.nextDue ? format(parseISO(item.nextDue), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.loans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum empréstimo registrado. Clique em "Adicionar Empréstimo" para começar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Editar Empréstimo' : 'Novo Empréstimo'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <input
                    type="text"
                    required
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Empréstimo</label>
                  <input
                    type="text"
                    required
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                    placeholder="Ex: Pessoal, Empresarial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {originOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.installmentValue}
                    onChange={(e) => setFormData({ ...formData, installmentValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Juros Mensal (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas Totais</label>
                  <input
                    type="number"
                    required
                    value={formData.totalInstallments}
                    onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas Pagas</label>
                  <input
                    type="number"
                    required
                    value={formData.paidInstallments}
                    onChange={(e) => setFormData({ ...formData, paidInstallments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Vencimento</label>
                  <input
                    type="date"
                    required
                    value={formData.nextDue}
                    onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
