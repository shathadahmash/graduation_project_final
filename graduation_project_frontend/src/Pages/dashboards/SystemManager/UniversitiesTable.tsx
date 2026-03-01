import React, { useEffect, useState } from 'react';
import { universityService, University } from '../../../services/universityService';

const UniversitiesTable: React.FC = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await universityService.getUniversities();
            setUniversities(data as any[]);
            setLoading(false);
        })();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await universityService.deleteUniversity(id);
            setUniversities(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            console.error(e);
            alert('فشل الحذف');
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">الجامعات</h2>
            {loading ? (
                <div className="text-center py-6 text-lg">جاري التحميل...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-center">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">ID</th>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">اسم الجامعة</th>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">نوع الجامعة</th>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">عدد الكليات</th>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">المدينة</th>
                                <th className="px-6 py-3 border border-gray-300 font-semibold">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {universities.map(u => (
                                <tr key={u.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border border-gray-300">{u.uid}</td>
                                    <td className="px-6 py-4 border border-gray-300">{u.uname_ar}</td>
                                    <td className="px-6 py-4 border border-gray-300">{u.type}</td>
                                    <td className="px-6 py-4 border border-gray-300">{u.colleges?.length ?? 0}</td>
                                    <td className="px-6 py-4 border border-gray-300">{u.city}</td>
                                    <td className="px-6 py-4 border border-gray-300">
                                        <div className="flex justify-center gap-3">
                                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition">
                                                تعديل
                                            </button>
                                            <button
                                                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded transition"
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {universities.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500 border border-gray-300">
                                        لا توجد جامعات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UniversitiesTable;