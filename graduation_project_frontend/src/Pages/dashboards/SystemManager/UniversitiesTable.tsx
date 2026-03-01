import React, { useEffect, useState } from 'react';
import { universityService, University } from '../../../services/universityService';

const UniversitiesTable: React.FC = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await universityService.getUniversities();
            // debug logging from component side as well
            try { console.debug('[UniversitiesTable] fetched rows count:', (data || []).length, 'sample:', (data || []).slice(0,3)); } catch (e) {}
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
        <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold mb-4">الجامعات</h2>
            {loading ? (
                <div>جاري التحميل...</div>
            ) : (
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="text-left">ID</th>
                            <th className="text-left">اسم الجامعة</th>
                            <th className="text-left">عرض الكليات</th>
                            <th className="text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {universities.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="py-2">{u.id}</td>
                                <td className="py-2">{u.university_name}</td>
                                <td className="py-2">{(u.colleges?.length ?? 0)}</td>
                                <td className="py-2">
                                    <button className="text-yellow-600 mr-2">تعديل</button>
                                    <button className="text-rose-600" onClick={() => handleDelete(u.id)}>حذف</button>
                                </td>
                            </tr>
                        ))}
                        {universities.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-slate-500">لا توجد جامعات</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UniversitiesTable;