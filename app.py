from flask import Flask, render_template, request, jsonify
from compare import saveImage, findSimilar
from os import remove

app = Flask(__name__, static_folder="public")

@app.get("/")
def index():
  return render_template("index.html")

@app.post("/api/send-image")
def send_image():
  data = request.get_json()
  dataURI = data.get("dataUri")
  file = saveImage(dataURI)
  result = findSimilar(file)
  remove(file)
  if (result == False):
    return jsonify({"name": "No Match"})
  return jsonify({"name": result})

if __name__ == "__main__":
  app.run(debug=True, port=3000, host="0.0.0.0", ssl_context=("SSL/cert.pem", "SSL/key.pem"))