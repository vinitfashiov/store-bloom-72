-- Add header/footer visibility settings to store settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS show_header boolean NOT NULL DEFAULT true;

ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS show_footer boolean NOT NULL DEFAULT true;
