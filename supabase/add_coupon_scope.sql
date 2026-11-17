-- Migration: Add scope columns to coupons table
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS applies_to TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS product_ids JSONB DEFAULT '[]'::jsonb;
