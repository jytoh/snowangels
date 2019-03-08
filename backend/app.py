import os, datetime, filereading, pandas

from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename


app = Flask(__name__)

POSTGRES = {
    'user': 'postgres',
    'pw': 'password',
    'db': 'template1', #had to change this bc I couldnt add a db
    'host': 'localhost',
    'port': '5433',
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

#added this to not keep restarting
app.config['DEBUG'] = True

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

    def __init__(self, user_id=None, corner_id=None):
        self.time = datetime.datetime.now()
        self.state = 0
        self.user_id=user_id
        self.corner_id=corner_id

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
        self.request = []

class Point(db.Model):
    __tablename__ = 'points'
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
        self.request = []

class Shoveling(db.Model):

    __tablename__ = 'shovelings'
    id = db.Column(db.Integer, primary_key=True)
    before_pic = db.Column(db.PickleType)
    after_pic = db.Column(db.PickleType)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))


#took out state + added user_id and corner_id
    def __init__(self, user_id=None, corner_id=None, before_pic=None, after_pic=None, start=None, end=None):
        #self.state = state
        self.user_id = user_id
        self.corner_id = corner_id
        self.before_pic = before_pic
        self.after_pic = after_pic
        self.start = start
        self.end = end



# COMMENT THIS OUT WHEN DEPLOYING
db.reflect()
db.drop_all()


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

@app.route("/create_corner", methods=['POST'])
def create_corner():
    lat = request.form["lat"]
    long = request.form["long"]
    st1 = request.form["street1"]
    st2 = request.form["street2"]
    crnr = Corner(st1,st2,lat,long)
    db.session.add(crnr)
    db.session.commit()
    return "Added new corner at %s1 and %s2" % (st1, st2)

@app.route("/create_corners_from_filename", methods=['POST'])
def create_corners_from_file():
    file= request.form["filename"]
    dframe = filereading.fetchGISdata(file)
    for index, row in dframe.iterrows():
        lat = row['InterX']
        long = row['InterY']
        st1 = row['STREET1']
        st2 = row['STREET2']
        crnr = Corner(st1, st2, lat, long)
        db.session.add(crnr)
    db.session.commit()
    return "data from file %s has been added to the corner database" % (file)

