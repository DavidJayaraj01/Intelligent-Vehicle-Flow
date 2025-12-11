# Quick Start Guide

## Step 1: Set Up Boundary Lines (IMPORTANT!)

First, run the interactive setup to position the lines correctly:

```bash
.venv\Scripts\python.exe setup_lines.py
```

**In the window that opens:**
1. You'll see your video with 2 lines:
   - **GREEN line** = Entry (where vehicles enter queue)
   - **RED line** = Exit (where vehicles exit queue)

2. **Drag each line** to the correct position:
   - Click and drag the line you want to move
   - Position them so vehicles cross BOTH lines as they move through the frame
   - Make sure there's enough space between them

3. **Press 's'** to save the line positions

4. The positions will be saved to `line_config.py`

## Step 2: Run Vehicle Detection

After setting up lines, run the main detection:

```bash
.venv\Scripts\python.exe vehicle_queue_detection.py
```

**Controls:**
- **'q'** = Quit and see final statistics
- **'s'** = Save current frame as image
- **'d'** = Toggle debug mode (shows detailed info)

## Tips for Best Results

### Line Positioning:
- Place the **ENTRY line** at the TOP of where you want to measure the queue
- Place the **EXIT line** at the BOTTOM of where you want to measure the queue
- Vehicles must travel DOWNWARD (top to bottom) through both lines
- Wider spacing = longer queue times measured

### If No Queue Times Are Calculated:
This usually means vehicles aren't crossing both lines. Check:
1. Are vehicles moving downward through the frame?
2. Do vehicles actually cross both the green AND red lines?
3. Are the lines positioned correctly (run setup_lines.py again)?

### Common Issues:
- **"Vehicle crossed line 2 without crossing line 1"** = Vehicle started between the lines or below line 1
  - Solution: Move line 1 higher up in the frame
  
- **"No queue times calculated"** = Vehicles aren't traveling through both lines
  - Solution: Reposition lines using setup_lines.py to match vehicle paths

## What Gets Displayed

- **Vehicle ID** - Unique number for each vehicle
- **IN-Q: X.Xs** - Currently in queue for X.X seconds
- **WAIT: X.Xs** - Completed queue in X.X seconds
- **[Before Entry]** - Vehicle hasn't entered queue yet
- **Statistics panel** - Total counts and averages
