import React, { useRef, useEffect, useState } from "react";
import { HotTable } from "@handsontable/react";
import ExcelJS from "exceljs";
import Handsontable from "handsontable";
import { BaseEditor } from "handsontable/editors";
import { textRenderer } from "handsontable/renderers";
import "handsontable/dist/handsontable.full.css";
import "./Spreadsheet.css";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Định nghĩa DateRenderer tùy chỉnh
function CustomDateRenderer(
    this: void,
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: any
): HTMLTableCellElement {
    textRenderer.apply(this as any, [instance, td, row, col, prop, value || "", cellProperties]);
    td.style.textAlign = "center";
    return td;
}

// Interface cho instance của Handsontable
interface HandsontableInstance extends Handsontable {
    view: {
        wt: {
            wtTable: {
                getCell: (coords: { row: number; col: number }) => {
                    top: number;
                    start: number;
                    width: number;
                    height: number
                };
            };
        };
    };
    rootElement: HTMLElement;
}

// Sửa lại định nghĩa CustomDateEditor
class CustomDateEditor extends BaseEditor {
    private TEXTAREA: HTMLInputElement;

    constructor(instance: HandsontableInstance) {
        super(instance);

        // Create an input element
        this.TEXTAREA = document.createElement('input') as HTMLInputElement;
        this.TEXTAREA.setAttribute('type', 'date');
        this.TEXTAREA.style.width = '100%';
        this.TEXTAREA.style.height = '100%';
    }

    prepare(
        this: CustomDateEditor,
        row: number,
        col: number,
        prop: string | number,
        td: HTMLTableCellElement,
        originalValue: string | number | null,
        cellProperties: Handsontable.CellProperties
    ): void {
        super.prepare(row, col, prop, td, originalValue, cellProperties);
        this.originalValue = originalValue || '';
    }

    getValue(this: CustomDateEditor): string {
        return this.TEXTAREA.value;
    }

    setValue(this: CustomDateEditor, value: string): void {
        this.TEXTAREA.value = value;
    }

    open(this: CustomDateEditor): void {
        this.refreshDimensions();
        this.instance.rootElement.appendChild(this.TEXTAREA);
        this.TEXTAREA.focus();
    }

    close(this: CustomDateEditor): void {
        this.TEXTAREA.blur();
        if (this.TEXTAREA.parentNode) {
            this.TEXTAREA.parentNode.removeChild(this.TEXTAREA);
        }
    }

    focus(this: CustomDateEditor): void {
        this.TEXTAREA.focus();
    }

    refreshDimensions(this: CustomDateEditor): void {
        const { row, col } = this;
        const instance = this.instance as HandsontableInstance;
        const { top, start, width, height } = instance.view.wt.wtTable.getCell({ row, col });

        const editTop = top;
        const editLeft = start;
        const editWidth = width;
        const editHeight = height;

        this.TEXTAREA.style.width = editWidth + 'px';
        this.TEXTAREA.style.height = editHeight + 'px';
        this.TEXTAREA.style.position = 'absolute';
        this.TEXTAREA.style.top = editTop + 'px';
        this.TEXTAREA.style.left = editLeft + 'px';
    }
}

// Row data interface
interface RowData {
    reportDate: string;
    reportTime: number;
    startingTime: string;
    jobContent: string;
    completed: string;
    completingTime: string;
    remark: string;
}

// Thêm interface cho FileSystemFileHandle và ShowSaveFilePickerOptions
interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
    write(data: any): Promise<void>;
    close(): Promise<void>;
}

interface ShowSaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

