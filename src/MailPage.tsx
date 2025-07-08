import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Divider } from 'antd';
import { SaveOutlined, DeleteOutlined, MailOutlined, LockOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

interface MailSettings {
    site: string;
    username: string;
    password: string;
}

const SECRET_KEY = 'ksys-mail-encryption-key-2024';

const MailPage: React.FC = () => {
    const { actualTheme } = useTheme();
    const [form] = Form.useForm();
    const [settings, setSettings] = useState<MailSettings | null>(null);
    const [loading, setLoading] = useState(false);

    // Mã hóa dữ liệu
    const encryptData = (data: string): string => {
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    };

    // Giải mã dữ liệu
    const decryptData = (encryptedData: string): string => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch {
            return '';
        }
    };

    // Lưu settings vào localStorage
    const saveToLocalStorage = (settings: MailSettings) => {
        const encryptedData = encryptData(JSON.stringify(settings));
        localStorage.setItem('mail_settings', encryptedData);
    };

    // Đọc settings từ localStorage
    const loadFromLocalStorage = (): MailSettings | null => {
        try {
            const encryptedData = localStorage.getItem('mail_settings');
            if (!encryptedData) return null;

            const decryptedData = decryptData(encryptedData);
            return decryptedData ? JSON.parse(decryptedData) : null;
        } catch {
            return null;
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        const savedSettings = loadFromLocalStorage();
        if (savedSettings) {
            setSettings(savedSettings);
            form.setFieldsValue(savedSettings);
        }
    }, [form]);

    // Lưu settings
    const handleSave = async (values: MailSettings) => {
        setLoading(true);
        try {
            setSettings(values);
            saveToLocalStorage(values);
            message.success('Lưu cài đặt thành công!');
        } catch {
            message.error('Có lỗi xảy ra khi lưu cài đặt!');
        } finally {
            setLoading(false);
        }
    };

    // Xóa dữ liệu
    const handleClearData = () => {
        try {
            localStorage.removeItem('mail_settings');
            setSettings(null);
            form.resetFields();
            message.success('Xóa dữ liệu thành công!');
        } catch {
            message.error('Có lỗi xảy ra khi xóa dữ liệu!');
        }
    };

    return (
        <motion.div
            className={`min-h-screen ${actualTheme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100vh'
            }}
        >
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4"
                    >
                        <MailOutlined className="text-2xl text-white" />
                    </motion.div>
                    <Title level={1} className={`mb-2 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Cài đặt Mail
                    </Title>
                    <Text className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Cấu hình thông tin tài khoản mail để gửi email tự động
                    </Text>
                </div>

                {/* Main Card */}
                <Card
                    className={`shadow-xl ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    bodyStyle={{ padding: '2rem' }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        className={actualTheme === 'dark' ? 'dark' : ''}
                        size="large"
                    >
                        <div className="space-y-6">
                            {/* Site Field */}
                            <Form.Item
                                label={
                                    <span className={`flex items-center gap-2 text-base font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                        <GlobalOutlined className="text-blue-500" />
                                        Mail Server
                                    </span>
                                }
                                name="site"
                                rules={[{ required: true, message: 'Vui lòng nhập mail server!' }]}
                            >
                                <Input
                                    placeholder="VD: smtp.gmail.com, smtp.outlook.com"
                                    className={`h-12 ${actualTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                />
                            </Form.Item>

                            {/* Username Field */}
                            <Form.Item
                                label={
                                    <span className={`flex items-center gap-2 text-base font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                        <UserOutlined className="text-green-500" />
                                        Email / Username
                                    </span>
                                }
                                name="username"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'text', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    placeholder="your-email@example.com"
                                    className={`h-12 ${actualTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                />
                            </Form.Item>

                            {/* Password Field */}
                            <Form.Item
                                label={
                                    <span className={`flex items-center gap-2 text-base font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                        <LockOutlined className="text-red-500" />
                                        Password / App Password
                                    </span>
                                }
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
                            >
                                <Input.Password
                                    placeholder="Mật khẩu hoặc App Password"
                                    className={`h-12 ${actualTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                />
                            </Form.Item>
                        </div>

                        <Divider className={actualTheme === 'dark' ? 'border-gray-600' : ''} />

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={loading}
                                size="large"
                                className="h-12 px-8 bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
                            >
                                Lưu cài đặt
                            </Button>

                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleClearData}
                                size="large"
                                className="h-12 px-8"
                                disabled={!settings}
                            >
                                Xóa dữ liệu
                            </Button>
                        </div>
                    </Form>

                    {/* Status */}
                    {settings && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}
                        >
                            <div className={`text-center ${actualTheme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <Text strong className={actualTheme === 'dark' ? 'text-green-300' : 'text-green-700'}>
                                        Đã cấu hình
                                    </Text>
                                </div>
                                <Text className={`text-sm ${actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    Mail server: {settings.site} | Email: {settings.username}
                                </Text>
                            </div>
                        </motion.div>
                    )}


                </Card>
            </div>
            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                >
                    <div className={`text-center space-y-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="text-2xl">🔒</div>
                        <Text strong className={actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}>
                            Mã hóa dữ liệu
                        </Text>
                        <Text className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tất cả thông tin tài khoản được mã hóa AES-256 trước khi lưu vào localStorage
                        </Text>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                >
                    <div className={`text-center space-y-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="text-2xl">💾</div>
                        <Text strong className={actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}>
                            Lưu trữ cục bộ
                        </Text>
                        <Text className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Dữ liệu được lưu trữ trong trình duyệt của bạn và không được gửi đến server nào
                        </Text>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MailPage; 
