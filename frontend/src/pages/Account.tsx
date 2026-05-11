import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User, Lock, MapPin, CheckCircle } from 'lucide-react';

type Tab = 'profile' | 'password' | 'address';

export default function Account() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Address form
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zip, setZip] = useState(user?.address?.zip || '');
  const [country, setCountry] = useState(user?.address?.country || 'US');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      const res = await authApi.updateProfile({ name, email });
      updateUser(res.data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Update failed';
      setProfileError(message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Password update failed';
      setPasswordError(message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError('');
    setAddressSuccess(false);
    try {
      const res = await authApi.updateProfile({ address: { street, city, state, zip, country } });
      updateUser(res.data.user);
      setAddressSuccess(true);
      setTimeout(() => setAddressSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Address update failed';
      setAddressError(message || 'Address update failed');
    } finally {
      setAddressLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password', label: 'Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your profile, password, and shipping address.</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white border border-gray-200 rounded-2xl">
        <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.role === 'admin' && (
            <span className="mt-1 inline-block text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Admin</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
            {profileSuccess && (
              <p className="text-green-700 text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Profile updated successfully
              </p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition text-sm"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-green-700 text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Password updated successfully
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition text-sm"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Address tab */}
      {tab === 'address' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main St"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="NY"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                </select>
              </div>
            </div>
            {addressError && <p className="text-red-600 text-sm">{addressError}</p>}
            {addressSuccess && (
              <p className="text-green-700 text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Address saved successfully
              </p>
            )}
            <button
              type="submit"
              disabled={addressLoading}
              className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition text-sm"
            >
              {addressLoading ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
