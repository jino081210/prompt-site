import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import nodemailer from 'nodemailer'; //gmail
import dotenv from 'dotenv'; // gmail
import jwt from 'jsonwebtoken';  // jsonwebtoken 라이브러리 추가
 //bcrypt 비밀번호 암호화화
import bcrypt from 'bcrypt';
import { useState } from 'react';
// import { random } from 'lodash';
const JWT_SECRET = 'omioiomioiom';  // JWT 서명 키
const app = express();
const port = 11001;

app.use(cors());
app.use(express.json()); // REST API 사용자 추가

async function bcrypt_pwd(pwd) {
  try {
    const hashedPassword = await bcrypt.hash(pwd, 10);
    return hashedPassword;
  } catch (err) {
    throw err;
  }
}

const db = new sqlite3.Database('./DataBase.db', (err) => {
  if (err) {
    console.error("DB 연결 실패", err);
  } else {
    console.log("sqlite 데이터베이스 연결");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userid TEXT,  
      name TEXT,
      email TEXT,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS board (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      writer TEXT,
      time TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS codeboard(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      writer TEXT,
      time TEXT
    )
  `);
});

dotenv.config(); // .env 파일 로드
// Nodemailer 이메일 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const recordCodes = {}; // 이메일과 인증 코드 저장

// 비밀번호 재설정 이메일 전송 API
app.post('/send-reset-email', (req, res) => {
  const { email } = req.body;
  let code = Math.floor(Math.random() * 999999) + 1;
  code = String(code).padStart(6, "0");

  // 인증 코드 저장 및 만료 시간 설정 (10분 후 자동 삭제)
  recordCodes[email] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 현재 시간 + 10분
  };

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('DB 조회 오류:', err);
      return res.status(500).json({ error: '서버 오류 발생' });
    }

    if (!row) {
      return res.status(404).json({ error: '등록된 이메일이 없습니다.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '비밀번호 재설정 요청',
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2>비밀번호 재설정 인증 코드</h2>
          <p>아래 6자리 인증 코드를 입력하여 비밀번호 재설정을 진행하세요.</p>
          <h1 style="color: #007bff;">${code}</h1>
          <p>이 코드는 10분 동안 유효합니다.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('이메일 전송 오류:', error);
        return res.status(500).json({ error: '이메일 전송 실패' });
      }
      res.status(200).json({ message: '비밀번호 재설정 이메일이 전송되었습니다.' });
    });
  });
});

// 인증 코드 검증 API
app.post('/compare-code', (req, res) => {
  const { email, inputcode } = req.body;

  // 이메일에 대한 인증 코드가 없는 경우
  if (!recordCodes[email]) {
    return res.status(400).json({ error: '인증 코드가 없습니다. 다시 요청하세요.' });
  }

  const { code, expiresAt } = recordCodes[email];

  // 인증 코드가 만료된 경우
  if (Date.now() > expiresAt) {
    delete recordCodes[email]; // 만료된 코드 삭제
    return res.status(400).json({ error: '인증 코드가 만료되었습니다. 다시 요청하세요.' });
  }

  // 입력된 코드와 저장된 코드가 일치하는지 확인
  if (code !== inputcode) {
    return res.status(400).json({ error: '잘못된 인증 코드입니다.' });
  }

  // 인증 성공 시 토큰 발급 (10분 동안 유효)
  console.log("이메일 :::::::::::::"+email)
  const key = jwt.sign(
    {email}, // 비밀번호를 제외하고 사용자 정보만 담기
    JWT_SECRET,                     // 서명 키
    { expiresIn: '1h' }             // 토큰 만료 시간 (1시간)
  );

  // 사용된 인증 코드는 삭제 (보안 강화를 위해)
  delete recordCodes[email];

  return res.status(200).json({ message: '코드 인증 성공', key });
});


app.post('/login', async (req, res) => {
  const { cpr_id, cpr_pwd } = req.body;

  try {
    const hashedPassword = await bcrypt_pwd(cpr_pwd);
    console.log(hashedPassword);

    db.get('SELECT * FROM users WHERE userid = ?', [cpr_id], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'DB 조회 중 오류가 발생했습니다.' });
      }

      if (row) {
        // 비밀번호 비교
        const isMatch = await bcrypt.compare(cpr_pwd, row.password);
        if (isMatch) {
          // JWT 토큰 생성
          console.log(row.userid)
          const token = jwt.sign(
            { id: row.userid, name: row.name, email: row.email, pwd: row.password}, // 비밀번호를 제외하고 사용자 정보만 담기
            JWT_SECRET,                     // 서명 키
            { expiresIn: '1h' }             // 토큰 만료 시간 (1시간)
          );
          
          return res.status(200).json({ message: '로그인 성공', token });
        } else {
          return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
        }
      } else {
        return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

//클라이언트 측으로 부터 토큰을 받고 토큰검사
// JWT 인증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Authorization 헤더에서 토큰 추출
  if (!token) {
    console.log('토큰이 없습니다.');
    return res.status(403).json({ message: '토큰이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('토큰 검증 실패:', err);
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = decoded; // 토큰에서 사용자 정보 저장
    next(); // 다음 미들웨어로 넘김
  });
};

app.get('/tokencheck', verifyToken, (req, res) => {
  // 토큰 검증 후, 토큰이 유효한 경우 응답 처리
  res.status(200).json({ message: '토큰이 유효합니다.', user: req.user });
});

//비번 재설정
const verifyKey = (req, res, next) => {
  const key = req.headers['authorization']?.split(' ')[1]; // Authorization 헤더에서 토큰 추출
  if (!key) {
    console.log('키가가 없습니다.');
    return res.status(403).json({ message: '키가가 필요합니다.' });
  }

  jwt.verify(key, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('키 검증 실패:', err);
      return res.status(401).json({ message: '유효하지 않은 키 입니다.' });
    }
    req.user = decoded; // 토큰에서 사용자 정보 저장
    next(); // 다음 미들웨어로 넘김
  });
};

app.get('/keycheck', verifyKey, (req, res) => {
  // 토큰 검증 후, 토큰이 유효한 경우 응답 처리
  res.status(200).json({ message: '키가 유효합니다.', user: req.user });
});
app.post('/resetpassword', verifyKey, async (req, res) => {
  const { password } = req.body;
  const email = req.user.email; // `verifyKey`에서 추출된 이메일

  if (!password) {
      return res.status(400).json({ error: '새로운 비밀번호를 입력해야 합니다.' });
  }

  try {
      // 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(password, 10);

      // 비밀번호 업데이트 실행
      db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], function (err) {
          if (err) {
              console.error('비밀번호 변경 오류:', err);
              return res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
          }

          if (this.changes === 0) {
              return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
          }

          res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
      });

  } catch (error) {
      console.error('비밀번호 암호화 오류:', error);
      res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

app.post('/poster', (req, res) => {
  const { title, content, writer} = req.body;
  // 원하는 날짜 형식으로 time 설정
  const time = new Date();
  const formattedTime = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;

  db.run("INSERT INTO board (title, content, writer, time) VALUES (?, ?, ?, ?)", [title, content, writer, formattedTime], function(err) {
    if (err) {
      console.error('글 등록 오류:', err);
      return res.status(500).json({ error: '글 등록 오류 발생' });
    }
    res.status(200).json({ message: '글이 등록되었습니다.' });
  });
});
app.post('/codeposter', (req, res) => {
  const { title, content, writer} = req.body;
  // 원하는 날짜 형식으로 time 설정
  const time = new Date();
  const formattedTime = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;

  db.run("INSERT INTO codeboard (title, content, writer, time) VALUES (?, ?, ?, ?)", [title, content, writer, formattedTime], function(err) {
    if (err) {
      console.error('글 등록 오류:', err);
      return res.status(500).json({ error: '글 등록 오류 발생' });
    }
    res.status(200).json({ message: '글이 등록되었습니다.' });
  });
});
app.get('/codeposts/:id', verifyToken, (req, res) => {
  const { id } = req.params; // URL에서 게시물 ID 추출
  const userId = req.user.id; // JWT에서 로그인한 사용자 ID 가져오기

  console.log(`요청한 게시물 ID: ${id}, 사용자 ID: ${userId}`); // 디버깅 로그

  db.get('SELECT * FROM codeboard WHERE id = ? AND writer = ?', [id, userId], (err, row) => {
    if (err) {
      console.error('게시물 조회 오류:', err);
      return res.status(500).json({ error: '게시물 조회 오류 발생' });
    }
    if (!row) {
      console.log('해당 게시물이 존재하지 않음'); // 디버깅 로그
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }
    res.status(200).json(row); // 게시물 데이터 응답
  });
});

app.get('/posts/:id', (req, res) => {
  const { id } = req.params; // URL 파라미터에서 게시물 ID 받기
  db.get('SELECT * FROM board WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('게시물 조회 오류:', err);
      return res.status(500).json({ error: '게시물 조회 오류 발생' });
    }
    if (!row) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }
    res.status(200).json(row); // 해당 게시물 반환
  });
});

app.post('/users', (req, res) => {
    const { userid, email, name, pwd } = req.body;
  
    // 먼저, 아이디가 이미 존재하는지 확인
    db.get('SELECT * FROM users WHERE userid = ?', [userid], (err, row) => {
      if (err) {
        console.error('회원가입 중 오류가 발생했습니다:', err);
        return res.status(500).json({ error: '회원가입 오류 발생' });
      }
  
      if (row) {
        // 이미 가입된 아이디가 있다면 에러 처리
        return res.status(401).json({ error: '이미 가입된 아이디입니다' });
      }
      bcrypt.hash(pwd, 10, (err, hasedPassword) => {
        console.log(hasedPassword)
        if (err) throw err ;

      db.run("INSERT INTO users (userid, email, name, password) VALUES (?, ?, ?, ?)", [userid, email, name, hasedPassword], function(err) {
                if (err) {
                  console.error('회원가입 오류:', err);
                  return res.status(500).json({ error: '회원가입 오류 발생' });
                }
                // 성공적으로 추가된 후 응답
                res.status(201).json();
              });
      }) 
      // 아이디가 없으면 새로 사용자 추가
    });
  });
  
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM board ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error('게시물 조회 오류:', err);
      return res.status(500).json({ error: '게시물 조회 오류 발생' });
    }
    res.status(200).json(rows); // 게시물 목록 반환
  });
});
app.get('/codeposts', verifyToken, (req, res) => {
  const userId = req.user.id; // JWT에서 사용자 ID 가져오기

  db.all('SELECT * FROM codeboard WHERE writer = ? ORDER BY id DESC', [userId], (err, rows) => {
    if (err) {
      console.error('코드 게시물 조회 오류:', err);
      return res.status(500).json({ error: '코드 게시물 조회 오류 발생' });
    }
    res.status(200).json(rows); // 사용자 코드 게시물 목록 반환
  });
});

app.post('/nameChange', verifyToken, (req, res) => {
  const { newName } = req.body;
  const userId = req.user.id; // JWT 토큰에서 사용자 ID 가져오기

  if (!newName || newName.trim() === "") {
    return res.status(400).json({ error: '이름을 입력해야 합니다.' });
  }

  db.run(
    "UPDATE users SET name = ? WHERE userid = ?",
    [newName, userId],
    function (err) {
      if (err) {
        console.error("이름 변경 오류:", err);
        return res.status(500).json({ error: "이름 변경 중 오류가 발생했습니다." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      }

      //  DB에서 변경된 사용자 정보 가져오기
      db.get("SELECT * FROM users WHERE userid = ?", [userId], (err, user) => {
        if (err || !user) {
          console.error("사용자 조회 오류:", err);
          return res.status(500).json({ error: "사용자 정보를 가져오는 중 오류가 발생했습니다." });
        }

        //  새로운 JWT 토큰 생성
        const newToken = jwt.sign(
          { id: user.userid, name: user.name, email: user.email },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        //  새로운 토큰을 클라이언트에 반환
        res.status(200).json({ message: "이름이 변경되었습니다.", token: newToken });
      });
    }
  );
});
app.post('/pwdchange', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // JWT에서 유저 ID 추출

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '현재 비밀번호와 새로운 비밀번호를 입력하세요.' });
  }

  try {
    // 기존 비밀번호 가져오기
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT password FROM users WHERE userid = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 비교
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새로운 비밀번호 암호화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password = ? WHERE userid = ?', [hashedNewPassword, userId], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(200).json({ message: '비밀번호가 변경되었습니다.' });

  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

// 게시물 삭제 API
app.delete('/posts/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 현재 로그인한 사용자 ID

  // 게시물 작성자 확인
  db.get('SELECT writer FROM board WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('게시물 조회 오류:', err);
      return res.status(500).json({ error: '서버 오류' });
    }

    if (!row) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    if (row.writer !== userId) {
      return res.status(403).json({ error: '게시물을 삭제할 권한이 없습니다.' });
    }

    // 게시물 삭제 실행
    db.run('DELETE FROM board WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('게시물 삭제 오류:', err);
        return res.status(500).json({ error: '게시물 삭제 실패' });
      }
      res.status(200).json({ message: '게시물이 삭제되었습니다.' });
    });
  });
});
app.delete('/codeposts/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 현재 로그인한 사용자 ID
  
    // 게시물 삭제 실행
    db.run('DELETE FROM codeboard WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('게시물 삭제 오류:', err);
        return res.status(500).json({ error: '게시물 삭제 실패' });
      }
      res.status(200).json({ message: '게시물이 삭제되었습니다.' });
    });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
