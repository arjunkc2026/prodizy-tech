export default async function handler(req, res) {
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
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    // Temporary sender for testing (must be verified in Resend)
    const senderEmail = process.env.RESEND_TEST_EMAIL || "prodizytech@gmail.com";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Website Contact <${senderEmail}>`,
        to: [senderEmail], // Receive test emails here
        subject: "New Client Inquiry from Website",
        html: `
          <h2>New Contact Form Submission</h2>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "Not provided"}</p>
          <p><b>Company:</b> ${company || "Not provided"}</p>
          <p><b>Service Interested:</b> ${service}</p>
          <p><b>Budget:</b> ${budget || "Not specified"}</p>
          <p><b>Newsletter:</b> ${newsletter ? "Yes" : "No"}</p>
          <hr/>
          <p><b>Project Details:</b></p>
          <p>${message}</p>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      return res.status(500).json({ message: "Failed to send message", error: errorText });
    }

    return res.status(200).json({ message: "Message sent successfully!" });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}