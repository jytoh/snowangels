import requests, pytest


r=requests.post('https://snowangels-api.herokuapp.com/create_corners_from_filename',data={'filename':'Ints2019 copy.xls'})
#r=requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
#r=requests.get('https://snowangels-api.herokuapp.com/register/testuser', data ={})
#r=requests.post('https://snowangels-api.herokuapp.com/new_shovel', data ={'cid':'10', 'uid':'1', 'after_pic':'aaa'})
#r=requests.get('https://snowangels-api.herokuapp.com/')
#r=requests.get('https://snowangels-api.herokuapp.com/top_day_leader_ids')