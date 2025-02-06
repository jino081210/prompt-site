import { useState, useEffect } from 'react'; // React의 상태와 효과를 관리하는 훅들
import { FloatButton, message, List, Card, Avatar } from 'antd'; // Ant Design 컴포넌트들
import { EditOutlined } from '@ant-design/icons'; // 글쓰기 버튼 아이콘
import jwt_decode from 'jwt-decode'; // JWT 토큰 디코딩 라이브러리
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 hook
import axios from 'axios'; // HTTP 요청을 위한 axios
import CommonLayout from '../CommonLayout/CommonLayout'; // 공통 레이아웃 컴포넌트

function Homepage() {
  const [userName, setUserName] = useState(''); // 로그인한 사용자 이름
  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState([]); // 게시물 목록 상태 변수
  const ticket = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  // 로그인한 사용자 정보 처리
  useEffect(() => {
    if (ticket) {
      try {
        const decoded = jwt_decode(ticket); // JWT 토큰 디코딩
        if (decoded.name) {
          setUserName(decoded.name); // 사용자 이름을 상태에 저장
          setUserId(decoded.id)
        }
      } catch (error) {
        console.error('토큰 디코딩 실패:', error); // 디코딩 실패 시 에러 처리
      }
    }

    // 게시물 목록을 가져오는 함수
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:11001/posts', {
          headers: {
            Authorization: `Bearer ${ticket}`, // JWT 토큰을 Authorization 헤더에 포함
          },
        });
        setPosts(response.data); // 게시물 목록을 상태에 저장
      } catch (error) {
        console.error('게시물 불러오기 실패:', error); // 게시물 불러오기 실패 시 에러 처리
        message.error('게시물을 불러오는 데 실패했습니다.');
      }
    };

    fetchPosts(); // 컴포넌트 렌더링 시 게시물 목록 가져오기
  }, [ticket]);

  // 게시물 클릭 시 상세 페이지로 이동
  const handlePostClick = (id) => {
    navigate(`/post/${id}`); // 클릭한 게시물의 ID를 URL 파라미터로 전달
  };
  
  const handlePostpage=() => {
    if (userId != 'admin') {
      message.warning('관리자만 접속가능한 페이지입니다')
      return
    }
    navigate('/post')
  }

  return (
    <CommonLayout>
      <h1>홈페이지</h1>
      <p>안녕하세요, {userName}님!</p>

      {/* 게시물 목록을 보여주는 카드 */}
      <Card title="게시물 목록" style={{ marginBottom: '20px' }}>
        <List
          itemLayout="vertical" // 리스트 항목을 세로로 배치
          size="large" // 리스트 항목 크기 설정
          pagination={{
            onChange: (page) => {
              console.log(page); // 페이지 변경 시 로그 출력 (현재는 사용되지 않음)
            },
            pageSize: 5, // 페이지당 게시물 수
          }}
          dataSource={posts} // 게시물 목록 데이터
          renderItem={(item) => (
            <List.Item key={item.id} onClick={() => handlePostClick(item.id)} style={{cursor : 'pointer'}}> {/* 게시물 클릭 시 해당 게시물 ID로 상세 페이지로 이동 */}
              <List.Item.Meta
                avatar={<Avatar>{item.writer[0]}</Avatar>} // 작성자의 첫 글자를 아바타로 표시
                title={item.title} // 게시물 제목
                description={`작성자: ${item.writer} | 날짜: ${item.time}`} // 게시물 작성자와 작성일
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 글 작성 버튼 */}
      <FloatButton
        type="primary"
        icon={<EditOutlined />}
        onClick={handlePostpage} // 글 작성 페이지로 이동
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

export default Homepage;
