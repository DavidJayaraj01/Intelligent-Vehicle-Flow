"""
Test script to verify vehicle detection model integration
"""
import requests
import sys
from pathlib import Path

backend_url = "http://localhost:8000"
api_key = "vfa_admin_key_12345"

def test_health():
    """Test if backend is running"""
    print("1. Testing backend health...")
    try:
        response = requests.get(f"{backend_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✓ Backend is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"   ✗ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ Backend not reachable: {e}")
        return False

def test_detection_endpoint():
    """Test if detection endpoint is available"""
    print("\n2. Testing detection endpoint availability...")
    try:
        response = requests.get(f"{backend_url}/docs", timeout=5)
        if response.status_code == 200 and "detect" in response.text.lower():
            print("   ✓ Detection endpoint is registered")
            return True
        else:
            print("   ⚠ Detection endpoint might not be available")
            return False
    except Exception as e:
        print(f"   ✗ Cannot access API docs: {e}")
        return False

def test_detection_with_dummy_image():
    """Test detection with a generated dummy image"""
    print("\n3. Testing detection with dummy image...")
    try:
        import cv2
        import numpy as np
        
        # Create a dummy image
        dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
        cv2.rectangle(dummy_image, (100, 100), (300, 300), (0, 255, 0), -1)
        cv2.putText(dummy_image, "TEST", (150, 220), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
        
        # Encode to JPEG
        _, img_encoded = cv2.imencode('.jpg', dummy_image)
        
        # Send to detection API
        headers = {"X-API-Key": api_key}
        files = {"file": ("test.jpg", img_encoded.tobytes(), "image/jpeg")}
        params = {"confidence": 0.5, "draw_boxes": False}
        
        response = requests.post(
            f"{backend_url}/api/v1/detect/image",
            headers=headers,
            files=files,
            params=params,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Detection successful!")
            print(f"   Detections: {len(result.get('detections', []))}")
            if result.get('detections'):
                for det in result['detections'][:3]:  # Show first 3
                    print(f"     - {det['class']}: {det['confidence']:.2f}")
            return True
        else:
            print(f"   ✗ Detection failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except ImportError:
        print("   ⚠ OpenCV not available, skipping image generation test")
        return None
    except Exception as e:
        print(f"   ✗ Detection test failed: {e}")
        return False

def check_model_files():
    """Check if model weight files exist"""
    print("\n4. Checking model weight files...")
    
    weights_path = Path(__file__).parent / "weights"
    
    files_to_check = [
        weights_path / "yolo" / "best.pt",
        weights_path / "efficientnet" / "best_weights_256x256_v2.pt",
        weights_path / "enlightening" / "200_net_G_A.pth",
    ]
    
    all_exist = True
    for file_path in files_to_check:
        if file_path.exists():
            size_mb = file_path.stat().st_size / (1024 * 1024)
            print(f"   ✓ {file_path.name} ({size_mb:.1f} MB)")
        else:
            print(f"   ✗ {file_path} - NOT FOUND")
            all_exist = False
    
    return all_exist

def check_tph_yolo_module():
    """Check if TPH-YOLOv5 module is available"""
    print("\n5. Checking TPH-YOLOv5 module...")
    
    tph_path = Path(__file__).parent.parent / "TPHYolov5"
    
    if tph_path.exists():
        print(f"   ✓ TPHYolov5 directory found")
        
        # Check key files
        key_files = [
            "models/yolo.py",
            "utils/general.py",
            "detect.py"
        ]
        
        all_found = True
        for file in key_files:
            if (tph_path / file).exists():
                print(f"   ✓ {file}")
            else:
                print(f"   ✗ {file} - NOT FOUND")
                all_found = False
        
        return all_found
    else:
        print(f"   ✗ TPHYolov5 directory not found at {tph_path}")
        return False

def main():
    print("=" * 60)
    print("Vehicle Detection Model Integration Test")
    print("=" * 60)
    print()
    
    results = {
        "Backend Health": test_health(),
        "Detection Endpoint": test_detection_endpoint(),
        "Model Files": check_model_files(),
        "TPH-YOLOv5 Module": check_tph_yolo_module(),
        "Detection Test": test_detection_with_dummy_image(),
    }
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, result in results.items():
        if result is True:
            status = "✓ PASS"
        elif result is False:
            status = "✗ FAIL"
        else:
            status = "⚠ SKIP"
        
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    
    # Overall result
    if all(r in [True, None] for r in results.values()):
        print("✓ All tests passed!")
        print("\nNext steps:")
        print("1. View API docs: http://localhost:8000/docs")
        print("2. Test detection with real images")
        print("3. Check MODEL_DETECTION_GUIDE.md for usage examples")
        return 0
    else:
        print("✗ Some tests failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Ensure backend is running: `uvicorn app.main:app --reload`")
        print("2. Check if model weights are downloaded")
        print("3. Verify TPHYolov5 module is present")
        return 1

if __name__ == "__main__":
    sys.exit(main())
