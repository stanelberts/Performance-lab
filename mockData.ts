
import { Activity, ActivityType, Label, WorkoutTemplate } from './types';

export const DEFAULT_LABELS: Label[] = [
  { id: 'l1', name: 'Z2-Run', category: 'Hardlopen', color: '#10B981' },
  { id: 'l2', name: 'Threshold', category: 'Hardlopen', color: '#F59E0B' },
  { id: 'l3', name: 'VO2', category: 'Hardlopen', color: '#EF4444' },
  { id: 'l4', name: 'Z2-Ride', category: 'Fietsen', color: '#3B82F6' },
  { id: 'l5', name: 'Hyrox', category: 'Hyrox', color: '#8B5CF6' },
  { id: 'l6', name: 'Full Body', category: 'Kracht', color: '#6B7280' },
  { id: 'l7', name: 'Upperbody', category: 'Kracht', color: '#EC4899' },
];

export const HYROX_STATIONS = [
  'SkiErg',
  'Sled Push',
  'Sled Pull',
  'Burpee Broad Jump',
  'Rowing',
  'Farmers Carry',
  'Sandbag Lunges',
  'Wall Balls'
];

export const MOCK_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't1',
    name: 'Standard Z2 Run (1h)',
    type: ActivityType.RUN,
    description: 'Focus op lage hartslag, ontspannen ademhaling.',
    defaultLabels: [DEFAULT_LABELS[0]],
    targetDuration: 3600,
    targetDistance: 10000
  },
  {
    id: 't2',
    name: 'VO2 Max Intervals 6x800',
    type: ActivityType.RUN,
    description: 'Intensieve intervallen met 2min wandelen/dribbelen rust.',
    defaultLabels: [DEFAULT_LABELS[2]],
    targetDistance: 4800
  },
  {
    id: 't3',
    name: 'Full Hyrox Race Sim',
    type: ActivityType.OTHER,
    description: 'Alle 8 stations inclusief 1km runs tussen elk station.',
    defaultLabels: [DEFAULT_LABELS[4]],
    hyroxStations: HYROX_STATIONS
  }
];

const generateLaps = (count: number, basePace: number, baseHr: number) => {
  return Array.from({ length: count }, (_, i) => ({
    lapNumber: i + 1,
    distance: 1000,
    time: Math.floor(1000 / (basePace + (Math.random() - 0.5) * 0.2)),
    avgHr: Math.floor(baseHr + (Math.random() - 0.5) * 10),
  }));
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    stravaId: '12345678',
    name: 'Ochtend Loop - Z2 Focus',
    type: ActivityType.RUN,
    distance: 10000,
    movingTime: 3600,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    avgHr: 142,
    maxHr: 155,
    labels: [DEFAULT_LABELS[0]],
    laps: generateLaps(10, 2.77, 142),
  },
  {
    id: 'a3',
    stravaId: '32345678',
    name: 'Hyrox Simulation #1',
    type: ActivityType.OTHER,
    distance: 8000,
    movingTime: 4500,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    avgHr: 162,
    labels: [DEFAULT_LABELS[4]],
    laps: [],
    hyroxData: {
      totalScore: 75.2,
      category: 'Solo',
      division: 'Open',
      parts: [
        { name: 'SkiErg', time: 260, distance: 1000, weight: 0 },
        { name: 'Sled Push', time: 145, distance: 50, weight: 125 },
        { name: 'Sled Pull', time: 175, distance: 50, weight: 75 },
        { name: 'Burpee Broad Jump', time: 230, distance: 80, weight: 0 },
        { name: 'Rowing', time: 270, distance: 1000, weight: 0 },
        { name: 'Farmers Carry', time: 105, distance: 200, weight: 32 },
        { name: 'Sandbag Lunges', time: 200, distance: 100, weight: 20 },
        { name: 'Wall Balls', time: 350, reps: 75, weight: 6 },
      ]
    }
  },
  {
    id: 'a4',
    name: 'Hyrox Amsterdam (Official)',
    type: ActivityType.OTHER,
    distance: 8000,
    movingTime: 4200, // 1:10:00
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    avgHr: 170,
    labels: [DEFAULT_LABELS[4]],
    isRace: true,
    laps: [],
    hyroxData: {
      totalScore: 70.0,
      category: 'Solo',
      division: 'Pro',
      parts: [
        { name: 'SkiErg', time: 245, distance: 1000, weight: 0 },
        { name: 'Sled Push', time: 135, distance: 50, weight: 125 },
        { name: 'Sled Pull', time: 160, distance: 50, weight: 75 },
        { name: 'Burpee Broad Jump', time: 210, distance: 80, weight: 0 },
        { name: 'Rowing', time: 255, distance: 1000, weight: 0 },
        { name: 'Farmers Carry', time: 95, distance: 200, weight: 32 },
        { name: 'Sandbag Lunges', time: 185, distance: 100, weight: 20 },
        { name: 'Wall Balls', time: 320, reps: 75, weight: 6 },
      ]
    }
  }
];
