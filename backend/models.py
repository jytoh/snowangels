from app import db


class User(db.Model):

    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))

    def __init__(self, name=None):
        self.name = name

class Corner(db.Model):

    __tablename__ = 'corners'
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    street1 = db.Column(db.String(80), primary_key=True)
    street2 = db.Column(db.String(80), primary_key=True)

    def __init__(self, street1=None, street2=None):
        self.street1 = street1
        self.street2 = street2
