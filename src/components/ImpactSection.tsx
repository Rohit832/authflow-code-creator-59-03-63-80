import React from 'react';
import { ImpactCard } from '@/components/ImpactCard';

const impactData = [
  {
    id: 1,
    image:
      'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/23095aa2247f11d957a13ee12cfd604a4bbe90a6?placeholderIfAbsent=true',
    text: 'Employees report lower stress in just 1 session',
    imageAlt: 'Employee stress reduction icon',
  },
  {
    id: 2,
    image:
      'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/149d8e2337e67e75abc4ef2b51d48dce6f5c706d?placeholderIfAbsent=true',
    text: 'HRs see fewer CTC & tax queries',
    imageAlt: 'HR efficiency improvement icon',
  },
  {
    id: 3,
    image:
      'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/e83a8b332d7a16b503349c755088ad70d858394f?placeholderIfAbsent=true',
    text: 'Managers notice better focus & morale',
    imageAlt: 'Manager productivity improvement icon',
  },
  {
    id: 4,
    image:
      'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/b4aacace6525212b5015f8792a9ce810c2dc3c78?placeholderIfAbsent=true',
    text: 'Organisations retain happier, loyal talent',
    imageAlt: 'Employee retention icon',
  },
];

export const ImpactSection: React.FC = () => {
  return (
    <section
      aria-labelledby="impact-heading"
      className="w-full bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-10">
          <h2 id="impact-heading" className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            The Finsage Impact
          </h2>
          <p className="text-muted-foreground text-lg mt-2">Real relief. Real results.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactData.map((item) => (
            <ImpactCard key={item.id} image={item.image} text={item.text} imageAlt={item.imageAlt} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
