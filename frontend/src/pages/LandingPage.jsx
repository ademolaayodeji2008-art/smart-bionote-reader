import HeroSection from "./landing/HeroSection.jsx";
import WhatWeDoSection from "./landing/WhatWeDoSection.jsx";
import CoreFeaturesSection from "./landing/CoreFeaturesSection.jsx";
import HowItWorksSection from "./landing/HowItWorksSection.jsx";
import ForStudentsSection from "./landing/ForStudentsSection.jsx";
import ForTeachersSection from "./landing/ForTeachersSection.jsx";
import LearningPreviewSection from "./landing/LearningPreviewSection.jsx";
import CTASection from "./landing/CTASection.jsx";

/**
 * Public landing page. Navbar and Footer are provided by MainLayout —
 * this component only renders the sections in between.
 */
const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <WhatWeDoSection />
      <CoreFeaturesSection />
      <HowItWorksSection />
      <ForStudentsSection />
      <ForTeachersSection />
      <LearningPreviewSection />
      <CTASection />
    </div>
  );
};

export default LandingPage;
