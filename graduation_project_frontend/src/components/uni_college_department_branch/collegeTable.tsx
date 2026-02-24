// export default CollegeTable;
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { exportToCSV } from '../tableUtils';

interface College {
  cid: number;
  name_ar: string;
  name_en: string | null;
  branch: { ubid: number; location: string } | null;
}


// fatima

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    branch_id: ''
  });

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/colleges/');
      setColleges(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const openAddModal = () => {
    setEditingCollege(null);
    setFormData({ name_ar: '', name_en: '', branch_id: '' });
    setShowModal(true);
  };

  const openEditModal = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name_ar: college.name_ar,
      name_en: college.name_en || '',
      branch_id: college.branch?.ubid.toString() || ''
    });
    setShowModal(true);
  };

  const deleteCollege = async (cid: number) => {
    if (!window.confirm('Are you sure you want to delete this college?')) return;
    try {
      await api.delete(`/colleges/${cid}/`);
      setColleges(colleges.filter((c) => c.cid !== cid));
    } catch (err) {
      console.error(err);
      alert('Failed to delete college');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCollege) {
        const response = await api.put(`/colleges/${editingCollege.cid}/`, formData);
        setColleges(colleges.map((c) => (c.cid === editingCollege.cid ? response.data : c)));
      } else {
        const response = await api.post('/colleges/', formData);
        setColleges([...colleges, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const filteredColleges = colleges.filter((c) =>
    (c.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (c.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">إدارة الجامعات
        
      </h2>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by Arabic or English name..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV('colleges.csv', filteredColleges)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            تصدير
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-0 hover:bg-blue-600 transition"
          >
            + Add College
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-fixed border-collapse text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">الاسم بالعربي</th>
              <th className="px-4 py-3 border-b">الاسم بالانجليزي</th>
              <th className="px-4 py-3 border-b">Branch</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredColleges.map((c) => (
              <tr key={c.cid} className="hover:bg-gray-50">
                <td className="px-4 py-2">{c.cid}</td>
                <td className="px-4 py-2">{c.name_ar}</td>
                <td className="px-4 py-2">{c.name_en ?? '-'}</td>
                <td className="px-4 py-2">{c.branch?.location ?? '-'}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCollege(c.cid)}
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
              {editingCollege ? 'Edit College' : 'Add College'}
            </h3>

            <input
              type="text"
              placeholder="Arabic Name"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            />
            <input
              type="text"
              placeholder="English Name"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            />
            <input
              type="text"
              placeholder="Branch ID"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
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

export default CollegeTable;
