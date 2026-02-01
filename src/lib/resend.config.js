import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (to, name) => {
  try {
    const data = await resend.emails.send({
      from: "Chatter <onboarding@resend.dev>", // Replace with your verified domain in production
      to: [to],
      subject: "Welcome to Chatter! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @media only screen and (max-width: 480px) {
                .email-container { padding: 20px !important; border-radius: 20px !important; }
                .email-h1 { font-size: 28px !important; }
                .email-p { font-size: 16px !important; }
                .email-logo-text { font-size: 22px !important; }
                .email-cta { padding: 12px 24px !important; font-size: 16px !important; }
                .email-footer { font-size: 10px !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0;">
            <div style="background-color: #e9e9e9; padding: 40px 20px; font-family: 'Helvetica', Arial, sans-serif;">
              <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: white; border: 4px solid #000000; border-radius: 32px; padding: 40px; box-shadow: 12px 12px 0px 0px #000000;">
                
                <!-- Logo area -->
                <div style="margin-bottom: 32px;">
                  <div style="display: inline-block; background-color: #ccfd52; border: 2px solid black; border-radius: 12px; padding: 10px; box-shadow: 4px 4px 0px 0px black;">
                    <span style="font-size: 24px; font-weight: 900; color: black;">C</span>
                  </div>
                  <span class="email-logo-text" style="font-size: 28px; font-weight: 900; color: black; margin-left: 10px; vertical-align: middle; letter-spacing: -1px; text-transform: uppercase;">Chatter</span>
                </div>

                <h1 class="email-h1" style="font-size: 40px; font-weight: 900; color: #000000; line-height: 1.1; margin-bottom: 20px; letter-spacing: -1.5px;">
                  WELCOME TO THE <br/> <span style="background-color: #a881f3; color: white; padding: 0 10px; border: 2px solid black; box-shadow: 4px 4px 0px 0px black;">EVOLUTION</span>
                </h1>

                <p class="email-p" style="font-size: 18px; font-weight: 600; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                  Hey ${name}, we're pumped to have you! Chatter is the next generation platform built for speed, transparency, and pure team interaction.
                </p>

                <!-- Feature Card -->
                <div style="background-color: #f3f4f6; border: 3px solid black; border-radius: 20px; padding: 24px; margin-bottom: 32px; box-shadow: 6px 6px 0px 0px rgba(0,0,0,0.1);">
                  <div style="font-size: 16px; font-weight: 800; color: black; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">What's Next?</div>
                  <p class="email-p" style="font-size: 15px; font-weight: 600; color: #6b7280; margin: 0;">Your workspace is ready. Invite your team, start a voice note, or drop a high-quality video call instantly.</p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <a href="https://chatter-app.vercel.app/login" class="email-cta" style="display: inline-block; background-color: #a881f3; color: white; border: 4px solid black; border-radius: 9999px; padding: 16px 40px; font-size: 20px; font-weight: 900; text-decoration: none; box-shadow: 6px 6px 0px 0px #000000;">
                    START CHATTING NOW
                  </a>
                </div>

                <div class="email-footer" style="border-top: 2px solid #edeff2; padding-top: 30px; display: flex; align-items: center; gap: 10px;">
                  <p style="font-size: 14px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                    © ${new Date().getFullYear()} CHATTER INC. | BUILT FOR THE FUTURE
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};

export default resend;
