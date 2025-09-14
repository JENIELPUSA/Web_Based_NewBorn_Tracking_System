import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Benefits from "./Benefits"
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Benefits/>
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;
