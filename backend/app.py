import os, datetime, filereading, pandas
from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import psycopg2
import re
from urllib.parse import urlparse
from psycopg2.extras import RealDictCursor
# from werkzeug.utils import secure_filename
from flask import jsonify
import json
import sys
import base64

app = Flask(__name__)

#POSTGRES db config for local testing
POSTGRES = {
    'user': 'postgres',
    'pw': 'password',
    'db': 'template1',  
    'host': 'localhost',
    'port': int(os.environ.get("PORT", 5000)),
}
app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'postgres://iynghviiztghzc:66104fb16d27663cc06087163df3abe8f2c928d0de885c18dcbda3e2381d5707@ec2-184-73-153-64.compute-1.amazonaws.com:5432/dbldmkaclmemd5'

# To test locally, comment out postgres heroku link and use this 
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

# initialize the database connection
db = SQLAlchemy(app)


class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))
    time = db.Column(db.DateTime)
    state = db.Column(db.Integer)
    before_pic = db.Column(db.String(255))

    def __init__(self, user_id=None, corner_id=None, before_pic=None):
        self.time = datetime.datetime.now()
        self.state = 1
        self.user_id = user_id
        self.corner_id = corner_id
        self.before_pic = before_pic


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255))
    name = db.Column(db.String(255))
    photourl = db.Column(db.String(255))
    token = db.Column(db.String(255))

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

    def __init__(self, name=None, google_id=None, url=None,
                 token=None):  # remove None for production
        self.name = name
        self.google_id = google_id
        self.photourl = url
        self.token = token
        self.subscription = []
        self.request = []


class Point(db.Model):
    __tablename__ = 'points'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    day_pts = db.Column(db.Integer)
    week_pts = db.Column(db.Integer)
    szn_pts = db.Column(db.Integer)
    after_pics = db.Column(db.PickleType)

    def __init__(self, id):
        self.day_pts = 0
        self.week_pts = 0
        self.szn_pts = 0
        self.after_pics = []
        self.user_id = id


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
        self.lon = lon
        self.subscription = []
        self.request = []

    @property
    def serialize(self):
        return {
            'key': self.id,
            'coordinate': {'latitude': self.lat, 'longtitude': self.lon},
            'title': self.street1 + " & " + self.street2,
            'description': "Single Corner"
        }


class Shoveling(db.Model):
    __tablename__ = 'shovelings'
    id = db.Column(db.Integer, primary_key=True)
    before_pic = db.Column(db.String(255))
    after_pic = db.Column(db.String(255))
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))

    # took out state + added user_id and corner_id
    def __init__(self, user_id=None, corner_id=None, before_pic=None,
                 after_pic=None, start=None, end=None):
        # self.state = state
        self.user_id = user_id
        self.corner_id = corner_id
        self.before_pic = before_pic
        self.after_pic = after_pic
        self.start = datetime.datetime.now()
        self.end = end


#Did not get to implement subscription in time
class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    corner_id = db.Column(db.Integer, db.ForeignKey("corners.id"))


# COMMENT THIS OUT WHEN DEPLOYING
db.reflect()
# db.drop_all()


# db.init_app(app)
db.create_all()
db.session.commit()
# initialize database migration management
migrate = Migrate(app, db)


def import_corners(file):
    """
    Imports corners to the database from GIS dataset
    Parameters:
        file: file name which has corner data
    """
    dframe = filereading.fetchGISdata(file)
    for index, row in dframe.iterrows():#don't change these
        lat = row[2]
        long = row[3]
        st1 = row[4]
        st2 = row[5]
        crnr = Corner(st1, st2, lat, long)
        db.session.add(crnr)
    db.session.commit()
    print("end of import_corners fn")

import_corners("Ints2019 copy.xls") #TODO: change to "Ints2019" for full dataset
print("added corners")


