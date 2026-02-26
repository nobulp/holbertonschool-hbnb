
from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review


class HBnBFacade:
   
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()

    # -----------------
    # User operations
    # -----------------
    def create_user(self, user_data):
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute("email", email)

    def get_users(self):
        return self.user_repo.get_all()

    def update_user(self, user_id, data):
        user = self.get_user(user_id)
        if not user:
            return None
        self.user_repo.update(user_id, data)
        return self.get_user(user_id)

 # -----------------
    # Place operations
    # -----------------
    def create_place(self, place_data):
        # 1) vérifier owner existe
        owner_id = place_data.get("owner_id")
        owner = self.get_user(owner_id)
        if not owner:
            raise ValueError("Owner not found")

        # 2) vérifier amenities existent (liste d'IDs)
        amenity_ids = place_data.get("amenities", [])
        for a_id in amenity_ids:
            if not self.get_amenity(a_id):
                raise ValueError("Amenity not found")

        # 3) créer Place (ton modèle Place doit accepter owner_id + amenities)
        place = Place(
            title=place_data.get("title"),
            description=place_data.get("description", ""),
            price=place_data.get("price"),
            latitude=place_data.get("latitude"),
            longitude=place_data.get("longitude"),
            owner_id=owner_id,
            amenities=amenity_ids,
        )
        self.place_repo.add(place)
        return place

    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    def get_all_places(self):
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        place = self.get_place(place_id)
        if not place:
            return None

        # Si on modifie owner_id, vérifier que le nouveau owner existe
        if "owner_id" in place_data:
            owner = self.get_user(place_data["owner_id"])
            if not owner:
                raise ValueError("Owner not found")

        # Si on modifie amenities, vérifier que toutes existent
        if "amenities" in place_data:
            for a_id in place_data["amenities"]:
                if not self.get_amenity(a_id):
                    raise ValueError("Amenity not found")

        self.place_repo.update(place_id, place_data)
        return self.get_place(place_id)

    # -----------------
    # Amenity operations
    # -----------------
    def create_amenity(self, amenity_data):
        amenity = Amenity(name=amenity_data["name"])
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None

        name = amenity_data.get("name", "")
        if not name or len(name) > 50:
            raise ValueError("Name is required and must be 50 characters max")

        self.amenity_repo.update(amenity_id, amenity_data)
        return self.amenity_repo.get(amenity_id)

    # -----------------
    # Review operations
    # -----------------
    def create_review(self, review_data):
        user_id = review_data.get("user_id")
        place_id = review_data.get("place_id")
        if not self.get_user(user_id):
            raise ValueError("User not found")
        if not self.get_place(place_id):
            raise ValueError("Place not found")
        review = Review(
            text=review_data.get("text"),
            rating=review_data.get("rating"),
            place_id=place_id,
            user_id=user_id,
        )
        self.review_repo.add(review)
        return review

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        return [r for r in self.review_repo.get_all() if r.place_id == place_id]

    def update_review(self, review_id, review_data):
        review = self.get_review(review_id)
        if not review:
            return None
        if "rating" in review_data:
            rating = review_data["rating"]
            if rating is None or not (1 <= rating <= 5):
                raise ValueError("Rating must be between 1 and 5")
        if "text" in review_data and not review_data["text"]:
            raise ValueError("Text is required")
        self.review_repo.update(review_id, review_data)
        return self.get_review(review_id)

    def delete_review(self, review_id):
        review = self.get_review(review_id)
        if not review:
            return False
        self.review_repo.delete(review_id)
        return True