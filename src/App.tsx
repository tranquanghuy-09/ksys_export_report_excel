import { useState } from 'react';
import {
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SettingOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, Layout, ConfigProvider, theme } from 'antd';
import { motion } from "framer-motion";
import HomePage from "./HomePage";
import SettingsPage from "./SettingsPage";
import MailPage from "./MailPage";
import BreakfastSchedulePage from "./BreakfastSchedulePage";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
  // { key: '1', icon: <PieChartOutlined />, label: 'Báo cáo' },
  // { key: '2', icon: <DesktopOutlined />, label: 'Thống kê' },

  {
    key: 'sub1',
    label: 'Mail',
    icon: <MailOutlined />,
    // children: [
    //   { key: '5', label: 'Người dùng' },
    //   { key: '6', label: 'Phòng ban' },
    //   { key: '7', label: 'Quyền hạn' },
    //   { key: '8', label: 'Lịch sử' },
    // ],
  },
  { key: 'breakfast', icon: <ScheduleOutlined />, label: 'Phân việc' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  // {
  //   key: 'sub2',
  //   label: 'Công cụ',
  //   icon: <AppstoreOutlined />,
  //   // children: [
  //   //   { key: '9', label: 'Export' },
  //   //   { key: '10', label: 'Import' },
  //   //   {
  //   //     key: 'sub3',
  //   //     label: 'Tiện ích',
  //   //     children: [
  //   //       { key: '11', label: 'Backup' },
  //   //       { key: '12', label: 'Restore' },
  //   //     ],
  //   //   },
  //   // ],
  // },
];

function AppWithTheme() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState('home');
  const { actualTheme } = useTheme();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'home':
        return <HomePage />;
      case 'sub1':
        return <MailPage />;
      case 'breakfast':
        return <BreakfastSchedulePage />;
      case '1':
        return (
          <div className={`p-8 ${actualTheme === 'dark' ? 'dark' : ''}`}>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Báo cáo</h2>
            <p className="dark:text-gray-300">Trang báo cáo đang được phát triển...</p>
          </div>
        );
      case '2':
        return (
          <div className={`p-8 ${actualTheme === 'dark' ? 'dark' : ''}`}>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Thống kê</h2>
            <p className="dark:text-gray-300">Trang thống kê đang được phát triển...</p>
          </div>
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div className={`p-8 ${actualTheme === 'dark' ? 'dark' : ''}`}>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Trang đang phát triển</h2>
            <p className="dark:text-gray-300">Tính năng này đang được phát triển...</p>
          </div>
        );
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: actualTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <motion.div
        className={`App w-screen h-screen overflow-hidden ${actualTheme === 'dark' ? 'dark' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: actualTheme === 'dark' ? 'var(--bg-color)' : undefined,

        }}
      >
        <Layout style={{
          height: '100vh',
          backgroundColor: actualTheme === 'dark' ? 'var(--bg-color)' : undefined
        }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            theme={actualTheme}
            width={200}
          >
            <div className="p-4 flex justify-center " style={{ paddingLeft: '14px', borderBottom: actualTheme === 'light' ? '1px solid #e0e0e0' : undefined, paddingBottom: '10px' }}>
              <Button
                type="primary"
                onClick={toggleCollapsed}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                className="w-full mb-4"
              />
            </div>
            <Menu
              selectedKeys={[selectedKey]}
              defaultOpenKeys={['sub1']}
              mode="inline"
              theme={actualTheme}
              items={items}
              onClick={handleMenuClick}
            />
          </Sider>
          <Layout>
            <Content
              style={{
                overflow: 'auto',
                backgroundColor: actualTheme === 'dark' ? 'var(--bg-color)' : undefined,
                color: actualTheme === 'dark' ? 'var(--text-color)' : undefined,
                border: actualTheme === 'light' ? '1px solid #e0e0e0' : undefined,
              }}
              className={actualTheme === 'dark' ? 'dark' : ''}
            >
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
                className={actualTheme === 'dark' ? 'dark' : ''}
              >
                {renderContent()}
              </motion.div>
            </Content>
          </Layout>
        </Layout>
      </motion.div>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

export default App;