from flask import Flask, request, jsonify
import googlemaps
from flask_cors import CORS
import creds

app = Flask(__name__)
CORS(app)

# Initialize Google Maps Client with your API key
gmaps = googlemaps.Client(key= creds.api_key)

@app.route('/places', methods=['GET'])
def get_places():
    city = request.args.get('city')
    geocode_result = gmaps.geocode(city)
    
    if geocode_result:
        city_location = geocode_result[0]['geometry']['location']
        places_result = gmaps.places_nearby(location=city_location, radius=5000, type='tourist_attraction')
        
        places = []
        for place in places_result['results']:
            places.append({
                'name': place['name'],
                'lat': place['geometry']['location']['lat'],
                'lon': place['geometry']['location']['lng']
            })

        return jsonify({'places': places})
    else:
        return jsonify({'error': 'City not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
