-- =========================================================
-- Vehicle Flow Analyzer - PostgreSQL Database Schema
-- =========================================================

-- Enable TimescaleDB extension (optional, for time-series optimization)
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =========================================================
-- 1. VEHICLE EVENTS TABLE
-- =========================================================
CREATE TABLE vehicle_events (
    id BIGSERIAL PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    track_id VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,  -- car, truck, bus, bike, etc.
    timestamp TIMESTAMPTZ NOT NULL,
    enter_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    dwell_seconds DECIMAL(10, 2),
    lane_id VARCHAR(50),
    bbox JSONB,  -- Store as JSON: [x, y, w, h]
    confidence DECIMAL(5, 4),  -- 0.0000 to 1.0000
    embedding BYTEA,  -- Optional: Store feature embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for common queries
    CONSTRAINT vehicle_events_confidence_check CHECK (confidence >= 0 AND confidence <= 1)
);

-- Indexes for performance
CREATE INDEX idx_vehicle_events_camera_id ON vehicle_events(camera_id);
CREATE INDEX idx_vehicle_events_track_id ON vehicle_events(track_id);
CREATE INDEX idx_vehicle_events_timestamp ON vehicle_events(timestamp DESC);
CREATE INDEX idx_vehicle_events_class ON vehicle_events(class);
CREATE INDEX idx_vehicle_events_lane_id ON vehicle_events(lane_id);
CREATE INDEX idx_vehicle_events_camera_timestamp ON vehicle_events(camera_id, timestamp DESC);
CREATE INDEX idx_vehicle_events_track_timestamp ON vehicle_events(track_id, timestamp);

-- Optional: Convert to TimescaleDB hypertable for better time-series performance
-- SELECT create_hypertable('vehicle_events', 'timestamp', if_not_exists => TRUE);

