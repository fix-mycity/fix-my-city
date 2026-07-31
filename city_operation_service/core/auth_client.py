import urllib.request
import urllib.error
import json
import os
from sqlalchemy.orm import Session
from database import SessionLocal
from sqlalchemy import text

def register_worker_user(data: dict) -> dict:
    """
    Registers worker user credentials in auth_service via HTTP endpoint.
    """
    auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001/auth/register-worker")
    
    payload = {
        "username": data.get("username"),
        "email": data.get("email"),
        "password": data.get("password"),
        "confirm_password": data.get("confirm_password") or data.get("password"),
        "state": data.get("state") or "Kerala",
        "district": data.get("district") or "Malappuram",
        "pincode": data.get("pincode") or "676505",
        "manager_id": data.get("manager_id"),
        "department": data.get("department") or "water"
    }

    # 1. Try HTTP request to auth-service container
    try:
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            auth_service_url,
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            if res_json.get("success"):
                worker_id = res_json.get("data", {}).get("id") or res_json.get("user_id")
                return {"success": True, "user_id": worker_id, "message": "Worker registered successfully"}
            else:
                return {"success": False, "message": res_json.get("message", "Auth service worker registration failed")}
    except urllib.error.HTTPError as http_err:
        try:
            err_body = http_err.read().decode("utf-8")
            err_json = json.loads(err_body)
            detail = err_json.get("detail")
            if isinstance(detail, list) and len(detail) > 0:
                msg = detail[0].get("msg", "Validation error")
            elif isinstance(detail, str):
                msg = detail
            else:
                msg = err_json.get("message", "Validation error")
            return {"success": False, "message": msg}
        except Exception:
            return {"success": False, "message": f"Auth service error: HTTP {http_err.code}"}
    except Exception as e:
        print(f"Notice: HTTP register to auth-service failed ({e}).")
        return {"success": False, "message": f"Could not reach auth service: {str(e)}"}
