

// export default DepartmentTable;
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { exportToCSV } from '../tableUtils';

interface College {
  cid: number;
  name_ar: string;
}

interface Department {
  department_id: number;
  college: number; 
  name: string;
  description: string | null;
  college_name?: string; 
}

const DepartmentTable: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments/');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments');
    }
    setLoading(false);
  };

  const fetchColleges = async () => {
    try {
      const res = await api.get('/colleges/');
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchColleges();
  }, []);

  const deleteDepartment = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await api.delete(`/departments/${id}/`);
      fetchDepartments();
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const saveDepartment = async () => {
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.department_id}/`, editingDepartment);
        setEditingDepartment(null);
      } else {
        await api.post('/departments/', newDepartment);
        setNewDepartment({});
        setShowAddForm(false);
      }
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert('Failed to save department');
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">إدارة الاقسام</h2>

      {/* Add Department Button */}
      <div className="mb-4 text-right flex items-center justify-end gap-2">
        <button
          onClick={() => exportToCSV('departments.csv', filteredDepartments)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          تصدير
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showAddForm ? 'Close Form' : 'Add Department'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white rounded shadow">
          <div className="flex gap-2 flex-wrap">
            <select
              className="border px-2 py-1 rounded w-48"
              value={newDepartment.college || ''}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, college: Number(e.target.value) })
              }
            >
              <option value="">Select College</option>
              {colleges.map((col) => (
                <option key={col.cid} value={col.cid}>
                  {col.name_ar}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Department Name"
              className="border px-2 py-1 rounded w-48"
              value={newDepartment.name || ''}
              onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Description"
              className="border px-2 py-1 rounded w-60"
              value={newDepartment.description || ''}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, description: e.target.value })
              }
            />

            <button
              onClick={saveDepartment}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-fixed border-collapse text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">College</th>
              <th className="px-4 py-3 border-b">Description</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDepartments.map((d) => (
              <tr key={d.department_id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{d.department_id}</td>
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">{d.college_name || d.college}</td>
                <td className="px-4 py-2">{d.description || '-'}</td>

                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-2 py-1 rounded transition"
                    onClick={() => setEditingDepartment(d)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-200 hover:bg-red-300 text-gray-800 px-2 py-1 rounded transition"
                    onClick={() => deleteDepartment(d.department_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">

            <h3 className="font-bold mb-2 text-gray-800">Edit Department</h3>

            <select
              className="border px-2 py-1 rounded w-full mb-2"
              value={editingDepartment.college}
              onChange={(e) =>
                setEditingDepartment({
                  ...editingDepartment,
                  college: Number(e.target.value),
                })
              }
            >
              {colleges.map((col) => (
                <option key={col.cid} value={col.cid}>
                  {col.name_ar}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="border px-2 py-1 rounded w-full mb-2"
              value={editingDepartment.name}
              onChange={(e) =>
                setEditingDepartment({ ...editingDepartment, name: e.target.value })
              }
            />

            <input
              type="text"
              className="border px-2 py-1 rounded w-full mb-4"
              value={editingDepartment.description || ''}
              onChange={(e) =>
                setEditingDepartment({
                  ...editingDepartment,
                  description: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                onClick={() => setEditingDepartment(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={saveDepartment}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentTable;
