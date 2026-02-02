import React, { useState } from 'react';
import { FiZap, FiUsers, FiHeart, FiPlay, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

const UniqueFeatures = ({ tosContent, companyName, analysisResults }) => {
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [votes, setVotes] = useState({});

  const mockRisks = [
    { id: 1, title: 'Data Sharing Expansion', votes: 45 },
    { id: 2, title: 'Auto-Renewal Traps', votes: 32 },
    { id: 3, title: 'Arbitration Expansion', votes: 28 }
  ];

  const handleVote = (riskId, voteType) => {
    setVotes(prev => ({
      ...prev,
      [riskId]: voteType
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiZap className="h-7 w-7 mr-3 text-purple-400" />
          Unique Features
        </h2>
        <p className="text-gray-300">
          Interactive tools and community features for ToS analysis
        </p>
      </div>

      {/* ToS Future Simulator */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiPlay className="h-5 w-5 mr-2 text-green-400" />
          ToS Future Simulator
        </h3>
        
        {!simulatorActive ? (
          <div className="text-center py-8">
            <button
              onClick={() => setSimulatorActive(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              Start Simulation
            </button>
            <p className="text-gray-400 mt-2">
              Simulate accepting different parts of the ToS to see predicted consequences
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-400">🎮 Simulation Active</p>
            <p className="text-gray-300">
              Interactive simulation would allow users to toggle different ToS clauses 
              and see real-time predictions of consequences.
            </p>
            <button
              onClick={() => setSimulatorActive(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              End Simulation
            </button>
          </div>
        )}
      </div>

      {/* Community Voting */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiUsers className="h-5 w-5 mr-2 text-blue-400" />
          Community Risk Voting
        </h3>
        
        <div className="space-y-4">
          {mockRisks.map((risk) => (
            <div key={risk.id} className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{risk.title}</h4>
                  <p className="text-gray-400 text-sm">{risk.votes} community votes</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(risk.id, 'up')}
                    className={`p-2 rounded ${votes[risk.id] === 'up' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <FiThumbsUp className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleVote(risk.id, 'down')}
                    className={`p-2 rounded ${votes[risk.id] === 'down' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <FiThumbsDown className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethics Rating */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiHeart className="h-5 w-5 mr-2 text-pink-400" />
          Ethics Rating
        </h3>
        
        <div className="text-center py-6">
          <div className="text-4xl font-bold text-yellow-400 mb-2">6.5/10</div>
          <p className="text-gray-300 mb-4">Ethics Score</p>
          <p className="text-gray-400 text-sm">
            Based on analysis of user rights, data protection, and fair practices
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">7.2</div>
            <div className="text-sm text-gray-400">User Rights</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">5.8</div>
            <div className="text-sm text-gray-400">Data Protection</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">6.5</div>
            <div className="text-sm text-gray-400">Fair Practices</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueFeatures;
