import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BackButton } from './BackButton';

export function PrivacyPolicyScreen({ onNavigate }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#EBF5FB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <BackButton 
            onClick={() => onNavigate('back')}
            title="Go back to previous screen"
            aria-label="Return to previous screen"
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ImageWithFallback 
              src="/assets/images/magdee-logo.png" 
              alt="Magdee" 
              style={{
                width: '32px',
                height: '32px'
              }}
            />
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#4A90E2',
              margin: 0
            }}>
              Privacy Policy
            </h1>
          </div>
          <div style={{ width: '2rem' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            color: '#4B5563',
            lineHeight: '1.7',
            fontSize: '0.95rem'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                📜 Magdee Privacy & Security Policy (MVP Version)
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                Last updated: August 2025
              </p>
              <p style={{ marginBottom: '2rem' }}>
                Magdee ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your data. This policy explains how we collect, use, and safeguard your information when you use our app to convert PDFs into audiobooks.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </div>

            {/* Section 1 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔐 1. Data We Collect
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We collect only the information necessary to provide and improve our services:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Account Information</strong><br />
                  • Email address, username, and authentication details (via Supabase Auth).
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Uploaded Content</strong><br />
                  • PDF files you upload, processed text, and generated audio files.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Usage Data</strong><br />
                  • Interactions with the app (e.g., play history, language/voice preferences).
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Purchase Information</strong><br />
                  • If you purchase books or subscriptions, we collect payment details via a secure third-party provider (e.g., Stripe). We do not store credit card details.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Device Data (limited)</strong><br />
                  • Browser or app version, device type, and IP address (for security logging).
                </li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 2 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔒 2. How We Use Your Data
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We use your data to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Provide core functionality (upload PDFs, generate audio, manage your library).</li>
                <li style={{ marginBottom: '0.5rem' }}>• Personalize your experience (language, voice, speed preferences).</li>
                <li style={{ marginBottom: '0.5rem' }}>• Process payments securely.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Improve performance, usability, and security.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Comply with legal obligations.</li>
              </ul>
              <p style={{
                marginTop: '1rem',
                fontWeight: '500'
              }}>
                We do not sell your personal data.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 3 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚡ 3. Security Measures
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Magdee uses industry-standard security practices:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Row Level Security (RLS) in Supabase to ensure users can only access their own content.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Encrypted storage of uploaded files and generated audio.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Transport Layer Security (TLS) for all network communications.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Access controls to limit who can view or modify sensitive data.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Regular backups and audit logs for recovery and compliance.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 4 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🌍 4. Data Sharing
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We only share data with trusted third-party services that are essential to running Magdee:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Supabase (authentication, database, storage)</li>
                <li style={{ marginBottom: '0.5rem' }}>• Cloud hosting providers (for backend & frontend deployment)</li>
                <li style={{ marginBottom: '0.5rem' }}>• Payment providers (e.g., Stripe) for handling financial transactions</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                Each provider complies with modern security and privacy standards (GDPR/CCPA where applicable).
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 5 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🗂 5. Data Retention
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• User data is retained as long as your account is active.</li>
                <li style={{ marginBottom: '0.5rem' }}>• You may request deletion of your account and data at any time.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Backups may retain data for up to 30 days before permanent deletion.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 6 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📖 6. Your Rights
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Depending on your location, you may have rights to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Access the data we hold about you.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Request correction or deletion of your data.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Request a copy of your data in a portable format.</li>
                <li style={{ marginBottom: '0.5rem' }}>• Opt out of marketing communications.</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                We honor rights under GDPR (Europe), CCPA (California), and similar frameworks.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 7 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔧 7. Children's Privacy
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Magdee is not directed at children under 13 (or under the age required by local law). We do not knowingly collect personal data from children.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 8 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🛡 8. Updates to This Policy
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We may update this Privacy & Security Policy as our app evolves. If changes are significant, we will notify you in the app or by email.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* Section 9 */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📬 9. Contact Us
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                For privacy or security concerns, you can reach us at:<br />
                📧{' '}
                <a 
                  href="mailto:magdee427@gmail.com"
                  style={{
                    color: '#4A90E2',
                    textDecoration: 'underline'
                  }}
                >
                  magdee427@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}