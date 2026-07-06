import urllib.request
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from dependencies.database import get_db
from models.location_model import State, District

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


def fetch_pincode_details(pincode: str):
    url = f"https://api.postalpincode.in/pincode/{pincode}"
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if (
                    data and
                    isinstance(data, list) and
                    data[0].get("Status") == "Success"
                ):
                    post_offices = data[0].get("PostOffice")
                    if post_offices and len(post_offices) > 0:
                        first = post_offices[0]
                        return {
                            "state": first.get("State"),
                            "district": first.get("District")
                        }
    except Exception as e:
        print(f"Error fetching pincode details: {e}")
    return None


@router.get("/states")
def get_states(db: Session = Depends(get_db)):
    states = db.query(State).order_by(State.name).all()
    return [
        {"id": s.id, "name": s.name}
        for s in states
    ]


@router.get("/states/{state_id}/districts")
def get_districts(state_id: int, db: Session = Depends(get_db)):
    districts = db.query(District).filter(
        District.state_id == state_id
    ).order_by(District.name).all()

    return [
        {"id": d.id, "name": d.name}
        for d in districts
    ]


@router.get("/pincode/{pincode}")
def lookup_pincode(pincode: str, db: Session = Depends(get_db)):
    if not pincode.isdigit() or len(pincode) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid pincode format. Must be a 6-digit number."
        )

    details = fetch_pincode_details(pincode)
    if not details:
        raise HTTPException(
            status_code=404,
            detail="Pincode details not found or external API error"
        )

    state_name = details.get("state")
    district_name = details.get("district")

    matched_state = None
    matched_district = None

    if state_name:
        matched_state = db.query(State).filter(
            func.lower(State.name) == func.lower(state_name.strip())
        ).first()

    if matched_state and district_name:
        # Try direct case-insensitive match
        matched_district = db.query(District).filter(
            District.state_id == matched_state.id,
            func.lower(District.name) == func.lower(district_name.strip())
        ).first()

        # If not matched directly, look for substring match in Python
        if not matched_district:
            all_districts = db.query(District).filter(
                District.state_id == matched_state.id
            ).all()
            d_lower = district_name.strip().lower()
            for d in all_districts:
                name_lower = d.name.lower()
                if name_lower in d_lower or d_lower in name_lower:
                    matched_district = d
                    break

    return {
        "state": matched_state.name if matched_state else state_name,
        "district": matched_district.name if matched_district else district_name
    }
