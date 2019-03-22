import requests

r=requests.post('http://127.0.0.1:5000/create_corners_from_filename',data={'filename':'Ints2019.xls'},)
#r=requests.get('http://127.0.0.1:5000/')
r=requests.get('http://127.0.0.1:5000/get_all_corners')
print(r.content)
