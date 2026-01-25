import React from 'react';
import ApprovalsPanel from './ApprovalsPanel';

const ApprovalsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">الموافقات</h1>
      <ApprovalsPanel />
    </div>
  );
};

export default ApprovalsPage;