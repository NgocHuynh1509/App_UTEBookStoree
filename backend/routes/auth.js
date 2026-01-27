const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/email'); // 👈 Import hàm gửi email
const { generateToken } = require('../config/jwt');
const {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimit');

const router = express.Router();

// Lưu trữ OTP tạm thời (trong production nên dùng Redis)
const otpStore = {};

// Hàm tạo OTP 6 chữ số
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi OTP qua SMS (số điện thoại)
function sendOTPPhone(phone, otp) {
  console.log(`📱 OTP cho SĐT ${phone}: ${otp}`);
  // Trong production, sử dụng Twilio hoặc dịch vụ SMS khác
}

// Hàm validate email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Hàm validate số điện thoại
function isValidPhone(phone) {
  const regex = /^(0|\+84)[0-9]{9,10}$/;
  return regex.test(phone);
}

/* ========================================
   REGISTER - SEND OTP
   ======================================== */
router.post('/register/send-otp',  sendOtpLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email là bắt buộc' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  User.findByEmail(email, async (err, user) => {
    if (err) {
      console.log('DB error:', err);
      return res.status(500).json({ message: 'Lỗi server' });
    }

    if (user) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000;

    otpStore[`register_${email}`] = { otp, expiryTime };

    const result = await sendOTPEmail(email, otp);
    if (!result.success) {
      return res.status(500).json({ message: 'Không gửi được email OTP' });
    }

    console.log(`📩 OTP đăng ký gửi tới ${email}: ${otp}`);

    res.json({ message: 'OTP đã được gửi tới email' });
  });
});

/* ========================================
   REGISTER - VERIFY OTP & CREATE USER
   ======================================== */
router.post('/register',  verifyOtpLimiter, async (req, res) => {
  const { username, email, phone, password, otp } = req.body;

  const identifier = email || phone;

  if (!username || !password || !otp || !identifier) {
    return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });
  }

  const otpKey = `register_${identifier}`;
  const otpData = otpStore[otpKey];

  if (!otpData) {
    return res.status(400).json({ message: 'OTP không tồn tại hoặc đã hết hạn' });
  }

  if (Date.now() > otpData.expiryTime) {
    delete otpStore[otpKey];
    return res.status(400).json({ message: 'OTP đã hết hạn' });
  }

  if (otp !== otpData.otp) {
    return res.status(400).json({ message: 'OTP không chính xác' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  User.create(
    {
      username,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
    },
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Register failed' });
      }

      delete otpStore[otpKey];

      console.log(`✅ Đăng ký thành công: ${identifier}`);

      res.json({ message: 'Đăng ký thành công' });
    }
  );
});

router.post('/login',  loginLimiter,  (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // ✅ TẠO JWT
    const token = generateToken(user);

    res.json({
      message: 'Login success',
      token, // 👈 QUAN TRỌNG
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });
});

/* ========================================
   FORGOT PASSWORD - GỬI OTP
   Hỗ trợ cả email và số điện thoại
   ======================================== */
router.post('/forgot-password/send-otp',  sendOtpLimiter,  async (req, res) => {
  const { email, phone } = req.body;

  // Validate input
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email hoặc số điện thoại là bắt buộc' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
  }

  const identifier = email || phone;
  const identifierType = email ? 'email' : 'phone';

  // Kiểm tra user tồn tại (tìm theo email)
  // Nếu dùng phone, cần thêm hàm findByPhone trong User model
  const findUser = email 
    ? User.findByEmail 
    : User.findByPhone || User.findByEmail; // fallback nếu chưa có findByPhone

  findUser(identifier, async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server' });
    }

    if (!user) {
      return res.status(404).json({ 
        message: identifierType === 'email' 
          ? 'Email không tồn tại trong hệ thống' 
          : 'Số điện thoại không tồn tại trong hệ thống'
      });
    }

    // Tạo OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút

    // Lưu OTP với key là email hoặc phone
    otpStore[identifier] = { otp, expiryTime, type: identifierType };

    // Gửi OTP
    if (identifierType === 'email') {
      // Gửi email thực tế
      const result = await sendOTPEmail(identifier, otp);
      if (!result.success) {
        console.log(`⚠️ Không gửi được email, OTP: ${otp}`);
      }
    } else {
      sendOTPPhone(identifier, otp);
    }

    console.log(`✅ OTP đã tạo cho ${identifierType}: ${identifier} => ${otp}`);

    res.json({ 
      message: identifierType === 'email'
        ? 'Mã OTP đã được gửi đến email của bạn'
        : 'Mã OTP đã được gửi đến số điện thoại của bạn'
    });
  });
});

/* ========================================
   FORGOT PASSWORD - ĐẶT LẠI MẬT KHẨU
   Xác minh OTP và cập nhật mật khẩu mới
   ======================================== */
router.post('/forgot-password/reset-password',  resetPasswordLimiter, (req, res) => {
  const { email, phone, otp, newPassword } = req.body;

  const identifier = email || phone;

  // Validate input
  if (!identifier) {
    return res.status(400).json({ message: 'Email hoặc số điện thoại là bắt buộc' });
  }

  if (!otp) {
    return res.status(400).json({ message: 'Mã OTP là bắt buộc' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'Mật khẩu mới là bắt buộc' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  // Kiểm tra OTP tồn tại
  if (!otpStore[identifier]) {
    return res.status(400).json({ message: 'Mã OTP không tồn tại hoặc đã hết hạn' });
  }

  const { otp: storedOtp, expiryTime } = otpStore[identifier];

  // Kiểm tra OTP hết hạn
  if (Date.now() > expiryTime) {
    delete otpStore[identifier];
    return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu OTP mới.' });
  }

  // Kiểm tra OTP chính xác
  if (otp !== storedOtp) {
    return res.status(400).json({ message: 'Mã OTP không chính xác' });
  }

  // Hash mật khẩu mới
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server' });
    }

    // Cập nhật mật khẩu trong database
    const db = require('../db');
    const sql = email 
      ? 'UPDATE users SET password = ? WHERE email = ?'
      : 'UPDATE users SET password = ? WHERE phone = ?';
    
    db.query(sql, [hashedPassword, identifier], (err) => {
      if (err) {
        console.log('DB Error:', err);
        return res.status(500).json({ message: 'Không thể đặt lại mật khẩu' });
      }

      // Xóa OTP sau khi sử dụng
      delete otpStore[identifier];

      console.log(`✅ Mật khẩu đã được đặt lại cho: ${identifier}`);

      res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
    });
  });
});

module.exports = router;