@app.route("/register_user", methods=['POST'])
def register_user():
    """
    Initalizes a new user entry in the database     
    Parameters:
        name: name of user 
        google_id: google id of user
        url: url of user's photo icon
        tk: user's access token
    Returns:
        JSON object with user's name
    """
    name = request.form["name"]
    google_id = request.form["google_id"]
    url = request.form["photourl"]
    tk = request.form["token"]
    if (User.query.filter_by(google_id=google_id).first() == None):
        usr = User(name, google_id, url, tk)
        pts = Point(usr.id)
        usr.point = pts
        db.session.add(usr)
        db.session.add(pts)
        db.session.commit()
        return jsonify(user=name)
    else:
        return "user was already registered"


@app.route("/googleid_to_uid", methods=['POST'])
def googleid_to_uid():
    """
    Returns the user's id in the database given their Google ID     
    Parameters:
        google_id: google id of user
    Returns:
        JSON object with user's user id
    """
    google_id = request.form["google_id"]
    print(google_id)
    uid = User.query.filter_by(google_id=google_id).first().id
    print(uid)
    return jsonify(uid=uid)


@app.route("/get_all_corners", methods=['GET'])
def get_all_corners():
    """
    Returns the attributes of all corners    
    Returns:
        JSON object with all corner entried in db
    """
    dictlist = [i.serialize for i in Corner.query.all()]
    # return dictlist
    return json.dumps(dictlist, indent=2)


@app.route("/create_corner", methods=['POST'])
def create_corner():
    """
    Initializes a new corner in the db      
    Parameters:
        lat: latitude of the corner
        long: longitude of the corner
        st1: street 1 name
        st2: street 2 name
    Returns:
        JSON object with corner's street 1 and 2 names
    """
    lat = request.form["lat"]
    long = request.form["long"]
    st1 = request.form["street1"]
    st2 = request.form["street2"]
    crnr = Corner(st1, st2, lat, long)
    db.session.add(crnr)
    db.session.commit()
    return jsonify(street1=st1, street2=st2)


@app.route("/create_corners_from_filename", methods=['POST'])
def create_corners_from_file():
    """
    Initialize all corners in a file into the database  
    Parameters:
        file: file name 
    Returns:
        String 
    """
    file = request.form["filename"]
    dframe = filereading.fetchGISdata(file)
    print("success")
    for index, row in dframe.iterrows():  # don't change these
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
    """
    Add a subscription to the database 
    Parameters:
        uid: user id
        cid: corner id 
    Returns:
        JSON object with user id, corner id, and user name 
    """
    uid = request.form['uid']
    cid = request.form['cid']
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    subscr = Subscription()
    user.subscription.append(subscr)
    corner.subscription.append(subscr)
    db.session.add(subscr)
    db.session.commit()
    return jsonify(user=uid, corner=cid, username=user.name)


@app.route("/new_request", methods=['POST'])
def new_request():
    """
    Add a request to the database 
    Parameters:
        uid: user id
        cid: corner id 
        before_pic: before_pic
    Returns:
        JSON object with user id, corner id, user name, and before_pic
    """
    uid = request.values.get("uid")
    cid = request.values.get("cid")
    before_pic = request.values.get("before_pic")
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    reqs = Request.query.filter_by(corner_id=cid).all()
    if any([req.state > 0 for req in reqs]):
        return None
    req = Request(uid, cid, before_pic)
    db.session.add(req)
    db.session.commit()
    return jsonify(user=uid, corner=cid, username=user.name,
                   before_pic=before_pic)


@app.route("/num_requests", methods=['GET'])
def num_requests():
    """
    Get total number of requests a user has made
    Parameters:
        uid: user id
    Returns:
        JSON object with number of requests
    """
    uid = request.values.get("uid")
    num_requests = Request.query.filter_by(user_id=uid).count()
    return jsonify(num_requests=num_requests)


