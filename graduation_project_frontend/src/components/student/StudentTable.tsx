// import React, { useEffect, useState } from 'react';
// import api, { ROLES } from '../services/api';

// interface Student {
//   id: number;
//   username: string;
//   name: string;
//   email: string;
//   phone: string | null;
//   roles: string[];
// }

// const StudentTable: React.FC = () => {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');
//   const [editingStudent, setEditingStudent] = useState<Student | null>(null);
//   const [newStudent, setNewStudent] = useState<Partial<Student>>({ roles: [ROLES.STUDENT] });
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [showAddForm, setShowAddForm] = useState<boolean>(false);

//   // Fetch students
//   const fetchStudents = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/users/');
//       const studentList: Student[] = response.data.filter((u: Student) =>
//         u.roles.includes(ROLES.STUDENT)
//       );
//       setStudents(studentList);
//     } catch (err: any) {
//       console.error(err);
//       setError('Failed to fetch students');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   // Delete student
//   const deleteStudent = async (id: number) => {
//     if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
//     try {
//       await api.delete(`/users/${id}/`);
//       fetchStudents();
//     } catch (err) {
//       console.error(err);
//       alert('Failed to delete student');
//     }
//   };

//   // Add or Update student
//   const saveStudent = async () => {
//     try {
//       if (editingStudent) {
//         await api.put(`/users/${editingStudent.id}/`, editingStudent);
//         setEditingStudent(null);
//       } else {
//         // Create new user
//         const { data: createdUser } = await api.post('/users/', {
//           ...newStudent,
//           password: 'defaultpassword123',
//         });

//         // Assign the student role
//         await api.post('/user-roles/', {
//           user_id: createdUser.id,
//           role_id: 1,
//         });

//         setNewStudent({ roles: [ROLES.STUDENT] });
//         setShowAddForm(false);
//       }
//       fetchStudents();
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save student');
//     }
//   };

//   // Filter students
//   const filteredStudents = students.filter(
//     (s) =>
//       s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       s.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) return <div className="text-center p-10">Loading...</div>;
//   if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-center">Student Management</h2>

//       {/* Add Student Button */}
//       <div className="mb-4 text-right">
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {showAddForm ? 'Close Form' : 'Add Student'}
//         </button>
//       </div>

//       {/* Add Student Form */}
//       {showAddForm && (
//         <div className="mb-6 p-4 bg-white rounded shadow">
//           <div className="flex gap-2 flex-wrap">
//             <input
//               type="text"
//               placeholder="Username"
//               className="border px-2 py-1 rounded w-40"
//               value={newStudent.username || ''}
//               onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Name"
//               className="border px-2 py-1 rounded w-48"
//               value={newStudent.name || ''}
//               onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               className="border px-2 py-1 rounded w-48"
//               value={newStudent.email || ''}
//               onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Phone"
//               className="border px-2 py-1 rounded w-36"
//               value={newStudent.phone || ''}
//               onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
//             />
//             <button
//               onClick={saveStudent}
//               className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search by username or name..."
//           className="border px-3 py-2 rounded w-full md:w-1/3"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Students Table */}
//       <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
//         <table className="min-w-full table-fixed border-collapse">
//           <thead className="bg-blue-600 text-white">
//             <tr>
//               <th className="px-4 py-3 text-center border-b">ID</th>
//               <th className="px-4 py-3 text-center border-b">Username</th>
//               <th className="px-4 py-3 text-center border-b">Name</th>
//               <th className="px-4 py-3 text-center border-b">Email</th>
//               <th className="px-4 py-3 text-center border-b">Phone</th>
//               <th className="px-4 py-3 text-center border-b">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredStudents.map((student) => (
//               <tr key={student.id} className="hover:bg-blue-50">
//                 <td className="px-4 py-2 text-center">{student.id}</td>
//                 <td className="px-4 py-2 text-center">{student.username}</td>
//                 <td className="px-4 py-2 text-center">{student.name}</td>
//                 <td className="px-4 py-2 text-center">{student.email || '-'}</td>
//                 <td className="px-4 py-2 text-center">{student.phone || '-'}</td>
//                 <td className="px-4 py-2 flex justify-center gap-2">
//                   <button
//                     className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
//                     onClick={() => setEditingStudent(student)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                     onClick={() => deleteStudent(student.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Edit Modal */}
//       {editingStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
//           <div className="bg-white p-6 rounded shadow-lg w-96">
//             <h3 className="font-bold mb-2">Edit Student</h3>
//             <input
//               type="text"
//               placeholder="Username"
//               className="border px-2 py-1 rounded w-full mb-2"
//               value={editingStudent.username}
//               onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Name"
//               className="border px-2 py-1 rounded w-full mb-2"
//               value={editingStudent.name}
//               onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               className="border px-2 py-1 rounded w-full mb-2"
//               value={editingStudent.email || ''}
//               onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
//             />
//             <input
//               type="text"
//               placeholder="Phone"
//               className="border px-2 py-1 rounded w-full mb-4"
//               value={editingStudent.phone || ''}
//               onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 className="px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
//                 onClick={() => setEditingStudent(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//                 onClick={saveStudent}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useEffect, useState } from 'react';
import api, { ROLES } from '../../services/api';

