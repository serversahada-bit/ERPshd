export interface DualMetricPoint {
  label: string;
  barValue: number;
  lineValue: number;
}

export default function DualMetricChart({
  data,
  barColor = '#e11d48',
  lineColor = '#f97316',
}: {
  data: DualMetricPoint[];
  barColor?: string;
  lineColor?: string;
}) {
  const width = 800;
  const height = 240;
  const paddingLeft = 46;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxBar = Math.max(...data.map((d) => d.barValue), 1);
  const maxLine = Math.max(...data.map((d) => d.lineValue), 1);
  const step = chartWidth / data.length;
  const barWidth = Math.min(step * 0.45, 36);

  const linePoints = data
    .map((d, i) => {
      const x = paddingLeft + step * i + step / 2;
      const y = paddingTop + chartHeight - (d.lineValue / maxLine) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={paddingLeft}
          x2={width - paddingRight}
          y1={paddingTop + chartHeight * (1 - t)}
          y2={paddingTop + chartHeight * (1 - t)}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}

      {data.map((d, i) => {
        const x = paddingLeft + step * i + (step - barWidth) / 2;
        const barHeight = (d.barValue / maxBar) * chartHeight;
        const y = paddingTop + chartHeight - barHeight;
        return <rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={4} fill={barColor} />;
      })}

      <polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth={2.5} />
      {data.map((d, i) => {
        const x = paddingLeft + step * i + step / 2;
        const y = paddingTop + chartHeight - (d.lineValue / maxLine) * chartHeight;
        return <circle key={`dot-${i}`} cx={x} cy={y} r={3.5} fill={lineColor} />;
      })}

      {data.map((d, i) => {
        const x = paddingLeft + step * i + step / 2;
        return (
          <text key={`lbl-${i}`} x={x} y={height - 8} fontSize={10} textAnchor="middle" fill="#64748b">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
