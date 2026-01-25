import axios from 'axios';

export interface DeanStats {
  projects: number;
  supervisors: number;
  coSupervisors: number;
  groups: number;
  pendingApprovals: number;
  users: number;
}

export const getDeanStats = async (deanUser: any): Promise<DeanStats> => {
  try {
    console.log('Fetching dean stats from backend...');
    console.log('Dean user:', deanUser);

    const response = await axios.get('/api/dean-stats/');
    const stats = response.data;

    console.log('Dean stats received:', stats);
    console.log('Response status:', response.status);

    return {
      projects: stats.projects || 0,
      supervisors: stats.supervisors || 0,
      coSupervisors: stats.coSupervisors || 0,
      groups: stats.groups || 0,
      pendingApprovals: stats.pendingApprovals || 0,
      users: stats.users || 0
    };

  } catch (error: any) {
    console.error('Error fetching dean stats:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return {
      projects: 0,
      supervisors: 0,
      coSupervisors: 0,
      groups: 0,
      pendingApprovals: 0,
      users: 0
    };
  }
};