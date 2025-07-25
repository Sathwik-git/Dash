import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

interface StepsPanelProps {
  initialPrompt: string;
}

const StepsPanel: React.FC<StepsPanelProps> = ({ initialPrompt }) => {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Analyzing Your Request',
      description: 'Understanding your app requirements and features',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Designing Architecture',
      description: 'Planning the app structure and component hierarchy',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Generating Code',
      description: 'Creating React components with TypeScript and Tailwind',
      status: 'current'
    },
    {
      id: 4,
      title: 'Styling Interface',
      description: 'Applying beautiful design and responsive layouts',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Final Optimization',
      description: 'Performance tuning and code optimization',
      status: 'pending'
    }
  ];

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'current':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Building Your App</h2>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Your Prompt:</p>
          <p className="text-gray-200 italic">"{initialPrompt}"</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Progress Steps</h3>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-400' :
                  step.status === 'current' ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                {step.status === 'current' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <p className="text-sm text-gray-400">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="w-px h-6 bg-gray-700 ml-2.5 mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-2">AI Tips</h4>
        <p className="text-sm text-gray-300">
          Your app is being crafted with modern React patterns, responsive design, 
          and production-ready code. The process typically takes 30-60 seconds.
        </p>
      </div>
    </div>
  );
};

export default StepsPanel;