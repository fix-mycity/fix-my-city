from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)

    districts = relationship(
        "District",
        back_populates="state",
        cascade="all, delete-orphan"
    )


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    state_id = Column(
        Integer,
        ForeignKey("states.id"),
        nullable=False
    )

    state = relationship("State", back_populates="districts")
