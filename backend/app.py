from flask import Flask, request, jsonify, json
import googlemaps
from flask_cors import CORS
import creds
import os
from astar import optimize_tsp, get_full_route, astar

app = Flask(__name__)
CORS(app)

gmaps = googlemaps.Client(key=creds.api_key)

@app.route('/places', methods=['GET'])
def get_places():
    city = request.args.get('city')
    geocode_result = gmaps.geocode(city)
    
    if geocode_result:
        city_location = geocode_result[0]['geometry']['location']
        places_result = gmaps.places_nearby(location=city_location, radius=5000, type='tourist_attraction', rank_by='prominence')

        
        places = []
        for place in places_result['results']:
            photo_url = None
            if 'photos' in place:
                photo_reference = place['photos'][0]['photo_reference']
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={creds.api_key}"
            
            places.append({
                'name': place['name'],
                'lat': place['geometry']['location']['lat'],
                'lon': place['geometry']['location']['lng'],
                'image': photo_url
            })

        return jsonify({'places': places})
    else:
        return jsonify({'error': 'City not found'}), 404
    
@app.route('/save_places', methods=['POST'])
def save_places():
    data = request.json
    folder_path = './data'

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    file_path = os.path.join(folder_path, 'selected_places.json')

    with open(file_path, 'w') as f:
        f.write(json.dumps(data))

    return jsonify({'message': 'Places saved successfully!'})

@app.route('/astar', methods=['POST']) 
def optimize_route():
    places = request.json
    
    best_path, best_distance = optimize_tsp(places)
    full_route = get_full_route(best_path)

    route = [{'name': place['name'], 'lat': place['lat'], 'lon': place['lon']} for place in best_path]
    return jsonify({
        'optimized_route': route,
        'total_distance': f"{best_distance:.2f} km",
        'full_route': full_route
    })

@app.route('/dijkstra', methods=['POST'])
def dijkstra():
    # places = request.json
    # full_route = get_full_route(places)
    return jsonify({'Dummy Value'})

if __name__ == '__main__':
    app.run(debug=True)