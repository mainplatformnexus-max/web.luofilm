import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src={logo} alt="LUO FILM" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-lg">LUO FILM</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 15, 2026</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to LUO FILM ("we", "our", or "us"). We operate the website <strong>luofilm.site</strong> and related
              mobile and web applications. This Privacy Policy explains how we collect, use, disclose, and protect your
              personal information when you use our services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By accessing or using LUO FILM, you agree to this Privacy Policy. If you do not agree, please do not use
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, country, and password when you register.</li>
              <li><strong className="text-foreground">Google Sign-In Data:</strong> If you sign in with Google, we receive your name, email, and profile picture from Google.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Pages visited, content watched, search queries, and interaction history.</li>
              <li><strong className="text-foreground">Device Information:</strong> Browser type, device type, operating system, IP address, and unique device identifiers.</li>
              <li><strong className="text-foreground">Payment Information:</strong> Subscription and payment records (we do not store full card numbers).</li>
              <li><strong className="text-foreground">Notification Tokens:</strong> FCM (Firebase Cloud Messaging) tokens to deliver push notifications to your device.</li>
              <li><strong className="text-foreground">Location Data:</strong> Country detected from your IP address to determine local currency and content availability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>To create and manage your account</li>
              <li>To provide and improve our streaming services</li>
              <li>To process subscription payments</li>
              <li>To send you notifications about new movies, series, and promotions</li>
              <li>To personalise your content recommendations</li>
              <li>To detect and prevent fraud or unauthorised access</li>
              <li>To comply with legal obligations</li>
              <li>To communicate with you about your account or our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Push Notifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              With your permission, LUO FILM sends push notifications to your device — even when you are not actively
              using the app. These notifications include alerts about new movies, series, live sports, promotions, and
              subscription reminders. You can disable push notifications at any time through your browser or device
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. reCAPTCHA</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Google reCAPTCHA Enterprise to protect our login and registration forms from automated abuse.
              reCAPTCHA collects hardware and software information, including device and application data, and sends it
              to Google for analysis. This data is subject to Google's Privacy Policy at{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://policies.google.com/privacy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li><strong className="text-foreground">Firebase / Google:</strong> For authentication, database, and cloud messaging services.</li>
              <li><strong className="text-foreground">Payment Processors:</strong> To handle subscription payments securely.</li>
              <li><strong className="text-foreground">Legal Authorities:</strong> When required by law or to protect our legal rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide services. You
              may request deletion of your account and associated data by contacting us. Some data may be retained for
              legal or security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard security measures, including Firebase Authentication and encrypted connections
              (HTTPS), to protect your information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              LUO FILM is not directed at children under the age of 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us with their data, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Depending on your location, you may have rights to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:support@luofilm.site" className="text-primary hover:underline">support@luofilm.site</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use localStorage and cookies to maintain your session, remember preferences, and deliver a personalised
              experience. By using our service, you consent to the use of cookies. You can clear cookies through your
              browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting
              the new policy on this page with an updated date. Continued use of LUO FILM after changes constitutes
              your acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-3 p-4 bg-secondary rounded-lg text-sm text-muted-foreground space-y-1">
              <p><strong className="text-foreground">LUO FILM</strong></p>
              <p>Email: <a href="mailto:support@luofilm.site" className="text-primary hover:underline">support@luofilm.site</a></p>
              <p>Website: <a href="https://luofilm.site" className="text-primary hover:underline">https://luofilm.site</a></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} LUO FILM. All rights reserved. &nbsp;|&nbsp;{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
