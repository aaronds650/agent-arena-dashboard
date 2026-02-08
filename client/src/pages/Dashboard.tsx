import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { DetailTabs } from '@/components/dashboard/DetailTabs';
import { StrategyViewModal } from '@/components/dashboard/StrategyViewModal';
import { DashboardSkeleton, ErrorState } from '@/components/dashboard/LoadingState';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { GripHorizontal } from 'lucide-react';

export default function Dashboard() {
  const { data: liveData, isLoading, error, refetch } = useRealtimeData('auto');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartHeight, setChartHeight] = useState(60);
  const [isDragging, setIsDragging] = useState(false);

  const displayData = liveData;

  const handleAssetClick = (asset: string) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('dashboard-content');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      const clampedPercentage = Math.max(20, Math.min(80, percentage));
      setChartHeight(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isLoading && !liveData) {
    return <DashboardSkeleton />;
  }

  if (error && !liveData) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!displayData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="dashboard-container">
      <Header engineStatus={displayData.engineStatus} />
      
      <div id="dashboard-content" className="flex-1 flex flex-col overflow-hidden">
        <div 
          style={{ height: `${chartHeight}%` }} 
          className="min-h-0 border-b border-gray-200"
          data-testid="panel-equity-curve"
        >
          <EquityCurve pnlHistory={displayData.pnlHistory} />
        </div>
        
        <div
          className={`h-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-row-resize transition-colors ${isDragging ? 'bg-gray-300' : ''}`}
          onMouseDown={handleMouseDown}
          data-testid="resize-handle"
        >
          <GripHorizontal className="h-4 w-4 text-gray-400" />
        </div>
        
        <div 
          style={{ height: `calc(${100 - chartHeight}% - 0.5rem)` }}
          className="min-h-0 overflow-hidden"
          data-testid="panel-detail-tabs"
        >
          <DetailTabs 
            positions={displayData.livePositions}
            decisionLog={displayData.decisionLog}
            tradeHistory={displayData.tradeHistory}
            leaderboard={displayData.leaderboard}
            onAssetClick={handleAssetClick}
          />
        </div>
      </div>
      
      <StrategyViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        asset={selectedAsset}
        assetMathGrid={displayData.assetMathGrid}
      />
    </div>
  );
}
