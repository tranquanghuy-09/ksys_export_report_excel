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

const Spreadsheet: React.FC = () => {
    const hotRef = useRef<any>(null);
    const [selectedDate, setSelectedDate] = useState("2025-02-24");
    const [userName, setUserName] = useState("Tran Quang Huy");
    const reportHours = [9, 10, 11, 12, 14, 15, 16, 17]; // Cập nhật giờ theo yêu cầu

    useEffect(() => {
        Handsontable.cellTypes.registerCellType('date', {
            editor: CustomDateEditor,
            renderer: CustomDateRenderer,
        });
    }, []);

    // Cập nhật dữ liệu khi thay đổi ngày
    useEffect(() => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

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
    }, [selectedDate, reportHours]);

    const clearData = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const data = hot.getSourceData();
        const updatedData = data.map((row: RowData) => ({
            ...row,
            jobContent: "",
            completingTime: "",
            remark: ""
        }));

        hot.loadData(updatedData);
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
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const formattedDate = selectedDate.replace(/-/g, '');
        a.download = `Hour Report_DevHCM_${userName}_${formattedDate}_${currentHour}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
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
                const fileName = `Hour Report_DevHCM_${userName}_${formattedDate}_${hour}.xlsx`;
                folder.file(fileName, buffer);
            }
        }

        // Generate zip file and trigger download
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${formattedDate}.zip`);
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

            <div className="mb-4 grid grid-cols-3 gap-4 border border-gray-300 rounded px-3 py-2 w-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name:</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                        placeholder="Enter your name"
                    />
                </div>
                <div className="w-full flex flex-row px-3 py-2" id="actions">
                    <div className="flex w-full flex-row gap-2 justify-end items-end">
                        <button
                            onClick={clearData}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Clear Content
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
                data={reportHours.map(hour => {
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
                })}
                colHeaders={["Report date", "Report time", "Starting time", "Job content", "Completed Y/N", "Completing time", "Remark", "Actions"]}
                rowHeaders={true}
                columns={columns}
                licenseKey="non-commercial-and-evaluation"
                height="auto"
                width="100%"
                stretchH="all"
                readOnly={false}
                manualColumnResize={true}
                contextMenu={true}
                afterChange={() => {
                    // Cập nhật data khi thay đổi
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