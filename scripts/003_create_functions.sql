-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id, theme)
  VALUES (NEW.id, 'holographic')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fraud_cases_updated_at BEFORE UPDATE ON public.fraud_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate vendor risk score
CREATE OR REPLACE FUNCTION public.calculate_vendor_risk_score(vendor_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  risk_score INTEGER := 0;
  flagged_count INTEGER;
  total_count INTEGER;
  avg_amount DECIMAL;
BEGIN
  -- Get transaction statistics
  SELECT COUNT(*) FILTER (WHERE is_flagged = true),
         COUNT(*),
         AVG(amount)
  INTO flagged_count, total_count, avg_amount
  FROM public.transactions
  WHERE vendor_id = vendor_uuid;
  
  -- Calculate risk based on flagged percentage
  IF total_count > 0 THEN
    risk_score := (flagged_count::DECIMAL / total_count * 100)::INTEGER;
  END IF;
  
  -- Increase risk for high-value transactions
  IF avg_amount > 100000 THEN
    risk_score := risk_score + 20;
  ELSIF avg_amount > 50000 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Cap at 100
  IF risk_score > 100 THEN
    risk_score := 100;
  END IF;
  
  RETURN risk_score;
END;
$$;

-- Function to generate case number
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  case_num TEXT;
  year_suffix TEXT;
  sequence_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  
  SELECT COUNT(*) + 1
  INTO sequence_num
  FROM public.fraud_cases
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  case_num := 'FRD-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN case_num;
END;
$$;
