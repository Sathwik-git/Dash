import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Code,
  Palette,
  CheckCircle,
  Star,
  Shield,
} from "lucide-react";
import LogoIcon from "../assets/icons/dash-alt-svgrepo-com.svg";
const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      navigate("/editor", { state: { initialPrompt: prompt } });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Development",
      description:
        "Generate production-ready applications in seconds, not hours. Our AI understands modern development patterns.",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Clean, Maintainable Code",
      description:
        "Every line of code follows industry best practices with proper TypeScript, modern React patterns, and clean architecture.",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Design System",
      description:
        "Automatically generates cohesive, accessible designs with consistent spacing, typography, and color schemes.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Ready",
      description:
        "Built with security, scalability, and performance in mind. Ready for production deployment from day one.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Apps Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "< 30s", label: "Average Build Time" },
    { number: "500+", label: "Enterprise Clients" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechFlow",
      content:
        "This platform reduced our MVP development time from months to days. The code quality is exceptional.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Developer, StartupX",
      content:
        "Finally, an AI tool that generates code I'm actually proud to deploy. Game-changing for rapid prototyping.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Product Manager, InnovateCorp",
      content:
        "Our non-technical team can now create functional prototypes. It's democratized app development for us.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl shadow-lg">
              <img src={LogoIcon} alt="Dash" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white">Dash</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">
                Now in Production • Trusted by 500+ Companies
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Build Production Apps
              </span>
              <br />
              <span className="text-white">with AI Precision</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your ideas into enterprise-grade applications through
              natural conversation. No coding required, no compromises on
              quality.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main CTA Form */}
          <div className="max-w-4xl mx-auto mb-16">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your application... (e.g., 'Create a project management dashboard with real-time collaboration, task tracking, and team analytics')"
                  className="w-full h-32 px-6 py-4 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-lg leading-relaxed"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 px-6 py-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Production Ready</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isLoading}
                    className="group flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 mr-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Building Your App...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Building</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Example Prompts */}
            <div className="mt-8">
              <p className="text-gray-400 text-center mb-6 text-sm">
                Popular use cases:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "E-commerce platform with inventory management",
                  "CRM dashboard with sales analytics",
                  "Social media management tool",
                  "Project management with team collaboration",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Dash?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for developers, designed for everyone. Experience the future
              of application development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what developers and companies are saying about Dash.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and companies who are already building
            the future with AI.
          </p>
          <button
            onClick={() => document.querySelector("textarea")?.focus()}
            className="inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Dash</span>
            </div>
            <div className="flex items-center space-x-8 text-gray-400 text-sm">
              <span>© 2025 Dash. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
