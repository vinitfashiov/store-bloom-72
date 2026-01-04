-- ============================================
-- MULTI-STORE SUPPORT
-- One email can have multiple stores
-- Each store has independent payment and delivery systems
-- ============================================

-- Create junction table for user-tenant relationship (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tenants_user_id ON public.user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_id ON public.user_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_primary ON public.user_tenants(user_id, is_primary) WHERE is_primary = true;

-- Enable RLS
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tenants
CREATE POLICY "Users can view their tenant associations"
ON public.user_tenants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create tenant associations"
ON public.user_tenants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their tenant associations"
ON public.user_tenants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their tenant associations"
ON public.user_tenants FOR DELETE
USING (user_id = auth.uid());

-- Update get_user_tenant_id function to support multiple tenants
-- Keep old function for backward compatibility, but add new one
CREATE OR REPLACE FUNCTION public.get_user_tenants()
RETURNS TABLE(tenant_id UUID, is_primary BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ut.tenant_id, ut.is_primary
  FROM public.user_tenants ut
  WHERE ut.user_id = auth.uid()
  ORDER BY ut.is_primary DESC, ut.created_at DESC
$$;

-- Function to get primary tenant
CREATE OR REPLACE FUNCTION public.get_user_primary_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.user_tenants
  WHERE user_id = auth.uid() AND is_primary = true
  LIMIT 1
$$;

-- Function to set primary tenant
CREATE OR REPLACE FUNCTION public.set_primary_tenant(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove primary flag from all user's tenants
  UPDATE public.user_tenants
  SET is_primary = false
  WHERE user_id = auth.uid();
  
  -- Set the specified tenant as primary
  UPDATE public.user_tenants
  SET is_primary = true
  WHERE user_id = auth.uid() AND tenant_id = p_tenant_id;
END;
$$;

-- Function to check if user has access to tenant
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_tenants
    WHERE user_id = auth.uid() AND tenant_id = p_tenant_id
  )
$$;

-- Update RLS policies to use new function
-- Update tenants RLS to allow access if user is associated
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON public.tenants;

CREATE POLICY "Users can view their associated tenants"
ON public.tenants FOR SELECT
USING (public.user_has_tenant_access(id));

CREATE POLICY "Users can update their associated tenants"
ON public.tenants FOR UPDATE
USING (public.user_has_tenant_access(id))
WITH CHECK (public.user_has_tenant_access(id));

-- Update all other tenant-scoped RLS policies
-- We'll use a helper function that checks user_tenants table

-- Function to get user's accessible tenant IDs
CREATE OR REPLACE FUNCTION public.get_user_accessible_tenant_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(tenant_id)::UUID[]
  FROM public.user_tenants
  WHERE user_id = auth.uid()
$$;

-- Update get_user_tenant_id to use primary tenant (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tenant_id FROM public.user_tenants WHERE user_id = auth.uid() AND is_primary = true LIMIT 1),
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  )
$$;

-- Migrate existing data: Create user_tenants entries from profiles
INSERT INTO public.user_tenants (user_id, tenant_id, is_primary)
SELECT id, tenant_id, true
FROM public.profiles
WHERE tenant_id IS NOT NULL
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Add soft delete to tenants (for delete store feature)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON public.tenants(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update is_active check to exclude deleted tenants
CREATE OR REPLACE FUNCTION public.is_tenant_active(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_active = true AND deleted_at IS NULL
  FROM public.tenants
  WHERE id = p_tenant_id
$$;

-- Function to soft delete tenant (delete store)
CREATE OR REPLACE FUNCTION public.delete_tenant(p_tenant_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify user has access to this tenant
  IF NOT public.user_has_tenant_access(p_tenant_id) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  v_user_id := auth.uid();

  -- Soft delete the tenant
  UPDATE public.tenants
  SET 
    deleted_at = NOW(),
    deletion_reason = p_reason,
    is_active = false
  WHERE id = p_tenant_id;

  -- Remove user association
  DELETE FROM public.user_tenants
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

  -- If this was the primary tenant, set another one as primary
  IF EXISTS (
    SELECT 1 FROM public.user_tenants 
    WHERE user_id = v_user_id AND is_primary = true AND tenant_id = p_tenant_id
  ) THEN
    -- Set the most recently created tenant as primary
    UPDATE public.user_tenants
    SET is_primary = true
    WHERE user_id = v_user_id
    AND tenant_id = (
      SELECT tenant_id FROM public.user_tenants
      WHERE user_id = v_user_id
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;
END;
$$;

-- Update public tenant view policy to exclude deleted tenants
DROP POLICY IF EXISTS "Public can view active tenants by slug" ON public.tenants;

CREATE POLICY "Public can view active tenants by slug"
ON public.tenants FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

-- Update all tenant-scoped policies to check deleted_at
-- This will be done by updating the helper functions used in policies

-- Add comment
COMMENT ON TABLE public.user_tenants IS 'Junction table for many-to-many relationship between users and tenants. Enables one email to have multiple stores.';
COMMENT ON FUNCTION public.delete_tenant IS 'Soft deletes a tenant (store). Marks as deleted and removes user association.';

