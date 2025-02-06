import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginPage.css';

const token_check = async () => {
    const key = localStorage.getItem('key');
    if (!key) return false;
    try {
        await axios.get('http://localhost:11001/keycheck', {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        return true;
    } catch (error) {
        return false;
    } 
};

function ResetPwd() {
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Ant Design의 Form 상태 관리

    useEffect(() => {
        const checkToken = async () => {
            if (!(await token_check())) {
                message.error("비정상적인 접근입니다");
                navigate('/findpwd');
            }
        };
        checkToken();
    }, [navigate]);

    const handlePwdChange = async (values) => {
        const { changePwd, confirmPwd } = values;
        if (changePwd !== confirmPwd) {
            message.error("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const key = localStorage.getItem('key');
            await axios.post('http://localhost:11001/resetpassword', 
                { password: changePwd }, 
                { headers: { 'Authorization': `Bearer ${key}` } }
            );
            message.success("비밀번호가 성공적으로 변경되었습니다.");
            navigate('/login');
        } catch (error) {
            message.error("비밀번호 변경에 실패했습니다.");
        }
    };

    return (
        <div className="center">
            <Card title="비밀번호 변경" className='glass' hoverable>
                <Form form={form} layout="vertical" onFinish={handlePwdChange}>
                    <Form.Item 
                        label="변경할 비밀번호" 
                        name="changePwd"
                        rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    
                    <Form.Item 
                        label="비밀번호 재입력" 
                        name="confirmPwd"
                        rules={[{ required: true, message: "비밀번호를 다시 입력해주세요." }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            비밀번호 변경
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default ResetPwd;
