import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, CreditCard, Package, ChevronDown, ChevronUp, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as adminApi from '../../api/adminApi';
import { debugLog } from '../../utils/debug';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0
  });  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && user && user.role !== 'ADMIN') {
      navigate('/home');
    }
    
    fetchDashboardData();
  }, [isLoading, user, navigate]);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_DASHBOARD', 'Fetching admin dashboard data');

      // Get dashboard stats
      const statsResponse = await adminApi.getDashboardStats();
      if (statsResponse.status === 'OK' || statsResponse.status === '200 OK') {
        const dashboardData = statsResponse.data || {};
        setStats({
          totalUsers: dashboardData.totalUsers || 0,
          totalActivities: dashboardData.totalActivities || 0,
          totalBookings: dashboardData.totalBookings || 0,
          totalRevenue: dashboardData.totalRevenue || 0
        });
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to get dashboard stats', statsResponse);
      }

      // Get users
      const usersResponse = await adminApi.getAllUsers();
      if (usersResponse.status === 'OK' || usersResponse.status === '200 OK') {
        const userData = usersResponse.data || [];
        setUsers(userData);
        debugLog('ADMIN_DASHBOARD', 'Users loaded', userData);
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to get users', usersResponse);
        // Fallback to sample data
        setUsers([
          { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'USER' },
          { id: 3, firstName: 'Admin', lastName: 'User', email: 'admin@gmail.com', role: 'ADMIN' },
        ]);
      }

      // For activities, we're still using sample data until an activities API endpoint is created
      setActivities([
        { id: 1, title: 'Sigiriya Rock Fortress', bookings: 48, revenue: 4800 },
        { id: 2, title: 'Whale Watching', bookings: 32, revenue: 3200 },
        { id: 3, title: 'Yala Safari', bookings: 28, revenue: 2500 },
      ]);

      setLoading(false);
    } catch (err: any) {
      debugLog('ADMIN_DASHBOARD', 'Error fetching dashboard data', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };
  const handleUserRoleChange = async (userId: number, role: string) => {
    try {
      debugLog('ADMIN_DASHBOARD', `Changing user ${userId} role to ${role}`);
      
      // Call API to update user role
      const response = await adminApi.updateUserRole(userId, role);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        debugLog('ADMIN_DASHBOARD', 'User role updated successfully', response.data);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to update user role', response);
        setError(`Failed to update role: ${response.message}`);
      }
    } catch (err: any) {
      debugLog('ADMIN_DASHBOARD', 'Error updating user role', err);
      setError('Failed to update user role: ' + (err.message || 'Unknown error'));
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Render stats card
  const StatCard = ({ 
    icon, 
    title, 
    value, 
    trend 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    value: number; 
    trend: number 
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-blue-100 rounded-full">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="text-xs font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">
        {title.includes('Revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
      </p>
    </div>
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-20 px-6">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Admin'}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Manage Users
            </button>
            <button 
              onClick={() => setActiveTab('activities')}
              className={`pb-4 px-2 font-medium ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Activities
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 px-2 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<Users size={24} className="text-blue-600" />} 
                title="Total Users" 
                value={stats.totalUsers} 
                trend={5} 
              />
              <StatCard 
                icon={<Activity size={24} className="text-blue-600" />} 
                title="Active Activities" 
                value={stats.totalActivities} 
                trend={3} 
              />
              <StatCard 
                icon={<CreditCard size={24} className="text-blue-600" />} 
                title="Total Bookings" 
                value={stats.totalBookings} 
                trend={8} 
              />
              <StatCard 
                icon={<Package size={24} className="text-blue-600" />} 
                title="Total Revenue" 
                value={stats.totalRevenue} 
                trend={12} 
              />
            </div>

            {/* Recent Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Users</h2>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="text-blue-500 text-sm hover:text-blue-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {users.slice(0, 3).map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-800">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Activities */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Top Activities</h2>
                  <button 
                    onClick={() => setActiveTab('activities')}
                    className="text-blue-500 text-sm hover:text-blue-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {activities.slice(0, 3).map(activity => (
                    <div key={activity.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-800">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.bookings} bookings</p>
                      </div>
                      <span className="text-green-600 font-semibold">${activity.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Manage Users</h2>
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="mr-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Activities Management */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Activities</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
        
        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Bookings</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
