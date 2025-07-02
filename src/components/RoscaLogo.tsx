
import React from 'react';

const RoscaLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-peach-400 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-2xl">R</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground">DeROSCA</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Decentralized Rotating Savings and Credit Association
      </p>
    </div>
  );
};

export default RoscaLogo;
