import { Card, Form, Input, Button, Modal, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LoginPage.css';
import LoginPage from './LoginPage';

function findPwd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isVisible, setIsVisible] = useState(false); // 인증 코드 입력창 표시 여부
  const [inputCode, setInputCode] = useState(''); // 사용자가 입력한 인증 코드 저장
  const [email, setEmail] = useState(''); // 사용자가 입력한 이메일 저장

  // 이메일 전송 함수
  const sendResetEmail = async (email) => {
    try {
      await axios.post('http://localhost:11001/send-reset-email', { email });
      message.success('비밀번호 재설정 이메일이 전송되었습니다.');
      setIsVisible(true); // 인증 코드 입력창 표시
    } catch (error) {
      message.error('메일 전송 실패: ' + (error.response?.data?.error || error.message));
    }
  };

  // 모달 표시 및 이메일 전송
  const showAlert = (values) => {
    const userEmail = values.email; // 폼에서 입력한 이메일 가져오기
    setEmail(userEmail); // 상태에 저장
    Modal.confirm({
      title: '비밀번호 재설정',
      content: `${userEmail} : 이 이메일로 6자리 인증 코드를 보내시겠습니까?`,
      onOk() {
        sendResetEmail(userEmail);
      }
    });
  };

  // 인증 코드 확인 요청 (서버에서 받은 key를 localStorage에 저장)
  const codeCheck = async () => {
    if (!inputCode) {
      message.error('인증 코드를 입력하세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:11001/compare-code', {
        email,
        inputcode: inputCode
      });

      if (response.status === 200) {
        const { key } = response.data; // 서버에서 받은 key (JWT)
        localStorage.setItem('key', key); // 🔹 LocalStorage에 저장
        message.success('인증 성공! 비밀번호를 재설정하세요.');
        navigate('/reset-password'); // 🔹 비밀번호 재설정 페이지로 이동
      }
    } catch (error) {
      message.error('잘못된 인증 코드입니다. 다시 시도하세요.');
    }
  };

  return (
    <div className="center">
      <Card title="비밀번호 찾기" className='glass'>
        <Form form={form} layout="vertical" onFinish={showAlert}>
          <Form.Item>
            <label style={{ fontSize: '100%' }}>
              가입한 E-Mail을 입력하면 6자리 인증 코드가 전송됩니다.
            </label>
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요!' },
              { type: 'email', message: '올바른 이메일 형식을 입력해주세요!' }
            ]}
          >
            <Input placeholder='xxyyzz@email.com' onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>

          <Form.Item>
            {isVisible ? (
              <Button type='primary' htmlType='submit'>재전송</Button>
            ) : (
              <Button type='primary' htmlType='submit'>이메일로 전송</Button>
            )}
          </Form.Item>
        </Form>

        {/* 인증 코드 입력창 (isVisible이 true일 때만 표시) */}
        {isVisible && (
          <div style={{ marginTop: '20px' }}>
            <Form layout="vertical">
              <Form.Item label="인증 코드">
                <Input
                  placeholder="6자리 인증 코드 입력"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{ width: '40%' }}
                />
              </Form.Item>

              <Form.Item>
                <Button type='primary' onClick={codeCheck}>확인</Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
}

export default findPwd;
