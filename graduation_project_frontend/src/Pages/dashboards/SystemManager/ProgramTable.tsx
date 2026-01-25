import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { exportToCSV } from '../../../components/tableUtils';
import { useAuthStore } from '../../../store/useStore';
import { userService } from '../../../services/userService';

interface Program {
  pid: number;
  p_name: string;
  department: { department_id: number; name: string } | null;
}

const ProgramTable: React.FC = () => {
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const [formData, setFormData] = useState({
    p_name: '',
    department_id: ''
  });

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      // First fetch affiliations to get dean's college
      const affiliations = await userService.getAffiliations();
      const deanAff = affiliations.find((a: any) => a.id === user?.affiliation);
      const deanCollegeId = deanAff?.college;

      const response = await api.get('programs/');
      const allPrograms = response.data;

      // Fetch departments to filter by college
      const departments = await userService.getDepartments();
      const filteredPrograms = deanCollegeId ? allPrograms.filter((p: any) => {
        const dept = departments.find((d: any) => d.department_id === p.department?.department_id);
        return dept && dept.college === deanCollegeId;
      }) : allPrograms;

      setPrograms(filteredPrograms);
    } catch (err) {
      console.error(err);
      console.log(api.defaults.headers.common);
      setError('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openAddModal = () => {
    setEditingProgram(null);
    setFormData({ p_name: '', department_id: '' });
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      p_name: program.p_name,
      department_id: program.department?.department_id.toString() || ''
    });
    setShowModal(true);
  };

  const deleteProgram = async (pid: number) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${pid}/`);
      setPrograms(programs.filter((p) => p.pid !== pid));
    } catch (err) {
      console.error(err);
      alert('Failed to delete program');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProgram) {
        const response = await api.put(`/programs/${editingProgram.pid}/`, formData);
        setPrograms(programs.map((p) => (p.pid === editingProgram.pid ? response.data : p)));
      } else {
        const response = await api.post('/programs/', formData);
        setPrograms([...programs, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const filteredPrograms = programs.filter((p) =>
    (p.p_name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (p.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">إدارة اللاقسام </h2>

      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by program name or department..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV('programs.csv', filteredPrograms)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            تصدير
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            + Add Program
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-fixed border-collapse text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">Program Name</th>
              <th className="px-4 py-3 border-b">Department</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((p) => (
              <tr key={p.pid} className="hover:bg-gray-50">
                <td className="px-4 py-2">{p.pid}</td>
                <td className="px-4 py-2">{p.p_name}</td>
                <td className="px-4 py-2">{p.department?.name ?? '-'}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProgram(p.pid)}
                    className="bg-red-200 hover:bg-red-300 text-gray-800 px-3 py-1 rounded transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingProgram ? 'Edit Program' : 'Add Program'}
            </h3>

            <input
              type="text"
              placeholder="Program Name"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.p_name}
              onChange={(e) => setFormData({ ...formData, p_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department ID"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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

export default ProgramTable;


