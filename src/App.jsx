// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage/Homepage';
import BoardPage from './components/BoardPage/BoardPage';
import MyPage from './components/MyPage/MyPage';
import PostPage from './components/PostPage/PostPage';
import LoginPage from './components/LoginPage/LoginPage';
import SignUpPage from './components/SignUpPage/SignUpPage';
import PostDetailPage from './PostDetail.jsx/PostDetailPage';
import CodePostDetailPage from './PostDetail.jsx/codepostdetail';
import CodePostPage from './components/CodePostPage/CodePostPage';
import FindPwd from './components/LoginPage/FindPassword';
import Resetpwd from './components/LoginPage/Reset-password'
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 hook
import { message } from 'antd';
import { useEffect } from 'react';
function App() {
  // const navigate = useNavigate(); // 페이지 이동을 위한 hook

  // token = localStorage.getItem('token')
  // if (!token) {
  //   message.error('로그인을 해주세요');
  //   navigate('/login')
  //   return;
  // }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/myinfo" element={<MyPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/codepost" element={<CodePostPage />} />
        <Route path="/findpwd" element={<FindPwd />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/reset-password" element={<Resetpwd />} />
        <Route path="/codeposts/:id" element={<CodePostDetailPage/>} />
        
      </Routes>
    </Router>
  );
}

export default App;

// import { Card, Input, Form, Button, message, Menu, Layout, FloatButton, Upload, Spin } from 'antd';
// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
// import { HomeOutlined, UserOutlined, SettingOutlined, EditOutlined, InboxOutlined  } from '@ant-design/icons';
// import axios from 'axios';
// import './App.css';
// // import * as jwt_decode from "jwt-decode";
// import jwt_decode from "jwt-decode"; // 수정된 부분
// const { TextArea } = Input;

// const { Header, Sider, Content, Footer } = Layout;

// // Common Layout 컴포넌트
// function CommonLayout({ children }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 현재 경로에 따라 선택되는 메뉴 키를 동적으로 설정
//   const selectedKey = location.pathname === '/home' ? '1' :
//                       location.pathname === '/board' ? '2' :
//                       location.pathname === '/myinfo' ? '3' :
//                       location.pathname === '/post' ? '1' : '1';

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       <Header style={{ backgroundColor: '#001529', padding: '0 20px' }}>
//         <div style={{ color: 'white', fontSize: '24px' }}>prompt</div>
//       </Header>
//       <Layout>
//         <Sider width={200} style={{ backgroundColor: '#001529' }}>
//           <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
//             <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
//               게시판
//             </Menu.Item>
//             <Menu.Item key="2" icon={<SettingOutlined />} onClick={() => navigate('/board')}>
//               문제집
//             </Menu.Item>
//             <Menu.Item key="3" icon={<UserOutlined />} onClick={() => navigate('/myinfo')}>
//               내정보
//             </Menu.Item>
//           </Menu>
//         </Sider>
//         <Layout style={{ padding: '0 24px 24px' }}>
//           <Content
//             style={{
//               padding: 24,
//               margin: 0,
//               minHeight: 280,
//               backgroundColor: 'white',
//             }}
//           >
//             {children}
//           </Content>
//         </Layout>
//       </Layout>
//       <Footer style={{ textAlign: 'center' }}>Footer Content</Footer>
//     </Layout>
//   );
// }

// // Homepage 컴포넌트
// function Homepage() {
//   const [userName, setUserName] = useState('');
//   const ticket = localStorage.getItem('token');
  
//   useEffect(() => {
//     if (ticket) {
//       try {
//         const decoded = jwt_decode(ticket);
//         if (decoded.name) {
//           setUserName(decoded.name);
//         }
//         else {
//           console.log("n")
//         }
//       } catch (error) {
//         console.error('토큰 디코딩 실패:', error);
//       }
//     }
//   }, [ticket]);

//   const navigate = useNavigate();
//   const handleCreatePost = () => {
//     // 여기에 관리자 인증로직
//     navigate('/post');
//   };

//   return (
//     <CommonLayout>
//       <h1>홈페이지</h1>
//       <p>안녕하세요, {userName}님!</p>
//       <FloatButton
//         type="primary"
//         icon={<EditOutlined />}
//         onClick={handleCreatePost}
//         style={{
//           position: 'fixed',
//           bottom: 30,
//           right: 30,
//           zIndex: 1000,
//         }}
//       />
//     </CommonLayout>
//   );
// }

// // BoardPage 컴포넌트
// function BoardPage() {
//   return (
//     <CommonLayout>
//       <h1>문제집 페이지</h1>
//       {/* 추가 콘텐츠 */}
//     </CommonLayout>
//   );
// }

// // MyPage 컴포넌트
// function MyPage() {
//   return (
//     <CommonLayout>
//       <h1>내 정보 페이지</h1>
//       {/* 추가 콘텐츠 */}
//     </CommonLayout>
//   );
// }

// function PostPage() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // 파일 첨부 핸들러
//   const handleFileChange = (info) => {
//     if (info.file.status === 'done') {
//       setFile(info.file.originFileObj);
//       message.success(`${info.file.name} 파일 업로드 성공`);
//     } else if (info.file.status === 'error') {
//       message.error(`${info.file.name} 파일 업로드 실패`);
//     }
//   };

//   // 글쓰기 제출 함수
//   const handleSubmit = async () => {
//     if (!title || !content) {
//       message.error('제목과 내용을 모두 작성해주세요!');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('content', content);
//     if (file) formData.append('file', file);

