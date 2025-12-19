/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

/**
 * Convert an array of objects to CSV format
 */
export function jsonToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create CSV data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle dates
      if (value instanceof Date) {
        return value.toISOString();
      }

      // Handle objects (stringify them)
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      // Handle strings with commas, quotes, or newlines
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file to browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    URL.revokeObjectURL(url);
  }
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(transactions: any[], filename?: string): void {
  const csvData = transactions.map(t => ({
    ID: t.id,
    Fecha: t.paidAt ? new Date(t.paidAt).toLocaleDateString('es') : 'Pendiente',
    Cliente: t.customer?.name || 'N/A',
    'Email Cliente': t.customer?.email || 'N/A',
    Lavador: t.washer?.name || 'N/A',
    'Email Lavador': t.washer?.email || 'N/A',
    Servicio: t.booking?.service?.name || 'N/A',
    Monto: t.amount,
    Propina: t.tip,
    'Comisión Plataforma': t.platformFee,
    'Pago Lavador': t.washerAmount,
    Estado: t.status,
    'Método de Pago': t.paymentMethod || 'N/A',
  }));

  const csv = jsonToCSV(csvData);
  const defaultFilename = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
}

/**
 * Export washers to CSV
 */
export function exportWashersToCSV(washers: any[], filename?: string): void {
  const csvData = washers.map(w => ({
    ID: w.id,
    Nombre: w.name,
    Email: w.email,
    Teléfono: w.phone || 'N/A',
    Estado: w.isActive ? 'Activo' : 'Inactivo',
    Aprobado: w.isApproved ? 'Sí' : 'No',
    Rating: w.rating || 'N/A',
    'Trabajos Totales': w.totalJobs || 0,
    'Fecha de Registro': new Date(w.createdAt).toLocaleDateString('es'),
  }));

  const csv = jsonToCSV(csvData);
  const defaultFilename = `lavadores_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: any[], filename?: string): void {
  const csvData = customers.map(c => ({
    ID: c.id,
    Nombre: c.name,
    Email: c.email,
    Teléfono: c.phone || 'N/A',
    Estado: c.isActive ? 'Activo' : 'Inactivo',
    'Total Reservas': c._count?.bookingsAsCustomer || 0,
    'Fecha de Registro': new Date(c.createdAt).toLocaleDateString('es'),
  }));

  const csv = jsonToCSV(csvData);
  const defaultFilename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
}

/**
 * Export bookings to CSV
 */
export function exportBookingsToCSV(bookings: any[], filename?: string): void {
  const csvData = bookings.map(b => ({
    ID: b.id,
    Fecha: new Date(b.scheduledFor).toLocaleDateString('es'),
    Cliente: b.customer?.name || 'N/A',
    Lavador: b.washer?.name || 'N/A',
    Servicio: b.service?.name || 'N/A',
    Precio: b.price,
    Propina: b.tip,
    Total: b.totalAmount,
    Estado: b.status,
    'Fecha Creación': new Date(b.createdAt).toLocaleDateString('es'),
  }));

  const csv = jsonToCSV(csvData);
  const defaultFilename = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
}

/**
 * Export financial reports to CSV
 */
export function exportFinancialReportToCSV(data: any, reportType: string, filename?: string): void {
  let csvData: any[] = [];
  let defaultFilename = `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`;

  switch (reportType) {
    case 'topWashers':
      csvData = data.map((w: any) => ({
        Nombre: w.name,
        Email: w.email,
        Rating: w.rating || 'N/A',
        'Trabajos Totales': w.totalJobs,
        'Ganancias Totales': w.totalEarnings,
      }));
      defaultFilename = `top_lavadores_${new Date().toISOString().split('T')[0]}.csv`;
      break;

    case 'topCustomers':
      csvData = data.map((c: any) => ({
        Nombre: c.name,
        Email: c.email,
        'Total Reservas': c.totalBookings,
        'Total Gastado': c.totalSpent,
      }));
      defaultFilename = `top_clientes_${new Date().toISOString().split('T')[0]}.csv`;
      break;

    case 'popularServices':
      csvData = data.map((s: any) => ({
        Servicio: s.name,
        Tipo: s.type,
        'Precio Base': s.basePrice,
        'Total Reservas': s.totalBookings,
        'Ingresos Totales': s.revenue,
      }));
      defaultFilename = `servicios_populares_${new Date().toISOString().split('T')[0]}.csv`;
      break;

    case 'revenueByMonth':
      csvData = data.map((m: any) => ({
        Mes: m.month,
        'Ingresos Totales': m.revenue,
        Comisión: m.commission,
      }));
      defaultFilename = `ingresos_mensuales_${new Date().toISOString().split('T')[0]}.csv`;
      break;

    default:
      csvData = data;
  }

  const csv = jsonToCSV(csvData);
  downloadCSV(csv, filename || defaultFilename);
}
