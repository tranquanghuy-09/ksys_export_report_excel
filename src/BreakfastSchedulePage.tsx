import { useState, useEffect } from 'react';
import { Table, Card, Tag, Avatar, DatePicker, Button, Modal, Form, Input, Select, message, Spin } from 'antd';
import { PlusOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from './ThemeContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const API_BASE_URL = 'https://686bff3014219674dcc6e57a.mockapi.io';
const API_ENDPOINT = '/dat1';

interface BreakfastDuty {
    id: string;
    ten: string;
    avatar: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    tuan: number;
    trangThai: 'scheduled' | 'in-progress' | 'completed' | 'missed';
}

// API Service functions
const apiService = {
    // GET all duties
    getAllDuties: async (): Promise<BreakfastDuty[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);
            if (!response.ok) throw new Error('Failed to fetch duties');
            return await response.json();
        } catch (error) {
            console.error('Error fetching duties:', error);
            throw error;
        }
    },

    // GET duty by ID
    getDutyById: async (id: string): Promise<BreakfastDuty> => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch duty');
            return await response.json();
        } catch (error) {
            console.error('Error fetching duty:', error);
            throw error;
        }
    },

    // POST create new duty
    createDuty: async (duty: Omit<BreakfastDuty, 'id'>): Promise<BreakfastDuty> => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(duty),
            });
            if (!response.ok) throw new Error('Failed to create duty');
            return await response.json();
        } catch (error) {
            console.error('Error creating duty:', error);
            throw error;
        }
    },

    // PUT update duty
    updateDuty: async (id: string, duty: Omit<BreakfastDuty, 'id'>): Promise<BreakfastDuty> => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(duty),
            });
            if (!response.ok) throw new Error('Failed to update duty');
            return await response.json();
        } catch (error) {
            console.error('Error updating duty:', error);
            throw error;
        }
    },

    // DELETE duty
    deleteDuty: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete duty');
        } catch (error) {
            console.error('Error deleting duty:', error);
            throw error;
        }
    },
};

const BreakfastSchedulePage = () => {
    const { actualTheme } = useTheme();
    const [data, setData] = useState<BreakfastDuty[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<BreakfastDuty | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    // Load data from API when component mounts
    useEffect(() => {
        loadDuties();
    }, []);

    const loadDuties = async () => {
        setLoading(true);
        try {
            const duties = await apiService.getAllDuties();
            setData(duties);
        } catch {
            message.error('Không thể tải dữ liệu phân việc!');
            // Fallback to sample data if API fails
            // setData(generateSampleData());
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'green';
            case 'missed': return 'red';
            case 'scheduled': return 'blue';
            case 'in-progress': return 'orange';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Đã hoàn thành';
            case 'missed': return 'Đã bỏ lỡ';
            case 'scheduled': return 'Đã lên lịch';
            case 'in-progress': return 'Đang làm';
            default: return status;
        }
    };

    const columns: ColumnsType<BreakfastDuty> = [
        {
            title: 'Tuần',
            dataIndex: 'tuan',
            key: 'tuan',
            width: 80,
            align: 'center',
            sorter: (a, b) => a.tuan - b.tuan,
        },
        {
            title: 'Người phụ trách',
            key: 'person',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <span className={actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}>
                        {record.ten}
                    </span>
                </div>
            ),
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_, record) => (
                <div className={actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    <div>{dayjs(record.ngayBatDau).format('DD/MM/YYYY')} - {dayjs(record.ngayKetThuc).format('DD/MM/YYYY')}</div>
                    <small className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        ({dayjs(record.ngayBatDau).format('dddd')} - {dayjs(record.ngayKetThuc).format('dddd')})
                    </small>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Đã lên lịch', value: 'scheduled' },
                { text: 'Đang làm', value: 'in-progress' },
                { text: 'Đã hoàn thành', value: 'completed' },
                { text: 'Đã bỏ lỡ', value: 'missed' },
            ],
            onFilter: (value, record) => record.trangThai === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                        className={actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                    >
                        Chỉnh sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record)}
                        className={actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    const handleEdit = (record: BreakfastDuty) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            ngayBatDau: dayjs(record.ngayBatDau),
            ngayKetThuc: dayjs(record.ngayKetThuc),
        });
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const dutyData = {
                ten: values.ten,
                avatar: values.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + values.ten,
                ngayBatDau: values.ngayBatDau.format('YYYY-MM-DD'),
                ngayKetThuc: values.ngayKetThuc.format('YYYY-MM-DD'),
                tuan: values.tuan,
                trangThai: values.trangThai,
            };

            if (editingRecord) {
                // Update existing duty
                const updatedDuty = await apiService.updateDuty(editingRecord.id, dutyData);
                setData(data.map(item => item.id === editingRecord.id ? updatedDuty : item));
                message.success('Cập nhật thành công!');
            } else {
                // Create new duty
                const newDuty = await apiService.createDuty(dutyData);
                setData([...data, newDuty]);
                message.success('Thêm mới thành công!');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu dữ liệu!';
            message.error(`Lỗi: ${errorMessage}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleDelete = async (record: BreakfastDuty) => {
        try {
            await apiService.deleteDuty(record.id);
            setData(data.filter(item => item.id !== record.id));
            message.success('Xóa phân việc thành công!');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa!';
            message.error(`Lỗi: ${errorMessage}`);
        }
    };

    // Export dữ liệu JSON
    const exportJsonData = () => {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'breakfast_schedule.json';
        a.click();
        URL.revokeObjectURL(url);
        message.success('Xuất dữ liệu JSON thành công!');
    };

    return (
        <div className={`p-6 ${actualTheme === 'dark' ? 'dark' : ''}`}>
            <Card
                title={
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            📅 Phân việc đi lấy đồ ăn sáng
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                disabled={loading}
                            >
                                Thêm mới
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadDuties}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                            <Button onClick={exportJsonData} disabled={loading}>
                                Xuất JSON
                            </Button>
                        </div>
                    </div>
                }
                className={actualTheme === 'dark' ? 'dark-card' : ''}
            >
                <div className="mb-4">
                    <p className={`${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Lịch phân việc đi lấy đồ ăn sáng cho 21 tuần (10 tuần trước + tuần hiện tại + 10 tuần sau).
                        Mỗi người phụ trách 1 tuần từ thứ 2 đến thứ 6.
                    </p>
                </div>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                        }}
                        className={actualTheme === 'dark' ? 'dark-table' : ''}
                    />
                </Spin>
            </Card>

            <Modal
                title={editingRecord ? 'Chỉnh sửa phân việc' : 'Thêm phân việc mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={600}
                confirmLoading={submitLoading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten"
                        label="Tên người phụ trách"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input placeholder="Nhập tên người phụ trách" />
                    </Form.Item>

                    <Form.Item name="avatar" label="Avatar URL">
                        <Input placeholder="https://example.com/avatar.jpg" />
                    </Form.Item>

                    <Form.Item
                        name="tuan"
                        label="Số tuần"
                        rules={[{ required: true, message: 'Vui lòng nhập số tuần!' }]}
                    >
                        <Input type="number" placeholder="Số tuần" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="ngayBatDau"
                            label="Ngày bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item
                            name="ngayKetThuc"
                            label="Ngày kết thúc"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                        >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="trangThai"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="scheduled">Đã lên lịch</Select.Option>
                            <Select.Option value="in-progress">Đang làm</Select.Option>
                            <Select.Option value="completed">Đã hoàn thành</Select.Option>
                            <Select.Option value="missed">Đã bỏ lỡ</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BreakfastSchedulePage; 