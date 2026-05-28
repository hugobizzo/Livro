import { CustomerOrderClient } from "@/components/customer-order-client";

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerOrderClient orderId={id} />;
}
