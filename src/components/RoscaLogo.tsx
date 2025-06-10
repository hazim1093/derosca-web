
import React from 'react';

const RoscaLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-2xl">R</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">ROSCA</h1>
      <p className="text-gray-600 text-center max-w-md">
        Decentralized Rotating Savings and Credit Association
      </p>
    </div>
  );
};

export default RoscaLogo;
