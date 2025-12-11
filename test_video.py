import cv2
import numpy as np
import torch
import time
import sys

from classifier import WeatherClsasifier
from detector import TPHYolov5


def test_video(video_path, device='cpu', imgsz=1536, output_path=None):
    """Test vehicle detection on a video"""
    
    print(f"Loading video: {video_path}")
    video = cv2.VideoCapture(video_path)
    
    if not video.isOpened():
        print(f"Error: Could not open video {video_path}")
        return
    
    # Get video properties
    fps = video.get(cv2.CAP_PROP_FPS)
    w = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video properties:")
    print(f"  Resolution: {w}x{h}")
    print(f"  FPS: {fps}")
    print(f"  Total frames: {total_frames}")
    
    # Initialize models
    print("\nLoading YOLO detector...")
    detector = TPHYolov5(weights='weights/yolo/best.pt', img_size=imgsz, device=device, half=False)
    
    print("Loading weather classifier...")
    classifier = WeatherClsasifier(device=device)
    
    # Create video writer if output path specified
    vid_writer = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        vid_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        print(f"Output video: {output_path}")
    
    print("\n" + "="*60)
    print("Processing video...")
    print("="*60 + "\n")
    
    frame_count = 0
    total_detections = 0
    total_time = 0
    object_id_counter = 1
    
    while True:
        ret, frame = video.read()
        
        if not ret:
            break
        
        frame_count += 1
        object_id_counter = 1  # Reset ID counter for each frame
        
        # Classify day/night
        status = classifier.infer(frame)
        
        # Run detection
        start_time = time.time()
        results, det = detector.infer(frame, conf_thresh=0.25, iou_thresh=0.45)
        end_time = time.time()
        processing_time = end_time - start_time
        total_time += processing_time
        
        # Count detections (only sum numeric values, skip 'status' string)
        num_detections = sum(v for k, v in results.items() if isinstance(v, (int, float)) and k != 'status')
        total_detections += num_detections
        
        # Visualize
        visualized = detector.visualize(frame, det, hide_labels=False, hide_conf=False)
        
        # Add IDs to detections if present
        if det is not None and len(det) > 0:
            det_array = det if isinstance(det, np.ndarray) else det.cpu().numpy()
            for idx, detection in enumerate(det_array, 1):
                # detection format: [x1, y1, x2, y2, conf, class_id]
                if len(detection) >= 6:
                    x1, y1, x2, y2 = map(int, detection[:4])
                    conf = detection[4]
                    
                    # Draw ID on the frame
                    cv2.putText(visualized, f"ID: {idx}", (x1, y1 - 10), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)
        
        # Add info text
        info_text = f"Frame: {frame_count}/{total_frames} | Status: {status} | Objects: {num_detections} | FPS: {1/processing_time:.1f}"
        cv2.putText(visualized, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Display frame
        cv2.imshow('Video Detection', visualized)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
        # Write to output video
        if vid_writer:
            vid_writer.write(visualized)
        
        # Print progress with detection details
        if frame_count % 10 == 0:
            print(f"[{frame_count}/{total_frames}] Status: {status} | Detections: {num_detections} | Time: {processing_time:.2f}s")
            if num_detections > 0:
                # Print individual detections with IDs
                detection_str = f"  Objects: "
                if det is not None and len(det) > 0:
                    det_array = det if isinstance(det, np.ndarray) else det.cpu().numpy()
                    for idx in range(min(num_detections, len(det_array))):
                        detection_str += f"[ID:{idx+1}] "
                    print(detection_str)
    
    video.release()
    if vid_writer:
        vid_writer.release()
    cv2.destroyAllWindows()
    
    # Print summary
    print("\n" + "="*60)
    print("VIDEO PROCESSING SUMMARY")
    print("="*60)
    print(f"Total frames processed: {frame_count}")
    print(f"Total detections: {total_detections}")
    print(f"Average detections per frame: {total_detections/frame_count:.2f}")
    print(f"Total processing time: {total_time:.2f}s")
    print(f"Average FPS: {frame_count/total_time:.2f}")
    if output_path:
        print(f"Output saved to: {output_path}")
    print("="*60)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_video.py <video_path> [device] [output_path]")
        print("Example: python test_video.py test_video.mp4 cpu output_detected.mp4")
        sys.exit(1)
    
    video_path = sys.argv[1]
    device = sys.argv[2] if len(sys.argv) > 2 else 'cpu'
    output_path = sys.argv[3] if len(sys.argv) > 3 else None
    
    print(f"\nVehicle Detection Video Test Script")
    print(f"Device: {device}")
    print("="*60 + "\n")
    
    test_video(video_path, device=device, output_path=output_path)
