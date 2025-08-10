import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  {
    title: "Salary Optimization Program",
    summary:
      "Rolled out a company‑wide CTC restructure improving average in‑hand pay by 7.5%.",
  },
  {
    title: "Financial Wellness Workshops",
    summary:
      "Conducted 12 cohort sessions boosting employee savings rate by 18% in 90 days.",
  },
  {
    title: "HR Query Automation",
    summary:
      "Reduced repetitive salary inquiries by 63% with focused clinics and templates.",
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section
      aria-labelledby="projects-heading"
      className="w-full bg-background py-16 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <h2 id="projects-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            Recent Projects
          </h2>
          <p className="mt-3 text-muted-foreground">
            A glimpse of measurable wins we delivered for modern teams.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(({ title, summary }) => (
            <Card key={title} className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
