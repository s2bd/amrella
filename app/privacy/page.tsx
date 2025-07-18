export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        
        <div className="text-sm text-gray-600 mb-8 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Amrella. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our social learning platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (name, email, password)</li>
            <li>Profile information (bio, location, website, profile pictures)</li>
            <li>Content you create (posts, comments, course materials)</li>
            <li>Messages and communications</li>
            <li>Support requests and feedback</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Device information (browser type, operating system)</li>
            <li>Log data (IP address, access times, error logs)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our services</li>
            <li>Personalize your experience</li>
            <li>Facilitate communication between users</li>
            <li>Send important updates and notifications</li>
            <li>Improve our platform and develop new features</li>
            <li>Ensure platform security and prevent abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
          <p className="mb-4">We may share your information in the following circumstances:</p>
          
          <h3 className="text-xl font-medium mb-3">4.1 Public Information</h3>
          <p className="mb-4">
            Information in your public profile, posts, and comments is visible to other users and may be indexed by search engines.
          </p>

          <h3 className="text-xl font-medium mb-3">4.2 Service Providers</h3>
          <p className="mb-4">
            We may share information with trusted third-party service providers who help us operate our platform, subject to confidentiality agreements.
          </p>

          <h3 className="text-xl font-medium mb-3">4.3 Legal Requirements</h3>
          <p className="mb-4">
            We may disclose information when required by law or to protect our rights, users' safety, or investigate fraud.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Control your privacy settings</li>
            <li>Opt out of non-essential communications</li>
            <li>Request a copy of your data</li>
            <li>Object to certain data processing activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p className="mb-4">
            We retain your personal data only as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal data, except where retention is required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p className="mb-4">
            Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Through our support system on the platform</li>
            <li>Email: privacy@amrella.com</li>
            <li>Address: [Your Company Address]</li>
          </ul>
        </section>

        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600">
            Your privacy matters to us. Thank you for trusting Amrella with your data.
          </p>
        </div>
      </div>
    </div>
  )
}