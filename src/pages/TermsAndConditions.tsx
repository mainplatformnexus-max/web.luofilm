import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const TermsAndConditions = () => {
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

        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 15, 2026</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using LUO FILM ("the Service") at <strong>luofilm.site</strong>, you agree to be bound by
              these Terms and Conditions. If you do not agree with any part of these terms, you may not access the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              LUO FILM is an online streaming platform offering Luo-translated movies, series, live TV channels, and
              sports content. The Service is available via web browser and progressive web app (PWA). Some content
              requires an active subscription.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 mt-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Not share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Google Sign-In and Third-Party Authentication</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may sign in using your Google account. By doing so, you authorise LUO FILM to access basic profile
              information (name, email, profile photo) from Google. When you sign in with Google for the first time,
              we will ask you to provide your phone number and select your country to complete your profile. This
              information is required to provide localised content, process payments, and maintain account security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscriptions and Payments</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Access to premium content requires a paid subscription</li>
              <li>Subscription fees are charged in advance and are non-refundable unless required by applicable law</li>
              <li>We reserve the right to modify subscription prices with reasonable notice</li>
              <li>Failed payments may result in suspension of premium access</li>
              <li>You are responsible for all taxes applicable to your subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Agent Program</h2>
            <p className="text-muted-foreground leading-relaxed">
              LUO FILM offers an Agent Program that allows users to earn commissions by selling subscriptions on our
              behalf. Participation in the Agent Program is voluntary and subject to separate Agent Terms. Earnings are
              tracked and paid according to the terms specified in the Agent Program.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Content and Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content available on LUO FILM, including movies, series, translations, logos, and design elements,
              is protected by copyright and intellectual property laws. You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 mt-2">
              <li>Download, copy, or distribute content without written permission</li>
              <li>Use content for commercial purposes</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Push Notifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              By enabling notifications, you consent to receive push notifications from LUO FILM, including alerts
              about new movies, series, live events, and promotional offers. Notifications may be delivered even when
              you are not actively using the Service. You can withdraw consent by disabling notifications in your
              browser or device settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful, offensive, or unlawful content</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Use automated tools to scrape or access content</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any activity that disrupts or interferes with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Adult Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              LUO FILM may make available content designated as 18+ (adult content). By accessing such content, you
              confirm that you are at least 18 years of age. We reserve the right to restrict access to such content
              based on your location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. LUO FILM makes no warranties, express
              or implied, including but not limited to warranties of merchantability, fitness for a particular purpose,
              or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, LUO FILM shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of or inability to use the Service.
              Our total liability shall not exceed the amount you paid for the Service in the three months preceding
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at our discretion, without notice, for conduct
              that we determine violates these Terms or is harmful to other users, us, or third parties. You may
              terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by the laws of Uganda. Any disputes arising from these Terms shall be
              resolved through the courts of Uganda or through binding arbitration as mutually agreed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes. Continued use
              of the Service after changes constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">16. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us:
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
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
