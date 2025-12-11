"""Test script to process WhatsApp video with queue detection"""
import sys
sys.path.insert(0, 'c:/Users/david/Desktop/BI3/vehicle-flow-analyzer/backend')

from app.services.queue_detector import VehicleQueueDetector
import os

# Initialize detector
detector = VehicleQueueDetector('yolov8n.pt')

# Paths
video_path = 'c:/Users/david/Desktop/BI3/WhatsApp Video 2025-12-11 at 6.14.44 PM.mp4'
output_path = 'c:/Users/david/Desktop/BI3/vehicle-flow-analyzer/backend/outputs/queue/whatsapp_test_output.mp4'

print(f'Processing video: {video_path}')
print(f'Output will be saved to: {output_path}')
print('=' * 60)

# Process video
result = detector.process_video(video_path, output_path)

# Display results
print('\n' + '=' * 60)
print('QUEUE DETECTION RESULTS')
print('=' * 60)
print(f"Total Vehicles Detected: {result['statistics']['totalVehicles']}")
print(f"Currently in Queue: {result['statistics']['currentlyInQueue']}")
print(f"Completed Queue: {result['statistics']['completedQueue']}")
print(f"Average Wait Time: {result['statistics']['avgWaitTime']:.2f} seconds")
print(f"Max Wait Time: {result['statistics']['maxWaitTime']:.2f} seconds")
print(f"Min Wait Time: {result['statistics']['minWaitTime']:.2f} seconds")
print(f"Processing Time: {result['processing_time']:.2f} seconds")
print('=' * 60)

# Vehicle details
if result['statistics']['vehicleDetails']:
    print('\nVEHICLE DETAILS:')
    print('-' * 60)
    for vehicle in result['statistics']['vehicleDetails']:
        print(f"  ID {vehicle['id']:3d} | {vehicle['type']:12s} | Queue Time: {vehicle['queueTime']:.2f}s")
    print('-' * 60)

print(f'\n✓ Output video saved to: {output_path}')
print('You can now play this video to see the annotated output!')
