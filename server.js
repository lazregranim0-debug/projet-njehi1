const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;  // ← Directement ici

// ============ MIDDLEWARE ============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ============ SESSION ============
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// ============ MySQL CONNECTION ============
const conn = mysql.createConnection({
    host: 'localhost',      // ← Directement ici
    user: 'root',           // ← Directement ici
    password: '',           // ← Directement ici
    database: 'njehi'       // ← Directement ici
});

conn.connect((err) => {
    if (err) {
        console.error('❌ Erreur BD:', err);
        return;
    }
    console.log('✅ Connecté à MySQL');
});

// ============ SIGNUP ============
app.post('/api/signup.php', (req, res) => {
    const { first_name, last_name, email, username, password, confirm_password } = req.body;

    if (!first_name || !last_name || !email || !username || !password) {
        return res.json({ success: false, message: 'جميع الحقول مطلوبة' });
    }

    if (password !== confirm_password) {
        return res.json({ success: false, message: 'كلمات المرور غير متطابقة' });
    }

    if (password.length < 6) {
        return res.json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: 'البريد الإلكتروني غير صحيح' });
    }

    const mot_de_passe_hash = crypto.createHash('sha256').update(password).digest('hex');

    const checkSql = 'SELECT id FROM users WHERE email = ?';
    conn.query(checkSql, [email], (err, results) => {
        if (err) {
            return res.json({ success: false, message: 'خطأ في قاعدة البيانات' });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: 'البريد الإلكتروني موجود بالفعل' });
        }

        const insertSql = 'INSERT INTO users (nom, prenom, email, mot_de_passe, statut, role) VALUES (?, ?, ?, ?, ?, ?)';
        conn.query(insertSql, [last_name, first_name, email, mot_de_passe_hash, 'actif', 'etudiant'], (err, results) => {
            if (err) {
                return res.json({ success: false, message: 'خطأ في إنشاء الحساب' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            req.session.user_id = results.insertId;
            req.session.username = first_name;
            req.session.email = email;

            res.json({
                success: true,
                message: 'تم إنشاء الحساب بنجاح',
                user_id: results.insertId,
                username: first_name,
                token: token
            });
        });
    });
});

// ============ LOGIN ============
app.post('/api/login.php', (req, res) => {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
        return res.json({ success: false, message: 'الرجاء ملء جميع الحقول' });
    }

    const sql = 'SELECT id, nom, prenom, email, mot_de_passe, statut FROM users WHERE email = ? AND statut = ?';
    conn.query(sql, [username_or_email, 'actif'], (err, results) => {
        if (err) {
            return res.json({ success: false, message: 'خطأ في قاعدة البيانات' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'البريد الإلكتروني غير موجود' });
        }

        const user = results[0];
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== user.mot_de_passe) {
            return res.json({ success: false, message: 'كلمة المرور غير صحيحة' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        req.session.user_id = user.id;
        req.session.username = user.prenom;
        req.session.email = user.email;

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user_id: user.id,
            username: user.prenom,
            token: token
        });
    });
});

// ============ LOGOUT ============
app.get('/api/logout.php', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'تم تسجيل الخروج' });
});

// ============ SERVE INDEX ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ LANCER LE SERVEUR ============
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});