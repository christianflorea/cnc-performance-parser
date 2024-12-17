import React, { useState } from "react";
import * as XLSX from "xlsx";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import { TableRow } from "./types";

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

      const formattedData: TableRow[] = [1, 2, 3, 4].map((i) => ({
        cnc: i,
        totalParts: 0,
        totalSeconds: 0,
        dayParts: 0,
        nightParts: 0,
        daySeconds: 0,
        nightSeconds: 0,
      }));

      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        const cnc_number: number = parseInt(row["User"].match(/\d+/g)[0], 10);
        const isDay: boolean = row["User"].includes("Day");
        formattedData[cnc_number - 1].totalParts += 1;
        formattedData[cnc_number - 1].totalSeconds += row["Seconds"];
        if (isDay) {
          formattedData[cnc_number - 1].dayParts += 1;
          formattedData[cnc_number - 1].daySeconds += row["Seconds"];
        } else {
          formattedData[cnc_number - 1].nightParts += 1;
          formattedData[cnc_number - 1].nightSeconds += row["Seconds"];
        }
      }

      // regex pattern for DD.MM.YYYY
      const filename = file.name;
      const datePattern = /^(\d{2}\.\d{2}\.\d{4})/; 
      const match = filename.match(datePattern);
      const date = match ? match[1] : "Unknown date";

      setTableData((prev) => [...prev, { date, data: formattedData }]);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="app-container">
      <h1>Excel File Parser</h1>
      <FileUpload onFileUpload={parseExcel} />
      <DataTable data={tableData} />
    </div>
  );
};

export default App;
