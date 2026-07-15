from pydantic import BaseModel

class WorkerAssignSchema(BaseModel):
    worker_id: int

class ResolutionReportSchema(BaseModel):
    resolution_report: str

class WorkerCreateSchema(BaseModel):
    username: str
    email: str
    state: str
    district: str
    pincode: str
    password: str
    confirm_password: str
