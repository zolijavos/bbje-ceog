'use client';

/**
 * Tables Dashboard Client Component
 *
 * Displays table list with CRUD operations.
 * Story 4.1: Table CRUD Operations
 */

import { useState, useEffect, useCallback } from 'react';
import { logError } from '@/lib/utils/logger';
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Types
interface TableData {
  id: number;
  name: string;
  capacity: number;
  type: string;
  status: string;
  pos_x: number | null;
  pos_y: number | null;
  created_at: string;
  _count: {
    assignments: number;
  };
  assignments: Array<{
    id: number;
    seat_number: number | null;
    guest: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

interface FormData {
  name: string;
  capacity: number;
  type: string;
}

export default function TablesDashboard() {
  const { t } = useLanguage();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    capacity: 8,
    type: 'standard',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic labels using translations
  const TYPE_LABELS: Record<string, string> = {
    standard: t('standard'),
    vip: t('vip'),
    reserved: t('reserved'),
  };

  const STATUS_LABELS: Record<string, string> = {
    available: t('available'),
    full: t('full'),
    reserved: t('reserved'),
  };

  // Fetch tables
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables);
      }
    } catch (error) {
      logError('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const url = editingTable
        ? `/api/admin/tables/${editingTable.id}`
        : '/api/admin/tables';
      const method = editingTable ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || data.error || 'Error occurred');
        return;
      }

      // Success - refresh and close form
      await fetchTables();
      resetForm();
    } catch (error) {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (table: TableData) => {
    if (!confirm(`${t('confirmDeleteTable')} "${table.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tables/${table.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Error occurred during deletion');
        return;
      }

      await fetchTables();
    } catch (error) {
      alert('Network error');
    }
  };

  // Start editing
  const startEdit = (table: TableData) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      type: table.type,
    });
    setShowForm(true);
    setFormError(null);
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingTable(null);
    setFormData({ name: '', capacity: 8, type: 'standard' });
    setFormError(null);
  };

  // Calculate stats
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalOccupied = tables.reduce((sum, t) => sum + t._count.assignments, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Tables</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tables.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Capacity</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalCapacity}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Occupied Seats</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalOccupied}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Occupancy</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Table List</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          data-testid="add-table-button"
        >
          <Plus size={18} weight="duotone" className="mr-2" />
          {t('addTable')}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTable ? t('editTable') : t('createTable')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('tableName')} *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. VIP-01"
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  {t('capacity')} ({t('persons')}) *
                </label>
                <input
                  type="number"
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={1}
                  max={20}
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  {t('type')}
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="standard">{t('standard')}</option>
                  <option value="vip">{t('vip')}</option>
                  <option value="reserved">{t('reserved')}</option>
                </select>
              </div>

              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? t('submitting') : editingTable ? t('save') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tableName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('capacity')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('occupancy')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  {t('loading')}
                </td>
              </tr>
            ) : tables.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  {t('noTablesYet')}
                </td>
              </tr>
            ) : (
              tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{table.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        table.type === 'vip'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                          : table.type === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {TYPE_LABELS[table.type] || table.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.capacity} {t('persons')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            table._count.assignments >= table.capacity
                              ? 'bg-red-500'
                              : table._count.assignments > 0
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                          style={{
                            width: `${(table._count.assignments / table.capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {table._count.assignments}/{table.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        table.status === 'full'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : table.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}
                    >
                      {STATUS_LABELS[table.status] || table.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(table)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded mr-2"
                      data-testid={`edit-table-${table.id}`}
                      title={t('edit')}
                    >
                      <PencilSimple size={18} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDelete(table)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={table._count.assignments > 0}
                      data-testid={`delete-table-${table.id}`}
                      title={t('delete')}
                    >
                      <Trash size={18} weight="duotone" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Guests at each table (expandable) */}
      {tables.some(t => t._count.assignments > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Guests by Table</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables
              .filter(t => t._count.assignments > 0)
              .map((table) => (
                <div key={table.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <span className="text-sm text-gray-500">
                      {table._count.assignments}/{table.capacity}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {table.assignments.map((assignment) => (
                      <li key={assignment.id} className="text-sm text-gray-600 flex items-center">
                        {assignment.seat_number && (
                          <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">
                            #{assignment.seat_number}
                          </span>
                        )}
                        {assignment.guest.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
