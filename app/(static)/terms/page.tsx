"use client";

import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 py-8 pt-16">
        <div className="bg-white/70 rounded-xl shadow-lg p-8 space-y-8">
          <h1
            className="text-3xl font-bold mb-8 cursor-pointer text-center"
            onClick={() => (window.location.href = "/")}
          >
            <span className="text-blue-900 hover:text-blue-800">
              Mentor Mate&apos;s
            </span>{" "}
            Terms and Conditions
          </h1>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions govern your use of MentorMate (&quot;the Platform&quot;). By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of these terms, you may not access the platform.
            </p>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>You must be at least 13 years old to use the Platform</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You may not use another user&apos;s account without permission</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">3. Platform Rules</h2>
            <h3 className="text-xl font-medium mb-2">3.1 General Conduct</h3>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li>Treat all users with respect and professionalism</li>
              <li>Do not engage in harassment or discriminatory behavior</li>
              <li>Do not post inappropriate, offensive, or illegal content</li>
              <li>Do not attempt to disrupt or abuse the Platform&apos;s services</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">3.2 Project Submissions</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Submit only original work or work you have permission to use</li>
              <li>Respect intellectual property rights</li>
              <li>Follow project submission guidelines and deadlines</li>
              <li>Do not submit malicious code or harmful content</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Users retain ownership of their submitted content</li>
              <li>Users grant MentorMate a license to use submitted content for platform purposes</li>
              <li>MentorMate&apos;s branding and platform content are protected by copyright</li>
              <li>Do not use MentorMate&apos;s intellectual property without permission</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">5. Mentorship Guidelines</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Mentors must provide constructive and professional feedback</li>
              <li>Mentors should respect participant privacy and confidentiality</li>
              <li>Participants should engage actively and respectfully with mentors</li>
              <li>Both parties should maintain professional boundaries</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion. Upon termination:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Access to the platform will be revoked</li>
              <li>Submitted content may be removed</li>
              <li>You remain bound by relevant terms that survive termination</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimers</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>The Platform is provided &quot;as is&quot; without warranties</li>
              <li>We do not guarantee continuous, uninterrupted access</li>
              <li>We are not responsible for user-generated content</li>
              <li>Users assume risks associated with platform use</li>
            </ul>
          </section>

          <section className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms. We will notify users of significant changes through the platform or via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-700">
              Email:{" "}
              <a
                href="mailto:hello@mentor-mates.com"
                className="text-blue-900 hover:underline"
              >
                hello@mentor-mates.com
              </a>
              <br />
              Address: San Francisco Bay Area, California
            </p>
          </section>

          <footer className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            Last updated: {new Date().toLocaleDateString()}
          </footer>
        </div>
      </div>
    </div>
  );
}