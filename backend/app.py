import os

from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

POSTGRES = {
    'user': 'postgres',
    'pw': 'password',
    'db': 'snowangels_db',
    'host': 'localhost',
    'port': '5432',
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# initialize the database connection
db = SQLAlchemy(app)


class User(db.Model):

    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    points = db.Column(db.Integer)

    def __init__(self, name=None, points=0):
        self.name = name
        self.points = points


class Corner(db.Model):

    __tablename__ = 'corners'
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    street1 = db.Column(db.String(80), primary_key=True)
    street2 = db.Column(db.String(80), primary_key=True)

    def __init__(self, street1=None, street2=None, lat=None, lon=None):
        self.street1 = street1
        self.street2 = street2
        self.lat = lat
        self.lon=lon

class Claims(db.Model):

    __tablename__ = 'claims'
    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.Integer)
    before_pic = db.Column(db.PickleType)
    after_pic = db.Column(db.PickleType)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)

    def __init__(self, state=None, before_pic=None, after_pic=None, start=None, end=None):
        self.state = state
        self.before_pic = before_pic
        self.after_pic = after_pic
        self.start = start
        self.end = end



# db.init_app(app)
db.create_all()
db.session.commit()
# initialize database migration management
migrate = Migrate(app, db)





@app.route('/')
def index():
    print(User.query.all())
    return 'works'

@app.route('/register', methods=['POST'])
def register_user():
    name = request.form.get('name')
    usr = User(name)
    db.session.add(usr)
    db.session.commit()

if __name__ == "__main__":
    app.run()

