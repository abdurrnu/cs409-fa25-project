from flask import Flask, request, jsonify
from datetime import date
from user import db, User, LostItems, FoundItems, Claim
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
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    location = data.get("location")

    if not email or not password:
        return jsonify({"message": "Missing a requirement (email and password)"}), 400
    
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message" : "User already exists"}), 400
    
    user = User(email=email, password=password, location=location)
    db.session.add(user)
    db.session.commit()

    # return created user info (useful for frontend)
    return (
        jsonify(
            {
                "message": "Successful addition",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "location": user.location,
                },
            }
        ),
        201,
    )

@app.route('/login', methods=['POST']) # because we are sending a password
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing a requirement. Cannot login"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    return (
        jsonify(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "location": user.location,
                },
            }
        ),
        200,
    )

@app.route('/items/lost', methods=['POST'])
def report_lost():
    data = request.get_json() or {}
    required_fields = ["title", "description", "user_id", "location", "date_lost"]
    if any(field not in data for field in required_fields):
        return jsonify({"message": "Missing a requirement. Cannot Report Lost"}), 400
    try:
        # Expecting ISO date string, e.g. "2025-12-09"
        date_lost = date.fromisoformat(data["date_lost"])
    except Exception:
        return jsonify({"message": "Invalid date_lost format. Use YYYY-MM-DD."}), 400
    
    category = data.get("category")
    contact_email = data.get("contact_email")
    
    item = LostItems(
        title=data["title"],
        description=data["description"],
        user_id=data["user_id"],
        location=data["location"],
        date_lost=date_lost,
        category=category,
        contact_email=contact_email,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Successful addition of lost item", "item": item.to_dict()}), 201

@app.route('/items/found', methods=['POST'])
def report_found():
    data = request.get_json() or {}
    required_fields = ["title", "description", "user_id", "location", "date_found"]
    if any(field not in data for field in required_fields):
        return jsonify({"message": "Missing a requirement. Cannot Report Found"}), 400
    
    try:
        date_found = date.fromisoformat(data["date_found"])
    except Exception:
        return jsonify({"message": "Invalid date_found format. Use YYYY-MM-DD."}), 400
    
    category = data.get("category")
    contact_email = data.get("contact_email")
    
    item = FoundItems(
        title=data["title"],
        description=data["description"],
        user_id=data["user_id"],
        location=data["location"],
        date_found=date_found,
        category=category,
        contact_email=contact_email,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'message' : "Successful addition of found item", "item": item.to_dict()}), 201

#look at all lost items
@app.route('/items/lost', methods=['GET'])
# data lives in the URL
def search_lost():
    query = request.args.get("q", "").strip()
    location = request.args.get("location", "").strip()
    
    items_query = LostItems.query
    if query:
        items_query = items_query.filter(
            (LostItems.title.ilike(f"%{query}%"))
            | (LostItems.description.ilike(f"%{query}%"))
        )
    if location:
        items_query = items_query.filter(LostItems.location.ilike(f"%{location}%"))

    items = [item.to_dict() for item in items_query.all()]
    return jsonify(items), 200

@app.route('/items', methods=['GET'])
def get_all():
    lost = [item.to_dict() for item in LostItems.query.all()]
    found = [item.to_dict() for item in FoundItems.query.all()]

    for item in lost:
        item["type"] = "Lost"
    for item in found:
        item["type"] = "Found"
    return jsonify(lost + found), 200


@app.route('/items/<int:item_id>/claim', methods=['POST'])
def claim_item(item_id):
    data = request.get_json() or {}   # ← Never None!
    message = (data.get("message") or "").strip()
    claimant_id = data.get("claimant_id")
    if not claimant_id:
        return jsonify({"error": "claimant_id is required"}), 400
    
    item = LostItems.query.get_or_404(item_id)

    # helps prevent double-claiming
    if item.status != "pending":
        return jsonify({"error": "Item already claimed"}), 400

    claim = Claim(
        item_id=item_id,
        claimant_id=claimant_id,
        message=message or None,
    )
    db.session.add(claim)
    item.status = 'finished'  
    db.session.commit()

    return jsonify({"message": "Claim submitted successfully"}), 201
