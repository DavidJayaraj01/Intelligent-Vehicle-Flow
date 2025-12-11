"""Quick test for detection API"""
import requests
import json
from pathlib import Path

def test_detection_endpoint():
    """Test the detection endpoint with a simple request"""
    url = "http://localhost:8000/api/v1/detect/image"
    
    # Create a simple test image (1x1 pixel)
    import io
    from PIL import Image
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    # Send request
    files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
    
    try:
        response = requests.post(url, files=files, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\n✅ SUCCESS! Detection Response:")
                print(json.dumps(data, indent=2))
                print(f"\nDetections found: {data.get('count', 0)}")
                print(f"Processing time: {data.get('processing_time', 0)}s")
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                print(f"Raw response: {response.text[:500]}")
        else:
            print(f"❌ Error response:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend at http://localhost:8000")
        print("Make sure the backend is running!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing detection endpoint...")
    print("-" * 50)
    test_detection_endpoint()
