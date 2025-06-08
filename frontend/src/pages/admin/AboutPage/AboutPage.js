// portfolio_py/frontend/src/pages/admin/AboutPage/AboutPage.js
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import Section Components
import WhoIAmSection from './WhoIAmSection';
import SkillsSection from './SkillsSection';
import EducationSection from './EducationSection';
import CertificationsSection from './CertificationsSection';
import AchievementsSection from './AchievementsSection';

// The data is now fetched by the child components, so we can remove the static data here.

// A new component to create the sticky scroll effect for each section
const StickyScrollSection = ({ children, index, totalSections, progress }) => {
  // Each section will be animated based on a segment of the total scroll progress.
  const start = index / totalSections;
  const end = (index + 1) / totalSections;

  // As we scroll, the scale of the section will transform from 1 down to 0.8
  const scale = useTransform(progress, [start, end], [1, 0.8]);

  return (
    <motion.div style={{ scale }} className="sticky top-0 h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-5xl px-4 md:px-8">
            {children}
        </div>
      </div>
    </motion.div>
  );
};

const AboutPage = () => {
  // An array of the section components to be rendered
  const sections = [
    <WhoIAmSection />,
    <SkillsSection />,
    <EducationSection />,
    <CertificationsSection />,
    <AchievementsSection />
  ];

  const scrollRef = useRef(null);
  
  // Use the useScroll hook to track scroll progress within the scrollRef container
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'] // Track from the start of the container to the end
  });

  return (
    // The main container needs an explicit height to define the scroll area.
    // We give it a height relative to the number of sections (e.g., 500vh for 5 sections).
    <div ref={scrollRef} style={{ height: `${sections.length * 100}vh` }} className="relative">
      {sections.map((sectionContent, i) => (
        <StickyScrollSection
          key={i}
          index={i}
          totalSections={sections.length}
          progress={scrollYProgress}
        >
          {sectionContent}
        </StickyScrollSection>
      ))}
    </div>
  );
};

export default AboutPage;