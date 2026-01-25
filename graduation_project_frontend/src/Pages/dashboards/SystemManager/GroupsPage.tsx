import React from 'react';
import GroupTable from '../../../components/GroupTable';

const GroupsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">المجموعات</h2>
      <GroupTable />
    </div>
  );
};

export default GroupsPage;
