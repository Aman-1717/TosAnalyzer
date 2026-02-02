import React, { useState } from 'react';
import { FiBell, FiMail, FiCheck, FiSettings } from 'react-icons/fi';

const UserImpactAlerts = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiBell className="h-7 w-7 mr-3 text-yellow-400" />
          User Impact Alerts
        </h2>
        <p className="text-gray-300">
          Get notified when ToS changes or new risk predictions are available
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        {!subscribed ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Subscribe for Alerts</h3>
            <div className="flex space-x-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Subscribe
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Subscribed Successfully!</h3>
            <p className="text-gray-400">You'll receive alerts about ToS changes and risk predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserImpactAlerts;
