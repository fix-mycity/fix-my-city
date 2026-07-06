from sqlalchemy.orm import Session
from models.location_model import State, District
from utils.india_locations import INDIA_DISTRICTS_BY_STATE


def seed_locations(db: Session):
    state_count = db.query(State).count()
    if state_count > 0:
        return

    print("Seeding Indian states and districts...")
    try:
        for state_name, districts in INDIA_DISTRICTS_BY_STATE.items():
            db_state = State(name=state_name)
            db.add(db_state)
            db.flush()

            for district_name in districts:
                db_district = District(
                    name=district_name,
                    state_id=db_state.id
                )
                db.add(db_district)
        db.commit()
        print("Successfully seeded all Indian states and districts.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding locations: {e}")
