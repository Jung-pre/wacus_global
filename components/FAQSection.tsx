'use client';

import { useState } from 'react';
import styles from './FAQSection.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How much does it cost to build a website?',
    answer: 'The cost of a website varies depending on the purpose and scope of the project. Whether it\'s a corporate site, brand site, e-commerce platform, or responsive web, the design and development requirements will differ. We can customize the structure to fit your budget, and we provide accurate, reasonable estimates after a consultation.',
  },
  {
    question: 'How long does the website production take?',
    answer: 'Typically, production takes between 6 to 12 weeks. The schedule may vary based on the number of pages, complexity of features (such as login, booking, shopping cart), and level of design customization. We work closely with you during planning to ensure smooth project management and timely delivery.',
  },
  {
    question: 'Do you create custom designs or use templates?',
    answer: 'We offer both custom-designed websites and template-based builds. If strong brand identity is important, we recommend a fully customized design for a unique look and feel. For faster turnaround or cost efficiency, our premium templates can also deliver high-quality, professional results.',
  },
  {
    question: 'Will the website be mobile-friendly?',
    answer: 'Absolutely. All our websites are responsive by default, optimized for mobile, tablet, and desktop devices. Given that mobile traffic now dominates, we place special emphasis on clean, intuitive mobile UX to ensure seamless usability across all screen sizes.',
  },
  {
    question: 'Do you provide hosting and domain services?',
    answer: 'We offer free hosting for the first year. After that, renewal is available as a paid service. For domains, we recommend purchasing under your own name for ownership protection, but if needed, we can assist with domain registration and setup. If you already own a domain, we can migrate it to our hosting environment for you.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 첫 번째 항목이 기본으로 열림

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.faqTitle}>FAQ</h2>
      <div className={styles.faqList}>
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className={styles.faqQuestion}>
                <div className={styles.qIcon}>
                  <img
                    src="/main/icon_q.png"
                    alt="Q"
                  />
                </div>
                <span className={styles.questionText}>Q. {faq.question}</span>
                <div className={`${styles.arrowIcon} ${isOpen ? styles.arrowOpen : ''}`}>
                  <img
                    src="/main/icon_forward.svg"
                    alt="Arrow"
                  />
                </div>
              </div>
              <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}>
                <div className={styles.aIcon}>
                  <img
                    src="/main/icon_a.png"
                    alt="A"
                  />
                </div>
                <p className={styles.answerText}>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
