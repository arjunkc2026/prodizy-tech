// pages/api/contact.js
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    service,
    budget,
    message,
    newsletter
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !service || !message) {
    return res.status(400).json({ 
      message: "Please fill in all required fields" 
    });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return res.status(500).json({ 
        message: "Email service not configured" 
      });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // FROM: Use Resend's verified email
        from: "ProdizyTech Contact Form <onboarding@resend.dev>",
        
        // TO: Your Gmail where you'll RECEIVE the inquiries
        to: ["prodizytech@gmail.com"],
        
        // REPLY-TO: Client's email so you can reply directly
        reply_to: email,
        
        subject: `New Client Inquiry: ${service} - ${firstName} ${lastName}`,
        
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff;
                }
                .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .content { 
                  padding: 30px;
                  background: #f9fafb;
                }
                .info-box {
                  background: white;
                  border-radius: 8px;
                  padding: 20px;
                  margin-bottom: 20px;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .info-row {
                  padding: 12px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .info-row:last-child {
                  border-bottom: none;
                }
                .label {
                  font-weight: 600;
                  color: #374151;
                  display: inline-block;
                  min-width: 140px;
                }
                .value {
                  color: #6b7280;
                }
                .message-box {
                  background: white;
                  border-left: 4px solid #667eea;
                  padding: 20px;
                  border-radius: 8px;
                  margin-top: 20px;
                }
                .message-box h3 {
                  margin-top: 0;
                  color: #374151;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  color: #9ca3af;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔔 New Client Inquiry</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">From ProdizyTech Contact Form</p>
                </div>
                
                <div class="content">
                  <div class="info-box">
                    <div class="info-row">
                      <span class="label">👤 Name:</span>
                      <span class="value"><strong>${firstName} ${lastName}</strong></span>
                    </div>
                    <div class="info-row">
                      <span class="label">📧 Email:</span>
                      <span class="value"><a href="mailto:${email}" style="color: #667eea;">${email}</a></span>
                    </div>
                    ${phone ? `
                    <div class="info-row">
                      <span class="label">📱 Phone:</span>
                      <span class="value">${phone}</span>
                    </div>
                    ` : ''}
                    ${company ? `
                    <div class="info-row">
                      <span class="label">🏢 Company:</span>
                      <span class="value">${company}</span>
                    </div>
                    ` : ''}
                    <div class="info-row">
                      <span class="label">💼 Service:</span>
                      <span class="value"><strong>${service}</strong></span>
                    </div>
                    ${budget ? `
                    <div class="info-row">
                      <span class="label">💰 Budget:</span>
                      <span class="value">${budget}</span>
                    </div>
                    ` : ''}
                    <div class="info-row">
                      <span class="label">📰 Newsletter:</span>
                      <span class="value">${newsletter ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>

                  <div class="message-box">
                    <h3>📝 Project Details</h3>
                    <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      })
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ 
        message: "Failed to send message. Please try again.",
        error: data.message 
      });
    }

    console.log("✅ Email sent successfully:", data.id);
    
    return res.status(200).json({ 
      success: true,
      message: "Thank you! Your message has been sent successfully."
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ 
      message: "An error occurred. Please try again later.",
      error: err.message 
    });
  }
}