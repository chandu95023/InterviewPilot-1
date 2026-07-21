import React from 'react';

export const AdminFooter = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center py-2 text-sm text-gray-600 dark:text-gray-300">
      © {new Date().getFullYear()} InterviewPilot Admin Portal. All rights reserved.
    </footer>
  );
};
