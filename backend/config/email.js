const nodemailer = require('nodemailer');

/*
  ⚠️ HƯỚNG DẪN CẤU HÌNH EMAIL:
  
  1. Thay 'your-email@gmail.com' bằng email Gmail của bạn
  2. Thay 'your-app-password' bằng App Password (KHÔNG phải mật khẩu Gmail)
  
  📌 CÁCH LẤY APP PASSWORD:
  - Vào https://myaccount.google.com/security
  - Bật "2-Step Verification" (Xác minh 2 bước)
  - Tìm "App passwords" → Chọn "Mail" → Generate
  - Copy mật khẩu 16 ký tự (không có dấu cách)
*/

// ========== CẤU HÌNH EMAIL CỦA BẠN ==========
const EMAIL_USER = 'anhyeuem1phutthoi@gmail.com';
const EMAIL_PASS = 'aaxxnheoyzwmyehz';          // 👈 App Password KHÔNG có dấu cách
const EMAIL_FROM = 'My App <anhyeuem1phutthoi@gmail.com>';
// =============================================

// Tạo transporter với Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Kiểm tra kết nối email khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Lỗi cấu hình email:', error.message);
    console.log('💡 Kiểm tra lại EMAIL_USER và EMAIL_PASS trong config/email.js');
  } else {
    console.log('✅ Email server sẵn sàng gửi tin nhắn');
  }
});

// Hàm gửi OTP qua email
async function sendOTPEmail(toEmail, otp) {
  const mailOptions = {
    from: EMAIL_FROM,
    to: toEmail,
    subject: 'Mã OTP của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <div style="
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          padding: 30px;
          border-radius: 12px 12px 0 0;
        ">
          <h1 style="
            color: white;
            margin: 0;
            text-align: center;
            font-size: 26px;
          ">
            Xác Minh Bảo Mật
          </h1>
        </div>

        <div style="
          background: #FFF0F6;
          padding: 30px;
          border-radius: 0 0 12px 12px;
          border: 1px solid #F8BBD0;
          border-top: none;
        ">
          <p>Xin chào,</p>
          <p>Mã OTP của bạn là:</p>

          <div style="
            background: #F06292;
            color: #fff;
            font-size: 34px;
            font-weight: bold;
            text-align: center;
            padding: 22px;
            border-radius: 14px;
            letter-spacing: 10px;
            margin: 24px 0;
          ">
            ${otp}
          </div>

          <p>Mã có hiệu lực trong 10 phút.</p>

          <p style="font-size: 12px; color: #999; text-align: center;">
            Email được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      </div>
    `
  };


  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email OTP đã gửi thành công đến:', toEmail);
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOTPEmail };
