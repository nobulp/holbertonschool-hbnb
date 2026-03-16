from app.models.base_model import BaseModel
from app import db
from sqlalchemy.orm import validates

class Review(BaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey('places.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    @validates('text')
    def validate_text(self, key, value):
        if not value:
            raise ValueError("Text is required")
        return value

    @validates('rating')
    def validate_rating(self, key, value):
        if value is None or not (1 <= value <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return value
