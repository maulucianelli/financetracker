import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { AlertTriangle, Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const { data, updateCostAllocation } = useFinance();
  const [allocation, setAllocation] = useState(data.settings?.costAllocation || { store: 50, transport: 50 });

  const handleAllocationChange = (store) => {
    const transport = 100 - store;
    setAllocation({ store, transport });
    updateCostAllocation(store, transport);
  };

  const handleClearData = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do sistema!\n\nDeseja realmente continuar?')) {
      if (confirm('Última confirmação: Todos os dados serão perdidos permanentemente!')) {
        localStorage.removeItem('financeData');
        window.location.reload();
      }
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financetrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (confirm('Importar dados? Os dados atuais serão substituídos.')) {
          localStorage.setItem('financeData', JSON.stringify(imported));
          window.location.reload();
        }
      } catch (error) {
        alert('Erro ao importar arquivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

      {/* Cost Allocation */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rateio de Custos Compartilhados</h2>
        <p className="text-sm text-gray-600 mb-4">
          Define como os custos compartilhados (origem "Compartilhado") serão divididos entre Loja e Transportadora.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loja: {allocation.store}% | Transportadora: {allocation.transport}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.store}
              onChange={(e) => handleAllocationChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-900">Loja</p>
              <p className="text-2xl font-bold text-blue-600">{allocation.store}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm font-medium text-green-900">Transportadora</p>
              <p className="text-2xl font-bold text-green-600">{allocation.transport}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Dados</h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Exportar Dados</h3>
              <p className="text-sm text-gray-600">Fazer backup de todos os dados em arquivo JSON</p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Importar Dados</h3>
              <p className="text-sm text-gray-600">Restaurar dados de um arquivo de backup</p>
            </div>
            <label className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </h3>
              <p className="text-sm text-red-700">Remove TODOS os dados permanentemente. Não pode ser desfeito!</p>
            </div>
            <button
              onClick={handleClearData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> Faça backups regulares dos seus dados. O sistema armazena tudo localmente
              no seu navegador, então limpar dados do navegador também apaga seus dados financeiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
