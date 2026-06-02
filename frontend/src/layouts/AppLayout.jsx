import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useApp } from '../context/AppContext';

export default function AppLayout() {
  const { sidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <Navbar />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'} pt-16`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
