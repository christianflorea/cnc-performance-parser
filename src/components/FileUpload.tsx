import React, { ChangeEvent, useCallback } from "react";
import styled from "styled-components";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const DropZone = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  background: ${(props) => (props.isDragOver ? "#e0f7fa" : "#fff")};
  transition: background 0.3s ease;
  color: #555;
  font-size: 16px;
  margin-bottom: 20px;

  &:hover {
    background: #f1f1f1;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => onFileUpload(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => onFileUpload(file));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <DropZone
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        Drag & Drop files here or click to select
      </DropZone>
      <HiddenInput
        type="file"
        accept=".xlsx, .xls"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;
