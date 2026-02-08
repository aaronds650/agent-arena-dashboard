import { Play, Pause, SkipBack, SkipForward, FastForward, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  currentIndex: number;
  totalSnapshots: number;
  playbackSpeed: number;
  currentTimestamp: number | null;
  onPlayPause: () => void;
  onGoLive: () => void;
  onSeek: (index: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: number) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'America/Denver'
  });
}

export function PlaybackControls({
  isPlaying,
  isLive,
  currentIndex,
  totalSnapshots,
  playbackSpeed,
  currentTimestamp,
  onPlayPause,
  onGoLive,
  onSeek,
  onStepBack,
  onStepForward,
  onSpeedChange,
}: PlaybackControlsProps) {
  const speeds = [0.5, 1, 2, 4];
  
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200" data-testid="playback-controls">
      <div className="flex items-center gap-1">
        <History className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Playback</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onStepBack}
              disabled={totalSnapshots < 2 || (!isLive && currentIndex === 0)}
              data-testid="button-step-back"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous snapshot</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onPlayPause}
              disabled={isLive || totalSnapshots < 2}
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onStepForward}
              disabled={isLive || currentIndex >= totalSnapshots - 1}
              data-testid="button-step-forward"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next snapshot</TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex-1 px-4 max-w-md">
        <Slider
          value={[currentIndex]}
          min={0}
          max={Math.max(0, totalSnapshots - 1)}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          disabled={isLive || totalSnapshots === 0}
          data-testid="slider-playback"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono min-w-20" data-testid="text-snapshot-position">
          {currentIndex + 1} / {totalSnapshots}
        </span>
        
        {currentTimestamp && (
          <span className="text-xs text-gray-400 font-mono" data-testid="text-playback-time">
            {formatTimestamp(currentTimestamp)}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <FastForward className="h-3 w-3 text-gray-400" />
              <select
                value={playbackSpeed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                disabled={isLive}
                className="text-xs border-0 bg-transparent text-gray-600 cursor-pointer focus:ring-0"
                data-testid="select-playback-speed"
              >
                {speeds.map(speed => (
                  <option key={speed} value={speed}>{speed}x</option>
                ))}
              </select>
            </div>
          </TooltipTrigger>
          <TooltipContent>Playback speed</TooltipContent>
        </Tooltip>
      </div>
      
      <Button
        size="sm"
        variant={isLive ? "default" : "outline"}
        onClick={onGoLive}
        className="gap-1"
        data-testid="button-go-live"
      >
        <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
        Live
      </Button>
    </div>
  );
}
