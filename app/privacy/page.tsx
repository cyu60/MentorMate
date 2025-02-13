import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          This Privacy Policy explains how MentorMate (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, shares, and protects your personal information. This policy applies to all users of our platform, including mentors, participants, and administrators.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
        <h3 className="text-xl font-medium mb-2">2.1 Information You Provide</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Account information (name, email address)</li>
          <li>Profile information (professional background, areas of expertise)</li>
          <li>Project submissions and feedback</li>
          <li>Communications with other users</li>
        </ul>

        <h3 className="text-xl font-medium mb-2">2.2 Automatically Collected Information</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Device information (browser type, IP address)</li>
          <li>Usage data (interactions with the platform)</li>
          <li>Cookies and similar technologies</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>To provide and maintain our services</li>
          <li>To authenticate your identity through OAuth</li>
          <li>To match mentors with participants</li>
          <li>To facilitate communication between users</li>
          <li>To improve our platform and user experience</li>
          <li>To send important notifications and updates</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
        <p className="mb-4">
          We do not sell your personal information. We may share your information in the following circumstances:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>With other platform users as necessary for the service (e.g., mentors seeing participant profiles)</li>
          <li>With service providers who assist in platform operations</li>
          <li>When required by law or to protect rights</li>
          <li>With your consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. OAuth Authentication</h2>
        <p className="mb-4">
          We use OAuth for authentication, which means:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>You may log in using third-party authentication providers</li>
          <li>We receive basic profile information from these providers</li>
          <li>We do not receive or store your passwords for these services</li>
          <li>You can revoke access through your third-party provider settings</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal information, including:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure data storage practices</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Withdraw consent for data processing</li>
          <li>Export your data</li>
          <li>Object to certain data processing</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any significant changes through the platform or via email.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy or our data practices, please contact us at:
        </p>
        <p className="mb-4">
          Email: stanfordhackathon@gmail.com<br />
          Address: 353 Jane Stanford Way, Stanford University, California
        </p>
      </section>

      <footer className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
}