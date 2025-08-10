import React from 'react';
import { Star } from 'lucide-react';
import { TestimonialCard } from './TestimonialCard';
import { ClientFeedbackHeader } from './ClientFeedbackHeader';
import { ClientProfile } from './ClientProfile';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

export const TestimonialSection: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi | null>(null);

  React.useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      api.scrollNext();
    }, 2500);
    return () => clearInterval(id);
  }, [api]);
  return (
    <section className="w-full bg-gray-50 py-16 px-4" aria-labelledby="client-feedback-heading">
      <div className="container mx-auto max-w-7xl">
        <ClientFeedbackHeader />

        {/* Top: two-column responsive layout */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: stacked testimonial cards */}
          <div className="space-y-6">
            <TestimonialCard
              quote="My coach helped me restructure my salary and save ₹30,000 more every year. That's peace of mind."
              clientName="Shreya M."
              clientTitle="Fintech Startup Employee"
              clientAvatar="https://randomuser.me/api/portraits/women/1.jpg"
              badgeText="Employee Testimonial"
              badgeColor="rgba(5,147,252,1)"
            />

            <TestimonialCard
              quote="We used to get endless salary-related queries. Finsage solved that in just 3 sessions."
              clientName="Nikhil R."
              clientTitle="HR Head, SaaS Company"
              clientAvatar="https://randomuser.me/api/portraits/men/2.jpg"
              badgeText="HR Testimonial"
              badgeColor="rgba(248,90,31,1)"
            />
          </div>

          {/* Right column: description + illustration with floating stat card */}
          <div className="flex flex-col gap-6">
            <p className="text-black text-[19px] font-normal leading-8">
              Discover what our clients have to say about their experiences with us and learn how our services have positively impacted their life.
            </p>
            <div className="relative">
              <div className="absolute right-4 -top-6 bg-white shadow-[4px_3px_0px_rgba(0,0,0,1)] z-10 text-2xl text-black font-semibold leading-none px-6 py-4 rounded-[5px] border-black border-2">
                <div>50k+ Satisfy client's</div>
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-orange-400 text-orange-400"
                      size={16}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-[rgba(20,186,140,1)] rounded-[34px] p-4">
                <img
                  src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/df0a2303d2d30ac60dfae2e86307df91ca124bcd?placeholderIfAbsent=true"
                  alt="Happy clients illustration"
                  loading="lazy"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: auto-sliding carousel */}
        <div className="mt-12" aria-label="Client testimonials carousel">
          <Carousel opts={{ align: 'start', loop: true }} setApi={setApi} className="w-full">
            <CarouselContent>
              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                <article className="bg-white flex flex-col gap-4 text-black px-[38px] py-[41px] rounded-[13px] border-r-4 border-b-4 border-black border-t border-l min-h-[340px] md:min-h-[380px]">
                  <blockquote className="text-2xl font-medium leading-[36px] md:leading-[40px]">
                    "Finsage made taxes and investments simple — I finally feel in control."
                  </blockquote>
                  <div className="w-full h-[0.85px] bg-foreground/20 mt-4" />
                  <div className="mt-4 md:mt-5">
                    <ClientProfile
                      name="Rohit S."
                      title="Product Manager"
                      avatar="https://randomuser.me/api/portraits/men/3.jpg"
                      className="text-[17px] font-normal leading-[26px]"
                      rating={5}
                    />
                  </div>
                </article>
              </CarouselItem>

              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                <article className="bg-white flex flex-col gap-4 text-black px-[38px] py-[41px] rounded-[13px] border-r-4 border-b-4 border-black border-t border-l min-h-[340px] md:min-h-[380px]">
                  <blockquote className="text-2xl font-medium leading-[36px] md:leading-[40px]">
                    "Finsage helped me shift from salary stress to savings joy — in just two sessions."
                  </blockquote>
                  <div className="w-full h-[0.85px] bg-foreground/20 mt-4" />
                  <div className="mt-4 md:mt-5">
                    <ClientProfile
                      name="Priya K."
                      title="Tech Professional"
                      avatar="https://randomuser.me/api/portraits/women/4.jpg"
                      className="text-[17px] font-normal leading-[26px]"
                      rating={5}
                    />
                  </div>
                </article>
              </CarouselItem>

              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                <article className="bg-white flex flex-col items-stretch gap-4 text-black px-[38px] py-[41px] rounded-[13px] border-r-4 border-b-4 border-black border-t border-l min-h-[340px] md:min-h-[380px]">
                  <blockquote className="text-2xl font-medium leading-[36px] md:leading-[40px] max-md:max-w-full">
                    Our consultancy, with limited marketing resources, hesitated to hire agencies offering generic service packages.
                  </blockquote>
                  <div className="w-full h-[0.85px] bg-foreground/20 mt-4" />
                  <div className="mt-4 md:mt-5">
                    <ClientProfile
                      name="Anurag M."
                      title="CHRO, BFSI Company"
                      avatar="https://randomuser.me/api/portraits/men/5.jpg"
                      className="text-[17px] font-normal leading-[26px]"
                      rating={5}
                    />
                  </div>
                </article>
              </CarouselItem>

              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                <article className="bg-white flex flex-col gap-4 text-black px-[38px] py-[41px] rounded-[13px] border-r-4 border-b-4 border-black border-t border-l min-h-[340px] md:min-h-[380px]">
                  <blockquote className="text-2xl font-medium leading-[36px] md:leading-[40px]">
                    Our consultancy, with limited marketing resources, hesitated to hire agencies offering generic service packages.
                  </blockquote>
                  <div className="w-full h-[0.85px] bg-foreground/20 mt-4" />
                  <div className="mt-4 md:mt-5">
                    <ClientProfile
                      name="Anurag M."
                      title="CHRO, BFSI Company"
                      avatar="https://randomuser.me/api/portraits/men/6.jpg"
                      className="text-[17px] font-normal leading-[26px]"
                      rating={5}
                    />
                  </div>
                </article>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};