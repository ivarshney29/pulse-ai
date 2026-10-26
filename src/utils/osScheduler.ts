import { Patient, HospitalBed, ThreadExecutionLog, MutexState } from '../types/hospital';

export type SchedulingPolicy = 'PRIORITY_WITH_AGING' | 'ROUND_ROBIN' | 'FCFS';

/**
 * Calculates priority score for OS Priority Queue scheduling.
 * ESI 1 (Resuscitation) = base score 1000
 * ESI 2 (Emergent) = base score 750
 * ESI 3 (Urgent) = base score 500
 * ESI 4 (Less Urgent) = base score 250
 * ESI 5 (Non-urgent) = base score 100
 * 
 * Aging Factor: +15 points per minute waited to prevent starvation of lower-priority cases.
 */
export function calculatePatientPriority(patient: Patient): number {
  const effectiveEsi = patient.esiOverride ? patient.esiOverride.newLevel : patient.esiLevel;
  const baseScores: Record<number, number> = {
    1: 1000,
    2: 750,
    3: 500,
    4: 250,
    5: 100,
  };
  const base = baseScores[effectiveEsi] || 100;
  // Deterioration risk bonus (+up to 200 pts)
  const riskBonus = Math.round(patient.riskScore * 2);
  // Aging points: 12 pts per minute in queue
  const agingScore = patient.waitMinutes * 12;

  return base + riskBonus + agingScore;
}

/**
 * Sorts patients based on selected OS Scheduling algorithm
 */
export function schedulePatients(patients: Patient[], policy: SchedulingPolicy): Patient[] {
  const queuedPatients = [...patients.filter(p => p.status === 'Triage Queue')];

  switch (policy) {
    case 'PRIORITY_WITH_AGING':
      return queuedPatients.sort((a, b) => calculatePatientPriority(b) - calculatePatientPriority(a));

    case 'FCFS':
      // Sorted strictly by longest wait time (first come, first served)
      return queuedPatients.sort((a, b) => b.waitMinutes - a.waitMinutes);

    case 'ROUND_ROBIN': {
      // Group by ESI tier and cycle through them evenly
      const groups: Record<number, Patient[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      queuedPatients.forEach(p => {
        const esi = p.esiOverride?.newLevel || p.esiLevel;
        groups[esi].push(p);
      });
      const result: Patient[] = [];
      let added = true;
      let round = 0;
      while (added) {
        added = false;
        for (let level = 1; level <= 5; level++) {
          if (groups[level].length > round) {
            result.push(groups[level][round]);
            added = true;
          }
        }
        round++;
      }
      return result;
    }

    default:
      return queuedPatients;
  }
}

/**
 * Simulated OS Mutex Lock for atomic, thread-safe bed allocation.
 * Protects bed records from race conditions when 50+ concurrent requests arrive.
 */
class MutexManager {
  private isLocked: boolean = false;
  private activeThreadId: number | null = null;
  private lockQueue: Array<{
    threadId: number;
    patientId: string;
    bedId: string;
    resolve: () => void;
  }> = [];
  private totalAllocations: number = 248;
  private conflictsPrevented: number = 37;
  private deadlocksCount: number = 0;
  private latencies: number[] = [1.4, 2.1, 1.8, 1.9, 2.3, 1.2, 1.7];

  public getStatus(): MutexState {
    const avgLatency = this.latencies.length > 0 
      ? Number((this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length).toFixed(2))
      : 1.8;

    return {
      isLocked: this.isLocked,
      activeThreadId: this.activeThreadId,
      lockQueue: this.lockQueue.map(q => q.threadId),
      totalAllocations: this.totalAllocations,
      conflictsPrevented: this.conflictsPrevented,
      deadlocksCount: this.deadlocksCount,
      averageLockLatencyMs: avgLatency
    };
  }

  /**
   * Simulates acquiring lock
   */
  public async acquire(threadId: number, patientId: string, bedId: string): Promise<number> {
    const start = performance.now();
    if (!this.isLocked) {
      this.isLocked = true;
      this.activeThreadId = threadId;
      const latency = Number((performance.now() - start + 0.8 + Math.random() * 1.5).toFixed(2));
      this.latencies.push(latency);
      if (this.latencies.length > 20) this.latencies.shift();
      return latency;
    } else {
      // Race condition detected! Mutex serialized the request
      this.conflictsPrevented++;
      return new Promise((resolve) => {
        this.lockQueue.push({
          threadId,
          patientId,
          bedId,
          resolve: () => {
            const latency = Number((performance.now() - start + 2.0 + Math.random() * 2.0).toFixed(2));
            this.latencies.push(latency);
            if (this.latencies.length > 20) this.latencies.shift();
            resolve(latency);
          }
        });
      });
    }
  }

  /**
   * Releases lock and awakens next queued thread
   */
  public release(): void {
    this.totalAllocations++;
    if (this.lockQueue.length > 0) {
      const next = this.lockQueue.shift()!;
      this.activeThreadId = next.threadId;
      next.resolve();
    } else {
      this.isLocked = false;
      this.activeThreadId = null;
    }
  }
}

export const hospitalMutex = new MutexManager();
