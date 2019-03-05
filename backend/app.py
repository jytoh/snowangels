import os, datetime

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


class Subscription(db.Model):
    __tablename__='subscriptions'
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))

class Request(db.Model):
    __tablename__='requests'
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))
    time = db.Column(db.DateTime)
    state = db.Column(db.Integer)

    def __init__(self):
        self.time = datetime.datetime.now()
        self.state = 0

class User(db.Model):

    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    point = db.relationship(
        "Point", backref="user", lazy="select", uselist=False
    )

    subscription = db.relationship(
        "Subscription", backref="user", lazy="select", uselist=True
    )

    request = db.relationship(
        "Request", backref="user", lazy="select", uselist=True
    )

    shoveling = db.relationship(
        "Shoveling", backref="user", lazy="select", uselist=True
    )

    def __init__(self, name=None):
        self.name = name
        self.subscription = []

class Point(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"))
    day_pts = db.Column(db.Integer)
    week_pts = db.Column(db.Integer)
    szn_pts = db.Column(db.Integer)
    after_pics = db.Column(db.PickleType)

    def __init__(self):
        self.day_pts = 0
        self.week_pts = 0
        self.szn_pts = 0
        self.after_pics = []


class Corner(db.Model):

    __tablename__ = 'corners'
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    street1 = db.Column(db.String(80))
    street2 = db.Column(db.String(80))
    subscription = db.relationship(
        "Subscription", backref="corner", lazy="select", uselist=True
    )

    request = db.relationship(
        "Request", backref="corner", lazy="select", uselist=True
    )

    shoveling = db.relationship(
        "Shoveling", backref="corner", lazy="select", uselist=True
    )

    def __init__(self, street1=None, street2=None, lat=None, lon=None):
        self.street1 = street1
        self.street2 = street2
        self.lat = lat
        self.lon=lon
        self.subscription = []

class Shoveling(db.Model):

    __tablename__ = 'shovelings'
    id = db.Column(db.Integer, primary_key=True)
    before_pic = db.Column(db.PickleType)
    after_pic = db.Column(db.PickleType)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))


    def __init__(self, state=None, before_pic=None, after_pic=None, start=None, end=None):
        self.state = state
        self.before_pic = before_pic
        self.after_pic = after_pic
        self.start = start
        self.end = end


# COMMENT THIS OUT WHEN DEPLOYING
# db.reflect()
# db.drop_all()


# db.init_app(app)
db.create_all()
db.session.commit()
# initialize database migration management
migrate = Migrate(app, db)





@app.route('/')
def index():
    print(Corner.query.all())
    print(Point.query.all())
    print(Subscription.query.all())
    print(Request.query.all())
    print(Shoveling.query.all())
    print(User.query.all())
    return 'works'

@app.route("/register/<name>")
def register_user(name):
    usr = User(name)
    pts = Point()
    usr.point = pts
    db.session.add(usr)
    db.session.add(pts)
    db.session.commit()
    return "%s has been added to the database" % name


@app.route("/create_corner", methods=["POST"])
def create_corner():
    lat = request.form["lat"]
    long = request.form["long"]
    st1 = request.form["street1"]
    st2 = request.form["street2"]
    crnr = Corner(st1,st2,lat,long)
    db.session.add(crnr)
    db.session.commit()
    return "Added new corner at %s1 and %s2" % (st1, st2)

@app.route("/new_subscription", methods=["POST"])
def new_subscription():
    uid = request.form["user"]
    cid = request.form["corner"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    subscr = Subscription()
    user.subscription.append(subscr)
    corner.subscription.append(subscr)
    db.session.add(subscr)
    db.session.commit()
    return "User %s has subscribed to Corner %s" % (uid, cid)

if __name__ == "__main__":
    app.run()

