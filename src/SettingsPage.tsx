import { Card, Radio, Space, Typography, Divider, Row, Col } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTheme, ThemeMode } from './ThemeContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
    const { theme, actualTheme, setTheme } = useTheme();

    const themeOptions = [
        {
            value: 'light' as ThemeMode,
            label: 'Sáng',
            icon: <SunOutlined />,
            description: 'Giao diện sáng dễ nhìn trong ban ngày'
        },
        {
            value: 'dark' as ThemeMode,
            label: 'Tối',
            icon: <MoonOutlined />,
            description: 'Giao diện tối bảo vệ mắt trong môi trường ít ánh sáng'
        },
        {
            value: 'system' as ThemeMode,
            label: 'Theo hệ thống',
            icon: <DesktopOutlined />,
            description: 'Tự động thay đổi theo cài đặt hệ thống'
        },
    ];

    return (
        <motion.div
            className="p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Title level={2} className="mb-6">Cài đặt</Title>

            {/* Theme Settings */}
            <Card className="mb-6 shadow-lg">
                <Title level={4} className="mb-4">
                    <span className="mr-2">🎨</span>
                    Giao diện
                </Title>
                <Text type="secondary" className="block mb-4">
                    Chọn giao diện phù hợp với sở thích của bạn
                </Text>

                <Radio.Group
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full" size="large">
                        {themeOptions.map((option) => (
                            <motion.div
                                key={option.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Radio
                                    value={option.value}
                                    className="w-full"
                                >
                                    <Card
                                        size="small"
                                        className={`ml-2 cursor-pointer transition-all duration-300 ${theme === option.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'hover:border-gray-400'
                                            }`}
                                        bodyStyle={{ padding: '12px 16px' }}
                                    >
                                        <Row align="middle">
                                            <Col span={2}>
                                                <span className="text-xl">{option.icon}</span>
                                            </Col>
                                            <Col span={22}>
                                                <div>
                                                    <Text strong className="text-base">{option.label}</Text>
                                                    <br />
                                                    <Text type="secondary" className="text-sm">
                                                        {option.description}
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Radio>
                            </motion.div>
                        ))}
                    </Space>
                </Radio.Group>

                <Divider />

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <Text type="secondary">
                        <strong>Giao diện hiện tại:</strong> {actualTheme === 'dark' ? 'Tối' : 'Sáng'}
                    </Text>
                </div>
            </Card>

            {/* Application Settings */}
            {/* <Card className="mb-6 shadow-lg">
                <Title level={4} className="mb-4">
                    <span className="mr-2">⚙️</span>
                    Cài đặt ứng dụng
                </Title>

                <Space direction="vertical" size="large" className="w-full">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <div>
                                <Text strong>Tự động lưu dữ liệu</Text>
                                <br />
                                <Text type="secondary">Tự động lưu thay đổi sau mỗi 30 giây</Text>
                            </div>
                        </Col>
                        <Col>
                            <Switch defaultChecked />
                        </Col>
                    </Row>

                    <Divider className="my-4" />

                    <Row justify="space-between" align="middle">
                        <Col>
                            <div>
                                <Text strong>Thông báo</Text>
                                <br />
                                <Text type="secondary">Hiển thị thông báo khi export thành công</Text>
                            </div>
                        </Col>
                        <Col>
                            <Switch defaultChecked />
                        </Col>
                    </Row>

                    <Divider className="my-4" />

                    <Row justify="space-between" align="middle">
                        <Col>
                            <div>
                                <Text strong>Backup tự động</Text>
                                <br />
                                <Text type="secondary">Tự động backup dữ liệu hàng ngày</Text>
                            </div>
                        </Col>
                        <Col>
                            <Switch />
                        </Col>
                    </Row>
                </Space>
            </Card> */}

            {/* About */}
            {/* <Card className="shadow-lg">
                <Title level={4} className="mb-4">
                    <span className="mr-2">ℹ️</span>
                    Thông tin ứng dụng
                </Title>

                <Space direction="vertical" size="middle">
                    <div>
                        <Text strong>Phiên bản: </Text>
                        <Text>1.0.0</Text>
                    </div>
                    <div>
                        <Text strong>Cập nhật lần cuối: </Text>
                        <Text>{new Date().toLocaleDateString('vi-VN')}</Text>
                    </div>
                    <div>
                        <Text strong>Hỗ trợ: </Text>
                        <Text>support@company.com</Text>
                    </div>
                </Space>
            </Card> */}
        </motion.div>
    );
};

export default SettingsPage; 