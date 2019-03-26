import requests

#r=requests.post('http://127.0.0.1:5000/create_corners_from_filename',data={'filename':'Ints2019.xls'})
r=requests.get('http://127.0.0.1:5000/get_all_corners')
#r=requests.get('http://127.0.0.1:5000/register/testuser', data ={})
#r=requests.post('http://127.0.0.1:5000/new_request', data ={'cid':'10', 'uid':'1', 'before_pic':'aaa'})
#r=requests.post('http://127.0.0.1:5000/new_shovel', data ={'cid':'10', 'uid':'1', 'after_pic':'aaa'})
#r=requests.get('http://127.0.0.1:5000/')
#r=requests.get('http://127.0.0.1:5000/top_day_leader_ids')


print(r.content)
