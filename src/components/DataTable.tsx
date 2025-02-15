import React from "react";
import styled from "styled-components";
import { TableRow } from "../types";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Brightness2Icon from "@mui/icons-material/Brightness2";

interface DayData {
  date: string;       // e.g. "2025-01-27"
  data: TableRow[];   // array of { cnc, shift, totalParts, totalSeconds }
}

interface DataTableProps {
  data: DayData[];
}

const TableWrapper = styled.div`
  margin: 20px 0;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: auto; /* allow horizontal scroll for many date columns */
`;

const StyledHeading = styled.h2`
  text-align: center;
  background: #f0f0f0;
  margin: 0;
  padding: 10px 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead tr {
    background-color: #2E282A;
    color: #ffffff;
    font-weight: bold;
  }

  th, td {
    padding: 10px 8px;
    border-bottom: 1px solid #ddd;
    text-align: center;
  }

  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const shiftIconStyle = {
  Day: <WbSunnyIcon style={{ color: "#fbc02d" }} />,
  Night: <Brightness2Icon style={{ color: "#3f51b5" }} />,
};

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const allDates = Array.from(new Set(data.map(d => d.date))).sort();


  const allRowsSet = new Set<string>();
  data.forEach(dayData => {
    dayData.data.forEach(row => {
      // Key by "cnc|shift"
      allRowsSet.add(`${row.cnc}|${row.shift}`);
    });
  });
  const allRowKeys = Array.from(allRowsSet);


  const rowDefinitions = allRowKeys.map(rk => {
    const [cncStr, shift] = rk.split("|");
    return { cnc: parseInt(cncStr, 10), shift };
  });


  const pivot: Record<string, Record<string, { parts: number; minutes: number }>> = {};

  rowDefinitions.forEach(({ cnc, shift }) => {
    pivot[`${cnc}|${shift}`] = {};
  });

  data.forEach(dayData => {
    const currentDate = dayData.date;
    dayData.data.forEach(row => {
      const key = `${row.cnc}|${row.shift}`;
      if (!pivot[key][currentDate]) {
        pivot[key][currentDate] = { parts: 0, minutes: 0 };
      }
      pivot[key][currentDate].parts += row.totalParts;
      pivot[key][currentDate].minutes += Math.floor(row.totalSeconds / 60);
    });
  });

  let grandTotalParts = 0;
  let grandTotalMinutes = 0;
  
  const dateTotals: Record<string, { parts: number; minutes: number }> = {};
  allDates.forEach(d => {
    dateTotals[d] = { parts: 0, minutes: 0 };
  });

  return (
    <TableWrapper>
      <StyledHeading>Weekly Performance</StyledHeading>
      <StyledTable>
        <thead>
          <tr>
            <th rowSpan={2}>Machine</th>
            <th rowSpan={2}>Shift</th>
            {allDates.map(date => (
              <th key={date} colSpan={3}>
                {date}
              </th>
            ))}
            <th colSpan={3}>TOTAL</th>
          </tr>
          <tr>
            {allDates.map(date => (
              <>
                <th key={`${date}-parts`}>Parts</th>
                <th key={`${date}-min`}>Min</th>
                <th key={`${date}-mpp`}>Min/Part</th>
              </>
            ))}
            <th>Parts</th>
            <th>Min</th>
            <th>Min/Part</th>
          </tr>
        </thead>
        <tbody>
          {rowDefinitions.map(({ cnc, shift }) => {
            let rowTotalParts = 0;
            let rowTotalMinutes = 0;

            return (
              <tr key={`${cnc}-${shift}`}>
                <td>{cnc}</td>
                <td>
                  {shiftIconStyle[shift as "Day" | "Night"] ?? shift}
                </td>

                {allDates.map(date => {
                  const cellData = pivot[`${cnc}|${shift}`][date] || { parts: 0, minutes: 0 };
                  const parts = cellData.parts;
                  const minutes = cellData.minutes;
                  const mpp = parts > 0 ? (minutes / parts).toFixed(2) : "0";

                  rowTotalParts += parts;
                  rowTotalMinutes += minutes;

                  dateTotals[date].parts += parts;
                  dateTotals[date].minutes += minutes;

                  return (
                    <React.Fragment key={`${cnc}-${shift}-${date}`}>
                      <td>{parts}</td>
                      <td>{minutes}</td>
                      <td>{mpp}</td>
                    </React.Fragment>
                  );
                })}


                <td>{rowTotalParts}</td>
                <td>{rowTotalMinutes}</td>
                <td>
                  {rowTotalParts > 0
                    ? (rowTotalMinutes / rowTotalParts).toFixed(2)
                    : "0"}
                </td>
              </tr>
            );
          })}


          <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
            <td colSpan={2}>TOTAL</td>
            {allDates.map(date => {
              grandTotalParts += dateTotals[date].parts;
              grandTotalMinutes += dateTotals[date].minutes;
              const mpp = dateTotals[date].parts
                ? (dateTotals[date].minutes / dateTotals[date].parts).toFixed(2)
                : "0";
              return (
                <React.Fragment key={`total-${date}`}>
                  <td>{dateTotals[date].parts}</td>
                  <td>{dateTotals[date].minutes}</td>
                  <td>{mpp}</td>
                </React.Fragment>
              );
            })}
            <td>{grandTotalParts}</td>
            <td>{grandTotalMinutes}</td>
            <td>
              {grandTotalParts > 0
                ? (grandTotalMinutes / grandTotalParts).toFixed(2)
                : "0"}
            </td>
          </tr>
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default DataTable;