@app.route("/new_subscription", methods=['POST'])
def new_subscription():
    uid = request.form["uid"]
    cid = request.form["cid"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    subscr = Subscription()
    user.subscription.append(subscr)
    corner.subscription.append(subscr)
    db.session.add(subscr)
    db.session.commit()
    return "User %s has subscribed to Corner %s" % (uid, cid)

@app.route("/new_request", methods=['POST'])
def new_request():
    uid = request.form["uid"]
    cid = request.form["cid"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    req = Request(uid, cid)
    user.request.append(req)
    corner.request.append(req)
    db.session.add(req)
    db.session.commit()
    return "User %s has made a request for Corner %s" % (uid, cid)

@app.route("/new_shovel", methods=['POST'])
def new_shovel():
    uid = request.form["uid"]
    cid = request.form["cid"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    before_pic = request.form["before_pic"]
    after_pic = request.form["after_pic"]
    start = datetime.datetime.now() #TODO
    end = datetime.datetime.now() #TODO
    shovel = Shoveling(uid, cid, before_pic, after_pic, start, end)
    db.session.add(shovel)
    db.session.commit()
    #wasnt sure if we need these next two lines
    # user.request.append(shovel)
    # corner.request.append(shovel)

    #change state to 1 in requests table
    req = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first()
    req.state = 1
    db.session.commit()

    #add to point table
    points_entry = Point.query.filter_by(user_id=uid).first()
    points_entry.day_pts += 5 #TODO: figure out good # of points/ weights later
    points_entry.week_pts += 5
    points_entry.szn_pts += 5
    points_entry.after_pics.append(after_pic)
    db.session.commit()
    return "User %s has claimed to shovel Corner %s" % (uid, cid)

#validate shoveling
@app.route("/validate_shovel", methods=['POST'])
def validate_shovel():
    uid_requester = request.form["uid_requester"]
    uid_shoveler = request.form["uid_shoveler"]
    cid = request.form["cid"]
    validate_bit = request.form["validate_bit"]
    shoveler = User.query.get(uid_shoveler)
    corner = Corner.query.get(cid)
    #if requester says shoveling claim is not valid, take away points from shoveler + set state of request to 0
    if validate_bit=='0':
        points_entry = Point.query.filter_by(user_id=uid_shoveler).first()
        points_entry.day_pts -= 5 #TODO: figure out good # of points/ weights later
        points_entry.week_pts -= 5
        points_entry.szn_pts -= 5
        db.session.commit()
        req = Request.query.filter_by(corner_id=cid, state=1, user_id=uid_requester).order_by(Request.time.desc()).first()
        req.state = 0 #TODO: need to re-notify ppl that this corner needs to be cleared
        db.session.commit()
        return "User %s calimed that user %s did not properly shovel Corner %s" % (uid_requester, uid_shoveler, cid)
    #if requester says shoveling claim is valid, set state of request to steady state, 2
    elif validate_bit=='1':
        req = Request.query.filter_by(corner_id=cid, state=1, user_id=uid_requester).order_by(Request.time.desc()).first()
        req.state = 2 
        db.session.commit()
        return "User %s validated that user %s shoveled Corner %s" % (uid_requester, uid_shoveler, cid)

#get all people subscribed to a corner
@app.route("/ppl_subscribed", methods=['GET'])
def get_ppl_subscribed():
    cid = request.form["cid"]
    users_subscribed = map(str,[s.user_id for s in Subscription.query.filter_by(corner_id=cid)])
    return "Users %s are subscribed to corner %s" % (' '.join(users_subscribed), cid)

#get corners that user is subscribed to
@app.route("/subscribed_corners", methods=['GET'])
def get_subscribed_corners():
    uid = request.form["uid"]
    corners = map(str,[s.corner_id for s in Subscription.query.filter_by(user_id=uid)])
    return "User %s is subscribed to corners %s" % (uid, ' '.join(corners)) 

#unsubscribe a user from a corner
@app.route("/unsubscribe_corner", methods=['DELETE'])
def unsubscribe_corner():
    uid = request.form["uid"]
    cid = request.form["cid"]
    subscription = Subscription.query.filter_by(user_id=uid, corner_id=cid).one()
    db.session.delete(subscription)
    db.session.commit()
    return "User %s has unsubscribed from corner %s" % (uid, cid)

#get state of a corner request
@app.route("/state", methods=['GET'])
def get_state():
    cid = request.form["cid"]
    state = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().state
    return "Corner %s has  %s" % (cid, state)

#get user id who last requested a corner
@app.route("/latest_requester_id", methods=['GET'])
def get_latest_requester_id():
    cid = request.form["cid"]
    uid = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().user_id
    return "%s was the last person to make a request on corner %s" % (uid, cid)

#get name of who last requested a corner
@app.route("/latest_requester_name", methods=['GET'])
def get_latest_requester_name():
    cid = request.form["cid"]
    uid = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return "%s was the last person to make a request on corner %s" % (name, cid)

#get corner info: street names
@app.route("/corner_street_names", methods=['GET'])
def get_corner_street_names():
    cid = request.form["cid"]
    str1 = Corner.query.filter_by(id=cid).street1
    str2 = Corner.query.filter_by(id=cid).street2
    return "Corner %s is at streets %s and %s" % (cid, str1, str2)

#get corner info: latitude and longtitude
@app.route("/corner_coordinates", methods=['GET'])
def get_corner_coordinates():
    cid = request.form["cid"]
    lat = Corner.query.filter_by(id=cid).lat
    lon = Corner.query.filter_by(id=cid).lon
    return "Corner %s is at coordinates (%s, %s)" % (cid, lat, lon)

#get ID of leader of the day
@app.route("/day_leader_id", methods=['GET'])
def get_day_leader_id():
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    return "User id %s is the leader of the day" % (uid)

#get name of leader of the day
@app.route("/day_leader_name", methods=['GET'])
def get_day_leader_name():
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return "User %s is the leader of the day" % (name)

#get ID of leader of the week
@app.route("/week_leader_id", methods=['GET'])
def get_week_leader_id():
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    return "User id %s is the leader of the week" % (uid)

#get name of leader of the day
@app.route("/week_leader_name", methods=['GET'])
def get_week_leader_name():
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return "User %s is the leader of the week" % (name)

#get ID of leader of the season
@app.route("/szn_leader_id", methods=['GET'])
def get_szn_leader_id():
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    return "User id %s is the leader of the season" % (uid)

#get name of leader of the season
@app.route("/szn_leader_name", methods=['GET'])
def get_szn_leader_name():
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return "User %s is the leader of the season" % (name)

#get top x user ids for the day 
@app.route("/top_day_leader_ids", methods=['GET'])
def get_top_day_leader_ids():
    x = request.form["num_users"]
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.day_pts.desc())][:int(x)])
    return ' '.join(top_users)

#get top x user ids for the week
@app.route("/top_week_leader_ids", methods=['GET'])
def get_top_week_leader_ids():
    x = request.form["num_users"]
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.week_pts.desc())][:int(x)])
    return ' '.join(top_users)

#get top x user ids for the season 
@app.route("/top_szn_leader_ids", methods=['GET'])
def get_top_szn_leader_ids():
    x = request.form["num_users"]
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.szn_pts.desc())][:int(x)])
    return ' '.join(top_users)

if __name__ == "__main__":
    app.run()