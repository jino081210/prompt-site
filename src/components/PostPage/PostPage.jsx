import { Card, Input, Form, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill 기본 스타일

const token_check = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  try {
    await axios.get('http://localhost:11001/tokencheck', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return true;
  } catch {
    return false;
  }
};

function PostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer, setUserName] = useState('');

  useEffect(() => {
    const checkTokenAndSetUser = async () => {
      const tokenValid = await token_check();
      if (tokenValid) {
        const ticket = localStorage.getItem('token');
        if (ticket) {
          try {
            const decoded = jwt_decode(ticket);
            if (decoded.id) {
              if (decoded.id != "admin") {
                message.warning('관리자만 접속가능한 페이지입니다')
                navigate('/')
                return;
              }
              setUserName(decoded.id);
            }
          } catch (error) {
            console.error('토큰 디코딩 실패:', error);
          }
        }
      } else {
        message.error('로그인 후 시도해주세요');
        navigate('/login'); 
      }
    };
    // checkTokenAndSetUser();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      const postData = { title, content, writer };
      await axios.post('http://localhost:11001/poster', postData);
      message.success('글이 성공적으로 작성되었습니다!');
      navigate('/home');
    } catch (error) {
      message.error('네트워크 오류 또는 서버에 문제가 발생했습니다.');
      console.error(error);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }], // 글자 크기
      [{ font: [] }], // 폰트 변경
      [{ size: ["small", false, "large", "huge"] }], // 사이즈 변경 옵션 추가
      ["bold", "italic", "underline", "strike"], // 굵기, 기울기, 밑줄, 취소선
      [{ color: [] }, { background: [] }], // 색상 변경
      [{ script: "sub" }, { script: "super" }], // 위첨자, 아래첨자
      [{ align: [] }], // 정렬
      ["blockquote", "code-block"], // 블록 스타일
      [{ list: "ordered" }, { list: "bullet" }], // 리스트
      [{ indent: "-1" }, { indent: "+1" }], // 들여쓰기
      ["link", "image", "video"], // 링크, 이미지, 비디오 삽입
      ["clean"], // 스타일 초기화
    ],
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="글쓰기" style={{ width: '800px', cursor: 'default', minHeight : '500px' }} hoverable>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="제목" name="title" rules={[{ required: true, message: '제목을 입력해주세요!' }]}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="글 제목을 입력하세요" />
          </Form.Item>
          
          <Form.Item label="내용" name="content" rules={[{ required: true, message: '내용을 입력해주세요!' }]}>
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={quillModules} // 글자 크기 옵션 추가됨
              style={{ height: "300px" }} 
            />
          </Form.Item>

          <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop : '80px'}}>
            <Button type="primary" htmlType="submit" style={{ width: '500px' }}>
              등록하기
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default PostPage;
