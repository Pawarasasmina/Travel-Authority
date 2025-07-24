import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as adminApi from '../../api/adminApi';
import { debugLog } from '../../utils/debug';
import OwnerActivityManagement from '../../components/admin/OwnerActivityManagement';
import OwnerOfferManagement from '../../components/admin/OwnerOfferManagement';

const TravelOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    ownerActivities: 0,
    ownerOffers: 0,
    selectedOffers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is a travel activity owner
    if (!isLoading && user && user.role !== 'TRAVEL_ACTIVITY_OWNER') {
      navigate('/home');
    }
    
    fetchDashboardData();
  }, [isLoading, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      debugLog('OWNER_DASHBOARD', 'Fetching travel owner dashboard data');

      // Get dashboard stats
      const statsResponse = await adminApi.getTravelOwnerStats();
      if (statsResponse.status === 'OK' || statsResponse.status === '200 OK') {
        const dashboardData = statsResponse.data || {};
        debugLog('OWNER_DASHBOARD', 'Dashboard stats received', dashboardData);
        setStats({
          ownerActivities: dashboardData.ownerActivities || 0,
          ownerOffers: dashboardData.ownerOffers || 0,
          selectedOffers: dashboardData.selectedOffers || 0
        });
      } else {
        debugLog('OWNER_DASHBOARD', 'Failed to get dashboard stats', statsResponse);
      }

      setLoading(false);
    } catch (err: any) {
      debugLog('OWNER_DASHBOARD', 'Error fetching dashboard data', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Render stats card
  const StatCard = ({ 
    icon, 
    title, 
    value 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    value: number;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-green-100 rounded-full">
          {icon}
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
        {/* Owner Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Travel Activity Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Owner'}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('activities')}
              className={`pb-4 px-2 font-medium ${activeTab === 'activities' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Activities
            </button>
            <button 
              onClick={() => setActiveTab('offers')}
              className={`pb-4 px-2 font-medium ${activeTab === 'offers' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Offers
            </button>
          </nav>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                icon={<Activity size={24} className="text-green-600" />} 
                title="Your Activities" 
                value={stats.ownerActivities} 
              />
              <StatCard 
                icon={<Package size={24} className="text-green-600" />} 
                title="Your Offers" 
                value={stats.ownerOffers} 
              />
              <StatCard 
                icon={<Package size={24} className="text-green-600" />} 
                title="Selected for Homepage" 
                value={stats.selectedOffers} 
              />
            </div>

            {/* Welcome Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Travel Activity Owner Guide</h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Manage Your Activities</h3>
                  <p className="text-green-700">Create and manage travel activities that customers can book through our platform.</p>
                  <button 
                    onClick={() => setActiveTab('activities')}
                    className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Go to activities →
                  </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Create Special Offers</h3>
                  <p className="text-blue-700">Create special discounts and promotions for your travel activities.</p>
                  <button 
                    onClick={() => setActiveTab('offers')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Manage your offers →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Management */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <OwnerActivityManagement />
          </div>
        )}
        
        {/* Offers Management */}
        {activeTab === 'offers' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <OwnerOfferManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelOwnerDashboard;
