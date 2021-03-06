import React, { FunctionComponent, ReactElement } from 'react';

import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';

import { ProfilerResult } from '../Profiler.interfaces';
import { getCompleteRenderDuration } from '../utilities/getCompleteRenderDuration';

/**
 * Profiler line chart tooltip
 */
const ProfilerLineChartTooltip: FunctionComponent<{
  active: boolean;
  payload: Array<any>;
  label: string;
}> = ({ active, payload }): ReactElement | null => {
  return active ? (
    <div style={{ backgroundColor: '#FFF', padding: '6px 8px', border: '1px solid #AAA', color: '#285E61', fontSize: '12px' }}>
      Render time: {payload[0].payload.y}ms
    </div>
  ) : null;
};

/**
 * Profiler line chart
 */
const ProfilerLineChart: FunctionComponent<{
  profilerResults: Array<ProfilerResult>;
  width: number;
  height: number;
}> = ({ profilerResults, width, height }): ReactElement => {
  // Transform data into chart-compatible format
  const data: Array<any> = profilerResults.reduce(
    (acc: Array<any>, profilerResult: ProfilerResult, index: number): any => {
      acc.push({
        execution: profilerResult.execution,
        x: acc[index].x + profilerResult.actualDuration,
        y: profilerResult.actualDuration,
      });
      return acc;
    },
    // Start with x=0 so that the chart starts at the beginning
    [
      {
        execution: profilerResults[0].execution,
        x: 0,
        y: profilerResults[0].actualDuration,
      },
    ],
  );

  // Define ticks
  const ticks: Array<number> = data
    .reduce((acc: Array<any>, item: any) => {
      if (acc[item.execution] === undefined) {
        acc[item.execution] = [];
      }
      acc[item.execution].push(item);
      return acc;
    }, [])
    .map((dataByExecution: Array<any>): number => {
      return dataByExecution[dataByExecution.length - 1].x;
    });

  // Define tick formatter
  const tickFormatter = (): string => {
    return '';
  };

  // Define chart domain
  const xDomain: [number, number] = [0, getCompleteRenderDuration(profilerResults)];

  // Render
  return (
    <AreaChart data={data} width={width} height={height} margin={{ top: 16, bottom: 16 }}>
      <XAxis
        dataKey="x"
        domain={xDomain}
        type="number"
        ticks={ticks}
        tickFormatter={tickFormatter}
        tick={{ fontSize: '0', fill: '#285E61' }}
        tickSize={0}
      />
      <YAxis dataKey="y" type="number" unit="ms" width={64} tick={{ fontSize: '12px', fill: '#285E61' }} tickSize={12} />
      <CartesianGrid strokeDasharray="2 3" />
      <Tooltip content={ProfilerLineChartTooltip} />
      <Area type="stepBefore" dataKey="y" stroke="#3182CE" fill="#3182CE" animationDuration={500} />
    </AreaChart>
  );
};

export default ProfilerLineChart;
