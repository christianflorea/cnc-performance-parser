import React from "react";
import styled from "styled-components";
import { TableRow } from "../types";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Brightness2Icon from "@mui/icons-material/Brightness2";

interface DayData {
  date: string;
  data: TableRow[];
}

interface DataTableProps {
  data: DayData[];
}

const TableWrapper = styled.div`
  margin: 20px 0;
  width: 80%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
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
    background-color: #4CAF50;
    color: #ffffff;
    font-weight: bold;
  }

  th, td {
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
  }

  tbody tr.day-row {
    background-color: #e0f5e0;
  }

  tbody tr.night-row {
    background-color: #e0eaf5;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }
`;

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <div className="tables-container">
      {data.map((dayData, dayIndex) => (
        <TableWrapper key={dayIndex}>
          <StyledHeading>{dayData.date}</StyledHeading>
          <StyledTable>
            <thead>
              <tr>
                <th>CNC</th>
                <th>Shift</th>
                <th>Total Parts</th>
                <th>Total Minutes</th>
              </tr>
            </thead>
            <tbody>
              {dayData.data.map((row, index) => {
                if (!row.totalParts) return null;

                const shiftIcon = row.shift === "Day"
                  ? <WbSunnyIcon style={{ color: "#fbc02d" }} />
                  : <Brightness2Icon style={{ color: "#3f51b5" }} />;

                return (
                  <tr
                    key={index}
                    className={row.shift === "Day" ? "day-row" : "night-row"}
                  >
                    <td>{row.cnc}</td>
                    <td>{shiftIcon}</td>
                    <td>{row.totalParts || 0}</td>
                    <td>{Math.floor((row.totalSeconds || 0) / 60)}</td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </TableWrapper>
      ))}
    </div>
  );
};

export default DataTable;
