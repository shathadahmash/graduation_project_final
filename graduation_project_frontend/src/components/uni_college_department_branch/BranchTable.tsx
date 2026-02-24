import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { exportToCSV } from '../tableUtils';

interface Branch {
  ubid: number;
  university: { uid: number; uname_ar: string } | null;
  city: { bid: number; bname_ar: string } | null;
  location: string | null;
  address: string | null;
  contact: string | null;
}

const BranchTable: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    university_id: '',
    city_id: '',
    location: '',
    address: '',
    contact: ''
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/branches/');
      setBranches(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({ university_id: '', city_id: '', location: '', address: '', contact: '' });
    setShowModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      university_id: branch.university?.uid.toString() || '',
      city_id: branch.city?.bid.toString() || '',
      location: branch.location || '',
      address: branch.address || '',
      contact: branch.contact || ''
    });
    setShowModal(true);
  };

  const deleteBranch = async (ubid: number) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await api.delete(`/branches/${ubid}/`);
      setBranches(branches.filter((b) => b.ubid !== ubid));
    } catch (err) {
      console.error(err);
      alert('Failed to delete branch');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingBranch) {
        const response = await api.put(`/branches/${editingBranch.ubid}/`, formData);
        setBranches(branches.map((b) => (b.ubid === editingBranch.ubid ? response.data : b)));
      } else {
        const response = await api.post('/branches/', formData);
        setBranches([...branches, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const filteredBranches = branches.filter((b) =>
    (b.university?.uname_ar.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (b.city?.bname_ar.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (b.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">إدارة الفروع</h2>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by university, city, or location..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV('branches.csv', filteredBranches)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            تصدير
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded ml-0 hover:bg-blue-600 transition"
          >
            + Add Branch
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-fixed border-collapse text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border-b">ID</th>
              <th className="px-4 py-3 border-b">University</th>
              <th className="px-4 py-3 border-b">City</th>
              <th className="px-4 py-3 border-b">Location</th>
              <th className="px-4 py-3 border-b">Address</th>
              <th className="px-4 py-3 border-b">Contact</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.map((b) => (
              <tr key={b.ubid} className="hover:bg-gray-50">
                <td className="px-4 py-2">{b.ubid}</td>
                <td className="px-4 py-2">{b.university?.uname_ar ?? '-'}</td>
                <td className="px-4 py-2">{b.city?.bname_ar ?? '-'}</td>
                <td className="px-4 py-2">{b.location ?? '-'}</td>
                <td className="px-4 py-2">{b.address ?? '-'}</td>
                <td className="px-4 py-2">{b.contact ?? '-'}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBranch(b.ubid)}
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
              {editingBranch ? 'Edit Branch' : 'Add Branch'}
            </h3>

            <input
              type="text"
              placeholder="University ID"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.university_id}
              onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
            />
            <input
              type="text"
              placeholder="City ID"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.city_id}
              onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact"
              className="border w-full px-3 py-2 rounded mb-3"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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

export default BranchTable;
