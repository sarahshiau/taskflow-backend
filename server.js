// const express = require("express");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// const { Pool } = require("pg"); // 使用 PostgreSQL 連線池

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// // 設定 PostgreSQL 連線池
// const pool = new Pool({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });

// // 測試資料庫連線
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error("❌ PostgreSQL 連線失敗", err.stack);
//   } else {
//     console.log("✅ PostgreSQL 連線成功");
//     release(); // 釋放連線
//   }
// });

// // 註冊 API
// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;//從請求中獲取用戶輸入

//   try {
//     // 檢查 email 是否已註冊
//     const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (userExists.rows.length > 0) {
//       return res.status(400).json({ message: "Email 已被註冊" });
//     }

//     // 加密密碼
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 新增用戶，將使用者存入資料庫
//     const newUser = await pool.query(
//       "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
//       [username, email, hashedPassword]
//     );
    

//     //將使用者存入資料庫
//     res.status(201).json({ message: "註冊成功", user: newUser.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "伺服器錯誤" });
//   }
// });

// // 登入 API
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 檢查用戶是否存在
//     const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (user.rows.length === 0) {
//       return res.status(400).json({ message: "用戶不存在" });
//     }

//     // 驗證密碼
//     const validPassword = await bcrypt.compare(password, user.rows[0].password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "密碼錯誤" });
//     }

//     // 產生 JWT Token
//     const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ message: "登入成功", token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "伺服器錯誤" });
//   }
// });


// // 啟動伺服器
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
// });

// //前端向後端請求tasks
// app.get('/tasks', async (req, res) => {//前端呼叫 GET /tasks 並附帶 Authorization: Bearer <token>
//   const token = req.headers.authorization?.split(' ')[1];//後端解析 headers ➜ 取得 token
//   if(!token) return res.status(401).json({ message: '未授權' });//沒 token ➜ 401 拒絕

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);//有 token ➜ jwt.verify() 解碼 ➜ 拿到 user_id
//     const tasks = await pool.query(
//       'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',//查詢資料庫 ➜ 找出 user_id 對應的所有 tasks
//       [decoded.id]
//     );
//     res.json(task.rows);//將 tasks 列表回傳 JSON 給前端
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: '伺服器錯誤'});
//   }
//   });

///////////
// const express = require("express");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const sql = require("mssql");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Azure SQL 連線設定
// const config = {
//   user: process.env.SQL_SERVER_USER,
//   password: process.env.SQL_SERVER_PASSWORD,
//   server: process.env.SQL_SERVER_HOST,
//   database: process.env.SQL_SERVER_DATABASE,
//   port: parseInt(process.env.SQL_SERVER_PORT, 10),
//   options: {
//     encrypt: true, // Azure SQL 需要加密
//     trustServerCertificate: false
//   }
// };

// // 建立連線池
// const pool = new sql.ConnectionPool(config);
// const poolConnect = pool.connect();

// // 測試連線
// poolConnect
//   .then(() => {
//     console.log("✅ 成功連接 Azure SQL Server！");
//   })
//   .catch((err) => {
//     console.error("❌ 連線失敗:", err);
//   });

// // Health check
// app.get("/", (req, res) => {
//   res.send("Hello! Server is running!");
// });

// // ✅ 註冊 API
// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     await poolConnect; // 確保 pool 已連接
//     const request = pool.request();

//     // 檢查 email 是否存在
//     const result = await request
//       .input("email", sql.NVarChar, email)
//       .query("SELECT * FROM users WHERE email = @email");

//     if (result.recordset.length > 0) {
//       return res.status(400).json({ message: "Email 已被註冊" });
//     }

//     // 密碼加密
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 插入新用戶
//     await request
//       .input("username", sql.NVarChar, username)
//       .input("email", sql.NVarChar, email)
//       .input("password", sql.NVarChar, hashedPassword)
//       .query(`
//         INSERT INTO users (username, email, password)
//         VALUES (@username, @email, @password)
//       `);

