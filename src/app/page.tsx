import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { ServiceCatalog } from "@/components/home/ServiceCatalog";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Cinematic3DShowcase } from "@/components/home/Cinematic3DShowcase";
import { FullProjectGallery } from "@/components/home/FullProjectGallery";
import { BeforeAfterGallery } from "@/components/before-after/BeforeAfterGallery";
import { YardVisualizer } from "@/components/yard-visualizer/YardVisualizer";
import { ReferralCard } from "@/components/referral/ReferralCard";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <ServiceCatalog />
      <FeaturedProjects />
      <Cinematic3DShowcase />
      <BeforeAfterGallery />
      <FullProjectGallery />
      <YardVisualizer />
      <ReferralCard />
    </>
  );
}
