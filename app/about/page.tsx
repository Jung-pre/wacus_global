import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata: Metadata = {
  title: 'About',
  description: 'WACUS에 대해 알아보세요',
};

export default function About() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            <h1 className="text-5xl font-bold mb-8">About Us</h1>
            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300">
              <p>
                WACUS는 혁신적인 3D 인터랙션과 웹 기술을 통해 사용자에게
                놀라운 경험을 제공합니다.
              </p>
              <p>
                우리는 Three.js와 GSAP를 활용하여 화려하고 부드러운 애니메이션을
                구현하며, Next.js의 강력한 기능을 통해 최적화된 성능을 제공합니다.
              </p>
              <p>
                사용자 중심의 디자인과 최신 웹 기술을 결합하여 차별화된
                디지털 경험을 만들어갑니다.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </main>
  );
}
