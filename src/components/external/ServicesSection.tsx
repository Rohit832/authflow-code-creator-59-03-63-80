import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Wallet, Headphones } from "lucide-react";

const services = [
  {
    title: "Financial Coaching",
    description:
      "One-on-one coaching to build healthy money habits, eliminate debt, and grow savings.",
    Icon: Headphones,
  },
  {
    title: "Salary Structuring",
    description:
      "Optimize CTC components for better in-hand salary and tax efficiency for employees.",
    Icon: Wallet,
  },
  {
    title: "On‑demand HR Clinics",
    description:
      "Drop‑in sessions that resolve salary and benefits queries quickly at scale.",
    Icon: Briefcase,
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section
      aria-labelledby="services-heading"
      className="w-full bg-background py-16 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            Our Services
          </h2>
          <p className="mt-3 text-muted-foreground">
            Practical, outcome‑focused programs tailored for teams and individuals.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ title, description, Icon }) => (
            <Card key={title} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/20 text-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-xl text-foreground">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
