-- First, remove the existing unique constraint
ALTER TABLE document_info
DROP CONSTRAINT IF EXISTS document_info_document_id_key,
DROP CONSTRAINT IF EXISTS document_info_document_id_page_number_key;

-- Clean up any duplicate records keeping only the most recent
WITH ranked_records AS (
  SELECT id,
         document_id,
         page_number,
         ROW_NUMBER() OVER (
           PARTITION BY document_id, page_number 
           ORDER BY updated_at DESC NULLS LAST,
                    created_at DESC NULLS LAST
         ) as rn
  FROM document_info
)
DELETE FROM document_info
WHERE id IN (
  SELECT id 
  FROM ranked_records 
  WHERE rn > 1
);

-- Add the correct composite unique constraint
ALTER TABLE document_info
ADD CONSTRAINT document_info_document_id_page_number_key 
UNIQUE (document_id, page_number);

-- Update indices for better performance
DROP INDEX IF EXISTS idx_document_info_document_id;
DROP INDEX IF EXISTS idx_document_info_status;
DROP INDEX IF EXISTS idx_document_info_lookup;

-- Create new indices with unique names
CREATE INDEX IF NOT EXISTS idx_doc_info_lookup_v2 
ON document_info(document_id, page_number, processing_status);

CREATE INDEX IF NOT EXISTS idx_doc_info_status_date_v2 
ON document_info(processing_status, created_at DESC);

-- Update the trigger for handling concurrent updates
CREATE OR REPLACE FUNCTION handle_document_info_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set updated_at to current timestamp
  NEW.updated_at = now();
  
  -- Keep existing data if more recent
  IF OLD.updated_at IS NOT NULL AND OLD.updated_at > NEW.updated_at THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS document_info_update_trigger ON document_info;
CREATE TRIGGER document_info_update_trigger
  BEFORE UPDATE ON document_info
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_info_update();