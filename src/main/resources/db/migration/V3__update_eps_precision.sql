-- Update EPS precision in income_statements table
ALTER TABLE income_statements ALTER COLUMN eps TYPE NUMERIC(20, 4);

-- Update EPS precision in company_overviews table
ALTER TABLE company_overviews ALTER COLUMN yearly_eps TYPE NUMERIC(20, 4);
