import { useMemo, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from 'recharts';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PnlHistoryPoint } from '@shared/schema';
import { AGENT_METADATA } from '@shared/schema';
import { formatTime } from '@/lib/formatTime';

interface EquityCurveProps {
  pnlHistory: PnlHistoryPoint[];
}

interface ChartDataPoint {
  timestamp: string;
  formattedTime: string;
  [key: string]: number | string;
}

type TimeframeOption = '1H' | '4H' | '8H' | 'ALL';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function EquityCurve({ pnlHistory }: EquityCurveProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('ALL');
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const chartData = useMemo(() => {
    if (!pnlHistory || pnlHistory.length === 0) return [];
    const timestampMap = new Map<string, ChartDataPoint>();
    
    pnlHistory.forEach(point => {
      if (!timestampMap.has(point.timestamp)) {
        timestampMap.set(point.timestamp, {
          timestamp: point.timestamp,
          formattedTime: formatTime(point.timestamp),
        });
      }
      const dataPoint = timestampMap.get(point.timestamp)!;
      dataPoint[point.strategyId] = point.value;
    });
    
    return Array.from(timestampMap.values());
  }, [pnlHistory]);

  const filteredData = useMemo(() => {
    return chartData;
  }, [chartData]);

  const yAxisDomain = useMemo(() => {
    if (filteredData.length === 0) return [9900, 10100];
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    filteredData.forEach(point => {
      AGENT_METADATA.forEach(meta => {
        const value = point[meta.id];
        if (typeof value === 'number' && value > 0) {
          minVal = Math.min(minVal, value);
          maxVal = Math.max(maxVal, value);
        }
      });
    });
    
    if (minVal === Infinity || maxVal === -Infinity) {
      return [9900, 10100];
    }
    
    const range = maxVal - minVal;
    const padding = Math.max(range * 0.1, 10);
    
    return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  }, [filteredData]);

  const handleTimeframeChange = (tf: TimeframeOption) => {
    setTimeframe(tf);
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  };

  const handleBrushChange = (e: any) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      setBrushStartIndex(e.startIndex);
      setBrushEndIndex(e.endIndex);
    }
  };

  const handleZoomIn = () => {
    if (brushStartIndex === undefined || brushEndIndex === undefined) {
      const len = filteredData.length;
      const quarter = Math.floor(len / 4);
      setBrushStartIndex(quarter);
      setBrushEndIndex(len - quarter - 1);
    } else {
      const range = brushEndIndex - brushStartIndex;
      const newRange = Math.max(5, Math.floor(range * 0.7));
      const center = Math.floor((brushStartIndex + brushEndIndex) / 2);
      setBrushStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
      setBrushEndIndex(Math.min(filteredData.length - 1, center + Math.floor(newRange / 2)));
    }
  };

  const handleZoomOut = () => {
    if (brushStartIndex === undefined || brushEndIndex === undefined) return;
    
    const range = brushEndIndex - brushStartIndex;
    const newRange = Math.min(filteredData.length - 1, Math.floor(range * 1.5));
    const center = Math.floor((brushStartIndex + brushEndIndex) / 2);
    setBrushStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
    setBrushEndIndex(Math.min(filteredData.length - 1, center + Math.floor(newRange / 2)));
  };

  const handleReset = () => {
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
    setTimeframe('ALL');
  };

  const handleMouseDown = useCallback((e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsSelecting(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (isSelecting && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      const leftIndex = filteredData.findIndex(d => d.formattedTime === refAreaLeft);
      const rightIndex = filteredData.findIndex(d => d.formattedTime === refAreaRight);
      
      if (leftIndex !== -1 && rightIndex !== -1) {
        setBrushStartIndex(Math.min(leftIndex, rightIndex));
        setBrushEndIndex(Math.max(leftIndex, rightIndex));
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [refAreaLeft, refAreaRight, filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3" data-testid="chart-tooltip">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const meta = AGENT_METADATA.find(m => m.id === entry.dataKey);
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-gray-700">
                      {meta ? `${meta.name} (${meta.strategy})` : entry.dataKey}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-gray-900">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2" data-testid="chart-legend">
        {payload.map((entry: any, index: number) => {
          const meta = AGENT_METADATA.find(m => m.id === entry.dataKey);
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-700">
                {meta ? `${meta.name} (${meta.strategy})` : entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const timeframeOptions: TimeframeOption[] = ['1H', '4H', '8H', 'ALL'];

  return (
    <div className="h-full w-full bg-white p-6" data-testid="equity-curve-container">
      <div className="flex items-center justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden" data-testid="timeframe-controls">
            {timeframeOptions.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeframe === tf 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                data-testid={`button-timeframe-${tf.toLowerCase()}`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleZoomIn}
              title="Zoom In"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleZoomOut}
              title="Zoom Out"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleReset}
              title="Reset View"
              data-testid="button-zoom-reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={filteredData} 
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="formattedTime" 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              allowDataOverflow
              interval="preserveStartEnd"
              minTickGap={80}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={80}
              domain={yAxisDomain}
              allowDataOverflow={false}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#6366f1"
                fillOpacity={0.2}
              />
            )}
            
            {AGENT_METADATA.map((meta) => (
              <Line
                key={meta.id}
                type="monotone"
                dataKey={meta.id}
                stroke={meta.chartColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                animationDuration={300}
                connectNulls={true}
              />
            ))}
            
            <Brush
              dataKey="formattedTime"
              height={30}
              stroke="#9ca3af"
              fill="#f9fafb"
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              onChange={handleBrushChange}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
