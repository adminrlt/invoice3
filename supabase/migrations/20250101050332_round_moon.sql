-- Add unique constraint for document_id and page_number
ALTER TABLE document_info
DROP CONSTRAINT IF EXISTS document_info_document_id_page_number_key;

-- First clean up any duplicate records
WITH ranked_records AS (
  SELECT id,
         document_id,
         page_number,
         ROW_NUMBER() OVER (
           PARTITION BY document_id, page_number 
           ORDER BY created_at DESC
         ) as rn
  FROM document_info
)
DELETE FROM document_info
WHERE id IN (
  SELECT id 
  FROM ranked_records 
  WHERE rn > 1
);

-- Add the unique constraint
ALTER TABLE document_info
ADD CONSTRAINT document_info_document_id_page_number_key 
UNIQUE (document_id, page_number);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_document_info_lookup 
ON document_info(document_id, page_number, processing_status);

-- Update the trigger for concurrent updates
CREATE OR REPLACE FUNCTION handle_document_info_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if new data is more recent
  IF OLD.updated_at IS NULL OR NEW.updated_at > OLD.updated_at THEN
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;