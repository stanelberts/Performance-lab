
import { Activity, ActivityType } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaConfig {
  clientId: string;
  clientSecret: string;
}

export const getStravaAuthUrl = (clientId: string, redirectUri: string) => {
  const scope = 'read,activity:read_all';
  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
};

export const exchangeStravaCode = async (config: StravaConfig, code: string) => {
  // OPMERKING: In een productie-omgeving zou dit via een backend gaan om de clientSecret geheim te houden.
  // Voor deze lab-tool bewaren we het lokaal.
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Token exchange mislukt. Controleer je Client ID en Secret.');
  }

  return response.json();
};

export const fetchStravaActivities = async (accessToken: string, page = 1, perPage = 30): Promise<Activity[]> => {
  const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Kon activiteiten niet ophalen van Strava.');
  }

  const rawActivities = await response.json();
  
  return rawActivities.map((raw: any) => ({
    id: `strava-${raw.id}`,
    stravaId: raw.id.toString(),
    name: raw.name,
    type: mapStravaType(raw.type),
    distance: raw.distance,
    movingTime: raw.moving_time,
    startDate: raw.start_date,
    avgHr: raw.has_heartrate ? raw.average_heartrate : undefined,
    maxHr: raw.has_heartrate ? raw.max_heartrate : undefined,
    labels: [], // Worden later door de gebruiker toegevoegd
    laps: [], // Laps vereisen een extra API call per activiteit, voor nu leeg
    isRace: raw.workout_type === 1 // Strava workout_type 1 is vaak een race
  }));
};

const mapStravaType = (type: string): string => {
  if (type === 'Run') return ActivityType.RUN;
  if (type === 'Ride') return ActivityType.RIDE;
  if (type === 'WeightTraining') return ActivityType.STRENGTH;
  return ActivityType.OTHER;
};
