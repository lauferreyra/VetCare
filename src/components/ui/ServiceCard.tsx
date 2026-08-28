import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 inline-flex rounded-xl bg-teal-100 p-3 text-teal-700">
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900">
        {service.title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {service.description}
      </p>
    </article>
  );
}