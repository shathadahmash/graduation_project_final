import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit } from "react-icons/fi";
import api from "../../../services/api";
import { useAuthStore } from "../../../store/useStore";

interface Group {
  id: number;
  name: string;
  description?: string;
  department: number;
  supervisor: number;
}

const GroupsManager: React.FC = () => {
  const { user } = useAuthStore();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canManage =
    user?.roles?.some((r: any) =>
      ["supervisor", "مشرف", "head", "رئيس"].some((k) =>
        (r?.role__type || r || "").toLowerCase().includes(k)
      )
    );

  // =============================
  // Load department groups
  // =============================
  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/groups/");
      const deptGroups = res.data.filter(
        (g: Group) => Number(g.department) === Number(user?.department_id)
      );
      setGroups(deptGroups);
    } catch (e) {
      console.error("Load groups error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department_id) loadGroups();
  }, [user]);

  // =============================
  // Open create modal
  // =============================
  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setOpen(true);
  };

  // =============================
  // Open edit modal
  // =============================
  const openEdit = (group: Group) => {
    setEditing(group);
    setName(group.name);
    setDescription(group.description || "");
    setOpen(true);
  };

  // =============================
  // Save (create / update)
  // =============================
  const saveGroup = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        await api.put(`/groups/${editing.id}/`, {
          name,
          description,
        });
      } else {
        await api.post("/groups/", {
          name,
          description,
          department: user?.department_id,
          supervisor: user?.id,
        });
      }
      setOpen(false);
      loadGroups();
    } catch (e) {
      console.error("Save group error", e);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black">مجموعات القسم</h1>

        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <FiPlus />
            إنشاء مجموعة
          </button>
        )}
      </div>

      {/* Groups */}
      {loading ? (
        <p>جاري التحميل...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500">لا توجد مجموعات في هذا القسم</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{g.name}</h3>

                {canManage && (
                  <button
                    onClick={() => openEdit(g)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit />
                  </button>
                )}
              </div>

              {g.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {g.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">
              {editing ? "تعديل مجموعة" : "إنشاء مجموعة"}
            </h2>

            <div className="mb-3">
              <label className="text-sm font-bold">اسم المجموعة</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-bold">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={saveGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManager;
