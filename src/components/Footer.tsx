import React from "react";

// Footer ported from referenced repo, adapted to our design tokens
// - Maintains layout/sections 1:1 while using semantic tokens
// - Uses original asset URLs for visual parity

const Footer: React.FC = () => {
  const handleEmailClick = () => {
    window.location.href = "mailto:rishita@finance100x.com";
  };

  const handleSocialClick = (platform: string, url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    console.log(`${platform} clicked`);
  };

  const handleLinkClick = (label: string) => {
    console.log(`${label} clicked`);
  };

  return (
    <footer className="w-full bg-[hsl(var(--footer-base))] text-[hsl(var(--footer-fg))] -mt-16 md:-mt-24 relative z-0 pt-16 md:pt-24 overflow-hidden" role="contentinfo">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-14 md:-top-20 z-10">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-20 md:h-28 block text-[hsl(var(--background))]">
          <path d="M0,0 C360,80 1080,80 1440,0 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--footer-fg)/0.08),transparent_60%)] z-0" aria-hidden="true" />
      <div className="max-w-[1225px] mx-auto px-5 py-12 md:px-8">
        <img
          src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/840ea3f5c19f388260d41dcfec79f2df50d888b0?placeholderIfAbsent=true"
          alt="Finsage logo"
          loading="lazy"
          className="aspect-[3.91] object-contain w-[246px] max-w-full mt-10"
        />

        <nav
          aria-label="Footer navigation"
          className="w-full max-w-[1179px] grid grid-cols-1 md:grid-cols-3 gap-12 text-base font-semibold uppercase tracking-[0.64px] mt-[39px] max-md:max-w-full"
        >
          {/* Left column: site links */}
          <div className="leading-[60px] w-full">
            <button onClick={() => handleLinkClick("About Finsage")} className="block hover:underline text-left">
              About Finsage
            </button>
            <button onClick={() => handleLinkClick("For Employers")} className="block hover:underline text-left">
              For Employers
            </button>
            <button onClick={() => handleLinkClick("For Individuals")} className="block hover:underline text-left">
              For Individuals
            </button>
            <button onClick={() => handleLinkClick("Careers")} className="block hover:underline text-left">
              Careers
            </button>
            <button onClick={() => handleLinkClick("Resources/blog")} className="block hover:underline text-left">
              Resouces/blog
            </button>
          </div>

          {/* Middle column: contact */}
          <div className="leading-[60px]">
            <span className="font-black">CONTACT</span>
            <br />
            <span style={{ lineHeight: "19px" }}>
              Feel free to email us on
              <button onClick={handleEmailClick} className="hover:underline ml-1">
                rishita@finance100x.com
              </button>
              and we'll get back to you shortly.
            </span>
          </div>

          {/* Right column: social */}
          <div className="flex flex-col">
            <div className="font-black leading-[60px]">
              FOLLOW US ON
              <br />
            </div>
            <button
              onClick={() => handleSocialClick("Instagram", "https://instagram.com/")}
              className="flex items-stretch gap-[22px] whitespace-nowrap mt-6 hover:opacity-90 text-left"
              aria-label="Visit our Instagram"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/aea9744074c22dc407d7ac442fb0a9b5e7b4cda8?placeholderIfAbsent=true"
                alt="Instagram icon"
                loading="lazy"
                className="aspect-[1] object-contain w-[25px] shrink-0"
              />
              <div className="basis-auto my-auto">Instagram</div>
            </button>
            <button
              onClick={() => handleSocialClick("LinkedIn", "https://linkedin.com/")}
              className="flex items-stretch gap-5 whitespace-nowrap mt-6 hover:opacity-90 text-left"
              aria-label="Visit our LinkedIn"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/8afa3bad3095af3ac21eaafa196f9e907ecd57ee?placeholderIfAbsent=true"
                alt="LinkedIn icon"
                loading="lazy"
                className="aspect-[1] object-contain w-7 shrink-0"
              />
              <div className="my-auto">Linkedin</div>
            </button>
            <button
              onClick={handleEmailClick}
              className="self-stretch flex items-stretch gap-5 mt-6 hover:opacity-90 text-left"
              aria-label="Email us"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/3ae56b3752fd7eefc3beb513013e9f8b8a265242?placeholderIfAbsent=true"
                alt="Email icon"
                loading="lazy"
                className="aspect-[1] object-contain w-[27px] shrink-0"
              />
              <div className="grow shrink w-[152px] my-auto">Mail us on Email</div>
            </button>
          </div>
        </nav>

        <div className="text-base font-semibold text-center self-center mt-[95px] max-md:mt-10">
          <button onClick={() => handleLinkClick("Privacy policy")} className="font-normal underline hover:opacity-90 mr-2">
            Privacy policy
          </button>
          <button onClick={() => handleLinkClick("Terms of use")} className="font-normal underline hover:opacity-90 mr-2">
            Terms of use
          </button>
          <button onClick={() => handleLinkClick("Contact us")} className="font-normal underline hover:opacity-90">
            Contact us
          </button>
        </div>

        <div className="self-stretch min-h-0.5 w-full mt-6 border-background border-solid border-2 max-md:max-w-full" />

        <div className="flex w-full max-w-[1202px] items-stretch gap-5 text-base font-normal flex-wrap justify-between mt-[51px] max-md:max-w-full max-md:mt-10">
          <div>Finsage.co © 2025</div>
          <div className="text-right">Design & Develop by</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
