-- Add summary-related columns to document_info
ALTER TABLE document_info
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS key_points text[],
ADD COLUMN IF NOT EXISTS confidence_score decimal(5,2);

-- First, clean up any duplicate records
WITH latest_info AS (
  SELECT DISTINCT ON (document_id)
    id,
    document_id,
    vendor_name,
    invoice_number,
    invoice_date,
    total_amount,
    processing_status,
    error_message,
    processed_at,
    updated_at,
    file_url,
    page_count,
    summary,
    key_points,
    confidence_score
  FROM document_info
  ORDER BY document_id, updated_at DESC NULLS LAST
)
DELETE FROM document_info di
WHERE NOT EXISTS (
  SELECT 1 FROM latest_info li 
  WHERE li.id = di.id
);

-- Now safely add the unique constraint
ALTER TABLE document_info
DROP CONSTRAINT IF EXISTS document_info_document_id_key,
ADD CONSTRAINT document_info_document_id_key UNIQUE (document_id);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_document_info_summary 
ON document_info(document_id) 
WHERE summary IS NOT NULL;

-- Create or replace function to handle updates
CREATE OR REPLACE FUNCTION handle_document_info_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Always update timestamp
  NEW.updated_at = now();
  
  -- Keep existing summary if not provided in update
  IF NEW.summary IS NULL AND OLD.summary IS NOT NULL THEN
    NEW.summary = OLD.summary;
    NEW.key_points = OLD.key_points;
    NEW.confidence_score = OLD.confidence_score;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updates
DROP TRIGGER IF EXISTS document_info_update_trigger ON document_info;
CREATE TRIGGER document_info_update_trigger
  BEFORE UPDATE ON document_info
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_info_update();