from flask import Flask,render_template, request, jsonify, make_response, url_for,redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from sqlalchemy import Column, Integer,String, Float, Boolean, Date
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from PIL import Image
from io import BytesIO
import base64
import pickle
import numpy as np
import json
import git
import os
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import re 
import datetime
import boto3

app = Flask(__name__)
s3 = boto3.client('s3')
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///' + os.path.join(basedir,'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SECRET_KEY']='secret-key'
regex = '^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$'

def token_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token=None
        if 'x-access-tokens' in request.headers:
            token=request.headers['x-access-tokens']
        if not token:
            return jsonify(message='Token is missing'),401
        try:
            data=jwt.decode(token, app.config['SECRET_KEY'])
            current_user=User.query.filter_by(public_id=data['public_id']).first()
        except:
            return jsonify(message='Token is invalid'),401

        return f(current_user, *args, **kwargs)
    return decorated

db=SQLAlchemy(app)
@app.cli.command('dbCreate')
def db_create():
    db.create_all()
    print('Database created')

@app.cli.command('dbDrop')
def db_drop():
    db.drop_all()
    print('Database Dropped')

@app.cli.command('dbSeed')
def db_seed():
    hashed_password=generate_password_hash('password', method='sha256')
    testUser=User(firstName='Wrist',
                    lastName='Action',
                             email='wristaction@gmail.com',
                             password=hashed_password,
                             public_id=str(uuid.uuid4())
                             )
    db.session.add(testUser)
    db.session.commit()
    print('Seeded')

class User(db.Model):
    id=Column(Integer, primary_key=True)
    public_id=Column(String(50), unique=True)
    firstName=Column(String(50))
    lastName=Column(String(50))
    email=Column(String(50), unique=True)
    password=Column(String(50))

class Incidents(db.Model):
    id=Column(Integer, primary_key=True)
    user_id=Column(String(50), unique=False)
    date = Column(String(50))
    classification = Column(String(50))
    image_url = Column(String)
    session_id = Column(String)
    long = Column(Float)
    lat = Column(Float)

class Session(db.Model):
    id = Column(Integer, primary_key=True)
    session_id = Column(String(50), unique=True)
    user_id=Column(String(50), unique=False)
    startDate = Column(String(50))
    endDate = Column(String(50))
    status = Column(String(50))
    numOfIncidents = Column(Integer)
    image_url  = Column(String)
    coords = Column(String)

    
@app.route("/api/validateToken", methods=['GET'])
def validateToken():
    if not request.headers.get('x-access-tokens'):
        return {'message': 'No token provided'},400
    try:
        data=jwt.decode(request.headers.get('x-access-tokens'), app.config['SECRET_KEY'])
        current_user=User.query.filter_by(public_id=data['public_id']).first()
        return {'valid': True}
    except:
        return {'valid': False}

@app.route('/api/register', methods=['POST'])
def register():
    data=request.json
    emailUser=data['email']

    test=User.query.filter_by(email=emailUser).first()

    if test:
        return jsonify(message='A user with this email already exists.'), 409
    if data['firstName']=="":
        return jsonify(message="Enter a first name")
    if data['lastName']=="":
        return jsonify(message="Enter a last name")
    if not re.search(regex,data['email']):
        return jsonify(message="Invalid email")
    if len(data['password'])<8:
        return jsonify(message="Password must be more then 8 characters")
    if data['password'] != data['confirmPassword']:
        return jsonify(message='Passwords do not match')
    else:
        hashed_password=generate_password_hash(data['password'], method='sha256')
        new_user=User(
                             public_id=str(uuid.uuid4()),
                             firstName=data['firstName'],
                             lastName=data['lastName'],
                             email=data['email'],
                             password=hashed_password
                             )
        db.session.add(new_user)
        db.session.commit()
        return jsonify(message='User Created'),201

