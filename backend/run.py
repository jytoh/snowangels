import os
from src.app import app

env_name = os.getenv('FLASK_ENV')
# run app
app.run()