@app.route("/new_shovel", methods=['POST'])
def new_shovel():
    """
    Add a shovel to the database 
    Parameters:
        uid: user id
        cid: corner id 
        after_pic: after_pic
    Returns:
        JSON object with user id, corner id, user name, before_pic, after_pic, start_time, end_time, and total_time
    """
    uid = request.form["uid"]
    cid = request.form["cid"]
    user = User.query.get(uid)
    corner = Corner.query.get(cid)
    before_pic_req = Request.query.filter_by(corner_id=cid, state=1).order_by(
        Request.time.desc()).first()
    if before_pic_req is None:
        return None
    else:
        before_pic = before_pic_req.before_pic
    after_pic = request.form["after_pic"]
    start = datetime.datetime.now()  # TODO
    end = datetime.datetime.now()  # TODO
    shovel = Shoveling(uid, cid, before_pic, after_pic, start, end)
    db.session.add(shovel)
    db.session.commit()
    # change state to 2 in requests table
    req = Request.query.filter_by(corner_id=cid).order_by(
        Request.time.desc()).first()
    req.state = 2
    db.session.commit()
    # add to point table
    points_entry = Point.query.filter_by(user_id=uid).first()
    points_entry.day_pts += 5  # TODO: figure out good # of points/ weights later
    points_entry.week_pts += 5
    points_entry.szn_pts += 5
    points_entry.after_pics.append(after_pic)
    db.session.commit()
    return jsonify(user=uid, corner=cid, username=user.name,
                   before_pic=before_pic, after_pic=after_pic, start_time=start,
                   end_time=end, total_time=0)


@app.route("/num_shovels", methods=['GET'])
def num_shovels():
    """
    Get total number of shovels a user has made
    Parameters:
        uid: user id
    Returns:
        JSON object with number of shovels
    """
    uid = request.values.get("uid")
    num_shovels = Shoveling.query.filter_by(user_id=uid).count()
    return jsonify(num_shovels=num_shovels)


@app.route("/num_points", methods=['GET'])
def num_points():
    """
    Get total number of points a user has 
    Parameters:
        uid: user id
    Returns:
        JSON object with number of points
    """
    uid = request.values.get("uid")
    num_points = Point.query.filter_by(user_id=uid).first().szn_pts
    return jsonify(points=num_points)


@app.route("/corner_pictures", methods=['GET'])
def corner_pictures():
    """
    Get before and after pictures of corners
    Parameters:
        request_id: request_id
    Returns:
        JSON object with before and after pictures of corner
    """
    request_id = request.values.get("request_id")
    #filter for requsts that have been shoveled but need to be validated
    req = Request.query.filter_by(id=request_id, state=2).order_by(
        Request.time.desc()).first()
    cid = req.corner_id
    shoveling = Shoveling.query.filter_by(corner_id = cid).order_by(
        Shoveling.start.desc()).first()
    return jsonify(before_pic=shoveling.before_pic, after_pic=shoveling.after_pic)


@app.route("/validate_shovel", methods=['POST'])
def validate_shovel():
    """
    Requester validates a shoveling
    Parameters:
        request_id: request_id
        vb: valid bit
    Returns:
        JSON object with requester id, shoveler id, corner id, and valid bit
    """
    request_id = request.form["request_id"]
    validate_bit = request.form["vb"]
    req = Request.query.filter_by(id=request_id, state=2).first()
    cid = req.corner_id
    shoveling = Shoveling.query.filter_by(corner_id=cid).order_by(
        Shoveling.start.desc()).first()
    uid_shoveler = shoveling.user_id
    # if requester says shoveling claim is not valid, take away points from shoveler + set state of request to 1
    uid_requester = req.user_id
    if validate_bit == '0':
        points_entry = Point.query.filter_by(user_id=uid_shoveler).first()
        points_entry.day_pts -= 5  # TODO: figure out good # of points/ weights later
        points_entry.week_pts -= 5
        points_entry.szn_pts -= 5
        db.session.commit()
        db.session.delete(shoveling)
        db.session.commit()
        req.state = 1
        db.session.commit()
        # TODO: after implementing subscriptions and notifications, need to re-notify ppl that this corner needs to be cleared
        return jsonify(requester=uid_requester, shoveler=uid_shoveler,
                       corner=cid, validate_bit=validate_bit)
    # if requester says shoveling claim is valid, set state of request to steady state, 0
    elif validate_bit == '1':
        req.state = 0
        db.session.commit()
        return jsonify(requester=uid_requester, shoveler=uid_shoveler,
                       corner=cid, validate_bit=validate_bit)



