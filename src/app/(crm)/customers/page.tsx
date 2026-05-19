import { CustomerGrid } from "@/components/customers/customer-grid";
import { requireAppUser } from "@/lib/auth";
import { listCustomerOptions } from "@/lib/customer-options";
import { getCustomerFacets, listCustomerPage } from "@/lib/customers";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ detailCustomerId?: string | string[] }>;
}) {
  const user = await requireAppUser();
  const { detailCustomerId } = await searchParams;
  const initialDetailCustomerId = Array.isArray(detailCustomerId) ? detailCustomerId[0] : detailCustomerId;
  const [{ rows, pageInfo }, facets, customerOptions] = await Promise.all([
    listCustomerPage(user.id, { page: 1, pageSize: 100 }),
    getCustomerFacets(undefined, user.id),
    listCustomerOptions(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0d1b3d]">고객 관리</h1>
      </div>
      <CustomerGrid
        userId={user.id}
        initialRows={rows}
        initialPageInfo={pageInfo}
        facets={facets}
        initialCustomerOptions={customerOptions}
        initialDetailCustomerId={initialDetailCustomerId}
      />
    </div>
  );
}
