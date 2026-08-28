import About from "@/components/sections/About";
import Benefits from "@/components/sections/Benefits";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Benefits />
      <Contact />
    </>
  );
}