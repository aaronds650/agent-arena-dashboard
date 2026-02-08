import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  engineStatus: string;
}

export function Header({ engineStatus }: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between gap-6" data-testid="header">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight" data-testid="text-dashboard-title">
          AI Crypto Arena
        </h1>
      </div>
      
      <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-medium" data-testid="badge-engine-status">
        Engine Status: {engineStatus}
      </Badge>
    </header>
  );
}
