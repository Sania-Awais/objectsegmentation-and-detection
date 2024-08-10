from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import logging
import uvicorn
import torch
from PIL import Image
import io
import numpy as np
from transformers import AutoImageProcessor, SegformerForSemanticSegmentation
from ultralytics import YOLO  # Ensure you have ultralytics installed

# Initialize the FastAPI app
app = FastAPI()

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["my-auth-app"]
collection = db["Users"]

# User model for signup
class User(BaseModel):
    username: str
    email: str
    password: str

# User model for login
class LoginUser(BaseModel):
    email: str
    password: str

# Load the Segformer model and processor
processor = AutoImageProcessor.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")
segformer_model = SegformerForSemanticSegmentation.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")

# Load YOLOv8n model for detection
yolo_model = YOLO('yolov8n.pt')  # Ensure yolov8n.pt is downloaded and accessible

def process_image(image: Image.Image):
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = segformer_model(**inputs)
    logits = outputs.logits
    upsampled_logits = torch.nn.functional.interpolate(logits, size=image.size[::-1], mode='bilinear', align_corners=False)
    seg = upsampled_logits.argmax(dim=1)[0]
    return seg.cpu().numpy()

def detect_objects(image: Image.Image):
    results = yolo_model(image)
    detections = results.pandas().xyxy[0].to_dict(orient="records")  # Get detections as a list of dictionaries
    return detections

@app.post("/segment/")
async def segment(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Get segmentation results
        segmentation = process_image(image)
        
        # Convert segmentation result to an image
        segmentation_image = Image.fromarray(segmentation.astype(np.uint8))
        byte_arr_seg = io.BytesIO()
        segmentation_image.save(byte_arr_seg, format='PNG')
        byte_arr_seg = byte_arr_seg.getvalue()

        # Get detection results
        detections = detect_objects(image)
        
        return {
            "segmentation": byte_arr_seg,
            "detections": detections
        }
    except Exception as e:
        print(f"Internal Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Signup endpoint
@app.post("/signup")
def signup(user: User):
    try:
        if collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        collection.insert_one(user.dict())
        return {"status": "User created"}
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during signup")

# Login endpoint
@app.post("/login")
def login(user: LoginUser):
    try:
        logger.info(f"Attempting login for user: {user.email}")
        db_user = collection.find_one({"email": user.email, "password": user.password})
        if db_user:
            logger.info(f"Login successful for user: {user.email}")
            return {"status": "Login successful"}
        logger.warning(f"Invalid credentials for user: {user.email}")
        raise HTTPException(status_code=400, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during login")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
