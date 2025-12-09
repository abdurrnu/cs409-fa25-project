from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import date, datetime

db = SQLAlchemy()



class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(128), unique = True, nullable = False)
    password_hash = db.Column(db.String(128), nullable = False)

    # make location nullable since we allow None in __init__ and /register
    location = db.Column(db.String(128), unique = False, nullable = True)
    created_at = db.Column(db.DateTime, default = datetime.utcnow)



    def __init__(self, email, password, location = None): # if no location is passed, we assume None
        self.email = email
        self.password_hash = generate_password_hash(password) #password # also we can use hash_password
        self.location = location

class Item(db.Model):
    __abstract__ = True
    # __tablename__ = 'lostitems'
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(128), nullable = False)
    description = db.Column(db.String(128), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable = False)
    location = db.Column(db.String(128), nullable = False)
    # date_lost = db.Column(db.Date, nullable = False)
    status = db.Column(db.String(128), default = "pending") # can be pending or finished
    created_at = db.Column(db.DateTime, default = datetime.utcnow)
    #automatrically gives me an __init__ constructor. Only need to do __init__ if I want a custom one like for User
    def to_dict(self):
        data = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            
            # Convert dates/datetime to ISO string for JSON
            if isinstance(value, (datetime, date)):
                value = value.isoformat() if value else None
                
            data[column.name] = value
            
        return data
    
class FoundItems(Item):
    __tablename__ = "founditems"
    date_found =  db.Column(db.Date, nullable = False)

class LostItems(Item):
    __tablename__ = "lostitems"
    date_lost = db.Column(db.Date, nullable = False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'date_lost': self.date_lost.isoformat() if self.date_lost else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id
        }
    
class Claim(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('founditems.id'))
    claimant_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # can be pending or finished
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
