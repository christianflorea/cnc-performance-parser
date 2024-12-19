import React from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TableRow } from "../types";

interface DayData {
  date: string;
  data: TableRow[];
}

interface MinutesChartSectionProps {
  data: DayData[];
}

const ChartContainer = styled.div`
  width: 100%;
  height: 450px; 
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border-radius: 8px;
  margin-top: 20px;
`;

const ChartTitle = styled.h2`
  text-align: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const ExportButton = styled.button`
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #1976d2;
  }
`;

const CustomTooltipContainer = styled.div`
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-size: 13px;
  color: #333;
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <CustomTooltipContainer>
        <strong style={{display: "block", marginBottom: "5px"}}>{label}</strong>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{color: entry.color}}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </CustomTooltipContainer>
    );
  }
  return null;
};

const MinutesChartSection: React.FC<MinutesChartSectionProps> = ({ data }) => {
  // Transform the data for the minutes chart
  const chartData = data.map((dayData) => {
    const rowObj: any = { date: dayData.date };
    for (let cncNum = 1; cncNum <= 4; cncNum++) {
      const dayRow = dayData.data.find((r) => r.cnc === cncNum && r.shift === "Day");
      const nightRow = dayData.data.find((r) => r.cnc === cncNum && r.shift === "Night");
      
      // Calculate minutes by dividing totalSeconds by 60
      const dayMinutes = dayRow ? Math.floor((dayRow.totalSeconds || 0) / 60) : 0;
      const nightMinutes = nightRow ? Math.floor((nightRow.totalSeconds || 0) / 60) : 0;
      
      rowObj[`${cncNum} Day`] = dayMinutes;
      rowObj[`${cncNum} Night`] = nightMinutes;
    }
    return rowObj;
  });

  const allKeys = ["1 Day", "1 Night", "2 Day", "2 Night", "3 Day", "3 Night", "4 Day", "4 Night"];
  const keysWithData = allKeys.filter(key =>
    chartData.some(d => d[key] && d[key] > 0)
  );

  // Colors (same scheme as parts chart, can adjust as needed)
  const cncColors: Record<number, string> = {
    1: "#94D2BD",
    2: "#CA6702",
    3: "#9B2226",
    4: "#005F73"
  };

  const handleExport = () => {
    const headers = ["date", ...keysWithData];
    const rows = chartData.map((row) => {
      return headers.map(h => row[h] !== undefined ? row[h] : "").join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cnc_minutes_summary.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!chartData.length) return null;

  return (
    <ChartContainer>
      <ChartTitle>Total Minutes Per Day/Night by Date</ChartTitle>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20, right: 30, left: 20, bottom: 40
          }}
        >
          <defs>
            <pattern id="hatch1-min" patternUnits="userSpaceOnUse" width={6} height={6}>
              <path d="M0,0 L6,6 M6,0 L0,6" stroke={cncColors[1]} strokeWidth={1}/>
            </pattern>
            <pattern id="hatch2-min" patternUnits="userSpaceOnUse" width={6} height={6}>
              <path d="M0,0 L6,6 M6,0 L0,6" stroke={cncColors[2]} strokeWidth={1}/>
            </pattern>
            <pattern id="hatch3-min" patternUnits="userSpaceOnUse" width={6} height={6}>
              <path d="M0,0 L6,6 M6,0 L0,6" stroke={cncColors[3]} strokeWidth={1}/>
            </pattern>
            <pattern id="hatch4-min" patternUnits="userSpaceOnUse" width={6} height={6}>
              <path d="M0,0 L6,6 M6,0 L0,6" stroke={cncColors[4]} strokeWidth={1}/>
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            angle={-45} 
            textAnchor="end"
            height={60}
            stroke="#333"
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            stroke="#333"
            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          {keysWithData.length > 0 && <Legend wrapperStyle={{ fontSize: '12px' }} />}

          {keysWithData.map((key) => {
            const [cncNumStr, shift] = key.split(' ');
            const cncNum = parseInt(cncNumStr, 10);
            const baseColor = cncColors[cncNum] || "#4CAF50";
            const patternId = `hatch${cncNum}-min`;
            const fillColor = shift === "Day" ? baseColor : `url(#${patternId})`;

            return (
              <Bar key={key} dataKey={key} stackId="a" fill={fillColor} />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
      <ButtonWrapper>
        <ExportButton onClick={handleExport}>Export Minutes Summary</ExportButton>
      </ButtonWrapper>
    </ChartContainer>
  );
};

export default MinutesChartSection;
