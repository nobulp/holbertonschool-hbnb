from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('users', description='User operations')

user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})

user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
})


@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""

        user_data = api.payload
        existing_user = facade.get_user_by_email(user_data['email'])

        if existing_user:
            return {'error': 'Email already registered'}, 400

        try:
            new_user = facade.create_user(user_data)
        except (ValueError, KeyError) as e:
            return {'error': str(e)}, 400

        return {
            'id': new_user.id, 'message': 'User successfully created'
        }, 201

    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Retrieve the list of users"""

        users = facade.get_users()

        return [
            {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'email': u.email
            } for u in users
        ], 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""

        user = facade.get_user(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200

    @api.expect(user_update_model, validate=True)
    @api.response(200, 'User updated successfully')
    @api.response(404, 'User not found')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, user_id):
        """Update user details"""

        current_user = get_jwt_identity()
        data = api.payload

        if current_user != user_id:
            return {'error': 'Unauthorized action'}, 403

        if 'email' in data or 'password' in data:
            return {'error': 'You cannot modify email or password'}, 400

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        try:
            updated = facade.update_user(user_id, data)
        except (ValueError, KeyError) as e:
            return {'error': str(e)}, 400

        return {
            'id': updated.id,
            'first_name': updated.first_name,
            'last_name': updated.last_name,
            'email': updated.email
        }, 200
