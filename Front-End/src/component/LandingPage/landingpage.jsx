import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Benefits from "./Benefits";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero with parallax background */}
      <div 
        className="hero-parallax"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Hero />
      </div>
      
      <Benefits />
      
      {/* Features with parallax background */}
      <div 
        className="features-parallax"
        style={{
          backgroundImage: "url('/features-bg.jpg')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Features />
      </div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;