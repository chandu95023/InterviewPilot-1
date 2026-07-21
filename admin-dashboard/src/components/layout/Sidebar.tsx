import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Interview Questions', path: '/admin/questions' },
  { name: 'Company Questions', path: '/admin/company-questions' },
  { name: 'Coding Challenges', path: '/admin/coding' },
  { name: 'Aptitude', path: '/admin/aptitude' },
  { name: 'Study Plans', path: '/admin/study-plans' },
  { name: 'Career Roadmaps', path: '/admin/career-roadmaps' },
  { name: 'Resume Rules', path: '/admin/resume-rules' },
  { name: 'Voice Prompts', path: '/admin/voice-prompts' },
  { name: 'AI Prompts', path: '/admin/ai-prompts' },
  { name: 'Analytics', path: '/admin/analytics' },
  { name: 'Notifications', path: '/admin/notifications' },
  { name: 'Settings', path: '/admin/settings' },
  { name: 'Logs', path: '/admin/logs' },
  { name: 'Backups', path: '/admin/backups' },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-width duration-300 flex flex-col p-4`}>
      <h2 className="text-xl font-bold mb-6">Admin</h2>
      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block py-2 px-3 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
