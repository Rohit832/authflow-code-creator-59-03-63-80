import React from "react";

// What We Offer section inspired by the referenced repo, adapted to our design system
// Semantic colors and responsive layout used. Kept headings at H2 for SEO (single H1 per page).

interface ServiceItem {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  variant?: "outlined" | "filled";
  starIcon?: boolean;
}

const ServiceButton: React.FC<{ variant?: "outlined" | "filled"; onClick?: () => void }>=({ variant = "outlined", onClick }) => {
  const isOutlined = variant === "outlined";
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 relative flex items-center justify-center rounded-lg border border-foreground transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-foreground/60 focus:ring-offset-2 ${
        isOutlined ? "bg-transparent text-foreground" : "bg-foreground text-background"
      }`}
      aria-label="Get started with this service"
    >
      <span className="text-sm font-bold tracking-wide uppercase">Get started</span>
      <svg
        viewBox="0 0 40 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ml-3 w-4 h-auto sm:w-5 md:w-6"
        aria-hidden="true"
      >
        <path
          d="M39.584 7.56057C39.9162 7.22833 39.9162 6.68964 39.584 6.35739L34.1696 0.943081C33.8374 0.610832 33.2987 0.610832 32.9665 0.943081C32.6342 1.27533 32.6342 1.81401 32.9665 2.14626L37.7792 6.95898L32.9665 11.7717C32.6342 12.104 32.6342 12.6426 32.9665 12.9749C33.2987 13.3071 33.8374 13.3071 34.1696 12.9749L39.584 7.56057ZM0.697388 6.95898V7.80976H38.9824V6.95898V6.10821H0.697388V6.95898Z"
          fill={isOutlined ? "hsl(var(--foreground))" : "hsl(var(--background))"}
        />
      </svg>
    </button>
  );
};

const ServiceCard: React.FC<{ item: ServiceItem; index: number }> = ({ item, index }) => {
  const { title, description, iconSrc, iconAlt, variant = "outlined", starIcon } = item;
  const bgClass =
    index === 0
      ? "bg-[hsl(var(--offer-card-1))]"
      : index === 1
      ? "bg-[hsl(var(--offer-card-2))]"
      : "bg-[hsl(var(--offer-card-3))]";
  return (
    <article className={`relative flex flex-col rounded-xl border border-foreground p-8 md:p-10 min-h-[420px] md:min-h-[460px] shadow-[3px_4px_0_0_hsl(var(--foreground))] ${bgClass}`}>
      <div className="absolute top-0 right-0 p-0">
        <div className="relative">
          <img
            src={iconSrc}
            alt={iconAlt}
            loading="lazy"
            className="w-20 h-20 object-contain translate-x-[3px]"
          />
          {starIcon && (
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/f10502978275ebf7ce82532f1b135ce388eb3c08?width=58"
              alt="featured star icon"
              loading="lazy"
              className="w-5 h-5 md:w-7 md:h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          )}
        </div>
      </div>
      <h3 className="mt-2 md:mt-4 text-4xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">{title}</h3>
      <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed">{description}</p>
      <div className="mt-auto pt-8 md:pt-10">
        <ServiceButton variant={variant} onClick={() => console.log(`Get started with ${title}`)} />
      </div>
    </article>
  );
};

const WhatWeOffer: React.FC = () => {
  const services: ServiceItem[] = [
    {
      title: "Financial Coaching (1-on-1)",
      description: "Private, judgement-free sessions with certified experts",
      iconSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/9ea98ec3e8441431f263d48dc66f16b3907fdde8?width=214",
      iconAlt: "Financial coaching icon",
      variant: "outlined",
    },
    {
      title: "Group Learning",
      description:
        "Webinars on salary structuring, tax hacks, investment planning & more",
      iconSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/e01e5c17964712fd6b332228cd25772b481b952a?width=213",
      iconAlt: "Group learning icon",
      variant: "filled",
      starIcon: true,
    },
    {
      title: "DIY Digital Tools",
      description: "Budget guides, EMI calculators, tax estimators and more",
      iconSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/8da22a273eb352133f9de6966e8bf02a870772de?width=213",
      iconAlt: "Digital tools icon",
      variant: "outlined",
    },
  ];

  return (
    <section
      aria-labelledby="what-we-offer-title"
      className="w-full bg-accent/40 border-t border-foreground/20"
    >
      <div className="max-w-[1225px] mx-auto px-5 py-16 md:px-8">
        <header className="text-center mb-6">
          <h2 id="what-we-offer-title" className="text-4xl font-bold text-foreground">
            What We Offer
          </h2>
          <p className="mt-3 text-foreground/80">Built for modern workplaces.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <ServiceCard key={s.title} item={s} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;
