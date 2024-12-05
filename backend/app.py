from flask import Flask, jsonify, request, send_from_directory
from database import create_connection

app = Flask(__name__, static_folder="../frontend", static_url_path="")

@app.route('/')
def serve_html():
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
