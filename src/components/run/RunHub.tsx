import { useState } from 'react';
import RunLog from './RunLog';
import IntervalTimer from './IntervalTimer';
import GamePlan from './GamePlan';
import SubTabs from '../ui/SubTabs';

type Sub = 'log' | 'timer' | 'plan';

export default function RunHub() {
  const [sub, setSub] = useState<Sub>('log');
  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={(s) => setSub(s as Sub)}
        tabs={[
          { id: 'log', label: 'Log' },
          { id: 'timer', label: 'Interval Timer' },
          { id: 'plan', label: 'Game Plan' }
        ]}
      />
      {sub === 'log' && <RunLog />}
      {sub === 'timer' && <IntervalTimer />}
      {sub === 'plan' && <GamePlan />}
    </div>
  );
}
