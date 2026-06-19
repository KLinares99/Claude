import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TrainingZones from './components/TrainingZones';
import TrainingPlans from './components/TrainingPlans';
import Nutrition from './components/Nutrition';
import Recovery from './components/Recovery';
import ScienceHub from './components/ScienceHub';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'zones': return <TrainingZones />;
      case 'plans': return <TrainingPlans />;
      case 'nutrition': return <Nutrition />;
      case 'recovery': return <Recovery />;
      case 'science': return <ScienceHub />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderTab()}
      </main>
    </div>
  );
}
