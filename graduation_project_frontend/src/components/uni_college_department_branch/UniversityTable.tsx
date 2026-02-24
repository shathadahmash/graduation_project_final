import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { exportToCSV } from '../tableUtils';

interface University {
  uid: number;
  uname_ar: string;
  uname_en: string | null;
  type: string;
}

const UniversityTable: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);

  const [formData, setFormData] = useState({
    uname_ar: '',
    uname_en: '',
    type: ''
  });

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/universities/');
      setUniversities(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const openAddModal = () => {
    setEditingUniversity(null);
    setFormData({ uname_ar: '', uname_en: '', type: '' });
    setShowModal(true);
  };

  const openEditModal = (uni: University) => {
    setEditingUniversity(uni);
    setFormData({
      uname_ar: uni.uname_ar,
      uname_en: uni.uname_en || '',
      type: uni.type
    });
    setShowModal(true);
  };

  const deleteUniversity = async (uid: number) => {
    if (!window.confirm('Are you sure you want to delete this university?')) return;
    try {
      await api.delete(`/universities/${uid}/`);
      setUniversities(universities.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error(err);
      alert('Failed to delete university');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUniversity) {
        const response = await api.put(`/universities/${editingUniversity.uid}/`, formData);
        setUniversities(
          universities.map((u) => (u.uid === editingUniversity.uid ? response.data : u))
        );
      } else {
        const response = await api.post('/universities/', formData);
        setUniversities([...universities, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const filteredUniversities = universities.filter((u) =>
    (u.uname_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (u.uname_en?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">إدارة الجامعات  </h2>

      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by Arabic or English name..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV('universities.csv', filteredUniversities)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            تصدير
          </button>
          <button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
          >
            + Add University
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
              <th className="px-4 py-3 border-b">النوع</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUniversities.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50">
                <td className="px-4 py-2">{u.uid}</td>
                <td className="px-4 py-2">{u.uname_ar}</td>
                <td className="px-4 py-2">{u.uname_en ?? '-'}</td>
                <td className="px-4 py-2">{u.type}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(u)}
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUniversity(u.uid)}
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
              {editingUniversity ? 'Edit University' : 'Add University'}
            </h3>

            <input
              type="text"
              placeholder="Arabic Name"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.uname_ar}
              onChange={(e) => setFormData({ ...formData, uname_ar: e.target.value })}
            />

            <input
              type="text"
              placeholder="English Name"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.uname_en}
              onChange={(e) => setFormData({ ...formData, uname_en: e.target.value })}
            />

            <input
              type="text"
              placeholder="Type"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
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

export default UniversityTable;
