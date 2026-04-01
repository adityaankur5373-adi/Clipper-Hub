import Navbar from "../components/Navbar";
import Hero from "./Hero";
import Campaigns from "./Campaigns";
import HowItWorks from "./HowItWorks";
import Footer from "../components/Footer";
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Campaigns />
      <HowItWorks />
    </>
  );
}