@app.route("/get_user_history", methods=['GET'])
def get_user_history():
    """
    Returns users history
    Returns:
        JSON objects with user ids, names, corner street1, corner street2, and time
    """
    # join User, Request and Corner
    join = db.session.query( \
        User.id.label("userid"),
        User.name.label("name"),
        Shoveling.start.label("time"),
        Corner.street1.label("street1"),
        Corner.street2.label("street2")) \
        .select_from(Shoveling) \
        .join(User, Shoveling.user_id == User.id) \
        .join(Corner, Shoveling.corner_id == Corner.id) \
        .order_by(User.id.asc(), Shoveling.start.desc()).all()

    result = []
    for row in join:
        row_json = {"uid": row.userid, "name": row.name,
                    "address": "" + row.street1 + " & " + row.street2,
                    "time": row.time.__str__()}
        result.append(row_json)
    return json.dumps(result, indent=2)


@app.route("/ppl_subscribed", methods=['GET'])
def get_ppl_subscribed():
    """
    Get all people subscribed to a corner
    Parameters:
        cid: corner id
    Returns:
        JSON object with corner id and all users subsrcibed to that id
    """
    cid = request.args.get('cid')
    users_subscribed = map(str, [s.user_id for s in
                                 Subscription.query.filter_by(corner_id=cid)])
    return jsonify(corner=cid, users_subscribed=users_subscribed)


@app.route("/subscribed_corners", methods=['GET'])
def get_subscribed_corners():
    """
    Get all corners that user is subscribed to
    Parameters:
        uid: user id
    Returns:
        JSON object with user id and all corner ids they are subscribed to
    """
    uid = request.args.get('uid')
    corners = map(str, [s.corner_id for s in
                        Subscription.query.filter_by(user_id=uid)])
    return jsonify(user=uid, corners=corners)


@app.route("/unsubscribe_corner", methods=['DELETE'])
def unsubscribe_corner():
    """
    Unsubscribe a user from a corner
    Parameters:
        uid: user id
        cid: corner id user will unsubscribe from
    Returns:
        JSON object with user id and corner id
    """
    uid = request.args.get('uid')
    cid = request.args.get('cid')
    subscription = Subscription.query.filter_by(user_id=uid,
                                                corner_id=cid).one()
    db.session.delete(subscription)
    db.session.commit()
    return jsonify(user=uid, corner=cid)


@app.route("/state", methods=['GET'])
def get_states():
    """
    Get state of a corner request
    Parameters:
        cid: corner id 
    Returns:
        JSON object with corner id and its state
    """
    cid = request.args.get('cid')
    statequery = Request.query.filter_by(corner_id=cid).order_by(
        Request.time.desc()).first()
    if statequery is not None:
        state = statequery.state
    else:
        state = 0
    return jsonify(corner=cid, state=state)


@app.route("/latest_requester_id", methods=['GET'])
def get_latest_requester_id():
    """
    Get user id who last requested a corner
    Parameters:
        cid: corner id 
    Returns:
        JSON object with corner id and user id of who last requested that corner
    """
    cid = request.args.get('cid')
    uid = Request.query.filter_by(corner_id=cid).order_by(
        Request.time.desc()).first().user_id
    return jsonify(corner=cid, user=uid)


