from app.models.base_model import BaseModel
from app import db
from sqlalchemy.orm import validates

# Table d'association many-to-many Place↔Amenity
place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)

class Place(BaseModel):
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    # Relationships
    reviews = db.relationship('Review', backref='place', lazy=True)
    amenities = db.relationship('Amenity', secondary=place_amenity, lazy='subquery',
                                backref=db.backref('places', lazy=True))

    @validates('title')
    def validate_title(self, key, value):
        if not value or len(value) > 100:
            raise ValueError("Title is required and must be 100 characters max")
        return value

    @validates('price')
    def validate_price(self, key, value):
        if value is None or value < 0:
            raise ValueError("Price must be a non-negative number")
        return value

    @validates('latitude')
    def validate_latitude(self, key, value):
        if value is None or not (-90 <= value <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @validates('longitude')
    def validate_longitude(self, key, value):
        if value is None or not (-180 <= value <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return value
