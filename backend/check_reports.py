from app.database import SessionLocal
from app.models.report import GeneratedReport

db = SessionLocal()
reports = db.query(GeneratedReport).all()
print(f'Total reports: {len(reports)}')
for r in reports:
    vehicles = r.metrics.get('total_vehicles') if r.metrics else 'N/A'
    print(f'{r.report_id}: {r.title} - Camera: {r.camera_id} - Created: {r.created_at} - Vehicles: {vehicles}')
db.close()
