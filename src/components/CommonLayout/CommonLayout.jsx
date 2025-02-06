// src/components/CommonLayout/CommonLayout.jsx
import { Layout, Menu, message } from 'antd';
import { HomeOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

function CommonLayout({ children }) {
  const navigate = useNavigate(); // `useNavigate` 훅을 CommonLayout 안에서 사용
  const location = useLocation();

  const selectedKey = location.pathname === '/home' ? '1' :
                      location.pathname === '/board' ? '2' :
                      location.pathname === '/myinfo' ? '3' :
                      location.pathname === '/post' ? '1' : '1';

  // 로그아웃 함수
  const logout = () => {
    const token = localStorage.getItem('token'); // `token` 변수 선언
    if (!token) {
      message.error("로그인 후 시도해주세요");
      navigate('/login');
      return; // 로그아웃 후 추가 동작 방지
    }
    localStorage.removeItem('token'); // 토큰 삭제
    message.success("로그아웃 되었습니다");
    navigate('/login'); // 로그인 페이지로 리다이렉트
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '0 20px' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>prompt</div>
      </Header>
      <Layout>
        <Sider width={200} style={{ backgroundColor: '#001529' }}>
          <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
              게시판
            </Menu.Item>
            <Menu.Item key="2" icon={<SettingOutlined />} onClick={() => navigate('/board')}>
              코드저장함
            </Menu.Item>
            <Menu.Item key="3" icon={<UserOutlined />} onClick={() => navigate('/myinfo')}>
              내정보
            </Menu.Item>
            <Menu.Item key="4" icon={<LogoutOutlined />} onClick={logout}>
              로그아웃
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              backgroundColor: 'white',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
      <Footer style={{ textAlign: 'center' }}>

      </Footer>
    </Layout>
  );
}

export default CommonLayout;
