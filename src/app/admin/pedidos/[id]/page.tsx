import { AdminOrderClient } from "@/components/admin-order-client";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderClient orderId={id} />;
}
