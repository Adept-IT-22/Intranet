import React from "react";

const ITSupport = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#333", padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <header style={{ backgroundColor: "#004080", color: "white", padding: "20px 0", textAlign: "center" }}>
        <h1>IT Support Center</h1>
        <p>We're here to help you with all your technical needs.</p>
      </header>

      <main style={{ maxWidth: 900, margin: "20px auto", backgroundColor: "white", padding: 20, borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
        {/* Helpdesk Contacts */}
        <section id="helpdesk-contacts" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Helpdesk Contacts</h2>
          <div style={{ fontWeight: "bold", marginBottom: 10 }}>
            <p>
              Phone: <a href="tel:+15551234567" style={{ color: "#004080", textDecoration: "none" }}>+1 (555) 123-4567</a>
            </p>
            <p>
              Email: <a href="mailto:support@yourcompany.com" style={{ color: "#004080", textDecoration: "none" }}>support@yourcompany.com</a>
            </p>
            <p>
              Live Chat: Available Monday–Friday, 8:00 AM – 6:00 PM via{" "}
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: "#004080", textDecoration: "none" }}>
                Live Chat Portal
              </a>
            </p>
          </div>
          <p>You can reach out during business hours for immediate assistance or submit a ticket for non-urgent issues.</p>
        </section>

        {/* Ticketing System */}
        <section id="ticketing-system" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Ticketing System</h2>
          <p>
            To ensure your issues are tracked and resolved efficiently, please submit your support requests through our ticketing system:
          </p>
          <ul>
            <li>Visit the <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: "#004080" }}>IT Support Ticket Portal</a></li>
            <li>Fill in the required details about your issue</li>
            <li>Select the relevant category (Hardware, Software, Network, Access, etc.)</li>
            <li>Submit your ticket and receive a confirmation email with your ticket number</li>
          </ul>
          <p>Our support team will respond within 4 business hours and keep you updated on progress.</p>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Frequently Asked Questions (FAQ)</h2>
          <dl>
            <dt style={{ fontWeight: "bold", marginTop: 15 }}>How do I reset my password?</dt>
            <dd style={{ marginLeft: 20, marginBottom: 15 }}>
              Use the <a href="#" style={{ color: "#004080" }}>Password Reset Portal</a> or contact the helpdesk for assistance.
            </dd>

            <dt style={{ fontWeight: "bold", marginTop: 15 }}>How do I connect to the company Wi-Fi?</dt>
            <dd style={{ marginLeft: 20, marginBottom: 15 }}>
              Follow the instructions in our <a href="#" style={{ color: "#004080" }}>Wi-Fi Setup Guide</a> or contact support if you experience issues.
            </dd>

            <dt style={{ fontWeight: "bold", marginTop: 15 }}>How do I install approved software?</dt>
            <dd style={{ marginLeft: 20, marginBottom: 15 }}>
              Request software installation through the ticketing system with the software name and justification.
            </dd>

            <dt style={{ fontWeight: "bold", marginTop: 15 }}>Who do I contact if my computer is running slow?</dt>
            <dd style={{ marginLeft: 20, marginBottom: 15 }}>
              Submit a ticket under “Hardware Performance” or call the helpdesk for immediate troubleshooting.
            </dd>

            <dt style={{ fontWeight: "bold", marginTop: 15 }}>What should I do if I receive a suspicious email?</dt>
            <dd style={{ marginLeft: 20, marginBottom: 15 }}>
              Do not open links or attachments and immediately report the email to{" "}
              <a href="mailto:security@yourcompany.com" style={{ color: "#004080" }}>security@yourcompany.com</a>.
            </dd>
          </dl>
        </section>

        {/* Troubleshooting Guides */}
        <section id="troubleshooting-guides" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Troubleshooting Guides</h2>
          <h3>Common Issues and Solutions</h3>

          <h4>Cannot connect to VPN</h4>
          <ul>
            <li>Check your internet connection</li>
            <li>Verify VPN credentials</li>
            <li>Restart your VPN client</li>
            <li>If issues persist, submit a ticket with error screenshots</li>
          </ul>

          <h4>Printer not responding</h4>
          <ul>
            <li>Ensure printer is powered on and connected</li>
            <li>Restart printer and your computer</li>
            <li>Check for paper jams or low ink</li>
            <li>Contact helpdesk if unresolved</li>
          </ul>

          <h4>Email not syncing on mobile device</h4>
          <ul>
            <li>Verify correct email settings (IMAP/Exchange)</li>
            <li>Remove and re-add your email account</li>
            <li>Restart the device</li>
            <li>Submit a ticket if the problem continues</li>
          </ul>

          <p>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "8px 15px",
                backgroundColor: "#004080",
                color: "white",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              View all Troubleshooting Guides
            </a>
          </p>
        </section>

        {/* Software and Hardware Support */}
        <section id="software-hardware-support" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Software and Hardware Support</h2>
          <p>Our IT team supports a range of company-approved software and hardware, including but not limited to:</p>
          <ul>
            <li><strong>Software:</strong> Office 365, Slack, Zoom, VPN clients, antivirus, and custom internal apps</li>
            <li><strong>Hardware:</strong> Laptops, desktops, printers, scanners, network devices</li>
          </ul>
          <p>
            If you require new hardware or software, please submit a request through the ticketing system. All requests are reviewed for compliance with company IT policies.
          </p>
        </section>

        {/* Remote Support */}
        <section id="remote-support" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Remote Support</h2>
          <p>
            If you need direct assistance, our technicians can remotely access your device with your permission. Please contact the helpdesk to schedule a remote support session.
          </p>
        </section>

        {/* Service Hours */}
        <section id="service-hours" style={{ marginBottom: 40 }}>
          <h2 style={{ color: "#004080" }}>Service Hours</h2>
          <ul>
            <li><strong>Support Desk:</strong> Monday – Friday, 8:00 AM – 6:00 PM</li>
            <li><strong>Emergency Support:</strong> 24/7 for critical issues via phone</li>
          </ul>
        </section>
      </main>

      <footer style={{ textAlign: "center", marginTop: 40, marginBottom: 20, color: "#666", fontSize: "0.9em" }}>
        &copy; 2025 Your Company IT Support. All rights reserved.
      </footer>
    </div>
  );
};

export default ITSupport;
