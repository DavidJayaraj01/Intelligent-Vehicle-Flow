import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create generated_reports table with id column
sql = """
DROP TABLE IF EXISTS generated_reports CASCADE;

CREATE TABLE generated_reports (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    camera_id VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT,
    full_content TEXT,
    metrics JSONB,
    pdf_content BYTEA,
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reports_camera ON generated_reports(camera_id);
CREATE INDEX idx_reports_type ON generated_reports(report_type);
CREATE INDEX idx_reports_report_id ON generated_reports(report_id);
"""

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
    print("✅ Table 'generated_reports' recreated successfully with id column!")
    
    # Verify table exists
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'generated_reports'
        ORDER BY ordinal_position;
    """)
    columns = cur.fetchall()
    print(f"\n📊 Table has {len(columns)} columns:")
    for col_name, col_type in columns:
        print(f"  - {col_name}: {col_type}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
