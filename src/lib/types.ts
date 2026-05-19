import type { AppUserRole, AppUserStatus, CustomerOptionType } from "@/db/schema";

export type AppUserRow = {
  id: string;
  loginId: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  role: AppUserRole;
  status: AppUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerRow = {
  id: string;
  source: string;
  salesPotential: string | null;
  phone: string;
  gender: string | null;
  ageDecade: string | null;
  status: string | null;
  callNote: string | null;
  lastContactedAt: string | null;
  lastContactedLabel: string | null;
  orderNote: string | null;
  remark: string | null;
  tags: string[];
  assignedUserId: string | null;
  assignedUserName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFacets = {
  sources: string[];
  salesPotentials: string[];
  statuses: string[];
  sourceOptions: string[];
  salesPotentialOptions: string[];
  statusOptions: string[];
  genders: string[];
  ageDecades: string[];
  owners: string[];
};

export type CustomerSortKey =
  | "source"
  | "salesPotential"
  | "phone"
  | "gender"
  | "ageDecade"
  | "status"
  | "lastContacted"
  | "callNote"
  | "orderNote"
  | "remark";

export type CustomerPageInfo = {
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  returned: number;
};

export type CustomerPageResult = {
  rows: CustomerRow[];
  pageInfo: CustomerPageInfo;
};

export type CustomerContactMethod = "call" | "sms";

export type CustomerActivityRow = {
  id: string;
  customerId: string;
  method: CustomerContactMethod;
  occurredAt: string;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type CustomerOptionRow = {
  id: string;
  type: CustomerOptionType;
  label: string;
  sortOrder: number;
  isActive: boolean;
  usageCount: number;
  isManaged: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type NoticeRow = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  popupEnabled: boolean;
  popupStartsAt: string | null;
  popupEndsAt: string | null;
  createdBy: string | null;
  authorName: string | null;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NoticeCommentRow = {
  id: string;
  noticeId: string;
  content: string;
  createdBy: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoticeDetailRow = NoticeRow & {
  comments: NoticeCommentRow[];
};
