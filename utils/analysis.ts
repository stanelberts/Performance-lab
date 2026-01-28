
import { Activity } from '../types';

export const formatPace = (metersPerSecond: number): string => {
  if (!metersPerSecond || metersPerSecond === 0) return '0:00';
  const minsPerKm = 16.6667 / metersPerSecond;
  const minutes = Math.floor(minsPerKm);
  const seconds = Math.round((minsPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':');
};

export const calculateDelta = (current: number, previous: number) => {
  if (!current || !previous) return null;
  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  return {
    diff,
    percentage: parseFloat(percentage.toFixed(1)),
    isBetter: diff > 0 // Note: for pace/HR, lower is better usually, handled in UI
  };
};

export const getComparison = (current: Activity, previous?: Activity) => {
  if (!previous) return null;

  const paceDelta = calculateDelta(
    current.distance / current.movingTime,
    previous.distance / previous.movingTime
  );
  
  const hrDelta = current.avgHr && previous.avgHr 
    ? calculateDelta(current.avgHr, previous.avgHr) 
    : null;

  return {
    paceDelta,
    hrDelta,
    timeDelta: calculateDelta(current.movingTime, previous.movingTime),
    distanceDelta: calculateDelta(current.distance, previous.distance)
  };
};

export const getEfficiencyFactor = (activity: Activity) => {
  if (!activity.avgHr || !activity.distance || !activity.movingTime) return null;
  const pace = activity.distance / activity.movingTime; // m/s
  // Efficiency: meters per heartbeat
  const beatsPerSecond = activity.avgHr / 60;
  return pace / beatsPerSecond;
};
