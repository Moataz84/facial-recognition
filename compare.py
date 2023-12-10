from face_recognition import load_image_file, face_encodings, compare_faces
from os import getcwd, listdir, makedirs
from os.path import basename, splitext, dirname, exists
from urllib.request import urlopen
from uuid import uuid4
import json

def saveImage(dataURI):
  dir = dirname("tmp/")
  if not exists(dir):
    makedirs(dir)

  file_path = f"tmp/{uuid4()}.jpg"
  response = urlopen(dataURI)
  with open(file_path, "wb") as file:
    file.write(response.file.read())
  return file_path

def findSimilar(image_path):
  index = 0
  known_encodings = []
  dir = f"{getcwd()}\imgs"
  image_names = list(map(lambda path: f"imgs/{path}", listdir(dir)))

  query_image = face_encodings(load_image_file(image_path))
  if len(query_image) == 0:
    return False
  query_image_encoding = query_image[0]

  for i in image_names:
    image = load_image_file(i)
    image_encoding = face_encodings(image)[0]
    known_encodings.append(image_encoding)

  for encoding in known_encodings:
    result = compare_faces([query_image_encoding], encoding, tolerance=0.55)
    if result[0]:
      filename = image_names[index]
      id = splitext(basename(filename))[0]
      with open("data.json", "r") as json_file:
        people = json.load(json_file)
        for person in people:
          if person.get("id") == int(id):
            first = person.get("first")
            last = person.get("last")
            return f"{first} {last}"    
    index += 1
  return False