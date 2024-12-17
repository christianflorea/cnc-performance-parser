import React, { ChangeEvent } from "react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => onFileUpload(file));
    }
  };

  return (
    <div className="file-upload">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} multiple />
    </div>
  );
};

export default FileUpload;
