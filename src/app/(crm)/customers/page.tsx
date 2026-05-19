import { CustomerGrid } from "@/components/customers/customer-grid";
import { requireAppUser } from "@/lib/auth";
import { listCustomerOptions } from "@/lib/customer-options";
import { getCustomerFacets, listCustomerPage } from "@/lib/customers";
import type { CustomerDashboardFilter } from "@/lib/types";

type CustomerSearchParams = {
  detailCustomerId?: string | string[];
  query?: string | string[];
  source?: string | string[];
  salesPotential?: string | string[];
  status?: string | string[];
  gender?: string | string[];
  ageDecade?: string | string[];
  dashboardFilter?: string | string[];
};

const dashboardFilters = ["open", "callbacks", "contacted"] as const satisfies readonly CustomerDashboardFilter[];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<CustomerSearchParams>;
}) {
  const user = await requireAppUser();
  const params = await searchParams;
  const initialDetailCustomerId = firstParam(params.detailCustomerId);
  const initialFilters = {
    query: firstParam(params.query) ?? "",
    source: firstParam(params.source) ?? "__all__",
    salesPotential: firstParam(params.salesPotential) ?? "__all__",
    status: firstParam(params.status) ?? "__all__",
    gender: firstParam(params.gender) ?? "__all__",
    ageDecade: firstParam(params.ageDecade) ?? "__all__",
    dashboardFilter: parseDashboardFilter(firstParam(params.dashboardFilter)),
  };
  const [{ rows, pageInfo }, facets, customerOptions] = await Promise.all([
    listCustomerPage(user.id, {
      page: 1,
      pageSize: 100,
      query: initialFilters.query,
      source: normalizeServerFacet(initialFilters.source),
      salesPotential: normalizeServerFacet(initialFilters.salesPotential),
      status: normalizeServerFacet(initialFilters.status),
      gender: normalizeServerFacet(initialFilters.gender),
      ageDecade: normalizeServerFacet(initialFilters.ageDecade),
      dashboardFilter: initialFilters.dashboardFilter,
    }),
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
        initialFilters={initialFilters}
      />
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDashboardFilter(value: string | undefined) {
  return dashboardFilters.includes(value as CustomerDashboardFilter)
    ? (value as CustomerDashboardFilter)
    : null;
}

function normalizeServerFacet(value: string) {
  return value === "__all__" ? null : value;
}
