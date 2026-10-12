// Welcome email
exports.welcomeEmail = function ({ firstName }) {
  const subject = "Welcome to Oladan Radar";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #f7f8fa; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: #ffffff; margin: -24px -24px 24px; border-radius: 8px 8px 0 0; padding: 24px;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px;">Welcome, ${firstName}!</h2>
        <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
          Thank you for joining Oladan Radar. We're excited to have you on board.
        </p>
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Browse Properties
        </a>
      </div>
      <div style="padding: 24px; color: #6b7280; font-size: 0.875rem;">
        <p>You received this email because you signed up at Oladan Radar.</p>
        <p>If you have any questions, please reply to this email.</p>
      </div>
    </div>
  `;
  const text = `Welcome, ${firstName}!\n\nThank you for joining Oladan Radar. We're excited to have you on board.\n\nBrowse Properties: ${process.env.CLIENT_URL}\n\nIf you have any questions, please reply to this email.`;
  return { subject, html, text };
};

// Verify email
exports.verifyEmail = function ({ firstName, verifyUrl }) {
  const subject = "Verify your Oladan Radar email";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #f7f8fa; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: #ffffff; margin: -24px -24px 24px; border-radius: 8px 8px 0 0; padding: 24px;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px;">Verify your email</h2>
        <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
          Please verify your email address to complete your registration.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Verify Email
        </a>
      </div>
      <div style="padding: 24px; color: #6b7280; font-size: 0.875rem;">
        <p>You received this email because you signed up at Oladan Radar.</p>
        <p>If you did not create an account, no further action is needed.</p>
      </div>
    </div>
  `;
  const text = `Please verify your email address to complete your registration.\n\nVerify your email: ${verifyUrl}\n\nYou received this email because you signed up at Oladan Radar.\nIf you did not create an account, no further action is needed.`;
  return { subject, html, text };
};

// Forgot password
exports.forgotPasswordEmail = function ({ firstName, resetUrl }) {
  const subject = "Reset your Oladan Radar password";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #f7f8fa; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: #ffffff; margin: -24px -24px 24px; border-radius: 8px 8px 0 0; padding: 24px;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px;">Password reset requested</h2>
        <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
          You requested a password reset. Please use the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Reset Password
        </a>
      </div>
      <div style="padding: 24px; color: #6b7280; font-size: 0.875rem;">
        <p>You received this email because you requested a password reset.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you did not request a password reset, no further action is needed.</p>
      </div>
    </div>
  `;
  const text = `You requested a password reset.\n\nReset your password: ${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\nIf you did not request a password reset, no further action is needed.`;
  return { subject, html, text };
};

// Application status
exports.applicationStatusEmail = function ({ tenantName, propertyTitle, status }) {
  const subject = `Your application was ${status}`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #f7f8fa; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: #ffffff; margin: -24px -24px 24px; border-radius: 8px 8px 0 0; padding: 24px;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px;">
          Your application for <strong>${propertyTitle}</strong> was <strong>${status}</strong>
        </h2>
        <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
          Dear ${tenantName},<br/>We're writing to update you on the status of your application.
        </p>
      </div>
      <div style="padding: 24px; color: #6b7280; font-size: 0.875rem;">
        <p>If you have any questions, please contact us.</p>
        <p>You received this email because you submitted an application at Oladan Radar.</p>
      </div>
    </div>
  `;
  const text = `Your application for ${propertyTitle} was ${status}.\n\nDear ${tenantName},\n\nWe're writing to update you on the status of your application.\nIf you have any questions, please contact us.\nYou received this email because you submitted an application at Oladan Radar.`;
  return { subject, html, text };
};