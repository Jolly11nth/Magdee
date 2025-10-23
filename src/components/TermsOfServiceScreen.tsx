import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BackButton } from './BackButton';

export function TermsOfServiceScreen({ onNavigate }) {
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
              Terms of Service
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
                📜 Magdee Terms of Service (MVP Version)
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                Last updated: August 2025
              </p>
              <p style={{ marginBottom: '2rem' }}>
                Welcome to Magdee! These Terms of Service ("Terms") govern your access to and use of the Magdee app, website, and related services (collectively, the "Services"). By using Magdee, you agree to these Terms.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </div>

            {/* 1. Eligibility */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                1. Eligibility
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>You must be at least 13 years old (or the minimum legal age in your country) to use Magdee.</li>
                <li style={{ marginBottom: '0.5rem' }}>By creating an account, you confirm that you meet these requirements.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 2. Your Account */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                2. Your Account
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>You are responsible for maintaining the security of your account and password.</li>
                <li style={{ marginBottom: '0.5rem' }}>Notify us immediately if you suspect unauthorized access to your account.</li>
                <li style={{ marginBottom: '0.5rem' }}>We may suspend or terminate accounts that violate these Terms.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 3. Use of the Services */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                3. Use of the Services
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>You agree to:</p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Use Magdee only for lawful purposes.</li>
                <li style={{ marginBottom: '0.5rem' }}>Upload only content (e.g., PDFs) you have the rights to use.</li>
                <li style={{ marginBottom: '0.5rem' }}>Not attempt to reverse engineer, copy, or exploit the Services.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 4. Uploaded Content & Intellectual Property */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                4. Uploaded Content & Intellectual Property
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Your Content:</strong> You retain ownership of PDFs, text, and other materials you upload.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>License to Magdee:</strong> By uploading content, you grant Magdee a limited license to process and convert it into audio for your personal use.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Restrictions:</strong> You may not upload copyrighted materials without proper rights (e.g., pirated books).</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 5. Purchases & Payments */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                5. Purchases & Payments
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Some books or features may require payment.</li>
                <li style={{ marginBottom: '0.5rem' }}>Payments are securely processed through third-party providers (e.g., Stripe).</li>
                <li style={{ marginBottom: '0.5rem' }}>All purchases are final and non-refundable unless required by law.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 6. Privacy & Security */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                6. Privacy & Security
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Your use of Magdee is also governed by our Privacy & Security Policy, which explains how we collect, use, and protect your data.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 7. Service Availability */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                7. Service Availability
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>We strive to keep Magdee running smoothly, but we do not guarantee uninterrupted availability.</li>
                <li style={{ marginBottom: '0.5rem' }}>Features may be updated, modified, or discontinued at our discretion.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 8. Termination */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                8. Termination
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>We may suspend or terminate your account if:</p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>You violate these Terms.</li>
                <li style={{ marginBottom: '0.5rem' }}>We are required by law.</li>
                <li style={{ marginBottom: '0.5rem' }}>The Service is discontinued.</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>You may delete your account at any time.</p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 9. Disclaimers */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                9. Disclaimers
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Magdee provides services "as is" without warranties of any kind.</li>
                <li style={{ marginBottom: '0.5rem' }}>We do not guarantee 100% accuracy of text-to-speech or third-party content.</li>
                <li style={{ marginBottom: '0.5rem' }}>We are not liable for any loss or damage resulting from your use of the Services.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 10. Limitation of Liability */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                10. Limitation of Liability
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>To the maximum extent permitted by law:</p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Magdee and its team are not liable for indirect, incidental, or consequential damages.</li>
                <li style={{ marginBottom: '0.5rem' }}>Our total liability is limited to the amount you paid for the Services in the past 12 months.</li>
              </ul>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 11. Governing Law */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                11. Governing Law
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                These Terms are governed by the laws of your country of residence, unless otherwise required by local regulations.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 12. Changes to Terms */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                12. Changes to Terms
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We may update these Terms from time to time. If we make significant changes, we will notify you via the app or email. Continued use of Magdee after updates means you accept the new Terms.
              </p>
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '1rem 0'
              }} />
            </section>

            {/* 13. Contact Us */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                13. Contact Us
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                For questions about these Terms, please contact us: <br />
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