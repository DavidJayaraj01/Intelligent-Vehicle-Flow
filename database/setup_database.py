import psycopg2
from psycopg2 import sql

# Render database connection string
DATABASE_URL = "postgresql://david:Rcs9t2T9jc1vlkCNS3hgCq1fZLYr8VDM@dpg-d4t7jdk9c44c73bhr4vg-a.singapore-postgres.render.com/traffic_5am6"

# Read the schema SQL file
with open('database/schema.sql', 'r', encoding='utf-8') as f:
    schema_sql = f.read()

print("Connecting to Render PostgreSQL database...")
conn = None
cursor = None

try:
    # Connect to the database
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Connected successfully!")
    print("Executing schema...")
    
    # Execute the schema
    cursor.execute(schema_sql)
    
    print("\n✓ Schema executed successfully!")
    print("\nVerifying tables created...")
    
    # Verify tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print(f"\nTables created ({len(tables)}):")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Verify materialized views
    cursor.execute("""
        SELECT matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public';
    """)
    
    views = cursor.fetchall()
    print(f"\nMaterialized views created ({len(views)}):")
    for view in views:
        print(f"  - {view[0]}")
    
    # Verify seed data
    cursor.execute("SELECT COUNT(*) FROM cameras;")
    camera_count = cursor.fetchone()[0]
    print(f"\nSeed data:")
    print(f"  - Cameras: {camera_count}")
    
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    print(f"  - Users: {user_count}")
    
    print("\n✓ Database setup complete!")
    
except psycopg2.Error as e:
    print(f"\n✗ Error: {e}")
    print(f"Error code: {e.pgcode}")
    if hasattr(e, 'pgerror'):
        print(f"Details: {e.pgerror}")
    
except Exception as e:
    print(f"\n✗ Unexpected error: {e}")
    
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    print("\nConnection closed.")
