-- Update department names to Government of India ministries

-- Update transactions table
UPDATE public.transactions 
SET department = CASE department
  WHEN 'IT Department' THEN 'Ministry of Electronics & IT'
  WHEN 'Executive' THEN 'Prime Minister Office'
  WHEN 'Administration' THEN 'Ministry of Home Affairs'
  WHEN 'Facilities' THEN 'Ministry of Urban Development'
  WHEN 'HR Department' THEN 'Ministry of Personnel'
  ELSE department
END
WHERE department IN ('IT Department', 'Executive', 'Administration', 'Facilities', 'HR Department');

-- Update fraud cases if needed (add similar updates for other tables as needed)
-- This ensures all legacy data is migrated to new GOI ministry names
