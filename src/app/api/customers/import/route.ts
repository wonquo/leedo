import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { canManageCustomers, getCurrentAppUser } from "@/lib/auth";
import { getCustomerFacets, importCustomers, listCustomerPage } from "@/lib/customers";
import { parseCustomerSheet } from "@/lib/customer-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUser();
    if (!user || !canManageCustomers(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "엑셀 파일을 선택해주세요." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json({ error: "xlsx 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet("Sheet1");
    if (!sheet) {
      return NextResponse.json({ error: "Sheet1 시트를 찾을 수 없습니다." }, { status: 400 });
    }

    const rows = parseCustomerSheet(sheet);
    if (!rows.length) {
      return NextResponse.json(
        { error: "Sheet1에서 업로드할 고객 전화번호를 찾지 못했습니다." },
        { status: 400 },
      );
    }

    const result = await importCustomers({
      fileName: file.name,
      sheetName: sheet.name,
      rows,
      importedBy: user.id,
    });
    const [latestPage, facets] = await Promise.all([
      listCustomerPage(user.id, { page: 1, pageSize: 100 }),
      getCustomerFacets(undefined, user.id),
    ]);

    return NextResponse.json({
      ...result,
      sheetName: sheet.name,
      fileName: file.name,
      parsedRows: rows.length,
      sourceRows: Math.max(rows[rows.length - 1].sourceRowNumber - 5, 0),
      rows: latestPage.rows,
      pageInfo: latestPage.pageInfo,
      facets,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "엑셀 업로드에 실패했습니다." },
      { status: 400 },
    );
  }
}
