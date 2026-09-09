from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model.train(
    data="../dataset/data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,
    project="../models",
    name="infraai_yolo_v1",
)

print("Training complete. Best weights saved under ml/models/infraai_yolo_v1/weights/best.pt")