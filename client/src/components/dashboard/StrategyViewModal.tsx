import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { AssetMathSignal } from '@shared/schema';
import { AGENT_METADATA } from '@shared/schema';

function getRowColorClasses(strategyId: string): string {
  if (strategyId.startsWith('Grok')) {
    if (strategyId === 'Grok_Ichimoku') return 'bg-gray-900/20 border-l-4 border-gray-900';
    if (strategyId === 'Grok_Pattern') return 'bg-orange-500/20 border-l-4 border-orange-500';
    return 'bg-red-700/20 border-l-4 border-red-700';
  }
  if (strategyId.startsWith('OpenAI')) {
    if (strategyId === 'OpenAI_Pattern') return 'bg-violet-500/20 border-l-4 border-violet-500';
    return 'bg-green-700/20 border-l-4 border-green-700';
  }
  if (strategyId.startsWith('Gemini')) {
    if (strategyId === 'Gemini_Pattern') return 'bg-cyan-500/20 border-l-4 border-cyan-500';
    return 'bg-blue-700/20 border-l-4 border-blue-700';
  }
  return 'bg-gray-100/20 border-l-4 border-gray-300';
}

interface StrategyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: string | null;
  assetMathGrid: AssetMathSignal[];
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getZScoreColor(zScore: number): string {
  if (zScore <= -2) return 'text-green-600 bg-green-50';
  if (zScore <= -1) return 'text-green-500 bg-green-50';
  if (zScore >= 2) return 'text-red-600 bg-red-50';
  if (zScore >= 1) return 'text-red-500 bg-red-50';
  return 'text-gray-600 bg-gray-50';
}

function getZScoreLabel(zScore: number): string {
  if (zScore <= -2) return 'Strong Buy';
  if (zScore <= -1) return 'Buy Signal';
  if (zScore >= 2) return 'Strong Sell';
  if (zScore >= 1) return 'Sell Signal';
  return 'Neutral';
}

function getSlopeColor(slope: number): string {
  if (slope > 0.03) return 'text-green-600';
  if (slope > 0) return 'text-green-500';
  if (slope < -0.03) return 'text-red-600';
  if (slope < 0) return 'text-red-500';
  return 'text-gray-600';
}

function getVwapColor(vwapDist: number): string {
  if (vwapDist <= -2) return 'text-green-600';
  if (vwapDist >= 2) return 'text-red-600';
  return 'text-gray-600';
}

export function StrategyViewModal({ isOpen, onClose, asset, assetMathGrid }: StrategyViewModalProps) {
  // Defensive: ensure array is defined before calling find
  const safeGrid = assetMathGrid || [];
  const assetData = safeGrid.find(a => a.asset === asset);
  
  if (!assetData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white" data-testid="modal-strategy-view">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-bold text-gray-900" data-testid="text-modal-title">
                {asset} - Math Grid Analysis
              </DialogTitle>
              <Badge variant="secondary" className="font-mono" data-testid="badge-asset-price">
                {formatPrice(assetData.price)}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          <div className="grid grid-cols-3 gap-6 mb-8" data-testid="asset-metrics-grid">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Z-Score</div>
              <div className={`text-3xl font-mono font-bold ${getZScoreColor(assetData.zScore).split(' ')[0]}`} data-testid="text-zscore-value">
                {assetData.zScore.toFixed(2)}
              </div>
              <Badge className={`mt-2 ${getZScoreColor(assetData.zScore)}`} data-testid="badge-zscore-label">
                {getZScoreLabel(assetData.zScore)}
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Slope</div>
              <div className={`text-3xl font-mono font-bold ${getSlopeColor(assetData.slope)}`} data-testid="text-slope-value">
                {assetData.slope >= 0 ? '+' : ''}{assetData.slope.toFixed(4)}
              </div>
              <span className="text-xs text-gray-500 mt-2 block">
                {assetData.slope > 0 ? 'Upward Momentum' : assetData.slope < 0 ? 'Downward Momentum' : 'Flat'}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">VWAP Distance</div>
              <div className={`text-3xl font-mono font-bold ${getVwapColor(assetData.vwapDist)}`} data-testid="text-vwap-value">
                {assetData.vwapDist >= 0 ? '+' : ''}{assetData.vwapDist.toFixed(2)}%
              </div>
              <span className="text-xs text-gray-500 mt-2 block">
                {assetData.vwapDist < 0 ? 'Below VWAP' : 'Above VWAP'}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Strategy Signals for {asset}
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden" data-testid="strategy-signals-table">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Strategy</th>
                    <th className="text-center px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Signal Interpretation</th>
                    <th className="text-center px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {AGENT_METADATA.map((meta) => {
                    const signal = getZScoreLabel(assetData.zScore);
                    const confidence = Math.min(100, Math.abs(assetData.zScore) * 40 + Math.abs(assetData.slope) * 500);
                    const rowClasses = getRowColorClasses(meta.id);
                    
                    return (
                      <tr key={meta.id} className={`${rowClasses} hover:opacity-80 transition-opacity`} data-testid={`row-strategy-signal-${meta.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: meta.chartColor }}
                            />
                            <span className="text-sm font-medium text-gray-900">{meta.name} ({meta.strategy})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={getZScoreColor(assetData.zScore)}>
                            {signal}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-600">{confidence.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