//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:11001/posts', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       message.success('글이 작성되었습니다!');
//       navigate('/home'); // 글 작성 후 홈으로 이동
//     } catch (error) {
//       message.error('글 작성 실패: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//       <Card title="글쓰기" style={{ width: '800px'}}>
//         <Form layout="vertical" onFinish={handleSubmit}>
//           <Form.Item label="제목" name="title" rules={[{ required: true, message: '제목을 입력해주세요!' }]}>
//             <Input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="글 제목을 입력하세요"
//             />
//           </Form.Item>

//           <Form.Item label="내용" name="content" rules={[{ required: true, message: '내용을 입력해주세요!' }]}>
//             <TextArea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               rows={4}
//               placeholder="글 내용을 입력하세요"
//             />
//           </Form.Item>

//           <Form.Item label="파일 첨부" name="file">
//             <Upload.Dragger
//               name="file"
//               beforeUpload={() => false} // 파일을 즉시 선택 가능하게 설정
//               onChange={handleFileChange}
//               accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx"
//               showUploadList={{ showRemoveIcon: true }}
//             >
//               <p className="ant-upload-drag-icon">
//                 <InboxOutlined />
//               </p>
//               <p className="ant-upload-text">파일을 끌어다 놓거나 클릭하여 업로드하세요</p>
//             </Upload.Dragger>
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               block
//               loading={loading}
//             >
//               {loading ? '제출 중...' : '제출'}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// }

// // LoginPage 컴포넌트
// function LoginPage() {
//   const navigate = useNavigate();
//   const [cpr_id, setCprId] = useState('');
//   const [cpr_pwd, setCprPwd] = useState('');

//   const handleLogin = async () => {
//     const userData = { cpr_id, cpr_pwd };
//     try {
//       const response = await axios.post('http://localhost:11001/login', userData);
//       const token = response.data.token;
//       localStorage.setItem('token', token);
//       message.success('로그인 되었습니다.');
//       navigate('/home');
//     } catch (error) {
//       message.error('로그인 실패: ' + error.message);
//     }
//   };

//   return (
//     <div className="center">
//       <Card title="Login" style={{ width: '400px', border: '1px solid black' }}>
//         <Form onFinish={handleLogin}>
//           <Form.Item label="Id" name="id" rules={[{ required: true, message: '아이디를 입력해주세요' }]}>
//             <Input
//               placeholder="아이디를 입력해주세요"
//               value={cpr_id}
//               onChange={(e) => setCprId(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="PassWord" name="password" rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}>
//             <Input
//               placeholder="비밀번호를 입력해주세요"
//               type="password"
//               value={cpr_pwd}
//               onChange={(e) => setCprPwd(e.target.value)}
//             />
//           </Form.Item>
//           <Button block type="primary" htmlType="submit">
//             Login
//           </Button>
//         </Form>
//         <p>회원이 아니신가요? <a href="/sign-up">회원가입</a></p>
//       </Card>
//     </div>
//   );
// }

// // SignUpPage 컴포넌트
// function SignUpPage() {
//   const navigate = useNavigate();
//   const [userid, setId] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [pwd, setPwd] = useState('');
//   const [cnfpwd, setCnfpwd] = useState('');

//   const handle_signup = async () => {
//     if (pwd !== cnfpwd) {
//       message.error('비밀번호가 일치하지 않습니다');
//       return;
//     }
//     try {
//       const userData = { userid, email, name, pwd };
//       await axios.post('http://localhost:11001/users', userData);
//       message.success('회원가입 되었습니다');
//       navigate('/login');
//     } catch (error) {
//       message.error('회원가입 실패 - error : ' + error);
//     }
//   };

//   const back = () => {
//     navigate('/login');
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//       <Card title="Sign-Up" style={{ width: '500px', height: '550px', border: '0.5px solid black' }}>
//         <Form onFinish={handle_signup}>
//           <Form.Item label="Id" name="id" rules={[{ required: true, message: '아이디를 입력해주세요' }]}>
//             <Input
//               placeholder="사용하실 아이디를 입력해주세요"
//               value={userid}
//               onChange={(e) => setId(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="Name" name="name" rules={[{ required: true, message: '이름을 입력해주세요' }]}>
//             <Input
//               placeholder="이름을 입력해주세요"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="Email" name="email" rules={[{ required: true, message: '이메일을 입력해주세요' }]}>
//             <Input
//               placeholder="사용하실 이메일을 입력해주세요"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="PassWord" name="password" rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}>
//             <Input
//               type="password"
//               placeholder="사용하실 비밀번호를 입력해주세요"
//               value={pwd}
//               onChange={(e) => setPwd(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="PassWord-confirm" name="confirmPassword" rules={[{ required: true, message: '비밀번호 확인을 입력해주세요' }]}>
//             <Input
//               type="password"
//               placeholder="비밀번호를 다시 입력해주세요"
//               value={cnfpwd}
//               onChange={(e) => setCnfpwd(e.target.value)}
//             />
//           </Form.Item>
//           <Button block type="primary" htmlType="submit">
//             가입하기
//           </Button>
//           <Button block type="dashed" onClick={back} style={{ color: 'red', borderColor: 'red', marginTop: '10px' }}>
//             가입취소
//           </Button>
//         </Form>
//         <p>이미 가입하셨나요? <a href="/login">로그인</a></p>
//       </Card>
//     </div>
//   );
// }

// // App 컴포넌트
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Homepage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/sign-up" element={<SignUpPage />} />
//         <Route path="/home" element={<Homepage />} />
//         <Route path="/board" element={<BoardPage />} />
//         <Route path="/myinfo" element={<MyPage />} />
//         <Route path="/post" element={<PostPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
