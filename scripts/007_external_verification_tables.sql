-- External Verification & Integration Tables

-- Vendor Verifications (Banking, GST, PAN, etc.)
CREATE TABLE IF NOT EXISTS public.vendor_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('gst', 'pan', 'bank_account', 'company_registry', 'sanctions', 'credit_bureau')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  verified_data JSONB,
  verification_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  api_response JSONB,
  error_message TEXT,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sanctions Watchlist
CREATE TABLE IF NOT EXISTS public.sanctions_watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_name TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('individual', 'organization')),
  list_source TEXT NOT NULL,
  country TEXT,
  reason TEXT,
  date_added DATE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Predictions (ML-based)
CREATE TABLE IF NOT EXISTS public.risk_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor', 'transaction', 'department')),
  entity_id UUID NOT NULL,
  model_version TEXT,
  predicted_risk_score INTEGER CHECK (predicted_risk_score >= 0 AND predicted_risk_score <= 100),
  confidence_level DECIMAL(5, 2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
  risk_factors JSONB,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_accurate BOOLEAN,
  actual_outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomaly Detection Results
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  statistical_score DECIMAL(10, 4),
  detection_method TEXT,
  is_confirmed BOOLEAN DEFAULT FALSE,
  investigated_by UUID REFERENCES auth.users(id),
  investigation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_verifications_vendor ON public.vendor_verifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_verifications_status ON public.vendor_verifications(status);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_entity ON public.risk_predictions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_transaction ON public.anomalies(transaction_id);
