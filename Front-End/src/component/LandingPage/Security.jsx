import { Shield, Lock, Eye, Award, Clock, Users } from "lucide-react";

const Security = () => {
  const securityFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "HIPAA Compliance",
      description:
        "Full compliance with healthcare privacy regulations ensuring your data is protected according to medical standards.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "End-to-End Encryption",
      description:
        "All data is encrypted in transit and at rest using industry-standard AES-256 encryption protocols.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Privacy by Design",
      description:
        "We collect only necessary data and you maintain complete control over your information at all times.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "SOC 2 Certified",
      description:
        "Independently audited and certified for security, availability, and confidentiality standards.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Monitoring",
      description:
        "Continuous security monitoring and threat detection to protect against unauthorized access.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Access Controls",
      description:
        "Granular permissions and role-based access ensure only authorized individuals can view your data.",
    },
  ];

  return (
    <section id="security" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary-soft text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise-Grade Security
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Your Baby's Data is
            <span className="text-secondary"> Completely Safe</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We understand that your baby's health information is the most
            sensitive data you have. That's why we've built medical-grade
            security into every aspect of our platform.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border/50 hover:shadow-medium transition-smooth group bg-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary-soft rounded-lg flex items-center justify-center text-secondary group-hover:scale-110 transition-smooth">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Badges */}
        <div className="bg-gradient-soft rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Trusted & Certified
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="inline-flex items-center text-lg py-3 px-6 bg-card border border-border rounded-full">
              <Shield className="w-5 h-5 mr-2 text-secondary" />
              HIPAA Compliant
            </div>
            <div className="inline-flex items-center text-lg py-3 px-6 bg-card border border-border rounded-full">
              <Award className="w-5 h-5 mr-2 text-primary" />
              SOC 2 Type II
            </div>
            <div className="inline-flex items-center text-lg py-3 px-6 bg-card border border-border rounded-full">
              <Lock className="w-5 h-5 mr-2 text-accent" />
              ISO 27001
            </div>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              "BabyTracker meets the highest standards for medical data
              protection. Your family's information is safer here than most
              medical institutions."
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              — Dr. Sarah Johnson, Chief Medical Officer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
