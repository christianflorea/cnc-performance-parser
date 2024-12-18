import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import { TableRow } from "./types";
import ChartSection from "./components/ChartSection";

interface DayData {
  date: string;
  data: TableRow[];
}

const App: React.FC = () => {
  const [tableData, setTableData] = useState<DayData[]>([]);

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<any>(worksheet);

      if (json.length === 0) return;

      const rawStartDate = json[0]["Start date"];
      let extractedDate = "Unknown date";

      if (typeof rawStartDate === "number") {
        const dateObj = XLSX.SSF.parse_date_code(rawStartDate);
        if (dateObj) {
          const jsDate = new Date(
            dateObj.y,
            dateObj.m - 1,
            dateObj.d,
            dateObj.H,
            dateObj.M,
            dateObj.S
          );
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, "0");
          const day = String(jsDate.getDate()).padStart(2, "0");
          extractedDate = `${year}-${month}-${day}`;
        }
      } else if (typeof rawStartDate === "string") {
        // Expected format: "13/12/2024 12:50:13 AM"
        const dateTimeRegex =
          /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) ([AP]M)$/i;
        const match = rawStartDate.trim().match(dateTimeRegex);

        if (match) {
          const [
            _full,
            dayStr,
            monthStr,
            yearStr,
            hourStr,
            minuteStr,
            secondStr,
            amPm,
          ] = match;

          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          const second = parseInt(secondStr, 10);
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10) - 1;
          const day = parseInt(dayStr, 10);

          const amPmUpper = amPm.toUpperCase();
          if (amPmUpper === "PM" && hour !== 12) {
            hour += 12;
          } else if (amPmUpper === "AM" && hour === 12) {
            hour = 0;
          }

          const jsDate = new Date(year, month, day, hour, minute, second);
          const Y = jsDate.getFullYear();
          const M = String(jsDate.getMonth() + 1).padStart(2, "0");
          const D = String(jsDate.getDate()).padStart(2, "0");
          extractedDate = `${Y}-${M}-${D}`;
        }
      }

      let formattedData: TableRow[] = [];
      for (let i = 1; i <= 4; i++) {
        formattedData.push({
          cnc: i,
          shift: "Day",
          totalParts: 0,
          totalSeconds: 0,
        });
        formattedData.push({
          cnc: i,
          shift: "Night",
          totalParts: 0,
          totalSeconds: 0,
        });
      }

      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        const cnc_number: number = parseInt(row["User"].match(/\d+/g)[0], 10);
        const isDay: boolean = row["User"].includes("Day");

        const index = formattedData.findIndex(
          (d) => d.cnc === cnc_number && d.shift === (isDay ? "Day" : "Night")
        );
        if (index !== -1) {
          formattedData[index].totalParts += 1;
          formattedData[index].totalSeconds += row["Seconds"];
        }
      }

      setTableData((prev) => [
        ...prev,
        { date: extractedDate, data: formattedData },
      ]);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const sorted = [...tableData].sort((a, b) => (a.date < b.date ? -1 : 1));
    setTableData(sorted);
  }, [tableData.length]); // Re-sort whenever length changes (i.e., after new file added)

  return (
    <div className="app-container">
      <h1>Excel File Parser</h1>
      <FileUpload onFileUpload={parseExcel} />
      <div className="content-container">
        <div className="left-panel">
          <DataTable data={tableData} />
        </div>
        <div className="right-panel">
          <ChartSection data={tableData} />
        </div>
      </div>
    </div>
  );
};

export default App;
