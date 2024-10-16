import googlemaps
import math
import json
import os
import creds
from datetime import datetime
from datetime import datetime

def load_data():
    folder_path = './data'
    file_path = os.path.join(folder_path, 'selected_places.json')
    with open(file_path) as f:
        places = json.load(f)
    return places

gmaps = googlemaps.Client(key=creds.api_key)

def get_road_distance(place1, place2):

    result = gmaps.directions(
        f"{place1['lat']},{place1['lon']}",
        f"{place2['lat']},{place2['lon']}",
        mode="driving",
        departure_time=datetime.now()
    )
    
    if result:
        return result[0]['legs'][0]['distance']['value'] / 1000  # Convert meters to kilometers
    else:
        return haversine_distance(place1['lat'], place1['lon'], place2['lat'], place2['lon'])

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371 

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def dijkstra(start_place, end_place):
    distances = {place["name"]: float("inf") for place in load_data()}
    previous = {place["name"]: None for place in load_data()}
    distances[start_place["name"]] = 0
    unvisited = set(place["name"] for place in load_data())

    while unvisited:
        current_name = min(unvisited, key=lambda x: distances[x])
        current_place = next(place for place in load_data() if place["name"] == current_name)
        unvisited.remove(current_name)

        if current_name == end_place["name"]:
            break

        for neighbor in load_data():
            if neighbor["name"] in unvisited:
                distance = get_road_distance(current_place, neighbor)
                new_distance = distances[current_name] + distance
                if new_distance < distances[neighbor["name"]]:
                    distances[neighbor["name"]] = new_distance
                    previous[neighbor["name"]] = current_place


    path = []
    current = end_place
    while current:
        path.append(current)
        current = previous[current["name"]]
    return list(reversed(path))

def find_shortest_route():
    unvisited = load_data()[1:]
    route = [load_data()[0]]
    total_distance = 0

    while unvisited:
        last = route[-1]
        nearest = min(unvisited, key=lambda x: get_road_distance(last, x))
        path = dijkstra(last, nearest)
        route.extend(path[1:]) 
        total_distance += sum(get_road_distance(path[i], path[i+1]) for i in range(len(path)-1))
        unvisited.remove(nearest)

    return route, total_distance
