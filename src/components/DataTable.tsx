import React from "react";
import { TableRow } from "../types";

interface DayData {
  date: string;
  data: TableRow[];
}

interface DataTableProps {
  data: DayData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <div className="tables-container">
      {data.map((dayData, dayIndex) => (
        <div key={dayIndex} className="table-wrapper">
          <h2>{dayData.date}</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>CNC</th>
                <th>Total Parts</th>
                <th>Total Minutes</th>
              </tr>
            </thead>
            <tbody>
              {dayData.data.map((row, index) => (
                <tr key={index}>
                  <td>{row.cnc}</td>
                  <td
                    title={`Day: ${row.dayParts || 0}, Night: ${
                      row.nightParts || 0
                    }`}
                  >
                    {row.totalParts || 0}
                  </td>
                  <td
                    title={`Day: ${row.daySeconds || 0}, Night: ${
                      row.nightSeconds || 0
                    }`}
                  >
                    {Math.floor((row.totalSeconds || 0) / 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default DataTable;
