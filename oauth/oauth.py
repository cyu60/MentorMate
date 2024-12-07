import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import schedule
import time
import subprocess

# The API scopes required
SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 
          'https://www.googleapis.com/auth/drive', 
          "https://www.googleapis.com/auth/gmail.modify"]

# Path to the credentials file
creds = None
def job():
    global creds
    CLIENT_ID = '#########################.apps.googleusercontent.com' 
    CLIENT_SECRET = '#########################'  
    REDIRECT_URI = 'http://localhost:/' 

    # Default redirect URI (can use a custom one)
    # Check if the token already exists
    if os.path.exists('token.pkl'):
        with open('token.pkl', 'rb') as token:
            creds = pickle.load(token)

    # If credentials are invalid or not found, start the OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())  # Refresh token if expired
        else:
            client_config = {
                "installed": {
                "client_id": CLIENT_ID,
                "project_id": "gmail-pipeline",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": CLIENT_SECRET,
                "redirect_uris": [REDIRECT_URI]
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=0)  # or any available port
    

        with open('token.pkl', 'wb') as token:
            pickle.dump(creds, token)

    if creds and creds.token:

        access_token = creds.token
        print("Token is valid and exists.")

        access_token_path = '../oauth/access_token.txt'
        if os.path.exists('token.pkl'):
            #print("token.pkl exists!")
            with open('token.pkl', 'rb') as token_file:

                ##token_txt.write(creds.token)
                creds = pickle.load(token_file)
                print(f"Credentials loaded: {creds}") 
                print(f"Token: {creds.token}") 
            with open(access_token_path, 'w') as token_txt:
                token_txt.write(creds.token)
                #print(f"Successfully wrote to {access_token_path}")

while True:
    job()
    time.sleep(60)