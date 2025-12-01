-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view all documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (true);

-- Vendors policies
CREATE POLICY "Users can view all vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Users can insert vendors" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update vendors" ON public.vendors FOR UPDATE USING (true);

-- Fraud cases policies
CREATE POLICY "Users can view all fraud cases" ON public.fraud_cases FOR SELECT USING (true);
CREATE POLICY "Users can insert fraud cases" ON public.fraud_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update fraud cases" ON public.fraud_cases FOR UPDATE USING (true);

-- Case evidence policies
CREATE POLICY "Users can view case evidence" ON public.case_evidence FOR SELECT USING (true);
CREATE POLICY "Users can insert case evidence" ON public.case_evidence FOR INSERT WITH CHECK (true);

-- Case notes policies
CREATE POLICY "Users can view case notes" ON public.case_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert case notes" ON public.case_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "System can insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Policy violations policies
CREATE POLICY "Users can view policy violations" ON public.policy_violations FOR SELECT USING (true);
CREATE POLICY "System can insert violations" ON public.policy_violations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update violations" ON public.policy_violations FOR UPDATE USING (true);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can view own searches" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can insert own searches" ON public.saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own searches" ON public.saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own searches" ON public.saved_searches FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