interface Student {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
}

const StudentTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ roles: [ROLES.STUDENT] });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      const studentList: Student[] = response.data.filter((u: Student) =>
        u.roles.includes(ROLES.STUDENT)
      );
      setStudents(studentList);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await api.delete(`/users/${id}/`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete student');
    }
  };

  const saveStudent = async () => {
    try {
      if (editingStudent) {
        await api.put(`/users/${editingStudent.id}/`, editingStudent);
        setEditingStudent(null);
      } else {
        const { data: createdUser } = await api.post('/users/', {
          ...newStudent,
          password: 'defaultpassword123',
        });

        await api.post('/user-roles/', {
          user_id: createdUser.id,
          role_id: 1,
        });

        setNewStudent({ roles: [ROLES.STUDENT] });
        setShowAddForm(false);
      }
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert('Failed to save student');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Student Management</h2>

      {/* Add Student Button */}
      <div className="mb-4 text-right">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          {showAddForm ? 'Close Form' : 'Add Student'}
        </button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded shadow">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Username"
              className="border px-2 py-1 rounded w-40"
              value={newStudent.username || ''}
              onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
            />
            <input
              type="text"
              placeholder="Name"
              className="border px-2 py-1 rounded w-48"
              value={newStudent.name || ''}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border px-2 py-1 rounded w-48"
              value={newStudent.email || ''}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="border px-2 py-1 rounded w-36"
              value={newStudent.phone || ''}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
            <button
              onClick={saveStudent}
              className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-1 rounded transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or name..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-center border-b">ID</th>
              <th className="px-4 py-3 text-center border-b">Username</th>
              <th className="px-4 py-3 text-center border-b">Name</th>
              <th className="px-4 py-3 text-center border-b">Email</th>
              <th className="px-4 py-3 text-center border-b">Phone</th>
              <th className="px-4 py-3 text-center border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{student.id}</td>
                <td className="px-4 py-2 text-center">{student.username}</td>
                <td className="px-4 py-2 text-center">{student.name}</td>
                <td className="px-4 py-2 text-center">{student.email || '-'}</td>
                <td className="px-4 py-2 text-center">{student.phone || '-'}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 px-2 py-1 rounded transition"
                    onClick={() => setEditingStudent(student)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-200 hover:bg-red-300 text-gray-800 px-2 py-1 rounded transition"
                    onClick={() => deleteStudent(student.id)}
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
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="font-bold mb-2 text-gray-800">Edit Student</h3>
            <input
              type="text"
              placeholder="Username"
              className="border px-2 py-1 rounded w-full mb-2"
              value={editingStudent.username}
              onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
            />
            <input
              type="text"
              placeholder="Name"
              className="border px-2 py-1 rounded w-full mb-2"
              value={editingStudent.name}
              onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border px-2 py-1 rounded w-full mb-2"
              value={editingStudent.email || ''}
              onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="border px-2 py-1 rounded w-full mb-4"
              value={editingStudent.phone || ''}
              onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                onClick={() => setEditingStudent(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-blue-300 text-white hover:bg-blue-400 transition"
                onClick={saveStudent}
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

export default StudentTable;

