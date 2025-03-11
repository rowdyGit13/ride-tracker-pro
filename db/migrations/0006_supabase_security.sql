ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own profiles" ON public.profiles FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own rides" ON public.rides FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own rides" ON public.rides FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert their own rides" ON public.rides FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can delete their own rides" ON public.rides FOR DELETE USING (auth.uid()::text = id);

CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid()::text = id);

CREATE POLICY "Users can view their own vehicles" ON public.vehicles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert their own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles FOR DELETE USING (auth.uid()::text = id);



