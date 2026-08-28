import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ServiceCard from "@/components/ui/ServiceCard";

import { services } from "@/constants/services";

export default function Services() {
  return (
    <section id="services" className="bg-white py-20 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Servicios"
          title="Todo lo que tu mascota necesita"
          description="Atención integral, prevención y seguimiento profesional en un mismo lugar."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              service={service}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}