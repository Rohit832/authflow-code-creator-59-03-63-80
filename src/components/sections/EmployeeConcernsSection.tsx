import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const EmployeeConcernsSection: React.FC = () => {
  const concerns = [
    {
      icon: "💰",
      title: "Where did my salary go again?",
      description: "Employees struggle with budgeting and tracking expenses"
    },
    {
      icon: "📈",
      title: "Should I invest or wait?",
      description: "Investment decisions feel overwhelming without guidance"
    },
    {
      icon: "🏠",
      title: "Will I ever afford a home?",
      description: "Long-term financial goals seem unreachable"
    }
  ];

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your employees are doing their best.{' '}
              <span className="text-destructive">But behind their smiles are worries:</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              These questions don't stay at home. They walk into meetings, cloud performance, trigger attrition, and impact company culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {concerns.map((concern, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-l-4 border-l-destructive">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{concern.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-destructive transition-colors">
                    {concern.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {concern.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-destructive/10 rounded-xl p-8 text-center border border-destructive/20">
            <h3 className="text-2xl font-bold text-destructive mb-4">
              The Hidden Cost of Financial Stress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-destructive mb-2">40%</div>
                <div className="text-sm text-muted-foreground">Decreased Productivity</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive mb-2">65%</div>
                <div className="text-sm text-muted-foreground">Increased Absenteeism</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive mb-2">28%</div>
                <div className="text-sm text-muted-foreground">Higher Turnover</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};