-- =========================================================
-- 2. OPERATOR ACTIONS TABLE
-- =========================================================
CREATE TABLE operator_actions (
    id BIGSERIAL PRIMARY KEY,
    operator_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,  -- extend_green_light, trigger_alert, etc.
    params JSONB,  -- Flexible JSON for action parameters
    camera_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',  -- pending, executed, failed
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT operator_actions_status_check CHECK (status IN ('pending', 'executed', 'failed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_operator_actions_operator_id ON operator_actions(operator_id);
CREATE INDEX idx_operator_actions_camera_id ON operator_actions(camera_id);
CREATE INDEX idx_operator_actions_status ON operator_actions(status);
CREATE INDEX idx_operator_actions_created_at ON operator_actions(created_at DESC);

-- =========================================================
-- 3. CAMERAS TABLE (Reference data)
-- =========================================================
CREATE TABLE cameras (
    camera_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(500),
    coordinates JSONB,  -- {lat, lng}
    status VARCHAR(50) DEFAULT 'active',
    config JSONB,  -- Camera-specific configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT cameras_status_check CHECK (status IN ('active', 'inactive', 'maintenance'))
);

-- =========================================================
-- 4. AGGREGATED METRICS TABLE (Pre-computed for performance)
-- =========================================================
CREATE TABLE metrics_aggregated (
    id BIGSERIAL PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    interval_start TIMESTAMPTZ NOT NULL,
    interval_end TIMESTAMPTZ NOT NULL,
    interval_minutes INT NOT NULL,  -- 1, 5, 15, 60
    vehicle_count INT DEFAULT 0,
    avg_dwell_seconds DECIMAL(10, 2),
    max_dwell_seconds DECIMAL(10, 2),
    min_dwell_seconds DECIMAL(10, 2),
    avg_queue_length DECIMAL(10, 2),
    class_distribution JSONB,  -- {"car": 45, "truck": 12, "bike": 8}
    lane_distribution JSONB,  -- {"lane_1": 30, "lane_2": 35}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(camera_id, interval_start, interval_minutes)
);

-- Indexes
CREATE INDEX idx_metrics_camera_interval ON metrics_aggregated(camera_id, interval_start DESC);
CREATE INDEX idx_metrics_interval_start ON metrics_aggregated(interval_start DESC);

-- =========================================================
-- 5. SYSTEM ALERTS TABLE
-- =========================================================
CREATE TABLE system_alerts (
    id BIGSERIAL PRIMARY KEY,
    camera_id VARCHAR(50),
    alert_type VARCHAR(100) NOT NULL,  -- congestion, anomaly, system_error
    severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
    message TEXT,
    metadata JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT system_alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes
CREATE INDEX idx_system_alerts_camera_id ON system_alerts(camera_id);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_acknowledged ON system_alerts(acknowledged);
CREATE INDEX idx_system_alerts_created_at ON system_alerts(created_at DESC);

-- =========================================================
-- 6. RECOMMENDATIONS TABLE (Decision Engine Output)
-- =========================================================
CREATE TABLE recommendations (
    id BIGSERIAL PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    recommendation_type VARCHAR(100) NOT NULL,
    description TEXT,
    confidence DECIMAL(5, 4),
    params JSONB,
    based_on_metrics JSONB,  -- Store the metrics that triggered this
    status VARCHAR(50) DEFAULT 'pending',
    action_id BIGINT REFERENCES operator_actions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    CONSTRAINT recommendations_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

-- Indexes
CREATE INDEX idx_recommendations_camera_id ON recommendations(camera_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);

-- =========================================================
-- 7. USERS TABLE (Operator authentication)
-- =========================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator', 'viewer'))
);

-- Indexes
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_users_username ON users(username);

-- =========================================================
-- 8. AUDIT LOG TABLE
-- =========================================================
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),  -- vehicle_event, operator_action, etc.
    entity_id BIGINT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- =========================================================
-- MATERIALIZED VIEWS (For complex analytics)
-- =========================================================

-- Real-time dashboard metrics (refresh every minute)
CREATE MATERIALIZED VIEW mv_realtime_metrics AS
SELECT 
    camera_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT track_id) as unique_vehicles,
    AVG(dwell_seconds) as avg_dwell,
    MAX(dwell_seconds) as max_dwell,
    AVG(confidence) as avg_confidence,
    COUNT(*) FILTER (WHERE class = 'car') as car_count,
    COUNT(*) FILTER (WHERE class = 'truck') as truck_count,
    COUNT(*) FILTER (WHERE class = 'bus') as bus_count,
    COUNT(*) FILTER (WHERE class = 'bike') as bike_count,
    MIN(timestamp) as first_event,
    MAX(timestamp) as last_event
FROM vehicle_events
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY camera_id;

CREATE UNIQUE INDEX idx_mv_realtime_metrics ON mv_realtime_metrics(camera_id);

-- Hourly statistics
CREATE MATERIALIZED VIEW mv_hourly_stats AS
SELECT 
    camera_id,
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as vehicle_count,
    COUNT(DISTINCT track_id) as unique_vehicles,
    AVG(dwell_seconds) as avg_dwell,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dwell_seconds) as median_dwell,
    jsonb_object_agg(class, class_count) as class_distribution
FROM (
    SELECT 
        camera_id,
        timestamp,
        track_id,
        dwell_seconds,
        class,
        COUNT(*) OVER (PARTITION BY camera_id, DATE_TRUNC('hour', timestamp), class) as class_count
    FROM vehicle_events
) subquery
GROUP BY camera_id, DATE_TRUNC('hour', timestamp);

CREATE INDEX idx_mv_hourly_stats ON mv_hourly_stats(camera_id, hour DESC);

-- =========================================================
-- FUNCTIONS & TRIGGERS
-- =========================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cameras table
CREATE TRIGGER update_cameras_updated_at
    BEFORE UPDATE ON cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_metrics(p_camera_id VARCHAR, p_interval_minutes INT)
RETURNS void AS $$
BEGIN
    INSERT INTO metrics_aggregated (
        camera_id,
        interval_start,
        interval_end,
        interval_minutes,
        vehicle_count,
        avg_dwell_seconds,
        max_dwell_seconds,
        min_dwell_seconds,
        class_distribution,
        lane_distribution
    )
    SELECT 
        camera_id,
        DATE_TRUNC('minute', timestamp) - (EXTRACT(MINUTE FROM timestamp)::INT % p_interval_minutes) * INTERVAL '1 minute' as interval_start,
        DATE_TRUNC('minute', timestamp) - (EXTRACT(MINUTE FROM timestamp)::INT % p_interval_minutes) * INTERVAL '1 minute' + (p_interval_minutes || ' minutes')::INTERVAL as interval_end,
        p_interval_minutes,
        COUNT(*),
        AVG(dwell_seconds),
        MAX(dwell_seconds),
        MIN(dwell_seconds),
        jsonb_object_agg(class, class_count),
        jsonb_object_agg(lane_id, lane_count)
    FROM (
        SELECT 
            camera_id,
            timestamp,
            dwell_seconds,
            class,
            lane_id,
            COUNT(*) OVER (PARTITION BY camera_id, class) as class_count,
            COUNT(*) OVER (PARTITION BY camera_id, lane_id) as lane_count
        FROM vehicle_events
        WHERE camera_id = p_camera_id
          AND timestamp > NOW() - (p_interval_minutes || ' minutes')::INTERVAL
    ) subquery
    GROUP BY camera_id, interval_start, interval_end
    ON CONFLICT (camera_id, interval_start, interval_minutes) 
    DO UPDATE SET
        vehicle_count = EXCLUDED.vehicle_count,
        avg_dwell_seconds = EXCLUDED.avg_dwell_seconds,
        max_dwell_seconds = EXCLUDED.max_dwell_seconds,
        min_dwell_seconds = EXCLUDED.min_dwell_seconds,
        class_distribution = EXCLUDED.class_distribution,
        lane_distribution = EXCLUDED.lane_distribution;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- SEED DATA
-- =========================================================

-- Insert sample cameras
INSERT INTO cameras (camera_id, name, location, coordinates, status) VALUES
    ('cam01', 'Main Intersection North', 'MG Road & Brigade Road', '{"lat": 12.9716, "lng": 77.5946}'::jsonb, 'active'),
    ('cam02', 'Highway Entry Point', 'NH44 Toll Plaza', '{"lat": 13.0827, "lng": 77.5877}'::jsonb, 'active'),
    ('cam03', 'City Center Junction', 'Trinity Circle', '{"lat": 12.9863, "lng": 77.5949}'::jsonb, 'active'),
    ('cam04', 'Airport Road Gate', 'Kempegowda Airport Entry', '{"lat": 13.1986, "lng": 77.7066}'::jsonb, 'maintenance');

-- Insert sample users
INSERT INTO users (username, email, api_key, role) VALUES
    ('admin', 'admin@vehicleflow.local', 'vfa_admin_key_12345', 'admin'),
    ('operator1', 'operator1@vehicleflow.local', 'vfa_op1_key_67890', 'operator'),
    ('operator2', 'operator2@vehicleflow.local', 'vfa_op2_key_54321', 'operator'),
    ('viewer', 'viewer@vehicleflow.local', 'vfa_viewer_key_11111', 'viewer');

-- =========================================================
-- MAINTENANCE QUERIES
-- =========================================================

-- Refresh materialized views (run periodically via cron/scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_realtime_metrics;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_stats;

-- Clean old data (retention policy)
-- DELETE FROM vehicle_events WHERE timestamp < NOW() - INTERVAL '90 days';
-- DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '180 days';

-- Vacuum and analyze
-- VACUUM ANALYZE vehicle_events;
-- VACUUM ANALYZE operator_actions;

-- =========================================================
-- USEFUL QUERIES
-- =========================================================

-- Get real-time metrics for a camera
-- SELECT * FROM mv_realtime_metrics WHERE camera_id = 'cam01';

-- Get vehicles per minute for last hour
-- SELECT 
--     DATE_TRUNC('minute', timestamp) as minute,
--     COUNT(*) as vehicle_count
-- FROM vehicle_events
-- WHERE camera_id = 'cam01' 
--   AND timestamp > NOW() - INTERVAL '1 hour'
-- GROUP BY minute
-- ORDER BY minute DESC;

-- Get track history for replay
-- SELECT track_id, timestamp, bbox, class, lane_id
-- FROM vehicle_events
-- WHERE track_id = 't_4523'
-- ORDER BY timestamp ASC;

-- Get pending recommendations
-- SELECT * FROM recommendations 
-- WHERE status = 'pending' 
--   AND (expires_at IS NULL OR expires_at > NOW())
-- ORDER BY created_at DESC;
