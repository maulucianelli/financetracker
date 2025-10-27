import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function MonthlyResume() {
  const { data, addMonthlyResume, updateMonthlyResume, deleteMonthlyResume } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    month: '',
    storeRevenue: 0,
    transportRevenue: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    loanPayments: 0,
  });

  const resetForm = () => {
    setFormData({
      month: '',
      storeRevenue: 0,
      transportRevenue: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      loanPayments: 0,
    });
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalEntries = Number(formData.storeRevenue) + Number(formData.transportRevenue);
    const totalExits = Number(formData.fixedExpenses) + Number(formData.variableExpenses) + Number(formData.loanPayments);
    const profit = totalEntries - totalExits;

    const item = {
      ...formData,
      storeRevenue: Number(formData.storeRevenue),
      transportRevenue: Number(formData.transportRevenue),
      fixedExpenses: Number(formData.fixedExpenses),
      variableExpenses: Number(formData.variableExpenses),
      loanPayments: Number(formData.loanPayments),
      totalEntries,
      totalExits,
      profit,
    };

    if (editingItem) {
      updateMonthlyResume(editingItem.id, item);
    } else {
      addMonthlyResume(item);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      month: item.month,
      storeRevenue: item.storeRevenue,
      transportRevenue: item.transportRevenue,
      fixedExpenses: item.fixedExpenses,
      variableExpenses: item.variableExpenses,
      loanPayments: item.loanPayments,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteMonthlyResume(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Resumo Financeiro Mensal</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Registro
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entradas Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entradas Transp.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Entradas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Saídas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro/Prejuízo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.monthlyResume.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {item.storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {item.transportRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  R$ {item.totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {item.totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            ))}
          </tbody>
        </table>
        {data.monthlyResume.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum registro encontrado. Clique em "Adicionar Registro" para começar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Editar Registro' : 'Novo Registro'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entradas Loja (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.storeRevenue}
                    onChange={(e) => setFormData({ ...formData, storeRevenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entradas Transportadora (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.transportRevenue}
                    onChange={(e) => setFormData({ ...formData, transportRevenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Despesas Fixas (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.fixedExpenses}
                    onChange={(e) => setFormData({ ...formData, fixedExpenses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Despesas Variáveis (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.variableExpenses}
                    onChange={(e) => setFormData({ ...formData, variableExpenses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento Empréstimos (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.loanPayments}
                    onChange={(e) => setFormData({ ...formData, loanPayments: e.target.value })}
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
