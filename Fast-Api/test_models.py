import onnxruntime as ort
from pathlib import Path

models = list(Path("models").glob("anti_spoof_*.onnx"))

print("Found models:", len(models))

for p in models:
    print("\nTesting:", p)

    session = ort.InferenceSession(
        str(p),
        providers=["CPUExecutionProvider"]
    )

    print("Input :", session.get_inputs()[0].shape)
    print("Output:", session.get_outputs()[0].shape)

print("\nDONE")