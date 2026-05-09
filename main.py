"""Root ASGI entrypoint so `uvicorn main:app --reload` works from repository root."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

backend_dir = Path(__file__).resolve().parent / "backend"
backend_main = backend_dir / "main.py"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

spec = spec_from_file_location("mara_backend_main", backend_main)
if spec is None or spec.loader is None:
    raise RuntimeError("Failed to locate backend ASGI module")

module = module_from_spec(spec)
spec.loader.exec_module(module)
app = module.app
