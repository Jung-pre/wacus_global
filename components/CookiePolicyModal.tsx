'use client';

import { useState } from 'react';
import styles from './CookiePolicyModal.module.css';

export default function CookiePolicyModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [gyroscopeAllowed, setGyroscopeAllowed] = useState(true);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Cookie Policy">
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>WACUS Cookie Policy</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.sectionTitle}>1. Introduction</div>
          <p className={styles.text}>
          WACUS (hereinafter referred to as the "Company") uses cookies and similar technologies to enhance your browsing experience, analyze traffic, and provide personalized content and advertisements. This Cookie Policy explains what cookies are and how we use them. 
          </p>
          <div className={styles.sectionTitle}>2. What are Cookies?</div>
          <p className={styles.text}>
            Cookies are small text files stored on your device when you visit a website. They help the website recognize your device and remember your preferences.
          </p>
          <div className={styles.sectionTitle}>3. Types of Cookies We Use</div>
          <p className={styles.text}>
          ＊Essential Cookies: These are necessary for the website to function and cannot be disabled. ＊Analytics Cookies: These are used to understand user behavior and improve our services (e.g., Google Analytics).
          </p>
          <p className={styles.text}>
            <strong>Analytics Cookies:</strong> These are used to understand user behavior and improve our services.
            They help us analyze how visitors interact with our website, such as which pages are visited most often
            and if users get error messages from web pages. We use services like Google Analytics for this purpose.
          </p>
          <div className={styles.sectionTitle}>4. How We Use Cookies</div>
          <p className={styles.text}>
            We use cookies for various purposes, including:
          </p>
          <ul className={styles.list}>
            <li>To remember your preferences and settings</li>
            <li>To analyze website traffic and user behavior</li>
            <li>To provide personalized content and advertisements</li>
            <li>To improve website functionality and user experience</li>
            <li>To ensure website security and prevent fraud</li>
          </ul>
          <div className={styles.sectionTitle}>5. Third-Party Cookies</div>
          <p className={styles.text}>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics
            of the website, deliver advertisements on and through the website, and so on. These third-party cookies
            are subject to their respective privacy policies.
          </p>
          <div className={styles.sectionTitle}>6. Managing Cookies</div>
          <p className={styles.text}>
            You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies
            can impact your user experience and parts of our website may no longer be fully accessible. Most browsers
            automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.
          </p>
          <div className={styles.sectionTitle}>7. Changes to This Policy</div>
          <p className={styles.text}>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other
            operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed
            about our use of cookies and related technologies.
          </p>
          <div className={styles.sectionTitle}>8. Contact Us</div>
          <p className={styles.text}>
            If you have any questions about our use of cookies or other technologies, please contact us through
            our contact page or email us at privacy@wacus.com.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.acceptButton} onClick={() => setIsOpen(false)}>
            Accept
          </button>
          <button type="button" className={styles.rejectButton} onClick={() => setIsOpen(false)}>
            Reject
          </button>
        </div>
        <div className={styles.checkboxSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={gyroscopeAllowed}
              onChange={(e) => setGyroscopeAllowed(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              Allow access to device motion and orientation sensors (gyroscope).
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
