import React, { useEffect, useState } from 'react';
import { roleService, Role, Permission as RPermission } from '../services/roleService';
import { userService } from '../services/userService';
import { containerClass, tableWrapperClass, tableClass } from './tableStyles';
import { FiPlus, FiTrash2, FiCheck, FiX, FiSearch } from 'react-icons/fi';

const PermissionsTable: React.FC = () => {
	const [permissions, setPermissions] = useState<RPermission[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [permToRoles, setPermToRoles] = useState<Record<number, Role[]>>({});
	const [loading, setLoading] = useState(false);
	const [visibleRows, setVisibleRows] = useState<number>(10);
	const [newName, setNewName] = useState('');
	const [newDesc, setNewDesc] = useState('');
	const [assignRole, setAssignRole] = useState<Record<number, number>>({});

	const fetchAll = async () => {
		try {
			setLoading(true);
			const [perms, rls, rolePerms] = await Promise.all([
				roleService.getAllPermissions(),
				userService.getAllRoles(),
				roleService.getAllRolePermissions(),
			]);
			setPermissions(perms || []);
			setRoles(rls || []);

			const mapping: Record<number, Role[]> = {};
			(rolePerms || []).forEach((rp: any) => {
				const pid = rp.permission ?? rp.permission_id ?? rp.permission?.perm_ID ?? rp.permission_detail?.perm_ID;
				const role = rp.role_detail || rp.role || rp.role_id || rp.role;
				const roleObj: Role = role && role.role_ID ? { role_ID: role.role_ID, type: role.type, role_type: role.role_type } : { role_ID: rp.role ?? rp.role_id, type: rp.role_detail?.type ?? rp.role?.type ?? String(rp.role ?? rp.role_id) } as any;
				const permId = Number(pid);
				if (!permId) return;
				mapping[permId] = mapping[permId] || [];
				// avoid duplicates
				if (!mapping[permId].some(r => r.role_ID === roleObj.role_ID)) mapping[permId].push(roleObj);
			});
			setPermToRoles(mapping);
		} catch (err) {
			console.error('Failed to fetch permissions/roles', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchAll(); }, []);

	const handleCreate = async () => {
		if (!newName.trim()) return alert('الرجاء إدخال اسم الصلاحية');
		try {
			await roleService.createPermission({ name: newName.trim(), Description: newDesc.trim() });
			setNewName(''); setNewDesc('');
			await fetchAll();
		} catch (err) {
			console.error('Create permission failed', err);
			alert('فشل إنشاء الصلاحية');
		}
	};

	const handleDelete = async (permId: number) => {
		if (!confirm('هل تريد حذف هذه الصلاحية؟')) return;
		try {
			await roleService.deletePermission(permId);
			await fetchAll();
		} catch (err) {
			console.error('Delete permission failed', err);
			alert('فشل حذف الصلاحية');
		}
	};

	const handleAssign = async (permId: number) => {
		const roleId = assignRole[permId];
		if (!roleId) return alert('اختر دوراً للتعيين');
		try {
			await roleService.assignPermissionToRole(roleId, permId);
			// update local mapping
			setPermToRoles(prev => ({
				...prev,
				[permId]: [...(prev[permId] || []), roles.find(r => r.id === roleId)!]
			}));
			alert('تم تعيين الصلاحية إلى الدور');
		} catch (err) {
			console.error('Assign failed', err);
			alert('فشل التعيين');
		}
	};

	const handleUnassign = async (roleId: number, permId: number) => {
		if (!confirm('هل تريد إزالة هذه الصلاحية من الدور؟')) return;
		try {
			await roleService.removePermissionFromRole(roleId, permId);
			setPermToRoles(prev => ({
				...prev,
				[permId]: (prev[permId] || []).filter(r => r.id !== roleId)
			}));
		} catch (err) {
			console.error('Unassign failed', err);
			alert('فشل إزالة الصلاحية');
		}
	};

	return (
		<div className={containerClass} dir="rtl">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<div>
					<h1 className="text-3xl font-black text-slate-800">إدارة الصلاحيات</h1>
					<p className="text-slate-500 mt-1">إنشاء الصلاحيات وتعيينها للأدوار</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="relative">
						<FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input placeholder="ابحث عن صلاحية..." className="pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-1">
					<div className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-100 sticky top-24">
						<h3 className="text-xl font-black mb-2">إضافة صلاحية جديدة</h3>
						<div className="space-y-4">
							<div>
								<label className="text-xs font-black text-slate-400">اسم الصلاحية</label>
								<input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-xl" />
							</div>
							<div>
								<label className="text-xs font-black text-slate-400">الوصف (اختياري)</label>
								<textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-xl" />
							</div>
							<button onClick={handleCreate} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2">
								<FiPlus /> إضافة صلاحية
							</button>
						</div>
					</div>
				</div>

				<div className="lg:col-span-2">
					<div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
						<div className={tableWrapperClass}>
							<table className={tableClass + ' text-right'}>
								<thead>
									<tr className="bg-slate-50 border-b border-slate-100">
										<th className="px-8 py-5 text-xs font-black text-blue-50 uppercase">المعرف</th>
										<th className="px-8 py-5 text-xs font-black text-blue-50 uppercase">اسم الصلاحية</th>
										<th className="px-8 py-5 text-xs font-black text-blue-50 uppercase">الوصف</th>
										<th className="px-8 py-5 text-xs font-black text-blue-50 uppercase text-center">الإجراءات</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-50">
									{loading ? (
										<tr><td colSpan={4} className="px-8 py-20 text-center">جاري التحميل...</td></tr>
									) : permissions.length ? (
										permissions.slice(0, visibleRows).map(p => (
											<tr key={(p as any).perm_ID || (p as any).id} className="hover:bg-slate-50/50">
												<td className="px-8 py-6">#{(p as any).perm_ID ?? (p as any).id}</td>
												<td className="px-8 py-6 font-black text-slate-800">{p.name}</td>
												<td className="px-8 py-6">{p.Description || '-'}</td>
												<td className="px-8 py-6">
													<div className="flex flex-col gap-2 items-center">
														<div className="flex flex-wrap gap-2 justify-center">
															{(permToRoles[(p as any).perm_ID] || []).map(r => (
																<span key={r.id} className="px-3 py-1 rounded-full bg-slate-100 text-sm flex items-center gap-2">
																	<span>{r.type}</span>
																	<button onClick={() => handleUnassign(r.id, (p as any).perm_ID)} className="text-rose-600" title="إزالة">×</button>
																</span>
															))}
														</div>
														<div className="flex gap-2 mt-2">
															<select value={assignRole[(p as any).perm_ID] || ''} onChange={e => setAssignRole(prev => ({ ...prev, [(p as any).perm_ID]: Number(e.target.value) }))} className="px-3 py-2 rounded-lg border text-sm">
																<option value="">تعيين إلى دور...</option>
																{roles.map(r => <option key={r.id} value={r.id}>{r.type}</option>)}
															</select>
															<button onClick={() => handleAssign((p as any).perm_ID)} className="bg-emerald-500 text-white px-3 py-2 rounded">تعيين</button>
															<button onClick={() => handleDelete((p as any).perm_ID)} className="text-rose-600 px-3 py-2 rounded">حذف</button>
														</div>
													</div>
												</td>
											</tr>
										))
									) : (
										<tr><td colSpan={4} className="px-8 py-20 text-center">لا توجد صلاحيات بعد</td></tr>
									)}
								</tbody>
							</table>
						</div>
						{/* show more/less controls */}
						{!loading && permissions.length > visibleRows && (
							<div className="mt-4 flex justify-center">
								<button onClick={() => setVisibleRows(v => v + 10)} className="px-4 py-2 bg-white border rounded">عرض المزيد ({permissions.length - visibleRows} متبقي)</button>
							</div>
						)}
						{!loading && visibleRows > 10 && (
							<div className="mt-2 flex justify-center">
								<button onClick={() => setVisibleRows(10)} className="text-sm text-slate-500 underline">عرض أقل</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PermissionsTable;
