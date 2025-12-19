'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ReasonModal from '@/components/modals/ReasonModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import WasherDetailModal from '@/components/modals/WasherDetailModal';
import CustomerDetailModal from '@/components/modals/CustomerDetailModal';
import BookingDetailModal from '@/components/modals/BookingDetailModal';
import { exportTransactionsToCSV, exportFinancialReportToCSV } from '@/lib/csvExport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiUsers, FiDollarSign, FiClipboard, FiAlertCircle, FiEye, FiTrash2, FiUserX, FiUserCheck, FiX, FiCheck, FiDownload } from 'react-icons/fi';

interface Stats {
  totalCustomers: number;
  totalWashers: number;
  totalBookings: number;
  pendingApplications: number;
  totalRevenue: number;
  recentBookings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [washers, setWashers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [reasonModal, setReasonModal] = useState<any>({ isOpen: false });
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false });
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Detail Modal states
  const [washerDetailModal, setWasherDetailModal] = useState<{ isOpen: boolean; washerId: string | null }>({ isOpen: false, washerId: null });
  const [customerDetailModal, setCustomerDetailModal] = useState<{ isOpen: boolean; customerId: string | null }>({ isOpen: false, customerId: null });
  const [bookingDetailModal, setBookingDetailModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });

  // Finance data
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [financeTab, setFinanceTab] = useState('dashboard');
  const [transactionFilters, setTransactionFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'ADMIN') {
      toast.error('Access denied');
      router.push('/login');
      return;
    }
    setUser(userData);
    loadData();
  }, [router]);

  const loadData = async () => {
    await Promise.all([
      fetchStats(),
      fetchCustomers(),
      fetchWashers(),
      fetchApplications(),
      fetchBookings(),
    ]);
  };

  const loadFinanceData = async () => {
    await Promise.all([
      fetchFinanceStats(),
      fetchTransactions(),
      fetchReports(),
    ]);
  };

  useEffect(() => {
    if (activeTab === 'finance') {
      loadFinanceData();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchWashers = async () => {
    try {
      const response = await fetch('/api/admin/washers');
      if (response.ok) {
        const data = await response.json();
        setWashers(data);
      }
    } catch (error) {
      console.error('Error fetching washers:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications?status=PENDING');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setBookings([]);
    }
  };

  const fetchFinanceStats = async () => {
    try {
      const response = await fetch('/api/admin/finance/stats');
      if (response.ok) {
        const data = await response.json();
        setFinanceStats(data);
      }
    } catch (error) {
      console.error('Error fetching finance stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (transactionFilters.startDate) params.append('startDate', transactionFilters.startDate);
      if (transactionFilters.endDate) params.append('endDate', transactionFilters.endDate);
      if (transactionFilters.status) params.append('status', transactionFilters.status);

      const response = await fetch(`/api/admin/finance/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/finance/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Refetch transactions when filters change
  useEffect(() => {
    if (activeTab === 'finance' && financeTab === 'transactions') {
      fetchTransactions();
    }
  }, [transactionFilters]);

  // Customer actions
  const handleDeactivateCustomer = (customer: any) => {
    setSelectedItem(customer);
    setReasonModal({
      isOpen: true,
      title: 'Desactivar Cliente',
      description: `¿Estás seguro de que deseas desactivar a ${customer.name}? El cliente no podrá acceder a su cuenta.`,
      onConfirm: async (reason: string) => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/customers/${customer.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false, reason }),
          });
          if (response.ok) {
            toast.success('Cliente desactivado correctamente');
            fetchCustomers();
          } else {
            toast.error('Error al desactivar cliente');
          }
        } catch (error) {
          toast.error('Error al procesar la solicitud');
        } finally {
          setLoading(false);
          setReasonModal({ isOpen: false });
        }
      },
    });
  };

  const handleActivateCustomer = async (customer: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (response.ok) {
        toast.success('Cliente activado correctamente');
        fetchCustomers();
      } else {
        toast.error('Error al activar cliente');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = (customer: any) => {
    setSelectedItem(customer);
    setReasonModal({
      isOpen: true,
      title: 'Eliminar Cliente',
      description: `¿Estás seguro de que deseas eliminar permanentemente a ${customer.name}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      onConfirm: async (reason: string) => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/customers/${customer.id}?reason=${encodeURIComponent(reason)}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            toast.success('Cliente eliminado correctamente');
            fetchCustomers();
          } else {
            toast.error('Error al eliminar cliente');
          }
        } catch (error) {
          toast.error('Error al procesar la solicitud');
        } finally {
          setLoading(false);
          setReasonModal({ isOpen: false });
        }
      },
    });
  };

  // Washer actions
  const handleDeactivateWasher = (washer: any) => {
    setSelectedItem(washer);
    setReasonModal({
      isOpen: true,
      title: 'Desactivar Lavador',
      description: `¿Estás seguro de que deseas desactivar a ${washer.name}? El lavador no podrá recibir nuevas solicitudes.`,
      onConfirm: async (reason: string) => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/washers/${washer.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false, reason }),
          });
          if (response.ok) {
            toast.success('Lavador desactivado correctamente');
            fetchWashers();
          } else {
            toast.error('Error al desactivar lavador');
          }
        } catch (error) {
          toast.error('Error al procesar la solicitud');
        } finally {
          setLoading(false);
          setReasonModal({ isOpen: false });
        }
      },
    });
  };

  const handleActivateWasher = async (washer: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/washers/${washer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (response.ok) {
        toast.success('Lavador activado correctamente');
        fetchWashers();
      } else {
        toast.error('Error al activar lavador');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Application actions
  const handleApproveApplication = (application: any) => {
    setSelectedItem(application);
    setConfirmModal({
      isOpen: true,
      type: 'success',
      title: 'Aprobar Solicitud',
      description: `¿Deseas aprobar la solicitud de ${application.fullName}? Se creará una cuenta de lavador y se enviará un email con las credenciales.`,
      confirmText: 'Aprobar',
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/applications/${application.id}/approve`, {
            method: 'POST',
          });
          if (response.ok) {
            toast.success('Solicitud aprobada. Email enviado al lavador.');
            fetchApplications();
            fetchWashers();
            fetchStats();
          } else {
            const data = await response.json();
            toast.error(data.error || 'Error al aprobar solicitud');
          }
        } catch (error) {
          toast.error('Error al procesar la solicitud');
        } finally {
          setLoading(false);
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  const handleRejectApplication = (application: any) => {
    setSelectedItem(application);
    setReasonModal({
      isOpen: true,
      title: 'Rechazar Solicitud',
      description: `¿Por qué deseas rechazar la solicitud de ${application.fullName}? El solicitante recibirá un email con el motivo.`,
      confirmText: 'Rechazar',
      onConfirm: async (reason: string) => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/applications/${application.id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });
          if (response.ok) {
            toast.success('Solicitud rechazada. Email enviado al solicitante.');
            fetchApplications();
            fetchStats();
          } else {
            toast.error('Error al rechazar solicitud');
          }
        } catch (error) {
          toast.error('Error al procesar la solicitud');
        } finally {
          setLoading(false);
          setReasonModal({ isOpen: false });
        }
      },
    });
  };

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Admin Dashboard" userName={user.name} userRole={user.role} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lavadores</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWashers}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FiClipboard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingApplications}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FiAlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'customers', label: `Clientes (${customers.length})` },
                { key: 'washers', label: `Lavadores (${washers.length})` },
                { key: 'applications', label: `Solicitudes (${applications.length})` },
                { key: 'bookings', label: 'Reservas' },
                { key: 'finance', label: 'Finanzas' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de la Plataforma</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Estadísticas de Clientes</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Total de clientes: {stats.totalCustomers}</li>
                    <li>• Clientes activos: {customers.filter(c => c.isActive).length}</li>
                    <li>• Clientes inactivos: {customers.filter(c => !c.isActive).length}</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Estadísticas de Lavadores</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Lavadores aprobados: {stats.totalWashers}</li>
                    <li>• Lavadores activos: {washers.filter(w => w.isActive).length}</li>
                    <li>• Solicitudes pendientes: {stats.pendingApplications}</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Reservas</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Total de reservas: {stats.totalBookings}</li>
                    <li>• Últimos 30 días: {stats.recentBookings}</li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Ingresos</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Comisión total: ${stats.totalRevenue.toFixed(2)}</li>
                    <li>• Porcentaje de comisión: 20%</li>
                  </ul>
                </div>
              </div>

              {stats.pendingApplications > 0 && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-orange-900">Acción Requerida</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        Tienes {stats.pendingApplications} solicitud(es) de lavador pendiente(s) de revisión.
                      </p>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Ver solicitudes →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Clientes</h2>
              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay clientes registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Reservas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer._count?.bookingsAsCustomer || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setCustomerDetailModal({ isOpen: true, customerId: customer.id })}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <FiEye className="w-5 h-5" />
                              </button>
                              {customer.isActive ? (
                                <button
                                  onClick={() => handleDeactivateCustomer(customer)}
                                  disabled={loading}
                                  className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                  title="Desactivar"
                                >
                                  <FiUserX className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateCustomer(customer)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Activar"
                                >
                                  <FiUserCheck className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCustomer(customer)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Eliminar"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* WASHERS TAB */}
          {activeTab === 'washers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Lavadores</h2>
              {washers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay lavadores aprobados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lavador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trabajos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {washers.map((washer) => (
                        <tr key={washer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{washer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{washer.email}</div>
                            <div className="text-sm text-gray-500">{washer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">{washer.rating.toFixed(1)}</span>
                              <span className="text-yellow-400 ml-1">★</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {washer.totalJobs}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              washer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {washer.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(washer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setWasherDetailModal({ isOpen: true, washerId: washer.id })}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <FiEye className="w-5 h-5" />
                              </button>
                              {washer.isActive ? (
                                <button
                                  onClick={() => handleDeactivateWasher(washer)}
                                  disabled={loading}
                                  className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                  title="Desactivar"
                                >
                                  <FiUserX className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateWasher(washer)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Reactivar"
                                >
                                  <FiUserCheck className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitudes Pendientes</h2>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">✓</div>
                  <p className="text-gray-500">No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{app.fullName}</h3>
                          <p className="text-sm text-gray-600">{app.email} • {app.phone}</p>
                          <p className="text-sm text-gray-600">
                            {app.street}, {app.city}, {app.state} {app.zipCode}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                          PENDIENTE
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Información del Negocio</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {app.businessName && <li>• Negocio: {app.businessName}</li>}
                            <li>• Tipo: {app.serviceType}</li>
                            <li>• Experiencia: {app.yearsExperience} años</li>
                            <li>• Descripción: {app.description}</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Documentos</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • ID: <a href={app.idDocument} target="_blank" className="text-blue-600 hover:underline">Ver</a>
                            </li>
                            <li>
                              • Seguro: <a href={app.insuranceProof} target="_blank" className="text-blue-600 hover:underline">Ver</a>
                            </li>
                            {app.vehiclePhoto && (
                              <li>
                                • Vehículo: <a href={app.vehiclePhoto} target="_blank" className="text-blue-600 hover:underline">Ver</a>
                              </li>
                            )}
                            {app.businessLogo && (
                              <li>
                                • Logo: <a href={app.businessLogo} target="_blank" className="text-blue-600 hover:underline">Ver</a>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-orange-300">
                        <button
                          onClick={() => handleRejectApplication(app)}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4 mr-2" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApproveApplication(app)}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <FiCheck className="w-4 h-4 mr-2" />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Reservas</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📋</div>
                  <p className="text-gray-500">No hay reservas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      onClick={() => setBookingDetailModal({ isOpen: true, bookingId: booking.id })}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{booking.service?.name || 'Servicio'}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Cliente: {booking.customer?.name || 'N/A'}</p>
                            {booking.washer && <p>Lavador: {booking.washer.name}</p>}
                            <p>Fecha: {new Date(booking.scheduledFor).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-xl font-bold text-gray-900">${booking.totalAmount}</p>
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión Financiera</h2>

              {/* Finance Sub-tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                  {[
                    { key: 'dashboard', label: 'Dashboard' },
                    { key: 'transactions', label: 'Transacciones' },
                    { key: 'reports', label: 'Reportes' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFinanceTab(tab.key)}
                      className={`py-3 px-6 border-b-2 font-medium text-sm transition ${
                        financeTab === tab.key
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Finance Dashboard */}
              {financeTab === 'dashboard' && financeStats && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-blue-600 mb-2">Este Mes</h4>
                      <p className="text-2xl font-bold text-blue-900">${financeStats.thisMonth.revenue.toFixed(2)}</p>
                      <p className="text-sm text-blue-700 mt-1">Comisión: ${financeStats.thisMonth.commission.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-green-600 mb-2">Últimos 3 Meses</h4>
                      <p className="text-2xl font-bold text-green-900">${financeStats.last3Months.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-700 mt-1">Comisión: ${financeStats.last3Months.commission.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-purple-600 mb-2">Este Año</h4>
                      <p className="text-2xl font-bold text-purple-900">${financeStats.thisYear.revenue.toFixed(2)}</p>
                      <p className="text-sm text-purple-700 mt-1">Comisión: ${financeStats.thisYear.commission.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-orange-600 mb-2">Total Histórico</h4>
                      <p className="text-2xl font-bold text-orange-900">${financeStats.allTime.revenue.toFixed(2)}</p>
                      <p className="text-sm text-orange-700 mt-1">Comisión: ${financeStats.allTime.commission.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes (Últimos 12 meses)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={financeStats.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Ingresos" />
                        <Bar dataKey="commission" fill="#10B981" name="Comisión" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pending Payments */}
                  {financeStats.pendingPayments.count > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagos Pendientes a Lavadores</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Total pendiente: <span className="font-bold">${financeStats.pendingPayments.total.toFixed(2)}</span> ({financeStats.pendingPayments.count} pagos)
                      </p>
                      <div className="space-y-2">
                        {financeStats.pendingPayments.byWasher.map((item: any) => (
                          <div key={item.washerId} className="flex justify-between items-center bg-white rounded p-3">
                            <span className="text-sm font-medium text-gray-900">{item.washerName}</span>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">${item.totalPending.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{item.count} pago(s)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions */}
              {financeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                        <input
                          type="date"
                          value={transactionFilters.startDate}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                        <input
                          type="date"
                          value={transactionFilters.endDate}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={transactionFilters.status}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Todos</option>
                          <option value="COMPLETED">Completado</option>
                          <option value="PENDING">Pendiente</option>
                          <option value="PROCESSING">Procesando</option>
                          <option value="FAILED">Fallido</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => exportTransactionsToCSV(transactions)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                          <FiDownload className="mr-2" />
                          Exportar CSV
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transactions List */}
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No hay transacciones</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lavador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.paidAt ? format(new Date(transaction.paidAt), 'dd MMM yyyy', { locale: es }) : 'Pendiente'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.customer?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.washer?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.booking?.service?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${transaction.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                ${transaction.platformFee.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Reports */}
              {financeTab === 'reports' && reports && (
                <div className="space-y-6">
                  {/* Top Washers */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Top 10 Lavadores por Ganancias</h3>
                      <button
                        onClick={() => exportFinancialReportToCSV(reports.topWashers, 'topWashers')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FiDownload className="mr-1" />
                        Exportar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganancias</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reports.topWashers.map((washer: any, index: number) => (
                            <tr key={washer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{washer.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {washer.rating ? washer.rating.toFixed(1) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{washer.totalJobs}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                ${washer.totalEarnings.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Customers */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Top 10 Clientes por Gasto</h3>
                      <button
                        onClick={() => exportFinancialReportToCSV(reports.topCustomers, 'topCustomers')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FiDownload className="mr-1" />
                        Exportar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gastado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reports.topCustomers.map((customer: any, index: number) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalBookings}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                                ${customer.totalSpent.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Popular Services */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Servicios Más Populares</h3>
                      <button
                        onClick={() => exportFinancialReportToCSV(reports.popularServices, 'popularServices')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FiDownload className="mr-1" />
                        Exportar
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Reservas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reports.popularServices.map((service: any) => (
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${service.basePrice.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.totalBookings}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                ${service.revenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReasonModal
        isOpen={reasonModal.isOpen}
        onClose={() => setReasonModal({ isOpen: false })}
        onConfirm={reasonModal.onConfirm}
        title={reasonModal.title}
        description={reasonModal.description}
        confirmText={reasonModal.confirmText}
        loading={loading}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        loading={loading}
      />

      {/* Detail Modals */}
      {washerDetailModal.washerId && (
        <WasherDetailModal
          isOpen={washerDetailModal.isOpen}
          onClose={() => setWasherDetailModal({ isOpen: false, washerId: null })}
          washerId={washerDetailModal.washerId}
          onDeactivate={(id) => {
            setWasherDetailModal({ isOpen: false, washerId: null });
            const washer = washers.find(w => w.id === id);
            if (washer) handleDeactivateWasher(washer);
          }}
        />
      )}

      {customerDetailModal.customerId && (
        <CustomerDetailModal
          isOpen={customerDetailModal.isOpen}
          onClose={() => setCustomerDetailModal({ isOpen: false, customerId: null })}
          customerId={customerDetailModal.customerId}
          onDeactivate={(id) => {
            setCustomerDetailModal({ isOpen: false, customerId: null });
            const customer = customers.find(c => c.id === id);
            if (customer) handleDeactivateCustomer(customer);
          }}
          onDelete={(id) => {
            setCustomerDetailModal({ isOpen: false, customerId: null });
            const customer = customers.find(c => c.id === id);
            if (customer) handleDeleteCustomer(customer);
          }}
        />
      )}

      {bookingDetailModal.bookingId && (
        <BookingDetailModal
          isOpen={bookingDetailModal.isOpen}
          onClose={() => setBookingDetailModal({ isOpen: false, bookingId: null })}
          bookingId={bookingDetailModal.bookingId}
        />
      )}
    </div>
  );
}
