import { Mail, Phone, MessageCircle, Clock, ArrowRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent-soft text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                Get in Touch
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Start Your
                <span className="text-accent"> Baby's Journey?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of families who trust BabyTracker for comprehensive newborn monitoring. 
                Our team is here to help you get started.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone Support</h3>
                    <p className="text-muted-foreground">+1 (555) 123-BABY</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 8AM-8PM EST</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-soft rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Support</h3>
                    <p className="text-muted-foreground">support@babytracker.com</p>
                    <p className="text-sm text-muted-foreground">Response within 2 hours</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-soft rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">24/7 Emergency</h3>
                    <p className="text-muted-foreground">Emergency hotline available</p>
                    <p className="text-sm text-muted-foreground">For urgent health concerns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 border border-border/50 bg-card/80 backdrop-blur-sm shadow-medium rounded-xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Start Your Free Trial</h3>
                <p className="text-muted-foreground">
                  Get started with a 14-day free trial. No credit card required.
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter first name" 
                      className="w-full px-3 py-2 border rounded-md bg-background/50" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter last name" 
                      className="w-full px-3 py-2 border rounded-md bg-background/50" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    className="w-full px-3 py-2 border rounded-md bg-background/50" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Baby's Due Date / Birth Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-md bg-background/50" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">How can we help you?</label>
                  <textarea 
                    placeholder="Tell us about your baby monitoring needs..."
                    className="w-full px-3 py-2 border rounded-md bg-background/50 min-h-[100px]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy. 
                  Your data is protected with medical-grade security.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