@app.route("/latest_requester_name", methods=['GET'])
def get_latest_requester_name():
    """
    Get name of who last requested a corner
    Parameters:
        cid: corner id 
    Returns:
        JSON object with corner id and user name of who last requested that corner
    """
    cid = request.args.get('cid')
    uid = Request.query.filter_by(corner_id=cid).order_by(
        Request.time.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(corner=cid, user=uid, name=name)


@app.route("/states", methods=['GET'])
def get_state():
    """
    Get states of all corners
    Returns:
        JSON objects with corner id and state
    """
    reqs = Request.query.order_by(Request.time.desc()).all()
    st = []
    reqids = []
    for req in reqs:
        if req.corner_id not in reqids:
            st.append({"cid": req.corner_id, "state": req.state})
            reqids.append(req.corner_id)
    corners = Corner.query.all()
    for corner in corners:
        if corner.id not in reqids:
            st.append({"cid": corner.id, "state": 0})

    return json.dumps(st, indent=2)


@app.route("/get_corners_requests", methods=['GET'])
def get_c_requests():
    """
    Get all requests made on a specified corner
    Parameters:
        cid: corner id
    Returns:
        JSON objects with corner id and state
    """
    cid = request.args.get('cid')
    reqs = Request.query.filter_by(corner_id=cid).order_by(Request.time.desc(

    )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/get_requests", methods=['GET'])
def get_requests():
    """
    Get all requests of a given user
    Parameters:
        uid: user id
    Returns:
        JSON objects with request id, state, corner street1, corner street2, and time
    """
    uid = request.args.get('uid')
    reqs = Request.query.filter_by(user_id=uid).order_by(Request.time.desc(

    )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/get_requests_filter_state_cid", methods=['GET'])
def get_requests_filter_state_cid():
    """
    Get all requests at a given corner with a specific state
    Parameters:
        cid: corner id
        state: state of request
    Returns:
        JSON objects with request id, state, corner street1, corner street2, and time
    """
    cid = request.args.get('cid')
    state = request.args.get('state')
    reqs = Request.query.filter_by(corner_id=cid, state=state).order_by(
        Request.time.desc(

        )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/get_all_requests_not_shoveled", methods=['GET'])
def get_all_requests_not_shoveled():
    """
    Get all requests that have not been shoveled
    Returns:
        JSON objects with request id, state, corner street1, corner street2, and time of requests that haven't been shoveled
    """
    reqs = Request.query.filter_by(state=0).order_by(
        Request.time.desc(

        )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    reqs2 = Request.query.filter_by(state=1).order_by(
        Request.time.desc(

        )).all()
    for req in reqs2:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/get_requests_shoveled", methods=['GET'])
def get_requests_shoveled():
    """
    Get all requests that have been shoveled
    Returns:
        JSON objects with request id, state, corner street1, corner street2, and time of requests that have been shoveled
    """
    reqs = Request.query.filter_by(state=2).order_by(
        Request.time.desc(

        )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/get_requests_filter_state", methods=['GET'])
def get_requests_filter_state():
    """
    Get all requests made by a specific user that are at a specific state
    Parameters:
        uid: user id
        state: state of request
    Returns:
        JSON objects with request id, state, corner street1, corner street2, and time
    """
    uid = request.args.get('uid')
    state = request.args.get('state')
    reqs = Request.query.filter_by(user_id=uid, state=state).order_by(
        Request.time.desc(

        )).all()
    result = []
    for req in reqs:
        corner = Corner.query.filter_by(id=req.corner_id).first()
        result.append({'request_id': req.id,
                       'state': req.state,
                       'street1': corner.street1,
                       'street2': corner.street2,
                       'time': req.time.strftime("%m/%d/%Y, %H:%M:%S")})
    return json.dumps(result)


@app.route("/remove_request", methods=['DELETE'])
def remove_req():
    """
    Remove a request from the db    
    Parameters:
        req_id: request id
    Returns:
        JSON object with request id
    """
    req_id = request.args.get('id')
    req = Request.query.filter_by(id=req_id).one()
    db.session.delete(req)
    db.session.commit()
    return jsonify(request=req_id)


@app.route("/corner_street_names", methods=['GET'])
def get_corner_street_names():
    """
    Get the street names of a corner
    Parameters:
        cid: corner id
    Returns:
        JSON object with corner street1 and street2 
    """
    cid = request.args.get('cid')
    str1 = Corner.query.filter_by(id=cid).first().street1
    str2 = Corner.query.filter_by(id=cid).first().street2
    return jsonify(street1=str1, street2=str2)


@app.route("/corner_coordinates", methods=['GET'])
def get_corner_coordinates():
    """
    Get latitude and longitude of a corner
    Parameters:
        cid: corner id
    Returns:
        JSON objects with corner id, latitude, and longitude 
    """
    cid = request.args.get('cid')
    lat = Corner.query.filter_by(id=cid).lat
    lon = Corner.query.filter_by(id=cid).lon
    return jsonify(corner=cid, lat=lat, lon=lon)


@app.route("/day_leader_id", methods=['GET'])
def get_day_leader_id():
    """
    Get ID of leader of the day
    Returns:
        JSON object with user id 
    """
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    return jsonify(user=uid)


@app.route("/day_leader_name", methods=['GET'])
def get_day_leader_name():
    """
    Get name of leader of the day
    Returns:
        JSON object with user name 
    """
    uid = Point.query.order_by(Point.day_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name=name)


@app.route("/week_leader_id", methods=['GET'])
def get_week_leader_id():
    """
    Get ID of leader of the week
    Returns:
        JSON object with user id 
    """
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    return jsonify(user=uid)


@app.route("/week_leader_name", methods=['GET'])
def get_week_leader_name():
    """
    Get name of leader of the week
    Returns:
        JSON object with user name 
    """
    uid = Point.query.order_by(Point.week_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name=name)


@app.route("/szn_leader_id", methods=['GET'])
def get_szn_leader_id():
    """
    Get ID of leader of the season
    Returns:
        JSON object with user id 
    """
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    return jsonify(user=uid)


@app.route("/szn_leader_name", methods=['GET'])
def get_szn_leader_name():
    """
    Get name of leader of the season
    Returns:
        JSON object with user name 
    """
    uid = Point.query.order_by(Point.szn_pts.desc()).first().user_id
    name = User.query.filter_by(id=uid).first().name
    return jsonify(name=name)


@app.route("/top_day_leader_ids", methods=['GET'])
def get_top_day_leader_ids():
    """
    Get top users of the day
    Parameters:
        num_users: number of top users
    Returns:
        JSON objects of num_users top users
    """
    x = request.args.get('num_users')
    top_users = map(str, [u.user_id for u in
                          Point.query.order_by(Point.day_pts.desc())][:int(x)])
    return jsonify(top_users=' '.join(top_users))


@app.route("/top_week_leader_ids", methods=['GET'])
def get_top_week_leader_ids():
    """
    Get top users of the week
    Parameters:
        num_users: number of top users
    Returns:
        JSON objects of num_users top users
    """
    x = request.args.get('num_users')
    top_users = map(str, [u.user_id for u in
                          Point.query.order_by(Point.week_pts.desc())][:int(x)])
    return jsonify(top_users=' '.join(top_users))


@app.route("/top_szn_leader_ids", methods=['GET'])
def get_top_szn_leader_ids():
    """
    Get top users of the season
    Parameters:
        num_users: number of top users
    Returns:
        JSON objects of num_users top users
    """
    x = request.args.get('num_users')
    top_users = map(str, [u.user_id for u in
                          Point.query.order_by(Point.szn_pts.desc())][:int(x)])
    return jsonify(top_users=' '.join(top_users))


@app.before_request
def sanitize():
     name = request.values.get("name")
     google_id = request.values.get("google_id")
     url = request.values.get("photourl")
     tk = request.values.get("token")
     cid = request.values.get("cid")
     uid = request.values.get("uid")
     uid_requester = request.values.get("uid_requester")
     uid_shoveler = request.values.get("uid_shoveler")

     if name: #names can have various characters so it's easier to just escape all of them than to accidently have somebody's real name not work
         request.values.set("name",re.escape("name"))

     if google_id and not(google_id.isdigit()):
         return 404, "google id must be a number"

     if url:
         parsed = urlparse(photourl) #checking to make sure the file is coming from google
         request.values.set("photourl", re.escape("name"))
         if not("googleusercontent.com" in parsed.netloc):
             return 404, "photo must come from googleusercontent.com"

     if tk and not(tk.isalnum()):
         return 404, "token must be alphanumeric"

     if cid and not(cid.isdigit()):
         return 404, "id must be a number"

     if uid and not(uid.isdigit()):
         return 404, "id must be a number"

     if uid_requester and not(uid_requester.isdigit()):
         return 404, "id ust be a number"

     if uid_shoveler and not(uid_shoveler.isdigit()):
         return 404, "id ust be a number"


# helper functions
def get_num_users():
    """
    Get number of users
    Returns:
        Number of total users
    """
    users = User.query.all()
    return len(users)


@app.route("/get_user", methods=['GET'])
def get_user():
    """
    Get information on a specific user 
    Parameters:
        id: id of user
    Returns:
        JSON object with user id, google id, name, photourl, token, points for day, week, and season, and list of after pics
    """
    id = request.values.get('id')
    user = User.query.filter_by(id=id).first()
    uid = user.id
    pnt = Point.query.filter_by(user_id=uid).first()
    return jsonify(user_id=uid, google_id=user.google_id, name=user.name,
                   photourl=user.photourl, token=user.token, day_pts=
                   pnt.day_pts, week_pts=pnt.week_pts, szn_points=
                   pnt.szn_pts, after_pics=pnt.after_pics)


@app.route("/get_all_users", methods=['GET'])
def get_all_users():
    """
    Get information on all users
    Returns:
        JSON objects with user id, google id, name, photourl, token, points for day, week, and season, and list of after pics
    """
    us = []
    users = User.query.all()
    for u in users:
        uid = u.id
        pnt = Point.query.filter_by(user_id=uid).first()
        us.append({"user_id": uid, "google_id": u.google_id, "name": u.name,
                   "photourl": u.photourl, "token": u.token,
                   "day_pts": pnt.day_pts, "week_pts": pnt.week_pts,
                   "szn_pts": pnt.szn_pts})
    return jsonify(users=us)


@app.before_request
def authenticate():
     if request.path[0:15]=="/register_user":
         return None #registering new users is special and should be treated as such
     authenticated=False
     print(request.values)
     id = request.values.get('id')
     token = request.values.get('token')
     usr = User.query.get(id)
     if usr is None : #if user doesn't exist
         return "User doesn't exist", 404
     if usr.token == token:
         authenticated=True
     if authenticated:
         return None
     else:
         return "User authentication token doesn't match id", 401

@app.before_request
def sanitize():
    name = request.values.get("name")
    google_id = request.values.get("google_id")
    url = request.values.get("photourl")
    tk = request.values.get("token")
    cid = request.values.get("cid")
    uid = request.values.get("uid")
    uid_requester = request.values.get("uid_requester")
    uid_shoveler = request.values.get("uid_shoveler")

    if name: #names can have various characters so it's easier to just escape all of them than to accidently have somebody's real name not work
        request.values.set("name",re.escape("name"))

    if google_id and not(google_id.isdigit()):
        return 404, "google id must be a number"

    if url:
        parsed = urlparse(photourl) #checking to make sure the file is coming from google
        request.values.set("photourl", re.escape("name"))
        if not("googleusercontent.com" in parsed.netloc):
            return 404, "photo must come from googleusercontent.com"

    if cid and not(cid.isdigit()):
        return 404, "id must be a number"

    if uid and not(uid.isdigit()):
        return 404, "id must be a number"

    if uid_requester and not(uid_requester.isdigit()):
        return 404, "id ust be a number"

    if uid_shoveler and not(uid_shoveler.isdigit()):
        return 404, "id ust be a number"


#helper functions
def get_num_users():
    """
    Get number of users
    Returns:
        Number of total users
    """
    users = User.query.all()
    return len(user)

def get_user_with_points(id):
    query = db.session.query(User).join(User.point).filter(User.id ==id)
    return query.all()

def get_user_with_points_alt(id):
    query = db.session.query(
    User.id,
    User.user_id,
    User.name,
    User.photourl,
    Point.day_pts,
    Point.week_pts,
    Point.szn_pts)
    join = query.join(Point.user_id == User.id).filter(User.id == id)
    return query.all()



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
