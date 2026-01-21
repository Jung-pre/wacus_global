'use client';

import styles from './ExperienceSection.module.css';

export default function ExperienceSection() {
  return (
    <section className={styles.experienceSection}>
      <h2 className={styles.experienceTitle}>Our Experience</h2>
      <button className={styles.viewMoreButton}>View More</button>
    </section>
  );
}
