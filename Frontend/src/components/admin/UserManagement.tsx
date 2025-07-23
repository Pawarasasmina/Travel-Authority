import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Check, UserIcon } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { debugLog } from '../../utils/debug';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // User edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  
  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_USERS', 'Fetching admin users');

      const response = await adminApi.getAllUsers();
      if (response.status === 'OK' || response.status === '200 OK') {
        const userData = response.data || [];
        setUsers(userData);
        debugLog('ADMIN_USERS', 'Users loaded', userData);
      } else {
        debugLog('ADMIN_USERS', 'Failed to get users', response);
        setError('Failed to load users: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_USERS', 'Error fetching users', err);
      setError('Error loading users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      debugLog('ADMIN_USERS', `Changing user ${userId} role to ${role}`);
      
      const response = await adminApi.updateUserRole(userId, role);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        debugLog('ADMIN_USERS', 'User role updated successfully', response.data);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
        
        setSuccessMessage(`User role updated to ${role} successfully`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        debugLog('ADMIN_USERS', 'Failed to update user role', response);
        setError(`Failed to update role: ${response.message}`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      debugLog('ADMIN_USERS', 'Error updating user role', err);
      setError('Failed to update user role: ' + (err.message || 'Unknown error'));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      debugLog('ADMIN_USERS', `Updating user ${currentUser.id}`, editFormData);
      
      const response = await adminApi.editUser(currentUser.id, editFormData);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        debugLog('ADMIN_USERS', 'User updated successfully', response.data);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === currentUser.id ? { ...user, ...editFormData } : user
        ));
        
        setShowEditModal(false);
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        debugLog('ADMIN_USERS', 'Failed to update user', response);
        setError(`Failed to update user: ${response.message}`);
      }
    } catch (err: any) {
      debugLog('ADMIN_USERS', 'Error updating user', err);
      setError('Error updating user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      debugLog('ADMIN_USERS', `Deleting user ${userToDelete}`);
      
      const response = await adminApi.deleteUser(userToDelete);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        debugLog('ADMIN_USERS', 'User deleted successfully', response);
        
        // Remove user from state
        setUsers(users.filter(user => user.id !== userToDelete));
        
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        debugLog('ADMIN_USERS', 'Failed to delete user', response);
        setError(`Failed to delete user: ${response.message}`);
      }
    } catch (err: any) {
      debugLog('ADMIN_USERS', 'Error deleting user', err);
      setError('Error deleting user: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <p className="text-gray-300">Manage and organize system users</p>
                </div>
                
              </div>
              <div className="text-white text-right">
                    <div className="text-3xl font-bold">{filteredUsers.length}</div>
                    <div className="text-sm text-gray-300">Total Users</div>
                  </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Success and Error Messages */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <X className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
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
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
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
                            <div className="flex items-center space-x-3">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              <button 
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit user"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete user"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">
                              {searchTerm
                                ? "No users match your search criteria"
                                : "There are no users registered in the system"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit User</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={editFormData.firstName || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={editFormData.lastName || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={editFormData.phoneNumber || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address (optional)
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={editFormData.address || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Confirm Deletion</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
