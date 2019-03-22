import requests

#r=requests.post('http://127.0.0.1:5000/create_corners_from_filename',data={'filename':'Ints2019.xls'},)
r=requests.get('http://127.0.0.1:5000/')
print(r.content)