//     res.status(201).json({ message: "註冊成功！" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "伺服器錯誤" });
//   }
// });

// // ✅ 登入 API
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     await poolConnect;
//     const request = pool.request();

//     const result = await request
//       .input("email", sql.NVarChar, email)
//       .query("SELECT * FROM users WHERE email = @email");

//     if (result.recordset.length === 0) {
//       return res.status(400).json({ message: "用戶不存在" });
//     }

//     const user = result.recordset[0];

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "密碼錯誤" });
//     }

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ message: "登入成功", token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "伺服器錯誤" });
//   }
// });

// // ✅ 取得任務列表 API
// app.get("/tasks", async (req, res) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "未授權" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     await poolConnect;
//     const request = pool.request();

//     const result = await request
//       .input("user_id", sql.Int, decoded.id)
//       .query(`
//         SELECT * FROM tasks WHERE user_id = @user_id ORDER BY created_at DESC
//       `);

//     res.json(result.recordset);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "伺服器錯誤" });
//   }
// });

// // ✅ 啟動伺服器
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });

//////
// 匯入必要套件
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
require("dotenv").config();

// 初始化 express app
const app = express();
app.use(cors());               // 允許跨來源請求（給前端用）
app.use(express.json());       // 解析 JSON 請求 body

// Azure SQL 連線設定（從 .env 讀取）
const config = {
  user: process.env.SQL_SERVER_USER,
  password: process.env.SQL_SERVER_PASSWORD,
  server: process.env.SQL_SERVER_HOST,
  database: process.env.SQL_SERVER_DATABASE,
  port: parseInt(process.env.SQL_SERVER_PORT, 10),
  options: {
    encrypt: true,            // Azure 必須 true
    trustServerCertificate: false
  }
};

// 連接 SQL Server
sql.connect(config).then(pool => {
  if (pool.connected) {
    console.log("✅ 成功連接 Azure SQL Server！");
  }

  /**
   * 測試用 GET，確認 server 正常
   */
  app.get("/", (req, res) => {
    res.send("Hello! Server is running!");
  });

  /**
   * 使用者註冊
   */
  app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const userCheck = await pool.request()
        .input("email", sql.NVarChar, email)
        .query("SELECT * FROM users WHERE email = @email");

      if (userCheck.recordset.length > 0) {
        return res.status(400).json({ message: "Email 已註冊" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.request()
        .input("username", sql.NVarChar, username)
        .input("email", sql.NVarChar, email)
        .input("password", sql.NVarChar, hashedPassword)
        .query(`
          INSERT INTO users (username, email, password)
          VALUES (@username, @email, @password)
        `);

      res.status(201).json({ message: "註冊成功！" });
    } catch (error) {
      console.error("❌ 註冊錯誤：", error);
      res.status(500).json({ message: "伺服器錯誤" });
    }
  });

  /**
   * 使用者登入
   */
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.request()
        .input("email", sql.NVarChar, email)
        .query("SELECT * FROM users WHERE email = @email");

      if (result.recordset.length === 0) {
        return res.status(400).json({ message: "用戶不存在" });
      }

      const user = result.recordset[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ message: "密碼錯誤" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ message: "登入成功", token });
    } catch (error) {
      console.error("❌ 登入錯誤：", error);
      res.status(500).json({ message: "伺服器錯誤" });
    }
  });

  /**
   * 取得該用戶的任務
   */
  app.get("/tasks", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未授權" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await pool.request()
        .input("user_id", sql.Int, decoded.id)
        .query(`
          SELECT * FROM tasks WHERE user_id = @user_id ORDER BY created_at DESC
        `);

      res.json(result.recordset);
    } catch (error) {
      console.error("❌ 取得任務錯誤：", error);
      res.status(500).json({ message: "伺服器錯誤" });
    }
  });

  /**
   * 啟動 Server
   */
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

}).catch(err => {
  console.error("❌ 連線失敗：", err);
});
