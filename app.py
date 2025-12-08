from flask import Flask, request, jsonify, g
from user import db, User, LostItems, FoundItems, Item, Claim
from werkzeug.security import check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lostfound.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
with app.app_context():
    db.create_all()
    print("database ready")


@app.route('/register', methods = ['POST'])
def register():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({'message' : "Missing a requirement"}), 400
    already_user_exists = User.query.filter_by(email = data["email"]).first()
    if (already_user_exists):
        return jsonify({"message": "User already exists"}), 400
    location = None
    if 'location' in data:
        location = data['location']
    user = User(email=data['email'], password = data['password'], location= location)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message' : "Succesful addition"}), 201

@app.route('/login', methods=['POST']) # because we are sending a password
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({'message' : "Missing a requirement. Cannot login"}), 400
    already_user_exists = User.query.filter_by(email = data["email"]).first()
    if (already_user_exists):
        if (check_password_hash(already_user_exists.password_hash, data['password'])):
            return jsonify({"message": "Login Succesful"}), 200
    return jsonify({"message": "Invalid credentials", "user_id" : already_user_exists.id}), 401

@app.route('/items/lost', methods=['POST'])
def report_lost():
    data = request.json()
    if not data or "title" not in data or "description" not in data or "user_id" not in data or "location" not in data or "date_lost" not in data:
        return jsonify({'message' : "Missing a requirement. Cannot Report Lost"}), 400
    item = LostItems(title = data["title"], description = data["description"], user_id = data["user_id"], location = data["location"], date_lost = data["date_lost"])
    db.session.add(item)
    db.session.commit()
    return jsonify({'message' : "Succesful addition of lost Item"}), 201

@app.route('/items/found', methods=['POST'])
def report_found():
    data = request.json()
    if not data or "title" not in data or "description" not in data or "user_id" not in data or "location" not in data or "date_found" not in data:
        return jsonify({'message' : "Missing a requirement. Cannot Report Found"}), 400
    item = FoundItems(title = data["title"], description = data["description"], user_id = data["user_id"], location = data["location"], date_found = data["date_found"])
    db.session.add(item)
    db.session.commit()
    return jsonify({'message' : "Succesful addition of found Item"}), 201

#look at all lost items
@app.route('/items/lost', methods=['GET'])
# data lives in the URL
def search_lost():
    query = request.args('q', '').strip()
    location = request.args('location', '').strip()
    items = LostItems.query.filter(LostItems.title.ilike(f"%{query}%") | LostItems.description.ilike(f"%{query}%"))
    if location != '':
        items = items.filter(LostItems.location.ilike(f"%{location}%"))

    return jsonify([item.to_dict() for item in items.all()])

@app.route('/items', methods=['GET'])
def get_all():
    return jsonify([item.to_dict() for item in Item.query.all()])


@app.route('/items/<int:item_id>/claim', methods=['POST'])
def claim_item(item_id):
    data = request.get_json() or {}   # ← Never None!
    if not data:
        return jsonify({"error": "JSON body required"}), 400
    message = data.get('message', '').strip()
    item = FoundItems.query.get_or_404(item_id)
    
    #Helps prevent double-claiming
    if item.status != 'pending':
        return jsonify({"error": "Item already claimed"}), 400
    claim = Claim(
        item_id=item_id,
        claimant_id=g.current_user.id, # is a flask trick
        message=message or None
    )
    db.session.add(claim)
    item.status = 'finished'  
    db.session.commit()









    
    

















































