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
          {/* Header Section - Improved with better alignment */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-white/20 rounded-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <p className="text-gray-300 mt-1">Manage and organize system users</p>
                </div>
              </div>
              <div className="text-white text-right bg-black/30 px-6 py-3 rounded-lg">
                <div className="text-3xl font-bold">{filteredUsers.length}</div>
                <div className="text-sm text-gray-300">Total Users</div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section - Enhanced with better spacing */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              </div>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
              </div>
            </div>
          </div>

          {/* Success and Error Messages - Improved styling */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-1 mr-3">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-medium">{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="hover:bg-green-100 p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-1 mr-3">
                  <X className="w-4 h-4" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Users Table - Improved with card-based layout */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                {/* Desktop View - Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                              {user.phoneNumber && <div className="text-xs text-gray-500 mt-1">{user.phoneNumber}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {user.role === 'ADMIN' && (
                                  <svg className="mr-1.5 h-2 w-2 text-purple-700" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                )}
                                {user.role}
                              </span>
                            </td>
                            <td className="px-62 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                >
                                  <option value="USER">User</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                                <button 
                                  onClick={() => handleEdit(user)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Edit user"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(user.id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
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
                              <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <UserIcon className="w-10 h-10 text-gray-400" />
                              </div>
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
                
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div key={user.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                            <p className="text-gray-600 text-sm">{user.email}</p>
                            {user.phoneNumber && <p className="text-gray-500 text-sm mt-1">{user.phoneNumber}</p>}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {user.role === 'ADMIN' && (
                              <svg className="mr-1.5 h-2 w-2 text-purple-700" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                            )}
                            {user.role}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 mt-3 flex justify-between items-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit user"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <UserIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">
                          {searchTerm
                            ? "No users match your search criteria"
                            : "There are no users registered in the system"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal - Improved with better layout and styling */}
      {showEditModal && currentUser && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Edit className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit User Details</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={editFormData.firstName || ''}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={editFormData.lastName || ''}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={editFormData.phoneNumber || ''}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Street address, city, country"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal - Improved with better styling and visuals */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user from the system.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
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
