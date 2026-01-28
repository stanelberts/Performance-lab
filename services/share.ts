
import { Activity } from '../types';

/**
 * We coderen alleen de essentiële data om de URL kort genoeg te houden voor browsers.
 */
export const encodeActivityForSharing = (activity: Activity): string => {
  const essentialData = {
    n: activity.name,
    t: activity.type,
    d: activity.distance,
    mt: activity.movingTime,
    sd: activity.startDate,
    hr: activity.avgHr,
    ir: activity.isRace,
    h: activity.hyroxData ? {
      c: activity.hyroxData.category,
      di: activity.hyroxData.division,
      // Fixed: Property 'n', 't', 'w' were being accessed instead of 'name', 'time', 'weight'
      p: activity.hyroxData.parts.map(p => ({ n: p.name, t: p.time, w: p.weight }))
    } : null,
    l: activity.labels.map(lbl => ({ n: lbl.name, c: lbl.color }))
  };

  try {
    const jsonString = JSON.stringify(essentialData);
    // Gebruik btoa voor base64 encoding (URL safe-ish)
    return btoa(encodeURIComponent(jsonString));
  } catch (e) {
    console.error("Fout bij genereren share link", e);
    return "";
  }
};

export const decodeActivityFromUrl = (encoded: string): Partial<Activity> | null => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    const data = JSON.parse(jsonString);
    
    return {
      name: data.n,
      type: data.t,
      distance: data.d,
      movingTime: data.mt,
      startDate: data.sd,
      avgHr: data.hr,
      isRace: data.ir,
      labels: data.l ? data.l.map((lbl: any) => ({ id: Math.random().toString(), name: lbl.n, color: lbl.c, category: '' })) : [],
      hyroxData: data.h ? {
        category: data.h.c,
        division: data.h.di,
        parts: data.h.p.map((p: any) => ({ name: p.n, time: p.t, weight: p.w }))
      } : undefined,
      laps: []
    };
  } catch (e) {
    console.error("Fout bij decoderen shared data", e);
    return null;
  }
};
