import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata: Metadata = {
  title: 'Services',
  description: 'WACUS의 서비스를 확인하세요',
};

const services = [
  {
    title: '3D 인터랙션',
    description: 'Three.js를 활용한 화려한 3D 인터랙션 개발',
  },
  {
    title: '애니메이션',
    description: 'GSAP를 활용한 부드러운 스크롤 및 패스 애니메이션',
  },
  {
    title: '웹 최적화',
    description: 'Next.js를 통한 SEO 및 성능 최적화',
  },
  {
    title: '반응형 디자인',
    description: '모든 디바이스에서 완벽한 사용자 경험',
  },
];

export default function Services() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <h1 className="text-5xl font-bold mb-12 text-center">Our Services</h1>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <ScrollAnimation key={index}>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <h2 className="text-2xl font-semibold mb-4">{service.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
