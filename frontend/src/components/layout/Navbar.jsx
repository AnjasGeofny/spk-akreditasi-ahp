import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { sidebarOpen, setSidebarOpen, notification } = useApp();

  return (
    <header className={`fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-20'} h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
            id="toggle-sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white">Institut Teknologi Kalimantan</h2>
            <p className="text-xs text-dark-400">Sistem Pendukung Keputusan Akreditasi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <span className="text-xs font-medium text-primary-400">LAM Teknik</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`absolute top-20 right-6 animate-slide-up z-50 px-5 py-3 rounded-xl shadow-2xl border ${
          notification.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            : notification.type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
    </header>
  );
}
