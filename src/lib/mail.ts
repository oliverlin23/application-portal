import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: '"Yale Summer Debate Program" <noreply@ynhudl.com>',
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Welcome to Yale Summer Debate Program!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${confirmLink}">${confirmLink}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!email || !token) {
    throw new Error('Email and token are required')
  }

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Yale Summer Debate Program" <noreply@ynhudl.com>',
    to: email,
    subject: "Reset Your Password - Yale Summer Debate Program",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
            }
            .header {
              background-color: #00356B;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 20px;
              background-color: #ffffff;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #00356B;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666666;
            }
            .warning {
              font-size: 12px;
              color: #666666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Yale Summer Debate Program</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password for your Yale Summer Debate Program account. Please click the button below to select a new password:</p>
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              <p>If you didn't request this password reset, you can safely ignore this email - your password will remain unchanged.</p>
              <div class="warning">
                <p>This password reset link will expire in 1 hour for security reasons.</p>
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px;">${resetLink}</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Yale Summer Debate Program. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
} 