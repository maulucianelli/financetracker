import { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Pencil, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'compensado', label: 'Compensado' },
];

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  compensado: 'bg-green-100 text-green-800',
};

export default function Cheques() {
  const { data, addCheque, updateCheque, deleteCheque } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    payee: '',
    serialNumber: '',
    issueDate: '',
    clearingDate: '',
    value: 0,
    status: 'pending',
    notes: '',
  });

  const cheques = useMemo(() => data.cheques ?? [], [data.cheques]);

  const summary = useMemo(() => {
    const base = {
      totalValue: 0,
      pendingValue: 0,
      compensatedValue: 0,
      pendingCount: 0,
      compensatedCount: 0,
      nextClearing: null,
    };

    return cheques.reduce((acc, cheque) => {
      const value = Number(cheque.value) || 0;
      acc.totalValue += value;

      if (cheque.status === 'compensado') {
        acc.compensatedValue += value;
        acc.compensatedCount += 1;
      } else {
        acc.pendingValue += value;
        acc.pendingCount += 1;
        if (cheque.clearingDate) {
          const clearingDate = new Date(cheque.clearingDate);
          if (!acc.nextClearing || clearingDate < acc.nextClearing) {
            acc.nextClearing = clearingDate;
          }
        }
      }

      return acc;
    }, base);
  }, [cheques]);

  const resetForm = () => {
    setFormData({
      payee: '',
      serialNumber: '',
      issueDate: '',
      clearingDate: '',
      value: 0,
      status: 'pending',
      notes: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      value: Number(formData.value),
    };

    if (editingItem) {
      updateCheque(editingItem.id, payload);
    } else {
      addCheque(payload);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      payee: item.payee || '',
      serialNumber: item.serialNumber || '',
      issueDate: item.issueDate || '',
      clearingDate: item.clearingDate || '',
      value: item.value || 0,
      status: item.status || 'pending',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este cheque?')) {
      deleteCheque(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cheques</h1>
          <p className="text-gray-600 mt-1">
            Controle de cheques emitidos e seu status de compensação.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Registrar Cheque
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Valor Total Emitido</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1 text-yellow-600" />
            Pendentes ({summary.pendingCount})
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            R$ {summary.pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {summary.nextClearing && (
            <p className="text-xs text-gray-500 mt-1">
              Próx. desconto: {format(summary.nextClearing, 'dd/MM/yyyy')}
            </p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            Compensados ({summary.compensatedCount})
          </p>
          <p className="text-2xl font-bold text-green-600">
            R$ {summary.compensatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {cheques.length > 0
              ? (summary.totalValue / cheques.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
              : '0,00'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Série</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cheques.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.issueDate ? format(parseISO(item.issueDate), 'dd/MM/yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.clearingDate ? format(parseISO(item.clearingDate), 'dd/MM/yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.payee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.serialNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  R$ {(Number(item.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${statusStyles[item.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusOptions.find(option => option.value === item.status)?.label || item.status}
                  </span>
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
        {cheques.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum cheque registrado. Clique em &quot;Registrar Cheque&quot; para começar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Editar Cheque' : 'Novo Cheque'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinatário</label>
                  <input
                    type="text"
                    required
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Desconto</label>
                  <input
                    type="date"
                    value={formData.clearingDate}
                    onChange={(e) => setFormData({ ...formData, clearingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
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
