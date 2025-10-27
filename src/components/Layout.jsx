import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Truck,
  Store,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Settings as SettingsIcon,
  Receipt
} from 'lucide-react';
import { useState } from 'react';

const menuSections = [
  {
    title: 'Análises',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dre', icon: BarChart3, label: 'DRE (Lucros)' },
      { path: '/cash-flow', icon: FileText, label: 'Fluxo de Caixa' },
    ],
  },
  {
    title: 'Gestão Operacional',
    items: [
      { path: '/revenues', icon: Store, label: 'Receitas' },
      { path: '/accounts-payable', icon: FileText, label: 'Contas a Pagar' },
      { path: '/cheques', icon: Receipt, label: 'Cheques' },
      { path: '/loans', icon: CreditCard, label: 'Empréstimos' },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { path: '/settings', icon: SettingsIcon, label: 'Configurações' },
    ],
  },
  {
    title: 'Histórico (Legado)',
    items: [
      { path: '/monthly-resume', icon: Calendar, label: 'Resumo Mensal' },
      { path: '/transport-costs', icon: Truck, label: 'Custos Transportadora' },
      { path: '/store-costs', icon: Store, label: 'Custos Loja' },
      { path: '/consolidated', icon: BarChart3, label: 'Relatório Consolidado' },
    ],
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-white">FinanceTrack</h1>
            </div>
            <nav className="mt-8 flex-1 space-y-6 px-2">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-white">FinanceTrack</h1>
                </div>
                <nav className="mt-8 flex-1 space-y-6 px-2">
                  {menuSections.map((section) => (
                    <div key={section.title}>
                      <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                isActive
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">FinanceTrack</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
