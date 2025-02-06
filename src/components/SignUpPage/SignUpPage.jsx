import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUpPage.css'; // CSS 파일 import

function SignUpPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Ant Design의 Form 상태 관리

  const handle_signup = async (values) => {
    const { userid, name, email, pwd, cnfpwd } = values;

    if (pwd !== cnfpwd) {
      message.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const userData = { userid, email, name, pwd };
      await axios.post('http://localhost:11001/users', userData);
      message.success('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        message.error('이미 가입된 아이디입니다. 다른 아이디를 사용해주세요.');
      } else {
        message.error('회원가입에 실패했습니다.');
      }
    }
  };

  const back = () => {
    navigate('/login');
  };

  return (
    <div className="center">
      <Card title="Sign-Up" className='glass' hoverable>
        <Form form={form} layout="vertical" onFinish={handle_signup}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}><label>Id</label></td>
                <td style={{ width: '70%' }}>
                  <Form.Item name="userid" rules={[{ required: true, message: '아이디를 입력해주세요!' }]}>
                    <Input placeholder="사용하실 아이디를 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>

              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}><label>Name</label></td>
                <td style={{ width: '70%' }}>
                  <Form.Item name="name" rules={[{ required: true, message: '이름을 입력해주세요!' }]}>
                    <Input placeholder="이름을 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>

              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}><label>Email</label></td>
                <td style={{ width: '70%' }}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '이메일을 입력해주세요!' },
                      { type: 'email', message: '올바른 이메일 형식을 입력해주세요!' }
                    ]}
                  >
                    <Input placeholder="사용하실 이메일을 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>

              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}><label>PassWord</label></td>
                <td style={{ width: '70%' }}>
                  <Form.Item name="pwd" rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}>
                    <Input.Password placeholder="사용하실 비밀번호를 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>

              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}><label>PassWord-confirm</label></td>
                <td style={{ width: '70%' }}>
                  <Form.Item
                    name="cnfpwd"
                    dependencies={['pwd']}
                    rules={[
                      { required: true, message: '비밀번호 확인을 입력해주세요!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('pwd') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="비밀번호를 다시 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>
            </tbody>
          </table>

          <Button block type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
            가입하기
          </Button>
          <Button block type="dashed" onClick={back} style={{ color: 'red', borderColor: 'red', marginTop: '10px' }}>
            가입취소
          </Button>
        </Form>

        <p>이미 가입하셨나요? <a href="/login">로그인</a></p>
      </Card>
    </div>
  );
}

export default SignUpPage;
