import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Flame,
  Eye,
  RefreshCw,
  Tags,
  ThermometerSun,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/customers";
import { SALES_TEMPERATURE_LABEL, getSalesPotentialMeta } from "@/lib/sales-potential";
import type { CustomerRow } from "@/lib/types";

type CountPair = {
  label: string;
  value: number;
};

const sourceColors = ["#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#64748b", "#94a3b8"];
const distributionColors = ["#2563eb", "#0f766e", "#ca8a04", "#dc2626", "#7c3aed", "#475569", "#0891b2", "#94a3b8"];

export default async function DashboardPage() {
  const user = await requireAppUser();
  const stats = await getDashboardStats(user.id);
  const contactRate = stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0;
  const todayText = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
  const kpis = [
    {
      title: "총 고객",
      value: stats.total,
      caption: "내 담당 고객",
      icon: Users,
      accent: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "상담 가능",
      value: stats.open,
      caption: "블랙 제외",
      icon: UserRoundCheck,
      accent: "#0f766e",
      background: "#ecfdf5",
    },
    {
      title: "재연락 대상",
      value: stats.callbacks,
      caption: "다시 전화/재통",
      icon: RefreshCw,
      accent: "#ca8a04",
      background: "#fefce8",
    },
    {
      title: "블랙 고객",
      value: stats.black,
      caption: "상담 제외 필요",
      icon: Ban,
      accent: "#dc2626",
      background: "#fef2f2",
    },
    {
      title: "연락 완료율",
      value: `${contactRate}%`,
      caption: `${stats.contacted.toLocaleString()}명 연락 완료`,
      icon: CheckCircle2,
      accent: "#7c3aed",
      background: "#f5f3ff",
    },
  ];

  return (
    <div className="mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#66748a]">{todayText}</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0d1b3d]">고객관리 대시보드</h1>
          <p className="mt-2 text-sm text-[#66748a]">
            {user.name}님에게 배정된 고객 데이터를 기준으로 상담 현황을 집계합니다.
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit border-[#d6dfea] bg-white text-[#0d1b3d] shadow-sm">
          <Link href="/customers">
            고객관리로 이동
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {stats.total === 0 ? (
        <DashboardCard className="border-dashed">
          <CardContent className="flex min-h-32 flex-col items-center justify-center gap-2 text-center">
            <Users className="size-8 text-[#94a3b8]" />
            <p className="text-base font-semibold text-[#0d1b3d]">표시할 고객 데이터가 없습니다</p>
            <p className="text-sm text-[#66748a]">고객을 배정하거나 가져오면 이곳에 상담 지표가 표시됩니다.</p>
          </CardContent>
        </DashboardCard>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <KpiCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <TemperatureCard items={stats.bySalesPotential} total={stats.total} />
        <BarChartCard
          title="상태별 고객 분포"
          caption="고객관리 상태 TOP"
          icon={<Tags className="size-4" />}
          items={stats.byStatus}
          colors={distributionColors}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <BarChartCard
          title="유입경로 분포"
          caption="소스 기준 TOP"
          icon={<Flame className="size-4" />}
          items={stats.bySource}
          colors={sourceColors}
          horizontal
        />
        <DistributionCard gender={stats.byGender} ageDecade={stats.byAgeDecade} total={stats.total} />
      </div>

      <RecentContactsCard rows={stats.recentContacted} />
    </div>
  );
}

function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={`rounded-lg border border-[#dbe3ee] bg-white py-4 shadow-[0_10px_34px_rgba(20,35,65,0.06)] ring-0 ${className ?? ""}`}>
      {children}
    </Card>
  );
}

function KpiCard({
  title,
  value,
  caption,
  icon: Icon,
  accent,
  background,
}: {
  title: string;
  value: number | string;
  caption: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  background: string;
}) {
  return (
    <DashboardCard className="min-h-[132px]">
      <CardContent className="flex h-full flex-col justify-between gap-4 px-5 py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#44526a]">{title}</p>
            <p className="mt-2 truncate font-mono text-3xl font-bold text-[#0d1b3d]">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: background, color: accent }}>
            <Icon className="size-5" />
          </span>
        </div>
        <p className="truncate text-xs font-medium text-[#7a869b]">{caption}</p>
      </CardContent>
    </DashboardCard>
  );
}

