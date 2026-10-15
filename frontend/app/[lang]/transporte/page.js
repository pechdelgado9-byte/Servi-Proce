import { redirect } from 'next/navigation';

export default async function TransportePage({ params }) {
  const { lang } = await params;
  redirect(`/${lang}/freight-forwarder`);
}
