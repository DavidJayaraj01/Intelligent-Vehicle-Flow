# All-Day Vehicle Detection - Deployment Guide

## Project Overview
This is a vehicle detection system that works in both day and night conditions using:
- **TPH-YOLOv5**: Object detection model
- **EnlightenGAN**: Low-light image enhancement
- **EfficientNetB0**: Day/Night classifier

## Project Structure
```
All-Day-Vehicle-Detection/
├── main.py                 # Main detection script (entry point)
├── test_video.py          # Video testing script
├── classifier.py          # Weather/day-night classifier
├── detector.py            # YOLO detector wrapper
├── enlighten.py           # EnlightenGAN model wrapper
├── requirements.txt       # Python dependencies
├── setup.py              # Installation script
├── README.md             # Original project readme
│
├── EfficientNet/         # EfficientNet model code
├── EnlightenGAN/         # EnlightenGAN model code
├── TPHYolov5/            # YOLO model code
├── weights/              # Pre-trained model weights
│   ├── yolo/best.pt
│   ├── efficientnet/best_weights_256x256_v2.pt
│   └── enlightening/200_net_G_A.pth
└── venv/                 # Virtual environment (optional for deployment)
```

## Installation

1. **Clone/Copy the project**
   ```bash
   cd All-Day-Vehicle-Detection
   ```

2. **Create virtual environment (optional)**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Option 1: Run Detection on Video
```bash
python test_video.py <video_path> <device> [output_path]
```

**Examples:**
```bash
# Process video on CPU
python test_video.py input_video.mp4 cpu

# Process video on GPU and save output
python test_video.py input_video.mp4 cuda output_detected.mp4

# Use existing test video
python test_video.py TPHYolov5/data/videos/istockphoto-1419468638-640_adpp_is.mp4 cpu
```

### Option 2: Run Detection on Webcam/Video (Main Script)
```bash
python main.py --source 0 --device cpu --imgsz 1536
```

**Parameters:**
- `--source`: Video file path or 0 for webcam
- `--device`: cuda or cpu
- `--imgsz`: Input size (1280, 1536, 1996)
- `--weights`: Path to YOLO weights (default: weights/yolo/best.pt)
- `--conf_thresh`: Confidence threshold (default: 0.25)
- `--iou_thresh`: IOU threshold for NMS (default: 0.45)
- `--savedir`: Directory to save output video

## API/Backend Integration

### Using as a Python Module

```python
from detector import TPHYolov5
from classifier import WeatherClsasifier
from enlighten import EnlightenModel
import cv2

# Initialize models
detector = TPHYolov5(weights='weights/yolo/best.pt', device='cuda', img_size=1536)
classifier = WeatherClsasifier(device='cuda')
enlighten_model = EnlightenModel(device='cuda')

# Read image
image = cv2.imread('image.jpg')

# Classify day/night
status = classifier.infer(image)

# Run detection
results, detections = detector.infer(image, conf_thresh=0.25, iou_thresh=0.45)

# Visualize
visualized = detector.visualize(image, detections)
cv2.imwrite('output.jpg', visualized)

# Get results
print(results)  # Dict with detection counts: {'person': 2, 'car': 5, 'truck': 1}
print(detections)  # Raw detection boxes [x1, y1, x2, y2, conf, class_id]
```

### Expected Output Format

**Results Dictionary:**
```python
{
    'person': 2,
    'bicycle': 0,
    'car': 5,
    'motorcycle': 1,
    'bus': 0,
    'truck': 1
}
```

**Detection Array:**
```
Array shape: (num_detections, 6)
Each row: [x1, y1, x2, y2, confidence, class_id]
- x1, y1: Top-left corner
- x2, y2: Bottom-right corner
- confidence: Detection confidence (0-1)
- class_id: Class index (0=person, 1=bicycle, 2=car, 3=motorcycle, 4=bus, 5=truck)
```

## Model Classes
1. **person** (0)
2. **bicycle** (1)
3. **car** (2)
4. **motorcycle** (3)
5. **bus** (4)
6. **truck** (5)

## Hardware Requirements
- **GPU (Recommended)**: NVIDIA CUDA-capable GPU for real-time processing
- **CPU (Fallback)**: Will work but slower (expect 0.5-2 FPS depending on image size)
- **Memory**: 4GB RAM minimum, 8GB+ recommended

## Key Files Modified for Compatibility
- `TPHYolov5/models/experimental.py`: Fixed PyTorch 2.6+ weights loading
- `EnlightenGAN/models/networks.py`: Fixed GPU/CPU device handling

## Notes
- Day/night detection uses histogram analysis for better accuracy
- Night images are enhanced using EnlightenGAN before YOLO detection
- All pre-trained weights are included in the `weights/` directory
- The project is ready for backend integration via REST API or gRPC

## Support
For issues or questions, refer to the original repositories:
- TPH-YOLOv5: https://github.com/cv516Buaa/tph-yolov5
- EnlightenGAN: https://github.com/VITA-Group/EnlightenGAN
