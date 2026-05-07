export type Site = {
  id: string;
  site_name: string;
  slug: string;
  access_code: string;
  start_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  rams_version: number;
  created_at: string;
  updated_at: string;
};

export type RamsSection = {
  id: string;
  site_id: string;
  title: string;
  content: string;
  section_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
