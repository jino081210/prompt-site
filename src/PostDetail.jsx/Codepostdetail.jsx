import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, message, Modal } from 'antd';
import axios from 'axios';
import CommonLayout from '../components/CommonLayout/CommonLayout';
import jwt_decode from 'jwt-decode';
import DOMPurify from 'dompurify'; // XSS 방지
import 'react-quill/dist/quill.snow.css'; // Quill 스타일 추가
import './PostDetailPage.css'; // 추가 스타일 적용

const { Text } = Typography;

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const response = await axios.get(`http://localhost:11001/codeposts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('게시물 상세 정보 불러오기 실패:', error);
        setLoading(false);
      }
    };

    const fetchCurrentUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          setCurrentUser(decoded.id);
        } catch (error) {
          console.error('토큰 디코딩 실패:', error);
        }
      }
    };

    fetchPostDetail();
    fetchCurrentUser();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:11001/codeposts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('게시물이 삭제되었습니다.');
      navigate('/board');
    } catch (error) {
      message.error('게시물 삭제 실패');
      console.error('게시물 삭제 오류:', error);
    }
  };
  
  const showConfirm = () => {
    Modal.confirm({
      title: '경고',
      content: '게시물을 삭제하시겠습니까?',
      okText: '확인',
      cancelText: '취소',
      onOk() {
        handleDelete()
      },
      onCancel() {
        message.success('취소되었습니다')
      },
    });
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <div>게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <CommonLayout>
        <Card 
          title={
            <div>
              <div style={{ fontSize: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {post.title}
                {currentUser === post.writer && (
                  <Button type="primary" danger onClick={showConfirm}>
                    삭제하기
                  </Button>
                )}
              </div>
              
              <Text type="secondary" style={{ fontSize: "16px" }}>
                작성자 : {post.writer} 
              </Text>
              <Text style={{ marginLeft: "7px" }}> | </Text>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                작성일 : {post.time}
              </Text>
            </div>
          }
          style={{
            cursor: "default",
            height: "100%",
          }}
          hoverable
        >
          {/* HTML을 안전하게 렌더링 */}
          <div 
            className="quill-content" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
          />
        </Card>
      </CommonLayout>
    </div>
  );
}

export default PostDetailPage;
