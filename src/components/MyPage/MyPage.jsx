import { useState, useEffect } from 'react';
import CommonLayout from '../CommonLayout/CommonLayout';
import { Card, message, Input, Form, Button } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPage.css';

const token_check = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    await axios.get('http://localhost:11001/tokencheck', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    return false;
  } 
};
//안녕하세요
function MyPage() {
  const navigate = useNavigate();
  const [name, setUserName] = useState('');
  const [id, setUserId] = useState('');
  const [email, setUserEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPwdcnf, setNewPwdcnf] = useState('');
  useEffect(() => {
    const checkToken = async () => {
      if (await token_check()) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwt_decode(token);
            setUserName(decoded.name);
            setUserId(decoded.id);
            setUserEmail(decoded.email);
            setNewName(decoded.name);
          } catch (error) {
            console.error('토큰 디코딩 실패:', error);
          }
        }
      } else {
        message.warning('로그인이 필요합니다');
        navigate('/login');
      }
    };
    checkToken();
  }, [navigate]);

  const handleUpdate = async () => {
    if (isEditing && !newName.trim()) {
      message.error('이름을 입력하세요.');
      return;
    }
    if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
      message.error('비밀번호를 모두 입력하세요.');
      return;
    }
    
    if (isEditing) {
      try {
        const res = await axios.post('http://localhost:11001/nameChange',
          { newName },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        localStorage.setItem('token', res.data.token);
        setUserName(newName);
        setIsEditing(false);
        message.success('이름이 변경되었습니다.');
      } catch {
        message.error('이름 변경에 실패했습니다.');
      }
    }

    if (oldPassword && newPassword) {
      if (newPassword != newPwdcnf) {
        message.warning("변경 비밀번호가 일치하지 않습니다.")
        return;
      }
      try {
        const res = await axios.post('http://localhost:11001/pwdchange',
          { oldPassword, newPassword },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (res.status === 200) {
          message.success('비밀번호가 변경되었습니다.');
          setOldPassword('');
          setNewPassword('');
        } else {
          message.error(res.data.error || '비밀번호 변경에 실패했습니다.');
        }
      } catch (error) {
        console.error('비밀번호 변경 오류:', error.response?.data || error);
        message.error(error.response?.data?.error || '비밀번호 변경에 실패했습니다.');
      }
    }
  };

  return (
    <CommonLayout>
      <Card title="Info" style={{ border: '1px solid black', height: '100%' }}>
        <Form>
          <Card type="inner" title="아이디" style={{ marginBottom: '20px' }}>
            <h4>{id}</h4>
          </Card>
          <Card type="inner" title="이름" style={{ marginBottom: '20px' }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {isEditing ? (
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus style={{ width: "150px", marginRight: "10px" }} />
              ) : (
                <h4 style={{ marginRight: "10px" }}>{name}</h4>
              )}
              {isEditing ? (
                <CloseOutlined onClick={() => setIsEditing(false)} style={{ cursor: "pointer", color: "red" }} />
              ) : (
                <EditOutlined onClick={() => setIsEditing(true)} style={{ cursor: "pointer", color: "#1890ff" }} />
              )}
            </div>
          </Card>
          <Card type="inner" title="이메일" style={{ marginBottom: '20px' }}>
            <h4>{email}</h4>
          </Card>
          <Card type="inner" title="비밀번호 변경" style={{ marginBottom: '20px' }}>
            <table>
              <tr>
                <td>
                <label>현제 비밀번호 </label>
                </td>
                <td style={{paddingLeft:'20px'}}>
                  <Input.Password placeholder="현재 비밀번호" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ marginBottom: '10px' }} />
                </td>
              </tr>
              <tr>
                <td >
                  <label>새 비밀번호 </label>
                </td>
                <td style={{paddingLeft:'20px'}}>
                <Input.Password placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginBottom: '10px' }}/>
                </td>
              </tr>
              <tr>
                <td >
                  <label>비밀번호 확인</label>
                </td>
                <td style={{paddingLeft:'20px'}}>
                <Input.Password placeholder="새 비밀번호 재입력" value={newPwdcnf} onChange={(e) => setNewPwdcnf(e.target.value)} />
                </td>
              </tr>
            </table>
          </Card>
          {id === "admini" && (
            <p>._________.</p>  
          )}
          <Button type='primary' onClick={handleUpdate} style={{ marginLeft: '1%' }}>저장하기</Button>
        </Form>
      </Card>
    </CommonLayout>
  );
}

export default MyPage;
