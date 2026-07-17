from pydantic import ValidationError
from modules.traffic_management.schema import WorkerCreateSchema

payload = {
    'username': 'johndoe',
    'email': 'john@example.com',
    'state': 'Kerala',
    'district': 'Kollam',
    'pincode': '691001',
    'password': 'password123',
    'confirm_password': 'password123',
    'first_name': 'John',
    'last_name': 'Doe',
    'phone': '1234567890',
    'gender': 'Male',
    'address': '123 Main St',
    'place': 'City',
    'designation': 'Worker',
    'skill': 'Traffic Control',
    'availability': 'AVAILABLE',
    'employment_status': 'ACTIVE'
}

try:
    WorkerCreateSchema(**payload)
    print("SUCCESS")
except ValidationError as e:
    print("VALIDATION ERROR:")
    print(e)
