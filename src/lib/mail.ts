import sgMail from '@sendgrid/mail'

interface MailOptions {
  from: string;
  to?: string;
  subject: string;
  html: string;
}

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Replace the existing transporter with SendGrid send function
const sendMail = async (mailOptions: MailOptions) => {
  const msg = {
    from: {
      email: mailOptions.from.split('<')[1].split('>')[0] || 'noreply@ynhudl.com',
      name: mailOptions.from.split('<')[0].trim() || 'Yale Summer Debate Program'
    },
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  }
  
  return sgMail.send(msg)
}

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  await sendMail({
    from: 'Yale Summer Debate Program <noreply@ynhudl.com>',
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
    from: 'Yale Summer Debate Program <noreply@ynhudl.com>',
    to: email,
    subject: "Reset Your Password - Yale Summer Debate Program",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #00356B;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
              font-size: 16px;
            }
            .footer {
              padding: 24px;
              text-align: center;
              font-size: 13px;
              color: #666666;
            }
            .warning {
              margin-top: 30px;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 6px;
              font-size: 14px;
              color: #666666;
            }
            @media only screen and (max-width: 600px) {
              .content {
                padding: 30px 20px;
              }
              .header {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
          <div class="email-container">
            <div class="header">
              <h1>Yale Summer Debate Program</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Password Reset Request</h2>
              <p>We received a request to reset your password for your Yale Summer Debate Program account. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>If you didn't request this password reset, you can safely ignore this email - your password will remain unchanged.</p>
              <div class="warning">
                <p style="margin: 0 0 10px 0;">⚠️ This password reset link will expire in 1 hour for security reasons.</p>
                <p style="margin: 0 0 10px 0;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="margin: 0; word-break: break-all; font-family: monospace; font-size: 12px;">${resetLink}</p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;">This is an automated message, please do not reply to this email.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Yale Summer Debate Program. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  await sendMail(mailOptions)
}

export async function sendApplicationNotification(
  studentEmail: string,
  parentEmail: string,
  studentName: string,
  status: string
) {
  const subject = 
    'Your YSDP Application Has Been Submitted';

  const html = `
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
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Yale Summer Debate Program</h1>
          </div>
          <div class="content">
            <h2>${status === 'SUBMITTED' ? 'Application Submitted' : 'Application Saved'}</h2>
            <p>Dear ${studentName},</p>
            <p>Your application to the Yale Summer Debate Program has been successfully submitted. We will review your application and get back to you soon. </p>
            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:yalesummerdebateprogram@gmail.com">yalesummerdebateprogram@gmail.com</a>.</p>
            <p>Best regards,<br>YSDP Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Yale Summer Debate Program. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: 'Yale Summer Debate Program <noreply@ynhudl.com>',
    subject,
    html,
  };

  try {
    // Only send separate emails if the addresses are different
    if (studentEmail === parentEmail) {
      await sendMail(mailOptions)
    } else {
      await Promise.all([
        sendMail(mailOptions),
        sendMail({ ...mailOptions, to: parentEmail })
      ])
    }
  } catch (error) {
    console.error('Failed to send application notification:', error);
  }
}

export async function sendStatusUpdateEmail(
  studentEmail: string,
  parentEmail: string,
  studentName: string,
  status: string,
  isUdlStudent: boolean
) {
  const statusMessages = {
    ACCEPTED: isUdlStudent 
      ? "Congratulations! We are delighted to formally offer you a spot in the 2024 Yale Summer Debate Program. As a UDL student, your participation is fully supported by the New Haven Urban Debate League.\n\nThis year, the program will run from August 18-22 from 10:00 AM-4:00 PM. This program is a day camp, and transportation will not be provided. Essential logistics can be found in the Program Confirmation Form, which is now available on your dashboard. To secure your spot in the program, please have a parent log in to your account and complete the Program Confirmation Form by July 15th. If you do not plan on attending this program, please respond to this email to let us know as soon as possible so we can give other students an opportunity to attend. \n\nIn August, all those who completed the Program Confirmation Form will receive information about their teams, daily schedules, and the electives we will be offering. Students will be assigned to teams based on experience level and interests; if you have any special requests, please let us know.\n\nWe're excited to work with you this summer! Please do not hesitate to get in contact if you have any questions. Congratulations again!"
      : "Congratulations! We are delighted to formally offer you a spot in the 2024 Yale Summer Debate Program. We were impressed with your application and interest in debate, and could not be more excited to work with you this summer.\n\n Please have a parent/guardian complete the Program Confirmation Form now available on your application portal dashboard to secure your spot in the program. The deadline for this form and the program fee is July 15th. If you do not plan on attending this program, please respond to this email to let us know as soon as possible so we can give other students an opportunity to attend. \n\nThis year, the program will run from August 18-22 from 10:00 AM-4:00 PM. This program is a day camp, and transportation will not be provided. Essential logistics can be found in the Program Confirmation Form).\n\nAlong with this email, your parent/guardian should receive a PayPal invoice for payment. Additional information about payment is also included in the Program Confirmation Form. The fee for attending this program allows us to cover program costs (such as meals provided, coaching/judging stipends, program materials) and supports the broader mission of the New Haven Urban Debate League. Financial aid is available to cover the program fee only. If you intend to apply for financial aid, please complete that section of the Program Confirmation Form above.\n\nIn August, all those who completed the Program Confirmation Form will receive information about their teams, daily schedules, and the electives we will be offering. Students will be assigned to teams based on experience level and interests; if you have any special requests, please let us know.\n\nWe'd love for you to join us this summer, and we look forward to hearing back from you! Please do not hesitate to get in contact if you have any other questions. Congratulations again!",
    WAITLISTED: "Thank you for applying to the 2025 Yale Summer Debate Program. After careful review of your application, we have decided to offer you on our waitlist. We received an exceptional number of strong applications this year, making the decision process extremely challenging.\n\nYour application demonstrated clear potential and interest in debate, and we would be excited to have you join us if a spot becomes available. We will notify you immediately if a position opens up. We expect to finalize all admissions decisions by July 15th, and you should have your final decision by then.\n\nIf you would like to be removed from the waitlist at any point, please let us know immediately. Otherwise, we will keep your application active and contact you if a spot becomes available.\n\nWe appreciate your patience during this process and your interest in our program. We encourage you to keep pursuing your passion for debate, regardless of the outcome.",
    DENIED: "Thank you for applying to the 2025 Yale Summer Debate Program. We appreciate your interest and effort in submitting your application. After careful consideration, we regret to inform you that we are unable to offer you a spot in our program this year. We received a record number of applications this year, and the competition among the applicants was exceptionally high. Unfortunately, we had to make difficult choices due to limited space.\n\nWe understand that this news may be disappointing, but we encourage you to not be discouraged. We recognize your immense passion for debate and highly recommend that you apply again early next year.",
    WITHDRAWN: "We have received your request to withdraw your application from the 2025 Yale Summer Debate Program. Your application status has been updated to reflect this change.\n\nIf you withdrew by mistake or would like to be reconsidered, please contact us immediately at yalesummerdebateprogram@gmail.com.\n\nThank you for your interest in our program, and we wish you the best in your future endeavors."
  }

  const subject = `Yale Summer Debate Program - Application ${status.charAt(0) + status.slice(1).toLowerCase()}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            color: #333333;
            background-color: #ffffff;
            padding: 20px;
          }
          .header {
            background-color: #00356B;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-family: 'Arial', sans-serif;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .content p {
            margin: 0 0 24px 0;
            font-size: 16px;
          }
          .content .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 28px;
          }
          .signature {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
          }
          .signature p {
            margin: 0 0 16px 0;
          }
          .footer {
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #666666;
            font-family: 'Arial', sans-serif;
          }
          .contact {
            margin: 32px 0;
          }
          .contact a {
            color: #00356B;
            text-decoration: none;
            font-weight: 500;
          }
          .contact a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Yale Summer Debate Program</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${studentName},</p>
            <div style="white-space: pre-line">
              ${statusMessages[status as keyof typeof statusMessages]}
            </div>
            <p class="contact">If you have any questions, please don't hesitate to contact us at <a href="mailto:yalesummerdebateprogram@gmail.com">yalesummerdebateprogram@gmail.com</a>.</p>
            <div class="signature">
              <p>Best regards,</p>
              <p>Ayna Sibtain<br>Dennis Jin<br>Yale Summer Debate Program Co-Directors</p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Yale Summer Debate Program. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const mailOptions = {
    from: 'Yale Summer Debate Program <noreply@ynhudl.com>',
    subject,
    html,
  }

  try {
    // Only send separate emails if the addresses are different
    if (studentEmail === parentEmail) {
      await sendMail(mailOptions)
    } else {
      await Promise.all([
        sendMail(mailOptions),
        sendMail({ ...mailOptions, to: parentEmail })
      ])
    }
  } catch (error) {
    console.error('Failed to send status update email:', error)
  }
} 