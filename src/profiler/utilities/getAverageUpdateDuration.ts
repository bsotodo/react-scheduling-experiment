import { ProfilerResult } from '../Profiler.interfaces';

/**
 * Get average update duration
 */
export const getAverageUpdateDuration = (profilerResults: Array<ProfilerResult>): number => {
  return (
    profilerResults.reduce((completeDuration: number, profilerResult: ProfilerResult): number => {
      return completeDuration + profilerResult.actualDuration;
    }, 0) / profilerResults.length
  );
};
