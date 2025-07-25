import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#2d2d30] border-b border-[#2d2d30] px-4 lg:px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#cccccc] hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
          <div className="h-6 w-px bg-[#6e6e6e] hidden sm:block"></div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-[#007acc]" />
            <h1 className="text-lg lg:text-xl font-semibold text-[#cccccc]">AI-Powered App Builder Website</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="px-2 lg:px-3 py-1 bg-[#4caf50]/20 text-[#4caf50] rounded text-xs lg:text-sm font-medium">
            Building...
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;