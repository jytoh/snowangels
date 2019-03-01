import os

from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy



database_uri = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
    dbuser='user',
    dbpass='pass',
    dbhost='localhost',
    dbname='snowangels_db'
)

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=database_uri,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

# initialize the database connection
db = SQLAlchemy(app)

# initialize database migration management
migrate = Migrate(app, db)

@app.route('/', methods=['GET'])
def index():
    from .Models.models import User

    users = User.query.all()
    return users

@app.route('/register', methods=['POST'])
def register_user():
    from .Models.models import User
    name = request.form.get('name')

    user = User(name)
    db.session.add(user)
    db.session.commit()