function TemperatureCard({ items, total }: { items: CountPair[]; total: number }) {
  const chartTotal = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardCard className="min-h-[338px]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-[#0d1b3d]">{SALES_TEMPERATURE_LABEL} 분포</CardTitle>
          <p className="mt-2 text-xs text-[#66748a]">전체 고객 {total.toLocaleString()}명 기준</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-[#dbe3ee] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#22304f]">
          <ThermometerSun className="size-3.5" />
          실시간 집계
        </span>
      </CardHeader>
      <CardContent className="grid gap-7 md:grid-cols-[210px_minmax(0,1fr)] md:items-center">
        <div className="relative mx-auto grid size-[184px] place-items-center rounded-full" style={{ background: buildTemperatureGradient(items) }}>
          <div className="grid size-[98px] place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-xs font-semibold text-[#66748a]">집계</p>
              <p className="mt-1 font-mono text-xl font-bold text-[#0d1b3d]">{chartTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {items.map((item) => {
            const meta = getSalesPotentialMeta(item.label);
            const percent = getPercent(item.value, chartTotal);
            return (
              <div key={item.label} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-semibold text-[#22304f]">{meta.value}</span>
                  <span className="whitespace-nowrap font-mono text-xs font-bold text-[#22304f]">
                    {item.value.toLocaleString()}명 · {percent}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f7]">
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: meta.chartColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </DashboardCard>
  );
}

function BarChartCard({
  title,
  caption,
  icon,
  items,
  colors,
  horizontal = false,
}: {
  title: string;
  caption: string;
  icon: ReactNode;
  items: CountPair[];
  colors: string[];
  horizontal?: boolean;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...items.map((item) => item.value), 1);
  const chartItems = items.length > 0 ? items : [{ label: "미분류", value: 0 }];

  return (
    <DashboardCard className="min-h-[338px]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-[#0d1b3d]">
            <span className="grid size-7 place-items-center rounded-md bg-[#eef4fb] text-[#1f6fff]">{icon}</span>
            {title}
          </CardTitle>
          <p className="mt-2 text-xs text-[#66748a]">{caption}</p>
        </div>
        <span className="font-mono text-xs font-semibold text-[#66748a]">총 {total.toLocaleString()}명</span>
      </CardHeader>
      <CardContent>
        {horizontal ? (
          <div className="space-y-4">
            {chartItems.map((item, index) => (
              <ProgressRow key={`${item.label}-${index}`} item={item} max={max} total={total} color={colors[index % colors.length]} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-[220px] grid-cols-[repeat(auto-fit,minmax(54px,1fr))] items-end gap-3 border-b border-[#e7edf5] pb-3">
            {chartItems.map((item, index) => {
              const height = item.value > 0 ? Math.max(8, (item.value / max) * 100) : 2;
              return (
                <div key={`${item.label}-${index}`} className="flex min-w-0 flex-col items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#22304f]">{item.value.toLocaleString()}</span>
                  <div className="flex h-32 w-full max-w-12 items-end rounded-md bg-[#f1f5f9]">
                    <div
                      className="w-full rounded-md"
                      style={{ height: `${height}%`, backgroundColor: colors[index % colors.length] }}
                    />
                  </div>
                  <span className="w-full truncate text-center text-xs font-medium text-[#66748a]" title={item.label}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}

function ProgressRow({
  item,
  max,
  total,
  color,
}: {
  item: CountPair;
  max: number;
  total: number;
  color: string;
}) {
  const width = item.value > 0 ? Math.max(3, (item.value / max) * 100) : 0;
  const percent = getPercent(item.value, total);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-[#22304f]">{item.label}</span>
        <span className="whitespace-nowrap font-mono text-xs font-bold text-[#22304f]">
          {item.value.toLocaleString()}명 · {percent}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#edf2f7]">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function DistributionCard({
  gender,
  ageDecade,
  total,
}: {
  gender: CountPair[];
  ageDecade: CountPair[];
  total: number;
}) {
  return (
    <DashboardCard className="min-h-[338px]">
      <CardHeader>
        <CardTitle className="text-base font-bold text-[#0d1b3d]">고객 프로필 분포</CardTitle>
        <p className="mt-2 text-xs text-[#66748a]">성별과 연령대 기준</p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <MiniDistribution title="성별" items={gender} total={total} />
        <MiniDistribution title="연령대" items={ageDecade} total={total} />
      </CardContent>
    </DashboardCard>
  );
}

function MiniDistribution({ title, items, total }: { title: string; items: CountPair[]; total: number }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const chartItems = items.length > 0 ? items : [{ label: "미분류", value: 0 }];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#22304f]">{title}</h2>
        <span className="font-mono text-xs text-[#7a869b]">{total.toLocaleString()}명</span>
      </div>
      <div className="space-y-3">
        {chartItems.map((item, index) => (
          <ProgressRow
            key={`${title}-${item.label}-${index}`}
            item={item}
            max={max}
            total={total}
            color={distributionColors[index % distributionColors.length]}
          />
        ))}
      </div>
    </section>
  );
}

function RecentContactsCard({ rows }: { rows: CustomerRow[] }) {
  return (
    <DashboardCard>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-[#0d1b3d]">최근 연락 고객</CardTitle>
          <p className="mt-2 text-xs text-[#66748a]">최근 연락일 기준 최대 6명</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-[#1f6fff]">
          <Link href="/customers">
            전체보기
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#f2f5f9] text-xs text-[#22304f]">
              {["연락일", "연락처", "유입경로", SALES_TEMPERATURE_LABEL, "상태", "상담 메모", "상세"].map((head) => (
                <th key={head} className="h-9 px-3 text-left font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[#edf1f6] text-[#22304f] last:border-b-0">
                  <td className="h-11 whitespace-nowrap px-3 font-mono text-xs">{formatContactDate(row)}</td>
                  <td className="h-11 whitespace-nowrap px-3 font-mono text-xs font-semibold">{row.phone}</td>
                  <td className="h-11 max-w-[180px] truncate px-3">{row.source || "미분류"}</td>
                  <td className="h-11 whitespace-nowrap px-3">
                    <TemperatureBadge value={row.salesPotential} />
                  </td>
                  <td className="h-11 whitespace-nowrap px-3">
                    <StatusPill value={row.status} />
                  </td>
                  <td className="h-11 max-w-[260px] truncate px-3 text-[#66748a]">{row.callNote || row.remark || "-"}</td>
                  <td className="h-11 whitespace-nowrap px-3">
                    <Button asChild variant="outline" size="xs" className="h-6 px-2 text-[11px] leading-none">
                      <Link
                        href={{
                          pathname: "/customers",
                          query: { detailCustomerId: row.id },
                        }}
                      >
                        <Eye className="size-3" />
                        상세
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="h-20 px-3 text-center text-sm text-[#66748a]">
                  최근 연락 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </DashboardCard>
  );
}

function TemperatureBadge({ value }: { value: string | null }) {
  const meta = getSalesPotentialMeta(value);

  return (
    <span
      className="inline-flex items-center rounded px-2 py-1 text-xs font-semibold"
      style={{ color: meta.foreground, backgroundColor: meta.background, border: `1px solid ${meta.border}` }}
    >
      {meta.shortLabel}
    </span>
  );
}

function StatusPill({ value }: { value: string | null }) {
  const status = value || "미분류";
  const danger = status === "블랙";
  const callback = status === "다시 전화" || status === "재통";

  return (
    <span
      className={
        danger
          ? "inline-flex rounded bg-[#fef2f2] px-2 py-1 text-xs font-semibold text-[#dc2626]"
          : callback
            ? "inline-flex rounded bg-[#fefce8] px-2 py-1 text-xs font-semibold text-[#a16207]"
            : "inline-flex rounded bg-[#eef4fb] px-2 py-1 text-xs font-semibold text-[#1f5fbf]"
      }
    >
      {status}
    </span>
  );
}

function buildTemperatureGradient(items: CountPair[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return "conic-gradient(#e2e8f0 0% 100%)";

  let cursor = 0;
  const segments = items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;

      return `${getSalesPotentialMeta(item.label).chartColor} ${start}% ${end}%`;
    });

  return `conic-gradient(${segments.join(", ")})`;
}

function formatContactDate(row: CustomerRow) {
  if (row.lastContactedLabel) return row.lastContactedLabel;
  if (!row.lastContactedAt) return "-";

  const date = new Date(row.lastContactedAt);
  if (!Number.isFinite(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;

  return Math.round((value / total) * 100);
}
