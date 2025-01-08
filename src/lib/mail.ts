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

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Yale Summer Debate Program" <noreply@ynhudl.com>',
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
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