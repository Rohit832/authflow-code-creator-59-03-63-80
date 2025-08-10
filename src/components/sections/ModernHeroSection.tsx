import React from 'react';

export const ModernHeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-[600px] bg-gradient-to-br from-primary/10 to-secondary/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/15 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Why Finsage?
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Because money stress isn't just personal.{' '}
                <span className="text-primary">It shows up at work too.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform your workplace culture with comprehensive financial wellness solutions that address the real concerns keeping your employees up at night.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Get Started Today
              </button>
              <button className="px-8 py-4 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative">
            <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Financial Wellness</h3>
                  <p className="text-muted-foreground">Reducing money stress through education and support</p>
                </div>
              </div>
            </div>
            
            {/* Floating stats */}
            <div className="absolute -top-4 -right-4 bg-card rounded-lg shadow-lg border border-border p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">Stress Reduction</div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card rounded-lg shadow-lg border border-border p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">90%</div>
                <div className="text-sm text-muted-foreground">Employee Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};