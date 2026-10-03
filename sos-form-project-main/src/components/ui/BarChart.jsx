import "./BarChart.css";

// Gráfico de barras simples, em SVG puro (sem lib). `data`: [{ label, value }]
export default function BarChart({ data, height = 160, formatValue = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className="bar-chart" style={{ height }}>
      <div className="bar-chart__bars">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} className="bar-chart__col" style={{ width: `${barWidth}%` }}>
              <span className="bar-chart__value">{d.value > 0 ? formatValue(d.value) : ""}</span>
              <div className="bar-chart__track">
                <div
                  className="bar-chart__bar"
                  style={{ height: `${Math.max(pct, d.value > 0 ? 4 : 0)}%` }}
                  title={`${d.label}: ${formatValue(d.value)}`}
                />
              </div>
              <span className="bar-chart__label">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
