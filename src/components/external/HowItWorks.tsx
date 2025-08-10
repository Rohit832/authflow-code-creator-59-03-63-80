import React from 'react';
import ProcessStep from './ProcessStep';
import FeatureCard from './FeatureCard';
import CallToAction from './CallToAction';
const HowItWorks: React.FC = () => {
  const processSteps = [{
    icon: `<svg id="1:416" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="step-icon" style="width: 24px; height: 25px; fill: #000"> <path d="M23.4773 13.1599C23.9869 12.4864 24.269 11.6613 24.269 10.8028C24.269 9.44068 23.5076 8.15139 22.282 7.43242C21.9665 7.24735 21.6073 7.14995 21.2415 7.15029H13.9668L14.1489 3.42196C14.1913 2.52097 13.8728 1.66549 13.2539 1.01325C12.9502 0.691775 12.5838 0.435995 12.1773 0.261719C11.7709 0.087444 11.333 -0.00162303 10.8907 2.23887e-05C9.31324 2.23887e-05 7.91778 1.06179 7.49913 2.58164L4.89325 12.0162H0.970762C0.433809 12.0162 0 12.45 0 12.987V24.0294C0 24.5664 0.433809 25.0002 0.970762 25.0002H19.212C19.4911 25.0002 19.7641 24.9456 20.0159 24.8364C21.4599 24.2205 22.3912 22.8099 22.3912 21.2445C22.3912 20.8623 22.3366 20.4861 22.2274 20.1221C22.7371 19.4486 23.0192 18.6235 23.0192 17.765C23.0192 17.3827 22.9646 17.0066 22.8554 16.6425C23.365 15.9691 23.6471 15.1439 23.6471 14.2854C23.6411 13.9031 23.5865 13.5239 23.4773 13.1599ZM2.18421 22.816V14.2004H4.64145V22.816H2.18421ZM21.4902 12.1072L20.8259 12.6836L21.2475 13.4542C21.3865 13.708 21.4585 13.993 21.4569 14.2824C21.4569 14.7829 21.2384 15.2592 20.8623 15.5868L20.1979 16.1632L20.6196 16.9337C20.7585 17.1876 20.8305 17.4726 20.8289 17.7619C20.8289 18.2625 20.6105 18.7388 20.2343 19.0664L19.5699 19.6428L19.9916 20.4133C20.1305 20.6671 20.2026 20.9522 20.2009 21.2415C20.2009 21.921 19.8005 22.5338 19.1816 22.8129H6.58298V14.1034L9.60144 3.16713C9.67927 2.88683 9.84636 2.63953 10.0774 2.46271C10.3084 2.2859 10.5907 2.1892 10.8816 2.18727C11.1122 2.18727 11.3397 2.25401 11.5217 2.39052C11.8221 2.61501 11.9828 2.95478 11.9646 3.31578L11.6734 9.3345H21.2111C21.7511 9.66517 22.0848 10.2234 22.0848 10.8028C22.0848 11.3033 21.8664 11.7766 21.4902 12.1072Z" fill="black"></path> </svg>`,
    title: 'HR signs up for Finsage for their team',
    backgroundColor: 'bg-[rgba(20,112,93,0.20)]'
  }, {
    icon: `<svg id="1:386" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="step-icon" style="width: 24px; height: 25px; fill: #000"> <path d="M23.4773 13.1599C23.9869 12.4864 24.269 11.6613 24.269 10.8028C24.269 9.44068 23.5076 8.15139 22.282 7.43242C21.9665 7.24735 21.6073 7.14995 21.2415 7.15029H13.9668L14.1489 3.42196C14.1913 2.52097 13.8728 1.66549 13.2539 1.01325C12.9502 0.691775 12.5838 0.435995 12.1773 0.261719C11.7709 0.087444 11.333 -0.00162303 10.8907 2.23887e-05C9.31325 2.23887e-05 7.91778 1.06179 7.49913 2.58164L4.89325 12.0162H0.970762C0.433809 12.0162 0 12.45 0 12.987V24.0294C0 24.5664 0.433809 25.0002 0.970762 25.0002H19.212C19.4911 25.0002 19.7641 24.9456 20.0159 24.8364C21.4599 24.2205 22.3912 22.8099 22.3912 21.2445C22.3912 20.8623 22.3366 20.4861 22.2274 20.1221C22.7371 19.4486 23.0192 18.6235 23.0192 17.765C23.0192 17.3827 22.9646 17.0066 22.8554 16.6425C23.365 15.9691 23.6471 15.1439 23.6471 14.2854C23.6411 13.9031 23.5865 13.5239 23.4773 13.1599ZM2.18421 22.816V14.2004H4.64145V22.816H2.18421ZM21.4902 12.1072L20.8259 12.6836L21.2475 13.4542C21.3865 13.708 21.4585 13.993 21.4569 14.2824C21.4569 14.7829 21.2384 15.2592 20.8623 15.5868L20.1979 16.1632L20.6196 16.9337C20.7585 17.1876 20.8305 17.4726 20.8289 17.7619C20.8289 18.2625 20.6105 18.7388 20.2343 19.0664L19.5699 19.6428L19.9916 20.4133C20.1305 20.6671 20.2026 20.9522 20.2009 21.2415C20.2009 21.921 19.8005 22.5338 19.1816 22.8129H6.58298V14.1034L9.60144 3.16713C9.67927 2.88683 9.84636 2.63953 10.0774 2.46271C10.3084 2.2859 10.5907 2.1892 10.8816 2.18727C11.1122 2.18727 11.3397 2.25401 11.5217 2.39052C11.8221 2.61501 11.9828 2.95478 11.9646 3.31578L11.6734 9.3345H21.2111C21.7511 9.66517 22.0848 10.2234 22.0848 10.8028C22.0848 11.3033 21.8664 11.7766 21.4902 12.1072Z" fill="black"></path> </svg>`,
    title: 'We assess and personalise the experience',
    backgroundColor: 'bg-[rgba(254,219,64,0.20)]'
  }, {
    icon: `<svg id=\"1:391\" width=\"24\" height=\"25\" viewBox=\"0 0 24 25\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"step-icon\" style=\"width: 24px; height: 25px; fill: #000\"> <path d=\"M22.5382 13.1335C23.0274 12.487 23.2983 11.6948 23.2983 10.8707C23.2983 9.56306 22.5673 8.32533 21.3907 7.63512C21.0878 7.45746 20.743 7.36395 20.3918 7.36428H13.4082L13.5829 3.78508C13.6237 2.92013 13.3179 2.09887 12.7238 1.47273C12.4322 1.1641 12.0805 0.918555 11.6903 0.751251C11.3 0.583946 10.8797 0.498442 10.4551 0.500021C8.94072 0.500021 7.60107 1.51932 7.19917 2.97838L4.69752 12.0356H0.931932C0.416457 12.0356 0 12.452 0 12.9675V23.5682C0 24.0837 0.416457 24.5002 0.931932 24.5002H18.4435C18.7114 24.5002 18.9735 24.4477 19.2153 24.3429C20.6015 23.7517 21.4956 22.3975 21.4956 20.8948C21.4956 20.5278 21.4432 20.1667 21.3383 19.8172C21.8276 19.1707 22.0984 18.3785 22.0984 17.5544C22.0984 17.1874 22.046 16.8263 21.9412 16.4768C22.4304 15.8303 22.7013 15.0382 22.7013 14.214C22.6954 13.847 22.643 13.483 22.5382 13.1335ZM2.09685 22.4033V14.1324H4.4558V22.4033H2.09685ZM20.6306 12.123L19.9928 12.6763L20.3977 13.416C20.531 13.6597 20.6002 13.9333 20.5986 14.2111C20.5986 14.6916 20.3889 15.1488 20.0278 15.4633L19.39 16.0167L19.7948 16.7564C19.9282 17.0001 19.9973 17.2737 19.9958 17.5515C19.9958 18.032 19.7861 18.4892 19.4249 18.8037L18.7872 19.3571L19.192 20.0968C19.3253 20.3405 19.3945 20.6141 19.3929 20.8918C19.3929 21.5442 19.0085 22.1325 18.4144 22.4004H6.31966V14.0392L9.21739 3.54045C9.29211 3.27135 9.4525 3.03395 9.67427 2.8642C9.89604 2.69446 10.1671 2.60163 10.4464 2.59978C10.6677 2.59978 10.8861 2.66385 11.0609 2.7949C11.3492 3.01041 11.5035 3.33659 11.4861 3.68315L11.2065 9.46113H20.3627C20.8811 9.77857 21.2014 10.3144 21.2014 10.8707C21.2014 11.3512 20.9918 11.8055 20.6306 12.123Z" fill=\"black\"></path> </svg>`,
    title: 'Employees access:',
    backgroundColor: 'bg-[#BF96DD]'
  }];
  const features = [{
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/e2bee7c4e7cba9f054b2ac89b64b38177d21a317?width=210',
    altText: '1:1 Financial Coaching',
    title: 'Financial<br />Coaching',
    isNumbered: true,
    numberText: '1:1'
  }, {
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/c8633136abf25ac72ed6d7ea014b35c11e01abdd?width=216',
    altText: 'Live learning Sessions',
    title: 'Live learning<br />Sessions',
    isNumbered: false
  }, {
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/ecc9062ba10205f128d0aa42b997b467c4d514a7?width=244',
    altText: 'Money tools & calculators',
    title: 'Money tools &<br />calculators',
    isNumbered: false
  }];
  return <section aria-labelledby="how-it-works-heading" className="max-w-none relative w-full min-h-screen overflow-visible bg-background mx-auto max-md:max-w-[991px] max-sm:max-w-screen-sm">
      {/* background image */}
      

      <div className="relative grid max-w-[1120px] mx-auto px-5 py-12 md:py-14 grid-cols-1 md:grid-cols-[520px_minmax(0,520px)] gap-8 md:gap-12 items-start">
        {/* Left Illustration */}
        <aside className="relative flex-1 md:pr-2" aria-hidden="true">
          <img src="https://api.builder.io/api/v1/image/assets/TEMP/a09a9f2100b20bb41c7946f2b51b4050dde703cd?width=1017" alt="Illustration" className="w-full max-w-[509px] h-auto relative z-[2]" loading="lazy" />
          <img src="https://api.builder.io/api/v1/image/assets/TEMP/dd6f7d17ab242f5451705e43848fbe85e3d0cfa1?width=1486" alt="Design element" className="absolute left-[-15px] w-full max-w-[743px] h-auto z-[3] top-[113px]" loading="lazy" />
          <div className="relative">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/9e4b5c97d31319b9442054f559f53d9fe6e4e116?width=166" alt="Icon" className="absolute top-[-130px] w-[83px] h-[83px] left-[68px]" loading="lazy" />
            
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/6f048270ffb0399009976fae2c6a0cae8bf2b493?width=425" alt="Sticker" className="absolute w-[213px] h-[213px] z-[4] -left-8 -bottom-2.5" loading="lazy" />
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 w-full md:pl-10 md:max-w-[520px]">
          <header className="relative mb-10">
            <div className="mb-5">
              <h2 id="how-it-works-heading" className="text-5xl font-bold text-foreground mb-3 max-md:text-4xl max-sm:text-[28px]">
                How Finsage Works
              </h2>
              <p className="text-xl font-medium text-foreground max-md:text-lg max-sm:text-base">
                Simple to roll out. Powerful in impact.
              </p>
            </div>
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/7778b160624233024cbb8de5c8a788754f85e008?width=219" alt="Decorative shape" className="absolute right-[-50px] w-[109px] h-[109px] rotate-[-118.598deg] -top-1.5 max-md:hidden" loading="lazy" />
            
          </header>

          <article className="mb-[60px]">
            {processSteps.map((step, index) => <ProcessStep key={index} icon={step.icon} title={step.title} backgroundColor={step.backgroundColor} />)}
          </article>

          <section className="grid grid-cols-3 gap-6 md:gap-10 mb-10 place-items-center">
            {features.map((feature, index) => <FeatureCard key={index} image={feature.image} altText={feature.altText} title={feature.title} isNumbered={feature.isNumbered} numberText={feature.numberText} />)}
          </section>
        </div>
      </div>

      <CallToAction />
    </section>;
};
export default HowItWorks;