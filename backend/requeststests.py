import requests


#LOCALHOST TESTS
#r=requests.post('http://127.0.0.1:5000/create_corners_from_filename',data={'filename':'Ints2019 copy.xls'})
#r=requests.get('http://127.0.0.1:5000/get_all_corners')
#r=requests.get('http://127.0.0.1:5000/register/testuser', data ={})
#r=requests.post('http://127.0.0.1:5000/new_request', data ={'cid':'10', 'uid':'1', 'before_pic':'aaa'})
#r=requests.post('http://127.0.0.1:5000/new_shovel', data ={'cid':'10', 'uid':'1', 'after_pic':'aaa'})
#r=requests.get('http://127.0.0.1:5000/')
r=requests.get('http://127.0.0.1:5000/get_all_users')

#r=requests.get('http://127.0.0.1:5000/top_day_leader_ids')



#HEROKU TESTS
#IMPORTANT: restart app.py if creating corners
#r=requests.post('https://snowangels-api.herokuapp.com/create_corners_from_filename',data={'filename':'Ints2019 copy.xls'})
#r=requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
#r=requests.get('https://snowangels-api.herokuapp.com/register/testuser', data ={})
#r=requests.post('https://snowangels-api.herokuapp.com/new_shovel', data ={'cid':'10', 'uid':'1', 'after_pic':'aaa'})
#r=requests.get('https://snowangels-api.herokuapp.com/')
#r=requests.get('https://snowangels-api.herokuapp.com/top_day_leader_ids')

#New request TEST
#r=requests.post('https://snowangels-api.herokuapp.com/new_request', data ={'cid':'10', 'uid':'1', 'before_pic':'aaa'})
#r=requests.post('https://snowangels-api.herokuapp.com/new_request',data={'cid':'5', 'uid':'2', 'before_pic':'bbb'})

#New User TEST
#r=requests.get('https://snowangels-api.herokuapp.com/get_user_history')
#r=requests.post('http://127.0.0.1:5000/add_user_history')
r=requests.get('http://127.0.0.1:5000/get_user_history')

#User History TESTS


print(r.content)