// Mở rộng Window interface
declare global {
    interface Window {
        showSaveFilePicker(options?: ShowSaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }
}

const Spreadsheet: React.FC = () => {
    const hotRef = useRef<any>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    // Thay đổi khởi tạo state để load từ localStorage
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('hourReport_userName') || "Tran Quang Huy";
    });

    const [department, setDepartment] = useState(() => {
        return localStorage.getItem('hourReport_department') || "DevHCM";
    });

    // Thêm useEffect để lưu khi có thay đổi
    useEffect(() => {
        localStorage.setItem('hourReport_userName', userName);
    }, [userName]);

    useEffect(() => {
        localStorage.setItem('hourReport_department', department);
    }, [department]);

    const reportHours = [9, 10, 11, 12, 14, 15, 16, 17];

    // Sửa lại hàm getInitialData để sử dụng localStorage
    const getInitialData = () => {
        const savedData = localStorage.getItem(`spreadsheetData_${selectedDate}`);
        if (savedData) {
            return JSON.parse(savedData);
        }

        return reportHours.map(hour => {
            const prevHour = String(hour - 1).padStart(2, '0');
            return {
                reportDate: selectedDate,
                reportTime: hour,
                startingTime: `${prevHour}:00`,
                jobContent: "",
                completed: "N",
                completingTime: "",
                remark: ""
            };
        });
    };

    // Sửa lại handler để sử dụng localStorage
    const handleDataChange = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const currentData = hot.getSourceData();
        localStorage.setItem(`spreadsheetData_${selectedDate}`, JSON.stringify(currentData));
    };

    // Sửa trong useEffect để sử dụng localStorage
    useEffect(() => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const savedData = localStorage.getItem(`spreadsheetData_${selectedDate}`);
        if (savedData) {
            hot.loadData(JSON.parse(savedData));
        } else {
            const newData = reportHours.map(hour => {
                const prevHour = String(hour - 1).padStart(2, '0');
                return {
                    reportDate: selectedDate,
                    reportTime: hour,
                    startingTime: `${prevHour}:00`,
                    jobContent: "",
                    completed: "N",
                    completingTime: "",
                    remark: ""
                };
            });
            hot.loadData(newData);
        }
    }, [selectedDate]);

    useEffect(() => {
        Handsontable.cellTypes.registerCellType('date', {
            editor: CustomDateEditor,
            renderer: CustomDateRenderer,
        });
    }, []);

    const clearData = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const data = hot.getSourceData();
        const updatedData = data.map((row: RowData) => ({
            ...row,
            jobContent: "",
            completingTime: "",
            remark: "",
            completed: "N",
        }));

        hot.loadData(updatedData);
    };

    const clearAllStorageData = () => {
        if (window.confirm('Are you sure you want to clear all saved sheet data? This action cannot be undone.')) {
            // Lấy tất cả keys trong localStorage
            const keys = Object.keys(localStorage);

            // Xóa tất cả keys bắt đầu bằng "spreadsheetData_"
            keys.forEach(key => {
                if (key.startsWith('spreadsheetData_')) {
                    localStorage.removeItem(key);
                }
            });

            // Reload data cho ngày hiện tại
            const hot = hotRef.current?.hotInstance;
            if (hot) {
                hot.loadData(getInitialData());
            }
        }
    };

    const exportRow = async (row: number) => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        // Lấy dữ liệu hàng hiện tại
        const currentRowObj = hot.getSourceDataAtRow(row);
        const currentHour = currentRowObj.reportTime;

        // Chuẩn bị dữ liệu xuất
        const headers = ["Report date", "Report time", "Starting time", "Job content", "Completed Y/N", "Completing time", "Remark"];
        const dataToExport = reportHours.map(hour => {
            const rowIndex = hot.getSourceData().findIndex((rowData: RowData) => rowData.reportTime === hour);
            if (rowIndex >= 0) {
                const rowData = hot.getSourceDataAtRow(rowIndex);
                if (hour > currentHour) {
                    const startingHour = String(hour - 1).padStart(2, '0');
                    return [selectedDate, hour, `${startingHour}:00`, "", "", "", ""];
                }
                return [
                    rowData.reportDate,
                    rowData.reportTime,
                    rowData.startingTime,
                    rowData.jobContent,
                    rowData.completed,
                    rowData.completingTime,
                    rowData.remark
                ];
            }
            const startingHour = String(hour - 1).padStart(2, '0');
            return [selectedDate, hour, `${startingHour}:00`, "", "", "", ""];
        });

        // Tạo workbook và worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Thêm header
        worksheet.addRow(headers);

        // Thêm dữ liệu
        dataToExport.forEach(row => {
            worksheet.addRow(row);
        });

        // Định dạng border cho tất cả các ô
        worksheet.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
            });
        });

        // Định dạng header
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '2C7FB8' } // Màu xanh giống trong hình ảnh
            };
            cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // Chữ trắng, đậm
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Định dạng dữ liệu
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowNumber > 1) { // Bỏ qua header
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (colNumber === 4 || colNumber === 7) { // Job content và Remark căn trái
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    } else {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                });
            }
        });

        // Điều chỉnh độ rộng cột
        worksheet.columns = [
            { width: 20 }, // Report date
            { width: 20 }, // Report time
            { width: 20 }, // Starting time
            { width: 100 }, // Job content
            { width: 20 }, // Completed Y/N
            { width: 20 }, // Completing time
            { width: 50 }  // Remark
        ];

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();

        try {
            const formattedDate = selectedDate.replace(/-/g, '');
            const formattedHour = String(currentHour).padStart(2, '0');
            const fileName = `Hour Report_${department}_${userName}_${formattedDate}_${formattedHour}.xlsx`;

            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                    description: 'Excel Files',
                    accept: {
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                    }
                }]
            });

            const writable = await handle.createWritable();
            await writable.write(buffer);
            await writable.close();
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Failed to save file:', err);
                // Fallback to old method if showSaveFilePicker is not supported
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const formattedDate = selectedDate.replace(/-/g, '');
                const formattedHour = String(currentHour).padStart(2, '0');
                a.download = `Hour Report_${department}_${userName}_${formattedDate}_${formattedHour}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
            }
        }
    };

    const exportAllFiles = async () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        // Format for folder name
        const formattedDate = selectedDate.replace(/-/g, '');

        // Create zip object
        const zip = new JSZip();
        // Create folder inside zip
        const folder = zip.folder(formattedDate);

        if (!folder) return;

        // Generate all Excel files
        for (const hour of reportHours) {
            const rowIndex = hot.getSourceData().findIndex((rowData: RowData) => rowData.reportTime === hour);
            if (rowIndex >= 0) {
                // Prepare export data (reusing logic from exportRow)
                const headers = ["Report date", "Report time", "Starting time", "Job content", "Completed Y/N", "Completing time", "Remark"];
                const dataToExport = reportHours.map(h => {
                    const rowIdx = hot.getSourceData().findIndex((rowData: RowData) => rowData.reportTime === h);
                    if (rowIdx >= 0) {
                        const rowData = hot.getSourceDataAtRow(rowIdx);
                        if (h > hour) {
                            const startingHour = String(h - 1).padStart(2, '0');
                            return [selectedDate, h, `${startingHour}:00`, "", "", "", ""];
                        }
                        return [
                            rowData.reportDate,
                            rowData.reportTime,
                            rowData.startingTime,
                            rowData.jobContent,
                            rowData.completed,
                            rowData.completingTime,
                            rowData.remark
                        ];
                    }
                    const startingHour = String(h - 1).padStart(2, '0');
                    return [selectedDate, h, `${startingHour}:00`, "", "", "", ""];
                });

                // Create workbook and worksheet
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet1');

                // Add header
                worksheet.addRow(headers);

                // Add data
                dataToExport.forEach(row => {
                    worksheet.addRow(row);
                });

                // Format borders
                worksheet.eachRow({ includeEmpty: true }, (row) => {
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: '000000' } },
                            left: { style: 'thin', color: { argb: '000000' } },
                            bottom: { style: 'thin', color: { argb: '000000' } },
                            right: { style: 'thin', color: { argb: '000000' } }
                        };
                    });
                });

                // Format header
                worksheet.getRow(1).eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '2C7FB8' }
                    };
                    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });

                // Format data
                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    if (rowNumber > 1) {
                        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            if (colNumber === 4 || colNumber === 7) {
                                cell.alignment = { horizontal: 'left', vertical: 'middle' };
                            } else {
                                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                            }
                        });
                    }
                });

                // Set column widths
                worksheet.columns = [
                    { width: 20 }, // Report date
                    { width: 20 }, // Report time
                    { width: 20 }, // Starting time
                    { width: 100 }, // Job content
                    { width: 20 }, // Completed Y/N
                    { width: 20 }, // Completing time
                    { width: 50 }  // Remark
                ];

                // Get Excel file as buffer
                const buffer = await workbook.xlsx.writeBuffer();

                // Add Excel file to the zip folder
                const formattedHour = String(hour).padStart(2, '0');
                const fileName = `Hour Report_${department}_${userName}_${formattedDate}_${formattedHour}.xlsx`;
                folder.file(fileName, buffer);
            }
        }

        // Generate zip file and trigger download
        const content = await zip.generateAsync({ type: 'blob' });

        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${formattedDate}.zip`,
                types: [{
                    description: 'ZIP Files',
                    accept: {
                        'application/zip': ['.zip']
                    }
                }]
            });

            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Failed to save file:', err);
                saveAs(content, `${formattedDate}.zip`);
            }
        }
    };

    const columns = [
        {
            data: "reportDate",
            type: "text",
            editor: 'text',
            readOnly: false,
            width: '120px'
        },
        {
            data: "reportTime",
            type: "numeric",
            readOnly: false,
            width: 80
        },
        {
            data: "startingTime",
            type: "text",
            readOnly: false,
            width: 80
        },
        {
            data: "jobContent",
            type: "text",
            readOnly: false,
            width: 450
        },
        {
            data: "completed",
            type: "dropdown",
            source: ["Y", "N"],
            readOnly: false,
            width: 100
        },
        {
            data: "completingTime",
            type: "text",
            readOnly: false,
            width: 100
        },
        {
            data: "remark",
            type: "text",
            readOnly: false,
            width: 150
        },
        {
            renderer: (_instance: any, td: HTMLTableCellElement, row: number) => {
                td.innerHTML = '<button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Export</button>';
                td.onclick = () => exportRow(row);
                return td;
            },
            width: 80,
            readOnly: true
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto h-full w-full flex">
            <h1 className="text-2xl font-bold mb-4">Hourly Task Report</h1>

            <div className="mb-4 grid grid-cols-4 gap-4 border border-gray-300 rounded px-3 py-2 w-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                        style={{ width: '275px' }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                        placeholder="Enter your name"
                        style={{ width: '275px' }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{paddingRight: "2px"}}>Department:&nbsp;&nbsp;&nbsp;</label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                        style={{ width: '300px' }}
                    >
                        <option value="DevHCM">DevHCM</option>
                        <option value="AsHCM">AsHCM</option>
                        <option value="DevDN">DevDN</option>
                        <option value="AsDN">AsDN</option>
                        <option value="DevHN">DevHN</option>
                        <option value="AsHN">AsHN</option>
                    </select>
                </div>
                <div className="w-full flex flex-row px-3 py-2" id="actions">
                    <div className="flex w-full flex-row gap-2 justify-end items-end">
                        <button
                            onClick={clearData}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            style={{ backgroundColor: "rgb(160, 144, 160) " }}
                        >
                            Clear Content
                        </button>
                        <button
                            onClick={clearAllStorageData}
                            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors"
                            style={{ backgroundColor: "#FF0000" }}
                        >
                            Clear All Saved Data
                        </button>
                        <button
                            onClick={exportAllFiles}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                            Export All Files
                        </button>
                    </div>
                </div>
            </div>

            <HotTable
                ref={hotRef}
                data={getInitialData()}
                colHeaders={["Report date", "Report time", "Starting time", "Job content", "Completed Y/N", "Completing time", "Remark", "Actions"]}
                rowHeaders={true}
                columns={columns}
                licenseKey="non-commercial-and-evaluation"
                height="45vh"
                width="100%"
                stretchH="all"
                readOnly={false}
                manualColumnResize={true}
                contextMenu={true}
                afterChange={(changes) => {
                    if (changes) {
                        const hot = hotRef.current?.hotInstance;
                        if (!hot) return;

                        changes.forEach(([row, col, , newValue]) => {
                            // Format thời gian cho cột startingTime và completingTime
                            if ((col === 'startingTime' || col === 'completingTime') && newValue) {
                                let formattedTime = newValue;

                                // Nếu chỉ nhập số nguyên (vd: 12, 9)
                                if (/^\d{1,2}$/.test(newValue)) {
                                    formattedTime = `${newValue.padStart(2, '0')}:00`;
                                    hot.setDataAtRowProp(row, col, formattedTime);
                                }
                                // Nếu nhập số không có dấu : (vd: 1230, 930)
                                else if (/^\d{3,4}$/.test(newValue)) {
                                    const hours = newValue.length === 3 ?
                                        newValue.substring(0, 1) : newValue.substring(0, 2);
                                    const minutes = newValue.length === 3 ?
                                        newValue.substring(1) : newValue.substring(2);
                                    formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                                    hot.setDataAtRowProp(row, col, formattedTime);
                                }

                                // Sau khi format xong, xử lý logic thời gian bắt đầu của hàng tiếp theo
                                if (col === 'completingTime') {
                                    const currentRow = hot.getSourceDataAtRow(row);
                                    const currentReportTime = currentRow.reportTime;

                                    const nextRow = row + 1;
                                    const totalRows = hot.countRows();
                                    if (currentReportTime !== 12) {
                                        if (nextRow < totalRows) {
                                            // Kiểm tra nếu completing time thuộc giờ 12
                                            if (formattedTime.startsWith("12:")) {
                                                hot.setDataAtRowProp(nextRow, 'startingTime', "14:00");
                                            } else {
                                                hot.setDataAtRowProp(nextRow, 'startingTime', formattedTime);
                                            }
                                        }
                                    }
                                }
                            }

                            // Xử lý thay đổi trong cột completed
                            if (col === 'completed') {
                                if (newValue === "Y") {
                                    const currentRow = hot.getSourceDataAtRow(row);
                                    const currentReportTime = currentRow.reportTime;


                                    // Kiểm tra nếu là giờ 12
                                    if (currentReportTime === 12) {
                                        hot.setDataAtRowProp(row, 'completingTime', "12:00");
                                    } else {
                                        const nextRow = hot.getSourceDataAtRow(row + 1);
                                        if (nextRow) {
                                            hot.setDataAtRowProp(row, 'completingTime', nextRow.startingTime);
                                        } else {
                                            const completingHour = String(currentReportTime).padStart(2, '0');
                                            hot.setDataAtRowProp(row, 'completingTime', `${completingHour}:00`);
                                        }
                                    }
                                } else if (newValue === "N") {
                                    hot.setDataAtRowProp(row, 'completingTime', '');
                                }
                            }
                        });

                        handleDataChange();
                    }
                }}
                className="custom-handsontable htCustomStyles"
                cells={(row: number, col: number) => {
                    // Thay đổi màu sắc header và row headers sang màu xanh
                    if (row === -1) {
                        return {
                            className: "htCenter",
                            readOnly: true,
                            renderer: function (_instance: any, td: HTMLTableCellElement, _row: number, _col: number, _prop: any, value: any, _cellProperties: any) {
                                td.innerHTML = value;
                                td.style.backgroundColor = '#2c7fb8';
                                td.style.color = 'white';
                                td.style.fontWeight = 'bold';
                                td.style.textAlign = 'center';
                                return td;
                            }
                        };
                    }

                    // Định dạng cho cột số thứ tự (row headers)
                    if (col === -1) {
                        return {
                            className: "htCenter",
                            readOnly: true,
                            renderer: function (_instance: any, td: HTMLTableCellElement, _row: number, _col: number, _prop: any, value: any, _cellProperties: any) {
                                td.innerHTML = value;
                                td.style.backgroundColor = '#2c7fb8';
                                td.style.color = 'white';
                                td.style.fontWeight = 'bold';
                                td.style.textAlign = 'center';
                                return td;
                            }
                        };
                    }

                    if (col === 7) { // Export button column
                        return {
                            className: 'htMiddle',
                            readOnly: true
                        };
                    }
                    // Left align for jobContent and remark columns
                    if (col === 3 || col === 6) { // 3 is jobContent, 6 is remark
                        return {
                            className: 'htMiddle htLeft',
                            readOnly: false
                        };
                    }
                    return {
                        className: 'htMiddle',
                        readOnly: false
                    };
                }}
                settings={{
                    // Thêm border và các thiết lập khác để khớp với giao diện bạn cần
                    tableClassName: 'htBorderAll',
                    currentRowClassName: 'current-row',
                    currentColClassName: 'current-col',
                    manualColumnResize: true,
                }}
            />
        </div>
    );
};

export default Spreadsheet;
