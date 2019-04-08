import os, datetime, filereading, pandas
from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from psycopg2.extras import RealDictCursor
#from werkzeug.utils import secure_filename
from flask import jsonify
import json
import sys
import base64

app = Flask(__name__)

POSTGRES = {
    'user': 'postgres',
    'pw': 'password',
    'db': 'template1', #had to change this bc I couldnt add a db
    'host': 'localhost',
    'port': os.environ.get("PORT", 5000),
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://iynghviiztghzc:66104fb16d27663cc06087163df3abe8f2c928d0de885c18dcbda3e2381d5707@ec2-184-73-153-64.compute-1.amazonaws.com:5432/dbldmkaclmemd5'

# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES


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
    before_pic = db.Column(db.LargeBinary)
    def __init__(self, user_id=None, corner_id=None, before_pic=None):
        self.time = datetime.datetime.now()
        self.state = 0
        self.user_id=user_id
        self.corner_id=corner_id
        self.before_pic=before_pic

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    photourl = db.Column(db.String(80))
    token = db.Column(db.String(80))

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
    def __init__(self, name=None, id=None, url=None, token=None):#remove None for production
        self.name = name
        self.id =id
        self.photourl = url
        self.token = token
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
    def __init__(self,id):
        self.day_pts = 0
        self.week_pts = 0
        self.szn_pts = 0
        self.after_pics = []
        self.user_id=id

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

# put in dummy data
dummy_points = [
    Corner("Olin Ave", "Library Street", 42.4476, -76.4827),
    Corner("Campus Rd", "East Ave", 42.4452, -76.4826),
    Corner("Campus Rd", "Sage Ave", 42.4451, -76.4837)
]

for dummy_point in dummy_points:
    db.session.add(dummy_point)
db.session.commit()
# end of put in dummy data

@app.route('/')
def index():
    print(Corner.query.all())
    print(Point.query.all())
    print(Subscription.query.all())
    print(Request.query.all())
    print(Shoveling.query.all())
    print(User.query.all())
    return 'works'

@app.route("/register_user",methods=['POST'])
def register_user():
    name = request.form["name"]
    id = request.form["id"]
    url = request.form["photourl"]
    tk = request.form["token"]
    initialAuth = request.form["teststring"] #current solution: hardcode something and return that to verify that this is coming from our app

    #if initialAuth =/= "teststring":
        #return "Error: new users must be registered through the app", 401
    usr = User(name, id, url, tk)
    pts = Point(id)
    usr.point = pts
    db.session.add(usr)
    db.session.add(pts)
    db.session.commit()
    return jsonify(user = name)
    # return "%s has been added to the database" % name

@app.route("/get_all_corners", methods=['GET'])
def get_all_corners():
    connection = psycopg2.connect(dbname="template1", user="postgres", password="password", host="localhost")
    cur = connection.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
          SELECT * FROM corners
        """)
    columns = ['id', 'lat', 'lon', 'street1', 'street2']
    c = cur.fetchall()
    dictlist = []
    for row in c:
        #when we add support for 4 corners we need to change description
            print(row)
            d = {"coordinate": {"latitude":row['lat'], "longitude": row['lon']}, "title": ""+row['street1']+" & "+row['street2'], "description" :"SINGLE CORNER"}
            dictlist.append(d)
    print(dictlist)
    #return dictlist
    return json.dumps(dictlist, indent=2)

@app.route("/create_corner", methods=['POST'])
def create_corner():
    lat = request.form["lat"]
    long = request.form["long"]
    st1 = request.form["street1"]
    st2 = request.form["street2"]
    crnr = Corner(st1,st2,lat,long)
    db.session.add(crnr)
    db.session.commit()
    return jsonify(street1 = st1, street2=st2)
    #return "Added new corner at %s1 and %s2" % (st1, st2)

@app.route("/create_corners_from_filename", methods=['POST'])
def create_corners_from_file():
    file= request.form["filename"]
    dframe = filereading.fetchGISdata(file)
    print("success")
    for index, row in dframe.iterrows():#don't change these
        lat = row[2]
        long = row[3]
        st1 = row[4]
        st2 = row[5]
        crnr = Corner(st1, st2, lat, long)
        db.session.add(crnr)
    db.session.commit()
    return "data from file %s has been added to the corner database" % (file)

@app.route("/new_subscription", methods=['POST'])
def new_subscription():
    uid = request.form['uid']
    cid = request.form['cid']
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    subscr = Subscription()
    user.subscription.append(subscr)
    corner.subscription.append(subscr)
    db.session.add(subscr)
    db.session.commit()
    return jsonify(user = uid, corner=cid, username=user.name)
    #return "User %s has subscribed to Corner %s" % (uid, cid)

@app.route("/new_request", methods=['POST'])
def new_request():
    print("HI");
    uid = request.form["uid"]
    cid = request.form["cid"]
    before_pic = request.form["before_pic"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    # req = Request(uid, cid, before_pic)

    connection=None
    try:
        print("HI");
        user_id=uid;
        corner_id=cid;
        time = datetime.datetime.now();
        state = 0;
        print("HI");

        connection = psycopg2.connect(dbname="template1", user="postgres", password="password", host="localhost", post=5432);
        cur = connection.cursor(cursor_factory=RealDictCursor);
        print("HI");

        cur.execute("INSERT INTO requests(user_id, corner_id, time, state, before_pic) " +
        "VALUES(%s, %s, %s, %s,%s)",
        (user_id, corner_id, time, state, before_pic));
        print("HI");


        connection.commit();

        cur.close();



    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if connection is not None:
            connection.close()

    # may have to convert back to this below
    # user.request.append(req)
    # corner.request.append(req)
    # db.session.add(req)
    db.session.commit()
    #you can't conv
    return jsonify(user = uid, corner=cid, username=user.name, before_pic=before_pic)
    # #return "User %s has made a request for Corner %s" % (uid, cid)


@app.route("/new_shovel", methods=['POST'])
def new_shovel():
    uid = request.form["uid"]
    cid = request.form["cid"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    before_pic = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().before_pic
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
    #TODO: figure out total time
    return jsonify(user = uid, corner=cid, username=user.name, before_pic=before_pic, after_pic=after_pic, start_time=start, end_time=end, total_time=0)
    #return "User %s has claimed to shovel Corner %s" % (uid, cid)
#validate shoveling

@app.route("/validate_shovel", methods=['POST'])
def validate_shovel():
    uid_requester = request.form["uid_requester"]
    uid_shoveler = request.form["uid_shoveler"]
    cid = request.form["cid"]
    validate_bit = request.form["cid"]
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
        return jsonify(requester = uid_requester, shoveler=uid_shoveler, corner=cid, validate_bit=validate_bit)
        #return "User %s calimed that user %s did not properly shovel Corner %s" % (uid_requester, uid_shoveler, cid)
    #if requester says shoveling claim is valid, set state of request to steady state, 2
    elif validate_bit=='1':
        req = Request.query.filter_by(corner_id=cid, state=1, user_id=uid_requester).order_by(Request.time.desc()).first()
        req.state = 2
        db.session.commit()
        return jsonify(requester = uid_requester, shoveler=uid_shoveler, corner=cid, validate_bit=validate_bit)
        #return "User %s validated that user %s shoveled Corner %s" % (uid_requester, uid_shoveler, cid)
#get all people subscribed to a corner

@app.route("/ppl_subscribed", methods=['GET'])
def get_ppl_subscribed():
    cid = request.args.get('cid')
    users_subscribed = map(str,[s.user_id for s in Subscription.query.filter_by(corner_id=cid)])
    return jsonify(corner = cid, users_subscribed=users_subscribed)
    #return "Users %s are subscribed to corner %s" % (' '.join(users_subscribed), cid)
#get corners that user is subscribed to

@app.route("/subscribed_corners", methods=['GET'])
def get_subscribed_corners():
    uid = request.args.get('uid')
    corners = map(str,[s.corner_id for s in Subscription.query.filter_by(user_id=uid)])
    return jsonify(user = uid, corners = corners)
    #return "User %s is subscribed to corners %s" % (uid, ' '.join(corners))
#unsubscribe a user from a corner

@app.route("/unsubscribe_corner", methods=['DELETE'])
def unsubscribe_corner():
    uid = request.args.get('uid')
    cid = request.args.get('cid')
    subscription = Subscription.query.filter_by(user_id=uid, corner_id=cid).one()
    db.session.delete(subscription)
    db.session.commit()
    return jsonify(user = uid, corner = cid)
    #return "User %s has unsubscribed from corner %s" % (uid, cid)
#get state of a corner request

@app.route("/state", methods=['GET'])
def get_state():
    cid = request.args.get('cid')
    state = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().state
    return jsonify(corner = cid, state = state)
    # return "Corner %s has  %s" % (cid, state)
#get user id who last requested a corner

@app.route("/latest_requester_id", methods=['GET'])
def get_latest_requester_id():
    cid = request.args.get('cid')
    uid = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().user_id
    return jsonify(corner = cid, user = uid)
    # return "%s was the last person to make a request on corner %s" % (uid, cid)
#get name of who last requested a corner

@app.route("/latest_requester_name", methods=['GET'])
def get_latest_requester_name():
    cid = request.args.get('cid')
    uid = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(corner = cid, user=uid, name = name)
    #return "%s was the last person to make a request on corner %s" % (name, cid)
#get corner info: street names

@app.route("/corner_street_names", methods=['GET'])
def get_corner_street_names():
    #cid = request.form["cid"]
    cid = request.args.get('cid')
    #martin's edit
    str1 = Corner.query.filter_by(id=cid).first().street1
    str2 = Corner.query.filter_by(id=cid).first().street2
    return jsonify(street1 = str1, street2=str2)
    #return "Corner %s is at streets %s and %s" % (cid, str1, str2)
#get corner info: latitude and longtitude

@app.route("/corner_coordinates", methods=['GET'])
def get_corner_coordinates():
    cid = request.args.get('cid')
    lat = Corner.query.filter_by(id=cid).lat
    lon = Corner.query.filter_by(id=cid).lon
    return jsonify(corner = cid, lat = lat, lon=lon)
    #return "Corner %s is at coordinates (%s, %s)" % (cid, lat, lon)
#get ID of leader of the day

@app.route("/day_leader_id", methods=['GET'])
def get_day_leader_id():
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    return jsonify(user = uid)
    # return "User id %s is the leader of the day" % (uid)
#get name of leader of the day

@app.route("/day_leader_name", methods=['GET'])
def get_day_leader_name():
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name = name)
    # return "User %s is the leader of the day" % (name)
#get ID of leader of the week

@app.route("/week_leader_id", methods=['GET'])
def get_week_leader_id():
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    return jsonify(user = uid)
    # return "User id %s is the leader of the week" % (uid)
#get name of leader of the day

@app.route("/week_leader_name", methods=['GET'])
def get_week_leader_name():
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name = name)
    # return "User %s is the leader of the week" % (name)
#get ID of leader of the season

@app.route("/szn_leader_id", methods=['GET'])
def get_szn_leader_id():
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    return jsonify(user = uid)
    # return "User id %s is the leader of the season" % (uid)
#get name of leader of the season

@app.route("/szn_leader_name", methods=['GET'])
def get_szn_leader_name():
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name = name)
    # return "User %s is the leader of the season" % (name)
#get top x user ids for the day

@app.route("/top_day_leader_ids", methods=['GET'])
def get_top_day_leader_ids():
    x = request.args.get('num_users')
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.day_pts.desc())][:int(x)])
    return jsonify(top_users = ' '.join(top_users))
    # return ' '.join(top_users)
#get top x user ids for the week

@app.route("/top_week_leader_ids", methods=['GET'])
def get_top_week_leader_ids():
    x = request.args.get('num_users')
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.week_pts.desc())][:int(x)])
    return jsonify(top_users = ' '.join(top_users))
    # return ' '.join(top_users)
#get top x user ids for the season

@app.route("/top_szn_leader_ids", methods=['GET'])
def get_top_szn_leader_ids():
    x = request.args.get('num_users')
    top_users = map(str,[u.user_id for u in Point.query.order_by(Point.szn_pts.desc())][:int(x)])
    return jsonify(top_users = ' '.join(top_users))
    # return ' '.join(top_users)

# @app.before_request
# def authenticate():
#     if request.path[0:15]=="/register_user":
#         pass #registering new users is special and should be treated as such
#     authenticated=False
#     print(request.values)
#     id = request.values['id']
#     token = request.values['token']
#     connection = psycopg2.connect(dbname="template1", user="postgres", password="password", host="localhost", post=os.environ.get("PORT", 5000));
#
#     cur = connection.cursor(cursor_factory=RealDictCursor);
#     cur.execute("SELECT * FROM USERS WHERE id = "+id+";")
#     c=cur.fetchall()
#     if len(c) == 0: #if user doesn't exist
#         return "User doesn't exist", 404
#     for var in c: #i don't think order is guaranteed so we have to check the whole list
#         if var==token:
#             authenticated=True
#     if authenticated:
#         return None
#     else:
#         return "User authentication token doesn't match id", 401


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
