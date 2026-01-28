
export enum ActivityType {
  RUN = 'Run',
  RIDE = 'Ride',
  STRENGTH = 'WeightTraining',
  OTHER = 'Other'
}

export interface LapData {
  lapNumber: number;
  distance: number;
  time: number;
  avgHr?: number;
  avgPace?: number;
}

export interface HyroxPart {
  name: string;
  time?: number; // in seconds
  reps?: number;
  distance?: number; // in meters
  weight?: number; // in kg
}

export interface StrengthEntry {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  rpe?: number;
}

export interface Label {
  id: string;
  name: string;
  category: string;
  color: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  defaultLabels: Label[];
  targetDuration?: number; // in seconds
  targetDistance?: number; // in meters
  hyroxStations?: string[];
}

export interface Activity {
  id: string;
  stravaId?: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  startDate: string;
  avgHr?: number;
  maxHr?: number;
  labels: Label[];
  laps: LapData[];
  hyroxData?: {
    totalScore?: number;
    category?: 'Solo' | 'Duo';
    division?: 'Open' | 'Pro';
    subCategory?: 'Men' | 'Women' | 'Mixed';
    parts: HyroxPart[];
  };
  strengthEntries?: StrengthEntry[];
  templateId?: string;
  isPlanned?: boolean;
  isRace?: boolean;
}

export interface DashboardStats {
  z2Minutes: number;
  z2Goal: number;
  thresholdCount: number;
  thresholdGoal: number;
  vo2Count: number;
  vo2Goal: number;
  strengthCount: number;
  strengthGoal: number;
}
