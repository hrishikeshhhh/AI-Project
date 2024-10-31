import googlemaps
import json
import math
import os
from datetime import datetime
import creds

gmaps = googlemaps.Client(key=creds.api_key)
distance_cache = {}

def load_data():
    folder_path = './data'
    file_path = os.path.join(folder_path, 'selected_places.json')
    with open(file_path) as f:
        return json.load(f)

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def get_road_distance(place1, place2):
    result = gmaps.directions(
        f"{place1['lat']},{place1['lon']}",
        f"{place2['lat']},{place2['lon']}",
        mode="driving",
        departure_time=datetime.now()
    )
    
    if result:
        return result[0]['legs'][0]['distance']['value'] / 1000 
    else:
        return haversine_distance(place1['lat'], place1['lon'], place2['lat'], place2['lon'])