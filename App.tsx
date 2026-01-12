import React from 'react';
import IModelExplainer from './components/IModelExplainer';
import OpeningDoors from './components/OpeningDoors';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900">
      <OpeningDoors>
        <div className="w-full h-full bg-slate-900 overflow-hidden">
          <IModelExplainer />
        </div>
      </OpeningDoors>
    </div>
  );
};

export default App;