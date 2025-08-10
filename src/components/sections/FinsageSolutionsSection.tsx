import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const FinsageSolutionsSection: React.FC = () => {
  const solutions = [
    {
      icon: "👥",
      title: "1:1 Financial Coaching",
      description: "Personalized financial guidance as a workplace benefit",
      features: ["Personal budget planning", "Debt management strategies", "Investment guidance"],
      badge: "Core Benefit"
    },
    {
      icon: "📚",
      title: "Financial Education",
      description: "Comprehensive learning modules for financial literacy",
      features: ["Interactive workshops", "Online learning platform", "Expert-led sessions"],
      badge: "Education"
    },
    {
      icon: "🎯",
      title: "Goal Planning",
      description: "Structured approach to achieving financial milestones",
      features: ["Retirement planning", "Home buying guidance", "Emergency fund building"],
      badge: "Planning"
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor financial wellness journey with detailed insights",
      features: ["Financial health metrics", "Goal progress tracking", "Wellness reports"],
      badge: "Analytics"
    }
  ];

  return (
    <section className="w-full py-16 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Our Solution
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-primary">Finsage fixes this</span> with comprehensive financial wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your workplace culture with proven financial wellness solutions that directly address employee concerns and boost overall productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {solutions.map((solution, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl">{solution.icon}</div>
                    <Badge variant="secondary" className="text-xs">
                      {solution.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {solution.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {solution.description}
                  </p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-primary/10 rounded-xl p-8 text-center border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Ready to Transform Your Workplace?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of companies that have already improved employee satisfaction and productivity through financial wellness programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Schedule a Demo
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all duration-300">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};