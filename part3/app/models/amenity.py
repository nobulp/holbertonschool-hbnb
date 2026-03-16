from app.models.base_model import BaseModel
from app import db
from sqlalchemy.orm import validates


class Amenity(BaseModel):
    __tablename__ = 'amenities'

    name = db.Column(db.String(50), nullable=False)

    @validates('name')
    def validate_name(self, key, value):
        if not value or len(value) > 50:
            raise ValueError("Name is required and must be 50 characters max")
        return value
