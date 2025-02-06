import CommonLayout from '../CommonLayout/CommonLayout';
import { useState, useEffect } from 'react';
import { FloatButton, message, List, Card, Avatar } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BoardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 토큰 검증 함수
  const token_check = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      await axios.get('http://localhost:11001/tokencheck', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // 🔹 게시물 데이터 가져오기 함수
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:11001/codeposts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('게시물 조회 실패:', error);
      message.error('게시물 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 useEffect: 로그인 확인 및 데이터 불러오기
  useEffect(() => {
    const init = async () => {
      const isTokenValid = await token_check();
      if (!isTokenValid) {
        message.error("로그인 후 시도해주세요");
        navigate('/login');
        return;
      }
      await fetchPosts(); // 토큰이 유효하면 게시물 가져오기
    };

    init();
  }, [navigate]); // navigate 추가 (의존성)

  return (
    <CommonLayout>
      <Card 
        title={<div style={{ fontSize: '200%' }}>나의 저장 목록</div>} 
        loading={loading}
      > 
        <List
          itemLayout="vertical"
          size="large"
          dataSource={posts}
          pagination={{ pageSize: 10 }}
          renderItem={(item) => (
            <List.Item key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/codeposts/${item.id}`)}>
              <Card hoverable>
                <List.Item.Meta
                  avatar={<Avatar>{item.writer.charAt(0).toUpperCase()}</Avatar>}
                  title={<div style={{ fontSize: '120%', fontWeight: 'bold' }}>{item.title}</div>}
                  description={`작성자: ${item.writer} | 작성일: ${item.time}`}
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>
      
      {/* 글쓰기 버튼 */}
      <FloatButton
        type="primary"
        icon={<EditOutlined />}
        onClick={() => navigate('/codepost')}
        style={{
          position: 'fixed',
          bottom: 60,
          right: 60,
          zIndex: 1000,
        }}
      />
    </CommonLayout>
  );
}

export default BoardPage;