@app.route('/api/login', methods=['POST'])
def login():
    login=request.json
    user=User.query.filter_by(email=login['email']).first()

    if not user:
        return jsonify(message='A user with this email does not exist.')
    if check_password_hash(user.password,login['password']):
        token=jwt.encode({'public_id': user.public_id,'exp':datetime.datetime.utcnow()+datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'])
        return jsonify(token=token.decode('utf-8'))
    else:
        return jsonify(message='Your email or password is incorrect'),401
#Todo: Deprecate this endpoint once we implement the model, this is purley for testing
@app.route('/api/distraction', methods=['POST'])
@token_required
def analysis(current_user):
    json_data = request.get_json()
    now = datetime.datetime.now()

    user_data={}
    user_data['public_id']=current_user.public_id

    newTrackData=Incidents(
    user_id=user_data['public_id'],
    date = now.isoformat(),
    classification = json_data['classification'],
    image_url = json_data['image_url'],
    session_id = json_data['session_id'])

    db.session.add(newTrackData)
    db.session.commit()

    return jsonify(message='Data Added'),201
@app.route('/api/getIncidents', methods=['GET'])
@token_required
def getIncidents(current_user):
    user_data = {}
    user_data['public_id'] = current_user.public_id

    userIncidents = Incidents.query.filter_by(user_id = user_data['public_id']).all()

    output = []

    if userIncidents:
        for data in userIncidents:
            incidentData = {}
            incidentData['session_id'] = data.session_id
            incidentData['user_id'] = data.user_id
            incidentData['date'] = data.date
            incidentData['classification'] = data.classification
            incidentData['uri'] = data.image_url
            incidentData['long'] = data.long
            incidentData['lat'] = data.lat
           
            output.append(incidentData)
        return jsonify(incidentData = output)
    else:
        return jsonify(message= "You do not have session data")
@app.route('/api/getIncidents/<sessionId>', methods = ["GET"])
@token_required
def getIncident(current_user, sessionId):

    user_data={}
    user_data['public_id']=current_user.public_id

    userIncidents = Incidents.query.filter_by(user_id = user_data['public_id'], session_id=sessionId).all()

    output = []

    if userIncidents:
        for data in userIncidents:
            incidentData = {}
            incidentData['session_id'] = data.session_id
            incidentData['user_id'] = data.user_id
            incidentData['date'] = data.date
            incidentData['classification'] = data.classification
            incidentData['uri'] = data.image_url
            incidentData['long'] = data.long
            incidentData['lat'] = data.lat
           
            output.append(incidentData)
        return jsonify(incidentData = output)
    else:
        return jsonify(message= "You do not have session data")

@app.route('/api/addIncident', methods = ["POST"])
@token_required
def addIncident(current_user):
    
    json_data = request.get_json()
    now = datetime.datetime.now()
    BUCKET = 'driveraid'
    # Decode base64 strin
    image_data = base64.b64decode(json_data['image'])

    # Generate a unique file name based on current timestamp
    now = datetime.datetime.now()
    file_name = 'images/'+ current_user.public_id + now.strftime("%Y-%m-%d %H:%M:%S") + ".jpg"

    # Upload image data to S3
    s3.put_object(Bucket=BUCKET, Key=file_name, Body=image_data, ContentType='image/jpeg', ACL='public-read')

    # Return public URL of the uploaded image
    file_url = f"https://{BUCKET}.s3.amazonaws.com/{file_name}"
    
    user_data={}
    user_data['public_id']=current_user.public_id

    newTrackData=Incidents(
    user_id=user_data['public_id'],
    date = now.isoformat(),
    classification = json_data['classification'],
    image_url = file_url,
    session_id = json_data['session_id'],
    long = json_data['long'],
    lat = json_data['lat'])

    db.session.add(newTrackData)
    db.session.commit()

    return jsonify(message="Added Incident"),201

@app.route('/api/totaldistractions', methods=['GET'])
@token_required
def getCount(current_user):
    user={}
    user['public_id']=current_user.public_id

    count =Incidents.query.filter_by(user_id=user['public_id']).count()

    return jsonify(message=count), 201

@app.route('/api/classifydistractions', methods = ['GET'])
@token_required
def mapDistractions(current_user):
    user={}
    user['public_id']=current_user.public_id

    userDataAll=Incidents.query.filter_by(user_id=user['public_id']).all()
    output=[]
    user_data={}

    if userDataAll:
        for dist in userDataAll:
            if dist.classification not in user_data:
                user_data[dist.classification]= 1
            else:
                user_data[dist.classification]+= 1
        output.append(user_data)
        return jsonify(userData=output)
    else:
        return jsonify(message="No Distraction Data")
    
# @app.route('/api/predict', methods = ['POST'])
# @token_required
# def predictImage(current_user):
#     data = request.json
#     image = Image.open(BytesIO(base64.b64decode(data['image'])))
#     model, device = loadModel()
#     out = predict(model, image, device)
#     res = out.split()

#     return jsonify({
#                     "classification": getClassficiations(res[0]),
#                     "confidence": round(float(res[1]), 2)
#                     })
@app.route('/api/updateCoords', methods = ['PUT'])
@token_required
def updateCoords(current_user):
    data = request.json
    sessionId = data['sessionId']
    user_data={}
    user_data['public_id']=current_user.public_id
    userSession = Session.query.filter_by(user_id = user_data['public_id'], session_id=sessionId).first()
    if userSession:
        list_coords = ""
        if userSession.coords:
            list_coords = userSession.coords
            userSession.coords = list_coords + ", " + deserializeCoords(data['coords'])
            print(list_coords)
        else:
            userSession.coords = deserializeCoords(data['coords'])

        db.session.commit()
        return {"message":"Updated coords"}
    else:
        return {"message": "No session found"}
@app.route('/api/createSession', methods = ['POST'])
@token_required
def createSession(current_user):
    now = datetime.datetime.now()
    data = request.json

    user_data={}
    user_data['public_id']=current_user.public_id
    session = str(uuid.uuid4())

    newSession=Session(
    user_id=user_data['public_id'],
    session_id = session,
    startDate = now.isoformat(),
    endDate = "n/a",
    status = "ACTIVE",
    image_url  = data['image'],
    numOfIncidents=0)

    db.session.add(newSession)
    db.session.commit()

    return jsonify(message=session),201

@app.route('/api/endSession/<sessionId>', methods = ['GET'])
@token_required
def endSession(current_user, sessionId):
    endTime = datetime.datetime.now()

    user_data={}
    user_data['public_id']=current_user.public_id

    userSession = Session.query.filter_by(user_id = user_data['public_id'], session_id=sessionId).first()
    incidentCount = Incidents.query.filter_by(user_id = user_data['public_id'], session_id=sessionId).count()

    if userSession:
        if userSession.status == "ACTIVE":
            userSession.status = "COMPLETED"
            userSession.endDate = endTime.isoformat()
            userSession.numOfIncidents = incidentCount
            db.session.commit()
            return jsonify(success="This session has completed")

        else:
            return jsonify(message="This session has already been completed")
    else:
        return jsonify(message="This session does not exist")
    
@app.route('/api/getSessions', methods = ['GET'])
@token_required
def getSession(current_user):
    user_data= {}
    user_data['public_id'] = current_user.public_id

    userSession = Session.query.filter_by(user_id = user_data['public_id']).all()

    output = []

    if userSession:
        for data in userSession:
            sessionData = {}
            sessionData['session_id'] = data.session_id
            sessionData['user_id'] = data.user_id
            sessionData['startDate'] = data.startDate
            sessionData['endDate'] = data.endDate
            sessionData['status'] = data.status
            sessionData['numOfIncidents'] = data.numOfIncidents
            sessionData['image_url']= data.image_url
            if data.coords:
                sessionData['coords'] = serializeCoords(data.coords)


            output.append(sessionData)
        return jsonify(sessionData = output)
    else:
        return jsonify(message= "You do not have session data")
    
@app.route('/api/getSession/<sessionId>', methods = ['GET'])
@token_required
def viewSession(current_user, sessionId):
    user_data= {}
    user_data['public_id'] = current_user.public_id

    userSession = Session.query.filter_by(user_id = user_data['public_id'],  session_id=sessionId).first()

    if userSession:
        sessionData = {}
        sessionData['session_id'] = userSession.session_id
        sessionData['user_id'] = userSession.user_id
        sessionData['startDate'] = userSession.startDate
        sessionData['endDate'] = userSession.endDate
        sessionData['status'] = userSession.status
        sessionData['numOfIncidents'] = userSession.numOfIncidents
        sessionData['image_url ']= userSession.image_url 
        if userSession.coords:
            sessionData['coords'] = serializeCoords(userSession.coords)

        
        return jsonify(userSession = sessionData)
    else:
        return jsonify(message= "Not a valid session")
def deserializeCoords(coords):
     return ', '.join([f"{x['latitude']}:{x['longitude']}" for x in coords])
def serializeCoords(coord_string):
    pairs = coord_string.split(', ')
    return [{'latitude': float(pair.split(':')[0]), 'longitude': float(pair.split(':')[1])} for pair in pairs]

@app.route('/deploy_server', methods=['POST'])
def deployServer():
    if request.method != 'POST':
        return 'OK'
    else:
        abort_code = 418
        if 'X-Github-Event' not in request.headers:
            abort(abort_code)
        if 'X-Github-Delivery' not in request.headers:
            abort(abort_code)
        if not request.is_json:
            abort(abort_code)
        if 'User-Agent' not in request.headers:
            abort(abort_code)
        ua = request.headers.get('User-Agent')
        if not ua.startswith('GitHub-Hookshot/'):
            abort(abort_code)

        event = request.headers.get('X-GitHub-Event')
        if event != "push":
            return json.dumps({'msg': "Wrong event type"})
        
        payload = request.get_json()
        if payload is None:
            print('Deploy payload is empty: {payload}'.format(
                payload=payload))
            abort(abort_code)
        
        if payload['ref'] != 'refs/heads/main':
            return json.dumps({'msg': 'Not main; ignoring'})

        repo = git.Repo('./fydp-app')
        origin = repo.remotes.origin
        repo.create_head('main', origin.refs.main).set_tracking_branch(origin.refs.main).checkout()
        pull_info = origin.pull()

        commit_hash = pull_info[0].commit.hexsha
        build_commit = f'build_commit = "{commit_hash}"'
        print(f'{build_commit}')
        return 'Updated server to commit {commit}'.format(commit=commit_hash)
@app.route('/')
def main_page():
    return 'DriveGuard Server Running.'
if __name__ == '__main__':
    app.run(debug=True)
