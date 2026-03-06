from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
import os

frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app = FastAPI(title="AgentOS API")
app.add_middleware(CORSMiddleware,
  allow_origins=allowed_origins,
  allow_credentials=True,
  allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allow_headers=["Authorization", "Content-Type", "X-Requested-With"])
app.include_router(router, prefix="/api")

@app.get("/health")
def health(): return {"status": "ok"}
