-- GPS Geofenced Time Tracking Schema for CareCircle
-- Run this in Supabase SQL Editor

-- ============================================
-- LOCATIONS TABLE
-- Stores work locations with GPS coordinates and geofence radius
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Users can view locations in their circle" ON locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM circle_members 
            WHERE circle_members.circle_id = locations.circle_id 
            AND circle_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage locations" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM circle_members 
            WHERE circle_members.circle_id = locations.circle_id 
            AND circle_members.user_id = auth.uid()
            AND circle_members.role = 'admin'
        )
    );

-- ============================================
-- TIME ENTRIES TABLE
-- Stores clock-in/clock-out records with GPS validation
-- ============================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    
    -- Clock times
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    
    -- GPS coordinates at clock-in
    clock_in_lat DECIMAL(10, 8),
    clock_in_lng DECIMAL(11, 8),
    clock_in_distance_meters INTEGER,
    
    -- GPS coordinates at clock-out (optional, for verification)
    clock_out_lat DECIMAL(10, 8),
    clock_out_lng DECIMAL(11, 8),
    clock_out_distance_meters INTEGER,
    
    -- Override fields for admin corrections
    is_override BOOLEAN NOT NULL DEFAULT false,
    override_by UUID REFERENCES profiles(id),
    override_reason TEXT,
    
    -- Calculated duration (stored for easy querying)
    duration_minutes INTEGER,
    
    -- Additional notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Users can view their own time entries" ON time_entries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries" ON time_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own open time entries" ON time_entries
    FOR UPDATE USING (user_id = auth.uid() AND clock_out IS NULL);

CREATE POLICY "Admins can view all time entries in their circle" ON time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM circle_members 
            WHERE circle_members.circle_id = time_entries.circle_id 
            AND circle_members.user_id = auth.uid()
            AND circle_members.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all time entries in their circle" ON time_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM circle_members 
            WHERE circle_members.circle_id = time_entries.circle_id 
            AND circle_members.user_id = auth.uid()
            AND circle_members.role = 'admin'
        )
    );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_circle_id ON time_entries(circle_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_clock_in ON time_entries(user_id, clock_in);
CREATE INDEX IF NOT EXISTS idx_locations_circle_id ON locations(circle_id);

-- ============================================
-- TRIGGER: Update duration automatically when clock_out is set
-- ============================================
CREATE OR REPLACE FUNCTION update_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_duration ON time_entries;
CREATE TRIGGER trigger_update_duration
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_time_entry_duration();

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_time_entries_updated_at ON time_entries;
CREATE TRIGGER trigger_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_locations_updated_at ON locations;
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR PAY PERIOD CALCULATIONS
-- ============================================

-- Get pay period start date (assuming biweekly pay periods starting on Sunday)
CREATE OR REPLACE FUNCTION get_pay_period_start(check_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
DECLARE
    days_since_sunday INTEGER;
    weeks_back INTEGER;
BEGIN
    -- Calculate days since last Sunday
    days_since_sunday := EXTRACT(DOW FROM check_date);
    
    -- For biweekly, we need to determine if we're in week 1 or week 2 of the pay period
    -- Using a fixed anchor date: January 7, 2024 (a Sunday)
    weeks_back := FLOOR(EXTRACT(EPOCH FROM (check_date - '2024-01-07'::DATE)) / (86400 * 14))::INTEGER * 2;
    
    RETURN check_date - (days_since_sunday + (weeks_back * 7))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Get pay period hours for a user
CREATE OR REPLACE FUNCTION get_pay_period_hours(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_hours NUMERIC,
    days_worked INTEGER,
    entries_count INTEGER
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Default to current pay period if no start date provided
    v_start_date := COALESCE(p_start_date, get_pay_period_start());
    v_end_date := v_start_date + 14;
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(te.duration_minutes), 0) / 60.0 as total_hours,
        COUNT(DISTINCT DATE(te.clock_in))::INTEGER as days_worked,
        COUNT(*)::INTEGER as entries_count
    FROM time_entries te
    WHERE te.user_id = p_user_id
        AND te.clock_in >= v_start_date
        AND te.clock_in < v_end_date
        AND te.clock_out IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - remove in production)
-- ============================================
-- Uncomment to add sample work location for testing:
/*
INSERT INTO locations (circle_id, name, address, latitude, longitude, radius_meters)
SELECT 
    id as circle_id,
    'Main Office' as name,
    '123 Care Street, Healthcare City, HC 12345' as address,
    40.7128 as latitude,
    -74.0060 as longitude,
    100 as radius_meters
FROM care_circles LIMIT 1;
*/
