from fastapi.testclient import TestClient
from api.index import app
client = TestClient(app)

def test_health():
    assert client.get('/api/health').json()['status'] == 'ok'

def test_groceries():
    response = client.post('/api/shopping-list', json={'days': 5, 'ingredients': [
        {'name':'Banana','quantity':1,'unit':'un','category':'Hortifruti'},
        {'name':'banana','quantity':2,'unit':'un','category':'Hortifruti'}]})
    assert response.status_code == 200
    assert response.json()['items'][0]['quantity'] == 15
    assert len(response.json()['items']) == 1

def test_reject_invalid_days_and_quantities():
    assert client.post('/api/shopping-list', json={'days':0,'ingredients':[]}).status_code == 422
    assert client.post('/api/shopping-list', json={'days':5,'ingredients':[{'name':'a','quantity':-1,'unit':'g'}]}).status_code == 422
