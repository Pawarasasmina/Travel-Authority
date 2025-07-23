import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, CreditCard, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as adminApi from '../../api/adminApi';
import { debugLog } from '../../utils/debug';
import ActivityManagement from '../../components/admin/ActivityManagement';
import BookingManagement from '../../components/admin/BookingManagement';
import UserManagement from '../../components/admin/UserManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
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
        debugLog('ADMIN_DASHBOARD', 'Dashboard stats received', dashboardData);
        setStats({
          totalUsers: dashboardData.totalUsers || 0,
          totalActivities: dashboardData.totalActivities || 0,
          totalBookings: dashboardData.totalBookings || 0,
          totalRevenue: dashboardData.totalRevenue || 0
        });
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to get dashboard stats', statsResponse);
      }

      // Get users for dashboard overview
      const usersResponse = await adminApi.getAllUsers();
      if (usersResponse.status === 'OK' || usersResponse.status === '200 OK') {
        const userData = usersResponse.data || [];
        setUsers(userData);
        debugLog('ADMIN_DASHBOARD', 'Users loaded for dashboard overview', userData);
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to get users for dashboard overview', usersResponse);
      }

      // Get activities with bookings and revenue data
      const activitiesResponse = await adminApi.getAdminActivities();
      if (activitiesResponse.status === 'OK' || activitiesResponse.status === '200 OK') {
        const activitiesData = activitiesResponse.data || [];
        debugLog('ADMIN_DASHBOARD', 'Activities loaded', activitiesData);
        
        // Sort activities by revenue (highest first)
        const sortedActivities = [...activitiesData].sort((a, b) => 
          (b.revenue || 0) - (a.revenue || 0)
        );
        
        setActivities(sortedActivities);
      } else {
        debugLog('ADMIN_DASHBOARD', 'Failed to get activities', activitiesResponse);
      }

      setLoading(false);
    } catch (err: any) {
      debugLog('ADMIN_DASHBOARD', 'Error fetching dashboard data', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };
  // Removed user role management code as it's now handled by the UserManagement component
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
        {title.includes('Revenue') ? `Rs. ${value.toLocaleString()}` : value.toLocaleString()}
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
           {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<Users size={24} className="text-blue-600" />} 
                title="Total Users" 
                value={stats.totalUsers} 
                trend={5} 
              />
              <StatCard 
                icon={<Activity size={24} className="text-blue-600" />} 
                title="
                ctivities" 
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
            </div>*/}

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
                  {activities.length > 0 ? (
                    activities.slice(0, 3).map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                        <div>
                          <h3 className="font-medium text-gray-800">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{activity.bookings || 0} bookings</p>
                        </div>
                        <span className="text-green-600 font-semibold">Rs. {activity.price || 0}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No activities found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <UserManagement />
          </div>
        )}
          {/* Activities Management */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ActivityManagement />
          </div>
        )}
        
        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <BookingManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
