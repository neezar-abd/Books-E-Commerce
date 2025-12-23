'use client';

import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportButtonProps {
  data: any[];
  filename: string;
  format?: 'csv' | 'excel';
  className?: string;
}

export default function ExportButton({ 
  data, 
  filename, 
  format = 'excel',
  className = '' 
}: ExportButtonProps) {
  
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Generate file
      if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${filename}.csv`);
      } else {
        // Excel format
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        saveAs(blob, `${filename}.xlsx`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${className}`}
    >
      <Download size={18} />
      Export {format === 'excel' ? 'Excel' : 'CSV'}
    </button>
  );
}
