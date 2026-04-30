import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServicesSection from '../components/home/ServicesSection';
import AboutSection from '../components/home/AboutSection';
import DoctorsSection from '../components/home/DoctorsSection';
import AppointmentForm from '../components/home/AppointmentForm';

const Home = ({ isLoggedIn }) => {
  return (
    <main>
      <HeroSection isLoggedIn={isLoggedIn} />
      <ServicesSection />
      <AboutSection />
      <DoctorsSection />
      <AppointmentForm />
    </main>
  );
};

export default Home;
