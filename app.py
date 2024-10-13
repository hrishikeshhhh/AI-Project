from flask import Flask, request, jsonify, json
import googlemaps
from flask_cors import CORS
import creds

app = Flask(__name__)
CORS(app)

# Initialize Google Maps Client with your API key
gmaps = googlemaps.Client(key=creds.api_key)

@app.route('/places', methods=['GET'])
def get_places():
    city = request.args.get('city')
    geocode_result = gmaps.geocode(city)
    
    if geocode_result:
        city_location = geocode_result[0]['geometry']['location']
        places_result = gmaps.places_nearby(location=city_location, radius=5000, type='tourist_attraction')
        
        places = []
        for place in places_result['results']:
            # Fetch photo reference if available
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
    print(data)  
    # save the data in a json file
    with open('selected_places.json', 'w') as f:
        f.write(json.dumps(data))

    return jsonify({'message': 'Places saved successfully!'})

if __name__ == '__main__':
    app.run(debug=True)