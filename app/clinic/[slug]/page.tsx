import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ClinicPage({ params }: PageProps) {
  redirect(`/clinic/${params.slug}/select-language`);
}
