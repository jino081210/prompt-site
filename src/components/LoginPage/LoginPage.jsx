import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { filter } from 'lodash';

function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Ant Design의 Form 상태 관리

  const handleLogin = async (values) => {
    const { cpr_id, cpr_pwd } = values; // AntD Form에서 가져온 값

    try {
      const response = await axios.post('http://localhost:11001/login', { cpr_id, cpr_pwd });
      const token = response.data.token;
      localStorage.setItem('token', token);
      message.success('로그인 되었습니다.');
      navigate('/home');
    } catch (error) {
      message.error('로그인 실패: ' + (error.response?.data?.message || error.message));
    }
  };
  const handleFindPwd=async()=>{
    navigate('/findpwd')
  }

  return (
    <div className="center">
      <Card title="Login" className='glass' hoverable>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}>
                  <label>Id</label>
                </td>
                <td style={{ width: '70%' }}>
                  <Form.Item
                    name="cpr_id"
                    rules={[{ required: true, message: '아이디를 입력해주세요!' }]}
                  >
                    <Input placeholder="아이디를 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>

              <tr>
                <td style={{ width: '30%', paddingRight: '10px' }}>
                  <label>PassWord</label>
                </td>
                <td style={{ width: '70%' }}>
                  <Form.Item
                    name="cpr_pwd"
                    rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}
                  >
                    <Input.Password placeholder="비밀번호를 입력해주세요" />
                  </Form.Item>
                </td>
              </tr>
            </tbody>
          </table>
          <Button block type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
            Login
          </Button>
        </Form>
        <div style={{display : 'flex'}}>
        <p>회원이 아니신가요? <a href="/sign-up">회원가입</a></p>
        <p onClick={handleFindPwd} style={{color : 'blue', paddingLeft:'160px', cursor:'pointer'}}>비밀번호 찾기</p>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
