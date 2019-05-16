import requests, pytest, random

'''
This suite of unit tests evaluates the main functionality of the backend, 
primarily the request, shoveling, and validation logic. The remaining backend routes are very simple and can more easily be tested for functionality by interacting with the UI and thus we leave their corresponding tests as part of user-end evaluation
'''


# def test_add_corners():
#     r=requests.post('https://snowangels-api.herokuapp.com'
#                 '/create_corners_from_filename',data={'filename':'Ints2019.xls',
#                                                       'should_clear': "true"})

def test_num_corners():
    r = requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
    assert len(r.json()) == 505


r = requests.get('https://snowangels-api.herokuapp.com/get_all_corners')
cid = random.randint(1, 505)


def test_register_user():
    # --------------------------------------------------------------
    # Test that registering a user works given valid information
    # --------------------------------------------------------------
    gid = (random.randint(1, 1000))
    r = requests.post('https://snowangels-api.herokuapp.com/register_user',
                      data={'name': "Avinash", "google_id": gid,
                            "photourl": " ",
                            "token": " "})

    assert r.ok and requests.get(
        'https://snowangels-api.herokuapp.com/get_user?id=1').json().get(
        'user_id') == 1

    # --------------------------------------------------------------
    # Test that registering a user fails given invalid information
    # --------------------------------------------------------------
    r = requests.post('https://snowangels-api.herokuapp.com/register_user',
                      data={'name': "AvinashT", "google_id": gid,
                            "photourl": " ",
                            })

    num_users = len(requests.get(
        'https://snowangels-api.herokuapp.com/get_all_users'
        '').json().get('users'))
    assert (not r.ok) and (not requests.get(
        'https://snowangels-api.herokuapp.com/get_user?id=%d' % (
                num_users + 1)).ok)


def test_req_shvl_val_goodparams():
    # --------------------------------------------------------------
    # Test that requesting a corner works properly in valid context
    # --------------------------------------------------------------
    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={"uid": 1, "cid": cid, "after_pic": "aaa"})
    assert r.ok and requests.get('https://snowangels-api.herokuapp.com'
                                 '/get_corners_requests?cid=%d' % cid).json()[
        0].get(
        'state') == 1

    r = requests.get('https://snowangels-api.herokuapp.com'
                     '/latest_requester_id?cid=%d' % cid)
    assert r.ok and r.json().get('user') == 1

    r = requests.get('https://snowangels-api.herokuapp.com'
                     '/get_corners_requests?cid=%d' % cid)
    assert r.ok
    rid = r.json()[0].get('request_id')

    # --------------------------------------------------------------
    # Test that claiming a shoveling works properly in valid context
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                      data={'cid': cid, 'uid': 1, 'after_pic': 'aaa'})
    assert r.ok and requests.get('https://snowangels-api.herokuapp.com'
                                 '/get_corners_requests?cid=%d' % cid).json()[
        0].get(
        'state') == 2

    # --------------------------------------------------------------
    # Test that validating a shoveling works properly in valid context
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/validate_shovel',
                      data={'request_id': rid, 'vb': 1})
    assert r.ok and requests.get('https://snowangels-api.herokuapp.com'
                                 '/get_corners_requests?cid=%d' % cid).json()[
        0].get(
        'state') == 0


def test_request_shvl_val_badparams():
    bad_cid = (cid + 1) % 505

    # --------------------------------------------------------------
    # Test that making a request fails if invalid user id
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={"uid": -1, "cid": bad_cid, "after_pic": "aaa"})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % bad_cid).json(

    )) == 0

    # --------------------------------------------------------------
    # Test that making a request fails if invalid corner id
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={"uid": 1, "cid": 10000, "after_pic": "aaa"})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % 10000).json(

    )) == 0

    # --------------------------------------------------------------
    # Test that claiming shoveling fails if invalid user id
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                      data={'cid': bad_cid, 'uid': -1, 'after_pic': 'aaa'})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % bad_cid).json(

    )) == 0

    # --------------------------------------------------------------
    # Test that claiming shoveling fails if invalid corner id
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                      data={'cid': 10000, 'uid': 1, 'after_pic': 'aaa'})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % 10000).json(

    )) == 0

    # --------------------------------------------------------------
    # Test that making a request fails if already requested
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={"uid": 1, "cid": bad_cid, "after_pic": "aaa"})
    assert r.ok
    r = requests.post('https://snowangels-api.herokuapp.com/new_request',
                      data={"uid": 1, "cid": bad_cid, "after_pic": "aaa"})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % bad_cid).json(

    )) == 1

    # --------------------------------------------------------------
    # Test that claiming shoveling fails if already shoveled but not validated
    # --------------------------------------------------------------

    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                      data={'cid': bad_cid, 'uid': 1, 'after_pic': 'aaa'})
    assert r.ok
    r = requests.post('https://snowangels-api.herokuapp.com/new_shovel',
                      data={'cid': bad_cid, 'uid': 1, 'after_pic': 'aaa'})
    assert (not r.ok) and len(requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % bad_cid).json(

    )) == 1 and requests.get(
        'https://snowangels-api.herokuapp.com'
        '/get_corners_requests?cid=%d' % bad_cid).json(

    )[0].get('state') == 2


def test_corner_st_names():
    r = requests.get('https://snowangels-api.herokuapp.com'
                     '/corner_street_names?cid=%d' % cid)
    assert r.ok
    assert len(r.json()) > 0


def test_states():
    r = requests.get('https://snowangels-api.herokuapp.com/states')
    assert r.ok and len(r.json()) == 505
