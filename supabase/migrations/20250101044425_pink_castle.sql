-- Add case_number column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS case_number text;

-- Create unique index for case numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_case_number 
ON documents(case_number) 
WHERE case_number IS NOT NULL;

-- Create function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text AS $$
DECLARE
  year text;
  sequence int;
  new_case_number text;
BEGIN
  year := to_char(current_date, 'YYYY');
  
  -- Get the latest sequence number for the current year
  SELECT COALESCE(MAX(NULLIF(regexp_replace(case_number, '^CASE-' || year || '-', ''), '')), '0')::int
  INTO sequence
  FROM documents
  WHERE case_number LIKE 'CASE-' || year || '-%';
  
  -- Generate new case number
  new_case_number := 'CASE-' || year || '-' || lpad((sequence + 1)::text, 6, '0');
  
  RETURN new_case_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate case number
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_case_number_trigger
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_case_number();