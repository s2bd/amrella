export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
        
        <div className="text-sm text-gray-600 mb-8 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Amrella ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Amrella is a social learning platform that enables users to connect, learn, and grow together through groups, courses, forums, and social interactions. We provide tools for content creation, community building, and educational experiences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="mb-4">
            To access certain features of the Platform, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="mb-4">
            You retain ownership of content you post on Amrella. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform.
          </p>
          <p className="mb-4">
            You agree not to post content that:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violates any laws or regulations</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains harmful, threatening, or abusive material</li>
            <li>Promotes discrimination or harassment</li>
            <li>Contains spam or unauthorized advertising</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Community Guidelines</h2>
          <p className="mb-4">
            Amrella is built on respect, learning, and collaboration. We expect all users to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Treat others with respect and kindness</li>
            <li>Share knowledge and help others learn</li>
            <li>Respect intellectual property and give proper attribution</li>
            <li>Report inappropriate content or behavior</li>
            <li>Follow group-specific rules and guidelines</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
          <p className="mb-4">
            You may not use the Platform to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate others or provide false information</li>
            <li>Interfere with or disrupt the Platform's operation</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Use automated systems to access the Platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            The Platform and its original content, features, and functionality are owned by Amrella and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the Platform immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Disclaimer</h2>
          <p className="mb-4">
            The Platform is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the use or results of the Platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall Amrella be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us through our support system or at legal@amrella.com.
          </p>
        </section>

        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600">
            Thank you for being part of the Amrella community!
          </p>
        </div>
      </div>
    </div>
  )
}
