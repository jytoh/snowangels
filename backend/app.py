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
# db.init_app(app)
db.create_all()
db.session.commit()
# initialize database migration management
migrate = Migrate(app, db)





@app.route('/')
def index():
    from models import User
    print(User.query.all())
    return 'works'

@app.route('/register', methods=['POST'])
def register_user():
    from models import User
    name = request.form.get('name')
    usr = User(name)
    db.session.add(usr)
    db.session.commit()

if __name__ == "__main__":
    app.run()

