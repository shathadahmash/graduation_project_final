// Centralized table/field definitions for bulk fetches
export const TABLES = {
  projects: {
    name: 'projects',
    defaultFields: ['project_id', 'title', 'type', 'state', 'start_date', 'end_date', 'created_by']
  },
  groups: {
    name: 'groups',
    defaultFields: ['group_id', 'group_name', 'project']
  },
  users: {
    name: 'users',
    defaultFields: ['id', 'username', 'name', 'email']
  },
  academic_affiliations: {
    name: 'academic_affiliations',
    // backend model uses primary key `affiliation_id` (not `id`)
    defaultFields: ['affiliation_id', 'user_id', 'university_id', 'college_id', 'department_id', 'start_date', 'end_date']
  },
  colleges: {
    name: 'colleges',
    defaultFields: ['cid', 'name_ar', 'branch']
  },
  departments: {
    name: 'departments',
    defaultFields: ['department_id', 'name', 'college']
  }
}

export type TableKey = keyof typeof TABLES;

export default TABLES;
