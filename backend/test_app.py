import requests, pytest, random


# def test_add_corners():
#     r=requests.post('https://snowangels-api.herokuapp.com'
#                 '/create_corners_from_filename',data={'filename':'Ints2019.xls',
#                                                       'should_clear': "true"})

# def test_num_corners():
#     r = requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
#     assert len(r.json()) == 505

r = requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
cid = int(r.json()[0].get('key'))

def test_reg_user():
    gid = (random.randint(1, 1000))
    r = requests.post('https://snowangels-api.herokuapp.com/register_user',
                     data={'name': "Avinash", "google_id":gid,
                           "photourl":" ",
                           "token":" "})

    assert r.ok

def test_new_shovel_and_request():
    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={ "uid": 1, "cid": cid, "after_pic": "aaa"})
    assert r.ok
    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                  data={'cid': cid, 'uid': 1, 'after_pic': 'aaa'})
    assert r.ok

def test_corner_st_names():
    r = requests.get('https://snowangels-api.herokuapp.com'
                     '/corner_street_names', data={'cid'})
    assert r.ok
    assert len(r.json()) > 0




#r=requests.get('https://snowangels-api.herokuapp.com/top_day_leader_ids')